import { expect, test } from '@playwright/test';
import { calm, open, reset, storedNote } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar only exists from 1024 px');
});

test('Scenario: Desktop shows the glass sidebar', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const sidebar = page.getByRole('navigation', { name: 'Sidebar' });
	await expect(sidebar).toBeVisible();
	await expect(sidebar).toHaveClass(/glass/);
	expect(await sidebar.evaluate((el) => getComputedStyle(el).backdropFilter)).not.toBe('none');
	await expect(sidebar.getByRole('link', { name: 'Home' })).toBeVisible();
	await expect(sidebar.getByRole('button', { name: /Search/ })).toBeVisible();
	await expect(sidebar.getByRole('button', { name: 'New note' })).toBeVisible();
	await expect(sidebar.getByRole('heading', { name: 'Folders' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Bottom bar' })).toBeHidden();
});

test('Scenario: New note from the sidebar or bottom bar opens a root note (sidebar)', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	await page.getByRole('navigation', { name: 'Sidebar' }).getByRole('button', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))?.folderId).toBeNull();
});
