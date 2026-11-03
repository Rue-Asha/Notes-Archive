import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__homeLoaded?: boolean;
	}
}

test('Scenario: Empty archive shows the welcome state', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const welcome = page.locator('[data-welcome]');
	await expect(welcome).toContainText('Write your first note');
	await expect(welcome.getByRole('button', { name: 'New note' })).toBeVisible();
	for (const name of ['Pinned', 'Recently edited', 'Folders']) await expect(page.getByRole('region', { name })).toHaveCount(0);

	await welcome.getByRole('button', { name: 'New note' }).click();
	await expect(page).toHaveURL(/\/notes\/\d+$/);
});

test('Scenario: Home reflects a move without reload', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Packliste' }] });
	await calm(page);
	await open(page, '/');
	await page.evaluate(() => (window.__homeLoaded = true));

	const tile = page.getByRole('region', { name: 'Folders' }).locator('[data-folder-tile]');
	await expect(tile.locator('[data-tile-count]')).toHaveText('0 notes');
	await page.getByRole('region', { name: 'Recently edited' }).getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Reisen' }).click();

	await expect(tile.locator('[data-tile-count]')).toHaveText('1 note');
	expect(await page.evaluate(() => window.__homeLoaded)).toBe(true);
});
