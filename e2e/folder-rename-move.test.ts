import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function treeScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

async function storedFolder(page: Page, id: number) {
	const res = await page.request.get(`/api/folders/${id}`);
	return (await res.json()).folder as { name: string; parentId: number | null };
}

test('Scenario: Rename a folder inline in the tree', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Archiv menu' }).click();
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	const input = tree.getByRole('textbox', { name: 'Folder name' });
	await expect(input).toBeFocused();
	await input.fill('Archiv 2026');
	await page.keyboard.press('Enter');

	await expect(tree.getByRole('link', { name: 'Archiv 2026', exact: true })).toBeVisible();
	await expect(tree.getByRole('textbox')).toHaveCount(0);
	expect((await storedFolder(page, folders[0])).name).toBe('Archiv 2026');
});

test('Escape cancels a rename', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Archiv menu' }).click();
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	await tree.getByRole('textbox', { name: 'Folder name' }).fill('Verworfen');
	await page.keyboard.press('Escape');

	await expect(tree.getByRole('link', { name: 'Archiv', exact: true })).toBeVisible();
	await expect(tree.getByRole('textbox')).toHaveCount(0);
	expect((await storedFolder(page, folders[0])).name).toBe('Archiv');
});

test('A blank name becomes Untitled folder', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Archiv menu' }).click();
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	await tree.getByRole('textbox', { name: 'Folder name' }).fill('   ');
	await page.keyboard.press('Enter');

	await expect(tree.getByRole('link', { name: 'Untitled folder', exact: true })).toBeVisible();
	expect((await storedFolder(page, folders[0])).name).toBe('Untitled folder');
});

test('Scenario: Move a folder with Move to', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	const japan = tree.getByRole('link', { name: 'Japan', exact: true });
	const reisen = tree.getByRole('link', { name: 'Reisen', exact: true });
	expect((await japan.boundingBox())!.x).toBeGreaterThan((await reisen.boundingBox())!.x);

	await tree.getByRole('button', { name: 'Japan menu' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Root' }).click();

	await expect.poll(async () => (await japan.boundingBox())?.x).toBe((await reisen.boundingBox())!.x);
	expect((await storedFolder(page, folders[1])).parentId).toBeNull();
});

test('Scenario: Move to excludes the folder and its descendants', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }, { name: 'Essen' }]
	});
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	await tree.getByRole('button', { name: 'Reisen menu' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	const options = page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option');
	await expect(options).toHaveText(['Root', 'Essen']);
});
