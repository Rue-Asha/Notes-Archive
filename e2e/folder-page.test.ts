import { expect, test, type Page } from '@playwright/test';
import { calm, counts, isDesktop, open, photo, reset, seed, sidebar } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const main = (page: Page) => page.getByRole('main');
const cover = (page: Page) => main(page).locator('[data-cover] img');
const folderRows = (page: Page) => main(page).getByRole('list', { name: 'Folders' });
const noteRows = (page: Page) => main(page).getByRole('list', { name: 'Notes' });
const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

// the compact path keeps one control for the ancestors: open it first
async function crumbs(page: Page) {
	const nav = main(page).getByRole('navigation', { name: 'Breadcrumb' });
	const more = nav.getByRole('button', { name: /Show all \d+ parent folders/ });
	if (await more.count()) await more.click();
	return nav;
}

test('Scenario: Folder page shows path, cover, sub-folders and notes', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1, cover: true }, { name: 'Gion', parent: 2 }],
		notes: [
			...[1, 2, 3, 4].map((n) => ({ title: `Kyoto ${n}`, folder: 2, updatedAt: ago(10 - n) })),
			...[1, 2].map((n) => ({ title: `Gion ${n}`, folder: 3 }))
		]
	});
	await calm(page);
	await open(page, `/folders/${folders[2]}`);

	const nav = await crumbs(page);
	await expect(nav.getByRole('link', { name: 'Reisen' })).toHaveAttribute('href', `/folders/${folders[0]}`);
	await expect(nav.getByRole('link', { name: 'Japan' })).toHaveAttribute('href', `/folders/${folders[1]}`);
	await expect(nav.getByText('Kyoto', { exact: true })).toHaveAttribute('aria-current', 'page');
	await expect(cover(page)).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Kyoto');
	await expect(folderRows(page).getByRole('link', { name: /Gion/ })).toContainText('2 notes');
	await expect(noteRows(page).locator('[data-note-title]')).toHaveText(['Kyoto 4', 'Kyoto 3', 'Kyoto 2', 'Kyoto 1']);
	expect(await noScroll(page)).toBe(true);
});

test('Scenario: Only sub-folders or only notes omits the other section', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Nur Ordner' }, { name: 'Unter', parent: 0 }, { name: 'Nur Notizen' }],
		notes: [{ title: 'Eine', folder: 2 }]
	});
	await calm(page);

	await open(page, `/folders/${folders[0]}`);
	await expect(folderRows(page)).toBeVisible();
	await expect(main(page).getByRole('heading', { name: 'Notes' })).toHaveCount(0);
	await expect(noteRows(page)).toHaveCount(0);

	await open(page, `/folders/${folders[2]}`);
	await expect(noteRows(page)).toBeVisible();
	await expect(main(page).getByRole('heading', { name: 'Folders' })).toHaveCount(0);
	await expect(folderRows(page)).toHaveCount(0);
});

test('Scenario: Cover menu adds, changes and removes the cover', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	await expect(cover(page)).toHaveCount(0);

	await main(page).getByLabel('Add cover').setInputFiles(photo('house-solitude.jpg'));
	await expect(cover(page)).toHaveCount(1);
	const first = await cover(page).getAttribute('src');
	expect(first).toMatch(/^\/images\/\d+$/);
	// with a cover the action says what it does, as in the hi-fi
	await expect(main(page).getByRole('button', { name: 'Change cover', exact: true })).toBeVisible();
	await expect(main(page).getByRole('button', { name: 'Cover', exact: true })).toHaveCount(0);

	await main(page).getByRole('button', { name: 'Change cover', exact: true }).click();
	const chooser = page.waitForEvent('filechooser');
	await page.getByRole('menuitem', { name: 'Change cover' }).click();
	await (await chooser).setFiles(photo('lake-greek.jpg'));
	await expect(cover(page)).not.toHaveAttribute('src', first!);
	await expect(cover(page)).toHaveAttribute('src', /^\/images\/\d+$/);
	expect((await counts(request)).images).toBe(1);

	await main(page).getByRole('button', { name: 'Change cover', exact: true }).click();
	await page.getByRole('menuitem', { name: 'Remove cover' }).click();
	await expect(cover(page)).toHaveCount(0);
	await expect(main(page).getByRole('button', { name: 'Add cover' })).toBeVisible();
	expect((await counts(request)).images).toBe(0);
});

