import { expect, test, type Page } from '@playwright/test';
import { calm, counts, folderLink, isDesktop, open, openFolderMenu, reset, seed, sidebar, treeScope } from './helpers.ts';

const deleteFrom = async (page: Page, info: { project: { name: string } }, id: number, name: string) => {
	await openFolderMenu(page, info, id, name);
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	return page.getByRole('alertdialog', { name: /^Delete “/ });
};

test('Scenario: Deleting a folder asks with counts', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }],
		notes: [{ folder: 0 }, { folder: 0 }, { folder: 1 }, { folder: 2 }, { folder: 2 }]
	});
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	const dialog = await deleteFrom(page, info, folders[0], 'Reisen');
	await expect(dialog.getByRole('heading', { name: 'Delete “Reisen”?' })).toBeVisible();
	await expect(dialog.getByText("This deletes 2 folders and 5 notes inside it. This can't be undone.", { exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Delete folder', exact: true }).click();

	await expect.poll(async () => (await counts(request)).folders).toBe(0);
	await open(page, '/folders');
	await expect(folderLink(await treeScope(page, info), 'Reisen')).toHaveCount(0);
	expect(await counts(request)).toMatchObject({ folders: 0, notes: 0 });
});

test('Scenario: Empty folder asks without counts', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Leer' }] });
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	const dialog = await deleteFrom(page, info, folders[0], 'Leer');
	await expect(dialog.getByRole('heading', { name: 'Delete “Leer”?' })).toBeVisible();
	await expect(dialog.getByText("This can't be undone.", { exact: true })).toBeVisible();
});

test('Scenario: Cancelled folder delete keeps everything', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }], notes: [{ folder: 0 }, { folder: 1 }] });
	await calm(page);
	await open(page, '/');
	await treeScope(page, info);

	const dialog = await deleteFrom(page, info, folders[0], 'Reisen');
	await dialog.getByRole('button', { name: 'Cancel' }).click();

	await expect(dialog).toBeHidden();
	if (isDesktop(info)) await expect(folderLink(await treeScope(page, info), 'Reisen')).toBeVisible();
	else await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText('Reisen');
	expect(await counts(request)).toMatchObject({ folders: 2, notes: 2 });
});

test('Scenario: Deleting the folder of the open note navigates to its parent', async ({ page, request }, info) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Tempel', folder: 1 }]
	});
	await calm(page);
	if (isDesktop(info)) await open(page, `/notes/${notes[0]}`);
	else await open(page, `/folders/${folders[1]}`);

	const dialog = await deleteFrom(page, info, folders[1], 'Japan');
	await dialog.getByRole('button', { name: 'Delete' }).click();

	await page.waitForURL((url) => url.pathname === `/folders/${folders[0]}`);
	if (isDesktop(info)) await expect(folderLink(sidebar(page), 'Japan')).toHaveCount(0);
	expect(await counts(request)).toMatchObject({ folders: 1, notes: 0 });
});

test('Regression: a failed count lookup toasts and the next delete still asks', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ folder: 0 }] });
	await calm(page);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await open(page, '/');
	await treeScope(page, info);
	const lookup = (route: import('@playwright/test').Route) => (route.request().method() === 'GET' ? route.fulfill({ status: 500, body: 'nope' }) : route.continue());
	await page.route(`**/api/folders/${folders[0]}`, lookup);

	await deleteFrom(page, info, folders[0], 'Reisen');
	await expect(page.getByRole('status').filter({ hasText: "Couldn't load — try again" })).toBeVisible();
	await expect(page.getByRole('alertdialog', { name: /^Delete “/ })).toHaveCount(0);
	expect(errors).toEqual([]);

	await page.unroute(`**/api/folders/${folders[0]}`, lookup);
	const dialog = await deleteFrom(page, info, folders[0], 'Reisen');
	await expect(dialog.getByRole('heading', { name: 'Delete “Reisen”?' })).toBeVisible();
	await expect(dialog.getByText("This deletes 1 note inside it. This can't be undone.", { exact: true })).toBeVisible();
});
