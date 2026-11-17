import { expect, test, type Page } from '@playwright/test';
import { calm, folderLink, isDesktop, open, reset, seed, sidebar, storedNote, treeScope } from './helpers.ts';

const folderId = async (link: ReturnType<Page['locator']>) => Number((await link.getAttribute('href'))!.split('/').pop());

test('Scenario: Create a folder at the root', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	let tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'New folder' }).click();
	await tree.getByRole('textbox', { name: 'Folder name' }).fill('Reisen');
	await page.keyboard.press('Enter');
	await expect(folderLink(tree, 'Reisen')).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	tree = await treeScope(page, info);
	await expect(folderLink(tree, 'Reisen')).toBeVisible();
});

test('Scenario: Create a folder inside a folder', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	if (isDesktop(info)) {
		await tree.getByRole('button', { name: 'Reisen menu' }).click();
		await page.getByRole('menuitem', { name: 'New folder' }).click();
	} else {
		await folderLink(tree, 'Reisen').click();
		await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
		await page.getByRole('main').getByRole('button', { name: 'New folder' }).click();
	}
	await page.getByRole('textbox', { name: 'Folder name' }).fill('Japan');
	await page.keyboard.press('Enter');

	const scope = isDesktop(info) ? tree : page.getByRole('main');
	const japan = folderLink(scope, 'Japan');
	await expect(japan).toBeVisible();
	if (isDesktop(info)) {
		const reisen = folderLink(tree, 'Reisen');
		expect((await japan.boundingBox())!.x).toBeGreaterThan((await reisen.boundingBox())!.x);
	}
	const res = await request.get(`/api/folders/${await folderId(japan)}`);
	expect((await res.json()).folder.parentId).toBe(folders[0]);
});

test("Scenario: New note from a folder's menu lands in that folder", async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	if (isDesktop(info)) {
		await sidebar(page).getByRole('button', { name: 'Reisen menu' }).click();
		await page.getByRole('menuitem', { name: 'New note' }).click();
	} else {
		await folderLink(tree, 'Reisen').click();
		await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
		await page.getByRole('main').getByRole('button', { name: 'New note' }).click();
	}
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))?.folderId).toBe(folders[0]);
});
