import { expect, test } from '@playwright/test';
import { calm, open, reset, storedNote } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'phone', 'the bottom bar only exists below 1024 px');
});

test('Scenario: Phone shows the bottom bar', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const bar = page.getByRole('navigation', { name: 'Bottom bar' });
	await expect(bar).toBeVisible();
	await expect(bar).toHaveClass(/glass/);
	await expect(bar.getByRole('link', { name: 'Home' })).toBeVisible();
	await expect(bar.getByRole('button', { name: 'Search' })).toBeVisible();
	await expect(bar.getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(bar.getByRole('button', { name: 'Folders' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeHidden();
});

test('Scenario: New note from the sidebar or bottom bar opens a root note (bottom bar)', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))?.folderId).toBeNull();
});
