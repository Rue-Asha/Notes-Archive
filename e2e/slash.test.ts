import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, editor, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const menu = (page: Page) => page.getByRole('listbox', { name: 'Blocks' });

async function openEmptyNote(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Schrägstrich', body: '' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();
	return notes[0];
}

test('Scenario: Slash opens the block menu at a block start or after a space', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/');
	await expect(menu(page)).toBeVisible();
	await page.keyboard.press('Escape');
	await page.keyboard.press('Backspace');
	await expect(menu(page)).toBeHidden();

	await page.keyboard.type('Hallo /');
	await expect(menu(page)).toBeVisible();
	await page.keyboard.press('Escape');
	await page.keyboard.press('Enter');

	await page.keyboard.type('a/b');
	await expect(editor(page)).toContainText('a/b');
	await expect(menu(page)).toBeHidden();
});

test('Scenario: Typing filters the slash menu', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/hea');
	await expect(menu(page).getByRole('option')).toHaveCount(3);
	for (const name of ['Heading 1', 'Heading 2', 'Heading 3']) await expect(menu(page).getByRole('option', { name })).toBeVisible();
});

test('Scenario: Arrow keys and Enter choose a block', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Block', body: '' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await editor(page).click();

	await page.keyboard.type('/head');
	await expect(menu(page).getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
	await page.keyboard.press('ArrowDown');
	await expect(menu(page).getByRole('option', { name: 'Heading 2' })).toHaveAttribute('aria-selected', 'true');
	await page.keyboard.press('Enter');

	await expect(menu(page)).toBeHidden();
	await expect(editor(page).getByRole('heading', { level: 2 })).toBeVisible();
	await saves.settled();
	const { content } = (await storedNote(request, notes[0]))!;
	const blocks: JSONContent[] = content.content ?? [];
	expect(blocks[0].type).toBe('heading');
	expect(blocks[0].attrs?.level).toBe(2);
	expect(JSON.stringify(content)).not.toContain('"text"');
});

test('Scenario: Escape closes the slash menu and keeps the text', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/quo');
	await expect(menu(page)).toBeVisible();
	await page.keyboard.press('Escape');

	await expect(menu(page)).toBeHidden();
	await expect(editor(page).getByRole('paragraph')).toHaveText('/quo');
});

test('Scenario: Space with no match closes the slash menu', async ({ page, request }) => {
	await openEmptyNote(page, request);

	await page.keyboard.type('/zzz');
	await expect(menu(page).getByText('No results')).toBeVisible();
	await page.keyboard.type(' ');

	await expect(menu(page)).toBeHidden();
	await expect(editor(page).getByRole('paragraph')).toHaveText('/zzz ');
});
