import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the tree keyboard is the pointer posture');
});

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Sidebar' });
const item = (page: Page, name: string) => sidebar(page).locator(`[role=treeitem]:has(> .row > a[title="${name}"])`);

async function reisen(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Leer' }],
		notes: [
			{ title: 'Packliste', folder: 0 },
			{ title: 'Visa', folder: 0 }
		]
	});
}

test('Scenario: Chevron expands without navigating', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');
	const tree = sidebar(page);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	for (const name of ['Japan', 'Packliste', 'Visa']) await expect(tree.getByRole('link', { name, exact: true })).toBeVisible();
	expect(new URL(page.url()).pathname).toBe('/');
	await tree.getByRole('button', { name: 'Collapse Reisen' }).click();
	for (const name of ['Japan', 'Packliste', 'Visa']) await expect(tree.getByRole('link', { name, exact: true })).toBeHidden();
	expect(new URL(page.url()).pathname).toBe('/');
});

test('Scenario: Manual open state lasts until reload', async ({ page, request }) => {
	const { folders } = await reisen(request);
	await calm(page);
	await open(page, '/');
	const tree = sidebar(page);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	await tree.getByRole('link', { name: 'Leer', exact: true }).click();
	await page.waitForURL(`**/folders/${folders[2]}`);
	await page.getByRole('link', { name: 'Home' }).first().click();
	await page.waitForURL((url) => url.pathname === '/');
	await expect(tree.getByRole('link', { name: 'Packliste', exact: true })).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(tree.getByRole('button', { name: 'Expand Reisen' })).toBeVisible();
	await expect(tree.getByRole('link', { name: 'Packliste', exact: true })).toBeHidden();
});

test('Scenario: Empty folder has no chevron', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');

	const leer = item(page, 'Leer');
	await expect(leer).toBeVisible();
	await expect(leer.getByRole('button', { name: /Expand|Collapse/ })).toHaveCount(0);
	await expect(item(page, 'Reisen').getByRole('button', { name: 'Expand Reisen' })).toBeVisible();
});

test('Scenario: Tree focuses the open note folder and marks its row', async ({ page, request }) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [{ title: 'Tempel', folder: 2 }]
	});
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	const tree = sidebar(page);

	// the tree focuses the note's folder, so every folder between that focus and the note is open (none hidden)
	await expect(tree.getByRole('link', { name: 'Tempel', exact: true })).toHaveAttribute('aria-current', 'page');
	await expect(tree.getByRole('navigation', { name: 'Path' }).getByRole('link', { name: 'Japan' })).toBeVisible();

	await open(page, `/folders/${folders[0]}`);
	await expect(tree.getByRole('button', { name: 'Expand Japan' })).toBeVisible();
	await expect(tree.getByRole('link', { name: 'Tempel', exact: true })).toHaveCount(0);
});

test('Scenario: Arrow keys move through the tree', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');
	const tree = sidebar(page);

	// folders sort A-Z: Leer, then Reisen
	await item(page, 'Leer').focus();
	await page.keyboard.press('ArrowDown');
	await expect(item(page, 'Reisen')).toBeFocused();
	await expect(item(page, 'Reisen')).toHaveAttribute('aria-expanded', 'false');
	await page.keyboard.press('ArrowRight');
	await expect(item(page, 'Reisen')).toHaveAttribute('aria-expanded', 'true');
	await page.keyboard.press('ArrowDown');
	await expect(item(page, 'Japan')).toBeFocused();
	await page.keyboard.press('ArrowLeft');
	await expect(item(page, 'Reisen')).toBeFocused();
	await page.keyboard.press('ArrowLeft');
	await expect(item(page, 'Reisen')).toHaveAttribute('aria-expanded', 'false');
	await expect(tree.getByRole('link', { name: 'Japan', exact: true })).toBeHidden();

	await page.keyboard.press('Enter');
	await page.waitForURL(/\/folders\/\d+$/);
});

