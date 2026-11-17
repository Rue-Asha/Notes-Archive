import { expect, test } from '@playwright/test';
import { calm, open, reset, storedNote } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the sidebar only exists from 1024 px');
});

test('Tree rail: the unfolded sidebar holds Home, Search, New note and Folders', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const sidebar = page.getByRole('navigation', { name: 'Sidebar' });
	await expect(sidebar).toBeVisible();
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

test('Regression: Search is named Search and announces its shortcut', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/');

	const search = page.getByRole('navigation', { name: 'Sidebar' }).getByRole('button', { name: 'Search', exact: true });
	await expect(search).toHaveAccessibleName('Search');
	await expect(search).toHaveAttribute('aria-keyshortcuts', 'Control+K Meta+K');
});