test('Scenario: Cover upload failure shows a toast', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0, cover: true }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	const kept = await cover(page).getAttribute('src');
	await page.route('**/api/folders/*/cover', (route) => (route.request().method() === 'PUT' ? route.fulfill({ status: 500, body: 'nope' }) : route.continue()));

	await main(page).locator('input[type=file]').setInputFiles(photo('lake-greek.jpg'));
	await expect(page.getByRole('status').filter({ hasText: "Couldn't upload — try again" })).toBeVisible();
	await expect(cover(page)).toHaveAttribute('src', kept!);
});

test('Scenario: Folder counts read singular', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }],
		notes: [{ title: 'Tempel', folder: 1 }]
	});
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	await expect(main(page).getByText('1 folder · 1 note', { exact: true })).toBeVisible();
	await expect(folderRows(page).getByRole('link', { name: /Japan/ })).toContainText('1 note');
});

test('Scenario: New folder appears without reload', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }], notes: [{ title: 'Tempel', folder: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	// the folder has nothing in it yet: the empty state carries the action
	await main(page).getByRole('button', { name: 'New folder' }).click();
	await page.getByRole('textbox', { name: 'Folder name' }).press('Enter');

	const row = folderRows(page).getByRole('link', { name: /Untitled folder/ });
	await expect(row).toBeVisible();
	const id = Number((await row.getAttribute('href'))!.split('/').pop());
	expect((await (await request.get(`/api/folders/${id}`)).json()).folder.parentId).toBe(folders[1]);
	if (isDesktop(info)) await expect(sidebar(page).getByRole('link', { name: 'Untitled folder', exact: true })).toBeVisible();
});

test('Scenario: Folder menu offers Rename, Move to and Delete', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);

	await main(page).getByRole('button', { name: 'Folder menu' }).click();
	await expect(page.getByRole('menu', { name: 'Folder menu' }).getByRole('menuitem')).toHaveText(['Rename', 'Move to…', 'Delete']);
	await page.getByRole('menuitem', { name: 'Rename' }).click();
	const input = page.getByRole('textbox', { name: 'Folder name' });
	await expect(input).toBeFocused();
	await input.fill('Nippon');
	await page.keyboard.press('Enter');

	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText('Nippon');
	await expect(main(page).getByRole('navigation', { name: 'Breadcrumb' }).getByText('Nippon', { exact: true })).toBeVisible();
	if (isDesktop(info)) await expect(sidebar(page).getByRole('button', { name: 'Nippon menu' })).toBeVisible();
});

test('Scenario: Long folder names wrap on the folder page', async ({ page, request }) => {
	await reset(request);
	const long = 'Ein sehr langer Ordnername der garantiert umbrechen muss weil er weit mehr als einhundert Zeichen enthält und trotzdem lesbar bleibt';
	const unbroken = 'Donaudampfschifffahrtsgesellschaftskapitaensmuetzenfabrikation1234';
	const { folders } = await seed(request, { folders: [{ name: unbroken }, { name: long, parent: 0 }] });
	await page.setViewportSize({ width: 375, height: 800 });
	await calm(page);

	await open(page, `/folders/${folders[1]}`);
	const nav = await crumbs(page);
	await expect(nav.getByRole('link', { name: unbroken.slice(0, 20) })).toBeVisible();
	await expect(main(page).getByRole('heading', { level: 1 })).toHaveText(long);
	expect(await noScroll(page)).toBe(true);
	expect((await main(page).getByRole('heading', { level: 1 }).boundingBox())!.height).toBeGreaterThan(60);

	await open(page, `/folders/${folders[0]}`);
	expect(await noScroll(page)).toBe(true);
});