test('Regression: a folder row is named by its folder alone', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');
	await expect(item(page, 'Reisen')).toHaveAccessibleName('Reisen');
	await expect(sidebar(page).getByRole('treeitem', { name: 'Leer', exact: true })).toHaveCount(1);
});

test('Regression: the tree keeps one tab stop after the focused row goes', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');
	const tabStops = sidebar(page).locator('[role=treeitem][tabindex="0"]');
	await expect(tabStops).toHaveCount(1);

	await item(page, 'Leer').focus();
	await page.keyboard.press('ArrowDown');
	await expect(item(page, 'Reisen')).toBeFocused();
	await expect(item(page, 'Reisen')).toHaveAttribute('tabindex', '0');
	await page.keyboard.press('ContextMenu');
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /^Delete “/ }).getByRole('button', { name: 'Delete' }).click();
	await expect(item(page, 'Reisen')).toHaveCount(0);

	await expect(tabStops).toHaveCount(1);
	await expect(item(page, 'Leer')).toHaveAttribute('tabindex', '0');
	await sidebar(page).getByRole('button', { name: 'Sort folders' }).focus();
	await page.keyboard.press('Tab');
	await expect(item(page, 'Leer')).toBeFocused();
});

test('Regression: Enter and Escape in a rename give the focus back to the row', async ({ page, request }) => {
	await reisen(request);
	await calm(page);
	await open(page, '/');

	for (const key of ['Enter', 'Escape']) {
		await item(page, 'Leer').focus();
		await page.keyboard.press('ContextMenu');
		await page.getByRole('menuitem', { name: 'Rename' }).click();
		const field = sidebar(page).getByRole('textbox', { name: 'Folder name' });
		await expect(field).toBeFocused();
		await page.keyboard.press(key);
		await expect(field).toHaveCount(0);
		await expect(item(page, 'Leer')).toBeFocused();
	}
});

test('Scenario: One control expands and collapses every folder of the tree', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }, { name: 'Leer' }],
		notes: [{ title: 'Packliste', folder: 0 }, { title: 'Tempel', folder: 2 }]
	});
	await calm(page);
	await open(page, '/');
	const tree = sidebar(page);
	const deep = ['Japan', 'Kyoto', 'Packliste', 'Tempel'];

	const expand = tree.getByRole('button', { name: 'Expand all folders' });
	await expand.focus();
	await page.keyboard.press('Enter');
	for (const name of deep) await expect(tree.getByRole('link', { name, exact: true })).toBeVisible();
	for (const name of ['Reisen', 'Japan', 'Kyoto']) await expect(item(page, name)).toHaveAttribute('aria-expanded', 'true');
	await expect(item(page, 'Leer')).not.toHaveAttribute('aria-expanded');
	await expect(expand).toHaveCount(0);
	await expect(tree.getByRole('button', { name: 'Collapse all folders' })).toBeFocused();

	// the arrow keys still walk the whole expanded tree from its one tab stop
	await item(page, 'Reisen').focus();
	// top level is Leer, Reisen: from Reisen two steps down reach Japan, then Kyoto
	for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown');
	await expect(item(page, 'Kyoto')).toBeFocused();
	for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowDown');
	await expect(item(page, 'Packliste')).toBeFocused();

	await tree.getByRole('button', { name: 'Collapse all folders' }).click();
	for (const name of deep) await expect(tree.getByRole('link', { name, exact: true })).toBeHidden();
	await expect(item(page, 'Reisen')).toHaveAttribute('aria-expanded', 'false');
	await expect(tree.getByRole('button', { name: 'Expand all folders' })).toBeVisible();
	expect(new URL(page.url()).pathname).toBe('/');
});

test('Scenario: The expand control stays away while no folder has anything inside', async ({ page, request }) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Leer' }] });
	await calm(page);
	await open(page, '/');
	await expect(sidebar(page).getByRole('button', { name: 'New folder' })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: /all folders/ })).toHaveCount(0);
});
