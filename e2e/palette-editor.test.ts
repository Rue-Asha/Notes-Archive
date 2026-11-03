import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, storedNote, watchSaves } from './helpers.ts';

const body = (page: Page) => page.locator('[data-editor-root] .ProseMirror');

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the phone bottom bar is inert while the editor is focused; the scenario opens from the sidebar');
});

test('Scenario: Palette keeps the editor\'s selection and content', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Garten', body: 'Schöne Tulpen im Beet' }] });
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[0]}`);
	await body(page).click();
	await page.keyboard.press('Home');
	for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowRight');
	const selected = () => page.evaluate(() => getSelection()!.toString());
	expect(await selected()).toBe('Schöne');
	const before = (await storedNote(request, notes[0]))!;

	const nav = page.getByRole('navigation', { name: 'Sidebar' });
	await nav.getByRole('button', { name: /Search/ }).click();
	const palette = page.getByRole('dialog', { name: 'Search' });
	await expect(palette).toBeVisible();
	await palette.getByRole('combobox', { name: 'Search notes' }).fill('tulpen');
	await page.keyboard.press('Escape');
	await expect(palette).toHaveCount(0);

	await expect(body(page)).toBeFocused();
	expect(await selected()).toBe('Schöne');
	await expect(body(page)).toHaveText('Schöne Tulpen im Beet');
	await saves.settled();
	expect(await storedNote(request, notes[0])).toEqual(before);

	await page.keyboard.type('X');
	await expect(body(page)).toHaveText('X Tulpen im Beet');
});

test('Escape returns the focus to the editor after a selection across two paragraphs', async ({ page, request }) => {
	await reset(request);
	const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
	const { notes } = await seed(request, { notes: [{ title: 'Garten', content: { type: 'doc', content: [paragraph('Erster Absatz'), paragraph('Zweiter Absatz')] } }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	await body(page).click();
	await page.keyboard.press('ControlOrMeta+Home');
	await page.keyboard.press('Shift+ArrowDown');
	await page.keyboard.press('Shift+ArrowRight');
	const selected = await page.evaluate(() => getSelection()!.toString());
	expect(selected).toContain('Erster');
	expect(selected).toContain('Zweiter'.slice(0, 1));

	await page.getByRole('navigation', { name: 'Sidebar' }).getByRole('button', { name: /Search/ }).click();
	await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
	await page.keyboard.press('Escape');

	await expect(body(page)).toBeFocused();
	expect(await page.evaluate(() => getSelection()!.toString())).toBe(selected);
});
