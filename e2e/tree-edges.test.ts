import { expect, test } from '@playwright/test';
import { calm, folderLink, isDesktop, open, reset, seed, treeScope } from './helpers.ts';

test('Scenario: Empty tree offers New folder', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await expect(tree.getByText('No folders yet')).toBeVisible();
	await expect(tree.getByRole('button', { name: 'New folder' })).toBeVisible();
});

test('Long folder names wrap on the Folders page', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'the focus tree has its own long-name and deep-path scenarios (tree-focus)');
	const name = 'Eine sehr lange Ordnerbezeichnung die garantiert nicht in eine schmale Zeile passt und deshalb umbricht';
	await reset(request);
	await seed(request, { folders: [{ name }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const row = folderLink(tree, name);
	await expect(row).toBeVisible();
	await expect.poll(async () => (await row.boundingBox())?.height ?? 0).toBeGreaterThan(56);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Scenario: A multi-line title shows on one line in the tree', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Reise\n\nPlan', folder: 0 }] });
	await calm(page);
	if (isDesktop(info)) {
		await open(page, `/folders/${folders[0]}`);
		const link = (await treeScope(page, info)).getByRole('link', { name: 'Reise Plan', exact: true });
		await expect(link).toBeVisible();
		await expect(link).toHaveAttribute('title', 'Reise Plan');
	} else {
		await open(page, `/folders/${folders[0]}`);
		await expect(page.getByRole('main').locator('[data-note-title]')).toHaveText('Reise Plan');
	}
});
