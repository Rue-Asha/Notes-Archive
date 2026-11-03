import { expect, test, type Page } from '@playwright/test';
import type { JSONContent } from '../src/lib/types.ts';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');
const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Format' });
const field = (page: Page) => toolbar(page).getByRole('textbox', { name: 'Link URL' });

function nodes(doc: JSONContent): JSONContent[] {
	return [doc, ...(doc.content ?? []).flatMap(nodes)];
}

async function setup(page: Page, request: Parameters<typeof reset>[0]) {
	await reset(request);
	const content: JSONContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Welt' }] }] };
	const { notes } = await seed(request, { notes: [{ title: 'Verweis', content }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	const href = async () => {
		await saves.settled();
		const text = nodes((await storedNote(request, notes[0]))!.content).find((n) => n.type === 'text')!;
		return text.marks?.find((m) => m.type === 'link')?.attrs?.href ?? null;
	};
	return { href };
}

test('Scenario: Add, edit and remove a link', async ({ page, request }) => {
	const { href } = await setup(page, request);
	await body(page).getByText('Welt').dblclick({ position: { x: 10, y: 8 } });
	await expect(toolbar(page)).toBeVisible();

	await toolbar(page).getByRole('button', { name: 'Link' }).click();
	await field(page).fill('https://example.org');
	await field(page).press('Enter');
	await expect(body(page).locator('a')).toHaveAttribute('href', 'https://example.org');
	expect(await href()).toBe('https://example.org');

	await expect(toolbar(page).getByRole('button', { name: 'Link' })).toHaveAttribute('aria-pressed', 'true');
	await toolbar(page).getByRole('button', { name: 'Link' }).click();
	await expect(field(page)).toHaveValue('https://example.org');
	await field(page).fill('https://example.com/zwei');
	await field(page).press('Enter');
	await expect(body(page).locator('a')).toHaveAttribute('href', 'https://example.com/zwei');
	expect(await href()).toBe('https://example.com/zwei');

	await toolbar(page).getByRole('button', { name: 'Link' }).click();
	await toolbar(page).getByRole('button', { name: 'Remove link' }).click();
	await expect(body(page).locator('a')).toHaveCount(0);
	expect(await href()).toBeNull();
});

test('Scenario: Cmd or Ctrl+K on a selection edits the link', async ({ page, request }) => {
	const { href } = await setup(page, request);
	await body(page).click();
	await page.keyboard.press('ControlOrMeta+A');
	await expect(toolbar(page)).toBeVisible();

	await page.keyboard.press('ControlOrMeta+k');
	await expect(field(page)).toBeFocused();
	await page.keyboard.type('https://example.org');
	await page.keyboard.press('Enter');

	await expect(body(page).locator('a')).toHaveAttribute('href', 'https://example.org');
	expect(await href()).toBe('https://example.org');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});
