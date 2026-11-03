import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, storedNote } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function treeScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

const folderId = async (link: ReturnType<Page['locator']>) => Number((await link.getAttribute('href'))!.split('/').pop());

test('Scenario: Create a folder at the root', async ({ page, request }, info) => {
	await reset(request);
	await calm(page);
	await open(page, '/');
	let tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'New folder' }).click();
	await tree.getByRole('textbox', { name: 'Folder name' }).fill('Reisen');
	await page.keyboard.press('Enter');
	await expect(tree.getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	tree = await treeScope(page, info);
	await expect(tree.getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();
});

test('Scenario: Create a folder inside a folder', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Reisen menu' }).click();
	await page.getByRole('menuitem', { name: 'New folder' }).click();
	await tree.getByRole('textbox', { name: 'Folder name' }).fill('Japan');
	await page.keyboard.press('Enter');

	const japan = tree.getByRole('link', { name: 'Japan', exact: true });
	const reisen = tree.getByRole('link', { name: 'Reisen', exact: true });
	await expect(japan).toBeVisible();
	expect((await japan.boundingBox())!.x).toBeGreaterThan((await reisen.boundingBox())!.x);
	const res = await request.get(`/api/folders/${await folderId(japan)}`);
	expect((await res.json()).folder.parentId).toBe(await folderId(reisen));
});

test("Scenario: New note from a folder's menu lands in that folder", async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Reisen menu' }).click();
	await page.getByRole('menuitem', { name: 'New note' }).click();
	await page.waitForURL(/\/notes\/\d+$/);
	const id = Number(new URL(page.url()).pathname.split('/').pop());
	expect((await storedNote(request, id))?.folderId).toBe(folders[0]);
});
