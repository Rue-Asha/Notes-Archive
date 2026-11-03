import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Search' });
const input = (page: Page) => palette(page).getByRole('combobox', { name: 'Search notes' });
const actions = (page: Page) => palette(page).getByRole('group', { name: 'Actions' });

test('Scenario: Palette offers New note and New folder', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await expect(actions(page).getByRole('option')).toHaveText([/New note/, /New folder/]);

	await actions(page).getByRole('option', { name: 'New note' }).click();
	await expect(page).toHaveURL(/\/notes\/\d+$/);
	await expect(palette(page)).toHaveCount(0);
	await expect(page.getByRole('textbox', { name: 'Title' })).toBeFocused();
	expect((await counts(request)).notes).toBe(1);

	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await actions(page).getByRole('option', { name: 'New folder' }).click();
	await expect(page).toHaveURL(/\/folders\/\d+$/);
	await expect(palette(page)).toHaveCount(0);
	expect((await counts(request)).folders).toBe(1);
	const { folder } = await (await request.get(`/api/folders/${page.url().split('/').pop()}`)).json();
	expect(folder).toMatchObject({ name: 'Untitled folder', parentId: null });
});

test('Scenario: See all results opens the search page', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Kyoto', body: 'Tempel' }] });
	await calm(page);
	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await expect(palette(page).getByRole('option', { name: /See all results/ })).toHaveCount(0);
	await input(page).fill('kyoto');

	await palette(page).getByRole('option', { name: /See all results/ }).click();
	await expect(page).toHaveURL((url) => url.pathname + url.search === '/search?q=kyoto');
	await expect(palette(page)).toHaveCount(0);
});
