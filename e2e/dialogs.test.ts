import { expect, test, type Page } from '@playwright/test';
import { calm, isDesktop, open, openFolderMenu, reset, seed, treeScope } from './helpers.ts';

test('Scenario: Delete confirm shows counts once known', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [{ folder: 0 }, { folder: 0 }, { folder: 1 }, { folder: 2 }, { folder: 2 }]
	});
	await calm(page);
	let release!: () => void;
	const gate = new Promise<void>((resolve) => (release = resolve));
	await page.route(/\/api\/folders\/\d+$/, async (route) => {
		if (route.request().method() === 'GET') await gate;
		await route.continue();
	});
	await open(page, '/');
	await treeScope(page, info);

	await openFolderMenu(page, info, folders[0], 'Reisen');
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog', { name: /^Delete “/ });
	await expect(dialog.locator('button:not([disabled])', { hasText: /^Delete folder$/ })).toHaveCount(0);

	release();
	await expect(dialog.getByRole('heading', { name: 'Delete “Reisen”?' })).toBeVisible();
	await expect(dialog.getByText("This deletes 2 folders and 5 notes inside it. This can't be undone.", { exact: true })).toBeVisible();
	await expect(dialog.getByRole('button', { name: 'Delete folder', exact: true })).toBeEnabled();
});

test('Scenario: Move to chooser starts with Root in tree order', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }, { name: 'Berlin', parent: 0 }, { name: 'Alpha' }]
	});
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	if (isDesktop(info)) await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	await openFolderMenu(page, info, folders[1], 'Japan');
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	const options = page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option');

	await expect(options).toHaveText(['Root', 'Alpha', 'Reisen', 'Berlin']);
});

test('Scenario: Modal dialog traps focus and returns it', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Rezept', body: 'Mehl' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const opener = page.getByRole('button', { name: 'Note menu' });
	await opener.click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog', { name: /^Delete “/ });
	await expect(dialog).toBeVisible();

	const inside = () => page.evaluate(() => !!document.activeElement?.closest('dialog[open]'));
	for (let i = 0; i < 6; i++) {
		await page.keyboard.press('Tab');
		expect(await inside()).toBe(true);
	}
	await page.keyboard.press('Escape');

	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
});

test('Scenario: Outside click cancels a menu or dialog', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Rezept', body: 'Mehl' }] });
	await calm(page);
	await open(page, `/notes/${notes[0]}`);

	const opener = page.getByRole('button', { name: 'Note menu' });
	await opener.click();
	const menu = page.getByRole('menu', { name: 'Note menu' });
	await expect(menu).toBeVisible();
	await page.mouse.click(4, 400);
	await expect(menu).toBeHidden();
	await expect(opener).toBeFocused();

	await opener.click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	const dialog = page.getByRole('alertdialog', { name: /^Delete “/ });
	await expect(dialog).toBeVisible();
	await page.mouse.click(4, 400);
	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
	await expect(page).toHaveURL(new RegExp(`/notes/${notes[0]}$`));
});
