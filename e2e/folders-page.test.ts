import { expect, test } from '@playwright/test';
import { bottomBar, calm, folderOrder, isDesktop, open, reset, seed, sidebar } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const list = (page: import('@playwright/test').Page) => page.getByRole('main').getByRole('list', { name: 'Folders' });

test('Scenario: Folders page lists top-level folders with counts, then tags', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'phone page');
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Garten' }],
		notes: [
			{ title: 'Packliste', folder: 0, tags: ['Reise'] },
			{ title: 'Visa', folder: 0, tags: ['Übung'] },
			{ title: 'Tempel', folder: 1, tags: ['Reise'] }
		]
	});
	await calm(page);
	await open(page, '/folders');

	const main = page.getByRole('main');
	const rows = list(page).getByRole('link');
	await expect(rows).toHaveCount(2);
	await expect(rows.nth(0)).toContainText('Garten');
	await expect(rows.nth(0)).toContainText('0 notes');
	await expect(rows.nth(1)).toContainText('Reisen');
	await expect(rows.nth(1)).toContainText('3 notes');

	const tags = main.getByRole('region', { name: 'Tags' });
	await expect(tags.getByRole('link')).toHaveCount(2);
	await expect(main.getByRole('button', { name: 'Sort folders' })).toBeVisible();
	await expect(main.getByRole('button', { name: 'New folder' })).toBeVisible();
	const listBox = (await list(page).boundingBox())!;
	const tagsBox = (await tags.boundingBox())!;
	expect(tagsBox.y).toBeGreaterThan(listBox.y + listBox.height - 1);
	// "New folder", then the sort button, both in the head above the folders
	const add = (await main.getByRole('button', { name: 'New folder' }).boundingBox())!;
	expect(add.y + add.height).toBeLessThanOrEqual(listBox.y + 1);
	const follows = await main.getByRole('button', { name: 'New folder' }).evaluate((add, sort) => !!(add.compareDocumentPosition(sort!) & Node.DOCUMENT_POSITION_FOLLOWING), await main.getByRole('button', { name: 'Sort folders' }).elementHandle());
	expect(follows).toBe(true);
});

test('Scenario: Folders pill opens the Folders page', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'the Bottom bar only exists below 1024 px');
	await reset(request);
	await calm(page);
	await open(page, '/');

	await bottomBar(page).getByRole('link', { name: 'Folders' }).click();
	await page.waitForURL((url) => url.pathname === '/folders');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('Scenario: No folders shows No folders yet', async ({ page, request }) => {
	await reset(request);
	await calm(page);
	await open(page, '/folders');

	const main = page.getByRole('main');
	await expect(main.getByText('No folders yet')).toBeVisible();
	await expect(main.getByRole('button', { name: 'New folder' })).toBeVisible();
});

test('Scenario: New folder from the Folders page', async ({ page, request }, info) => {
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }] });
	await calm(page);
	await open(page, '/folders');

	await page.getByRole('main').getByRole('button', { name: 'New folder' }).first().click();
	await page.getByRole('textbox', { name: 'Folder name' }).press('Enter');
	await expect(list(page).getByRole('link', { name: /Untitled folder/ })).toBeVisible();
	if (isDesktop(info)) await expect(sidebar(page).getByRole('link', { name: 'Untitled folder', exact: true })).toBeVisible();
});

test('Scenario: Desktop Folders page shows the tree at the top level', async ({ page, request }, info) => {
	test.skip(!isDesktop(info), 'desktop page');
	await reset(request);
	await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
	await calm(page);
	await open(page, '/folders');

	await expect(list(page).getByRole('link', { name: /Reisen/ })).toBeVisible();
	await expect(sidebar(page).getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();
	await expect(sidebar(page).getByRole('navigation', { name: 'Path' })).toHaveCount(0);
});

test('Scenario: Tags follow the folders on the phone', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'phone page');
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: [
			{ title: 'A', folder: 0, tags: ['Reise', 'Übung'] },
			{ title: 'B', tags: ['Reise'] }
		]
	});
	await calm(page);
	await open(page, '/folders');

	const tags = page.getByRole('main').getByRole('region', { name: 'Tags' });
	await expect(tags.getByRole('link')).toHaveText([/Reise\s*2/, /Übung\s*1/]);
	expect((await tags.boundingBox())!.y).toBeGreaterThan((await list(page).boundingBox())!.y);
	await expect(page.getByRole('main').getByRole('region', { name: 'Tags' })).toHaveCount(1);
});

test('Scenario: Sort picker on the phone lives on the Folders page', async ({ page, request }, info) => {
	test.skip(isDesktop(info), 'phone page');
	await reset(request);
	await seed(request, { folders: [{ name: 'Alpha', createdAt: ago(3) }, { name: 'Zulu', createdAt: ago(1) }, { name: 'Mike', createdAt: ago(2) }] });
	await calm(page);
	await open(page, '/folders');
	const names = async () => (await folderOrder(list(page))).map((t) => t.split('\n')[0].replace(/\s*0 notes$/, '').trim());
	expect(await names()).toEqual(['Alpha', 'Mike', 'Zulu']);

	await page.getByRole('main').getByRole('button', { name: 'Sort folders' }).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await expect.poll(names).toEqual(['Zulu', 'Mike', 'Alpha']);
});
