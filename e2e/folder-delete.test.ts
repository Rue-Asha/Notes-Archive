import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

// the sidebar on desktop, the drawer on phone
async function treeScope(page: Page, info: { project: { name: string } }) {
	if (info.project.name === 'desktop') return page.getByRole('navigation', { name: 'Sidebar' });
	await page.getByRole('navigation', { name: 'Bottom bar' }).getByRole('button', { name: 'Folders' }).click();
	return page.getByRole('dialog', { name: 'Folders' });
}

const deleteFrom = async (page: Page, tree: Awaited<ReturnType<typeof treeScope>>, name: string) => {
	await tree.getByRole('button', { name: `${name} menu` }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	return page.getByRole('dialog', { name: 'Delete folder' });
};

test('Scenario: Deleting a folder asks with counts', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [{ folder: 0 }, { folder: 0 }, { folder: 1 }, { folder: 2 }, { folder: 2 }]
	});
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const dialog = await deleteFrom(page, tree, 'Reisen');
	await expect(dialog.getByText("Delete “Reisen”? This deletes 2 folders and 5 notes inside it. This can't be undone.", { exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await expect(tree.getByRole('link', { name: 'Reisen', exact: true })).toHaveCount(0);
	expect(await counts(request)).toMatchObject({ folders: 0, notes: 0 });
});

test('Scenario: Empty folder asks without counts', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Leer' }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const dialog = await deleteFrom(page, tree, 'Leer');
	await expect(dialog.getByText("Delete “Leer”? This can't be undone.", { exact: true })).toBeVisible();
});

test('Scenario: Cancelled folder delete keeps everything', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }], notes: [{ folder: 0 }, { folder: 1 }] });
	await calm(page);
	await open(page, '/');
	const tree = await treeScope(page, info);

	const dialog = await deleteFrom(page, tree, 'Reisen');
	await dialog.getByRole('button', { name: 'Cancel' }).click();

	await expect(dialog).toBeHidden();
	await expect(tree.getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();
	expect(await counts(request)).toMatchObject({ folders: 2, notes: 2 });
});

test('Scenario: Deleting the folder of the open note navigates to its parent', async ({ page, request }, info) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Tempel', folder: 1 }]
	});
	await calm(page);
	await open(page, `/notes/${notes[0]}`);
	const tree = await treeScope(page, info);

	const dialog = await deleteFrom(page, tree, 'Japan');
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
	await expect(tree.getByRole('link', { name: 'Japan', exact: true })).toHaveCount(0);
	expect(await counts(request)).toMatchObject({ folders: 1, notes: 0 });
});
