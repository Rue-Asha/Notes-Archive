import { expect, test, type Page } from '@playwright/test';
import { calm, folderLink, isDesktop, open, openFolderMenu, reset, seed, treeScope } from './helpers.ts';

async function storedFolder(page: Page, id: number) {
	const res = await page.request.get(`/api/folders/${id}`);
	return (await res.json()).folder as { name: string; parentId: number | null };
}

// phone: the folder page renames in its heading, where desktop edits the row in the tree
const named = async (page: Page, info: { project: { name: string } }, name: string) =>
	isDesktop(info) ? expect(folderLink(await treeScope(page, info), name)).toBeVisible() : expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(name);

test('Scenario: Rename a folder inline in the tree', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	await openFolderMenu(page, info, folders[0], 'Archiv');
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	const input = page.getByRole('textbox', { name: 'Folder name' });
	await expect(input).toBeFocused();
	await input.fill('Archiv 2026');
	await page.keyboard.press('Enter');

	await named(page, info, 'Archiv 2026');
	await expect(page.getByRole('textbox')).toHaveCount(0);
	expect((await storedFolder(page, folders[0])).name).toBe('Archiv 2026');
});

test('Escape cancels a rename', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	await openFolderMenu(page, info, folders[0], 'Archiv');
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	await page.getByRole('textbox', { name: 'Folder name' }).fill('Verworfen');
	await page.keyboard.press('Escape');

	await named(page, info, 'Archiv');
	await expect(page.getByRole('textbox')).toHaveCount(0);
	expect((await storedFolder(page, folders[0])).name).toBe('Archiv');
});

test('A blank name becomes Untitled folder', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Archiv' }] });
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	await openFolderMenu(page, info, folders[0], 'Archiv');
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	await page.getByRole('textbox', { name: 'Folder name' }).fill('   ');
	await page.keyboard.press('Enter');

	await named(page, info, 'Untitled folder');
	expect((await storedFolder(page, folders[0])).name).toBe('Untitled folder');
});

test('Scenario: Move a folder with Move to', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	let nested = 0;
	if (isDesktop(info)) {
		await tree.getByRole('button', { name: 'Expand Reisen' }).click();
		nested = (await folderLink(tree, 'Japan').boundingBox())!.x;
		expect(nested).toBeGreaterThan((await folderLink(tree, 'Reisen').boundingBox())!.x);
	}

	await openFolderMenu(page, info, folders[1], 'Japan');
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Root' }).click();

	if (isDesktop(info)) {
		// at the top level Japan no longer sits one indent step in from Reisen; the moved row remounts, so a box can be briefly missing
		const left = async (name: string) => (await folderLink(tree, name).boundingBox())?.x ?? NaN;
		await expect
			.poll(async () => {
				const [japan, reisen] = [await left('Japan'), await left('Reisen')];
				return Math.abs(japan - reisen) < 16 && japan < nested + 8;
			})
			.toBe(true);
	}
	await expect.poll(async () => (await storedFolder(page, folders[1])).parentId).toBeNull();
	if (!isDesktop(info)) {
		await open(page, '/folders');
		await expect(folderLink(page.getByRole('main'), 'Japan')).toBeVisible();
	}
});

test('Scenario: Move to excludes the folder and its descendants', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }, { name: 'Essen' }]
	});
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	await openFolderMenu(page, info, folders[0], 'Reisen');
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	const options = page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option');
	await expect(options).toHaveText(['Root', 'Essen']);
});
