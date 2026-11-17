import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, watchSaves } from './helpers.ts';

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the focus tree is the pointer posture');
});

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Sidebar' });
const pathRow = (page: Page) => sidebar(page).getByRole('navigation', { name: 'Path' });
const noHScroll = (page: Page) => sidebar(page).evaluate((el) => el.scrollWidth <= el.clientWidth);

async function japan(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }, { name: 'Tempel', parent: 2 }, { name: 'Island' }],
		notes: [
			{ title: 'Fushimi', body: 'Tore', folder: 2 },
			{ title: 'Kinkaku', body: 'Gold', folder: 2 },
			{ title: 'Packliste', body: 'Zelt', folder: 1 },
			{ title: 'Lose Notiz', body: 'x' }
		]
	});
}

test('Scenario: Opening a folder focuses the tree on it', async ({ page, request }) => {
	const { folders } = await japan(request);
	await calm(page);
	await open(page, '/');
	const tree = sidebar(page);

	await tree.getByRole('button', { name: 'Expand Reisen' }).click();
	await tree.getByRole('button', { name: 'Expand Japan' }).click();
	await tree.getByRole('link', { name: 'Kyoto', exact: true }).click();

	await page.waitForURL(`**/folders/${folders[2]}`);
	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();
	await expect(pathRow(page).getByRole('link', { name: 'Japan' })).toBeVisible();
	const tempel = tree.getByRole('link', { name: 'Tempel', exact: true });
	const fushimi = tree.getByRole('link', { name: 'Fushimi', exact: true });
	await expect(tempel).toBeVisible();
	await expect(fushimi).toBeVisible();
	await expect(tree.getByRole('link', { name: 'Island', exact: true })).toHaveCount(0);
	// the first indent level: children sit one step in from the focused folder's name
	const focus = (await tree.locator('div[title="Kyoto"]').boundingBox())!;
	const child = (await tempel.boundingBox())!;
	expect(child.x).toBeGreaterThanOrEqual(focus.x - 2);
	expect(child.x).toBeLessThan(focus.x + 60);
});

test('Scenario: Path row links go up', async ({ page, request }) => {
	const { folders } = await japan(request);
	await calm(page);
	await open(page, `/folders/${folders[2]}`);

	await pathRow(page).getByRole('link', { name: 'Japan' }).click();
	await page.waitForURL(`**/folders/${folders[1]}`);
	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();
	await expect(pathRow(page).getByRole('link', { name: 'Japan' })).toHaveCount(0);
	await expect(sidebar(page).getByRole('link', { name: 'Kyoto', exact: true })).toBeVisible();
	await expect(sidebar(page).getByRole('link', { name: 'Packliste', exact: true })).toBeVisible();
});

test('Scenario: Top level has no path row', async ({ page, request }) => {
	await japan(request);
	await calm(page);

	for (const path of ['/', '/search']) {
		await open(page, path);
		await expect(sidebar(page).getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();
		await expect(sidebar(page).getByRole('link', { name: 'Island', exact: true })).toBeVisible();
		await expect(pathRow(page)).toHaveCount(0);
	}
});

test('Scenario: Deep path shortens the middle', async ({ page, request }) => {
	const names = Array.from({ length: 12 }, (_, i) => `Ebene ${i + 1} mit etwas längerem Namen`);
	await reset(request);
	const { folders } = await seed(request, { folders: names.map((name, i) => (i === 0 ? { name } : { name, parent: i - 1 })) });
	await calm(page);
	await open(page, `/folders/${folders[11]}`);

	const row = pathRow(page);
	await expect(row.getByRole('link', { name: names[0] })).toBeVisible();
	await expect(row.getByRole('link', { name: names[10] })).toBeVisible();
	await expect(row.getByRole('link', { name: names[8] })).toHaveCount(0);
	await expect(row.getByRole('link', { name: names[1] })).toHaveCount(0);
	expect(await noHScroll(page)).toBe(true);

	await row.getByRole('button', { name: /Show all 11 parent folders/ }).click();
	// the "…" goes away under the focus, which moves to the first folder it showed
	await expect(row.getByRole('link', { name: names[1] })).toBeFocused();
	for (const name of names.slice(0, 11)) await expect(row.getByRole('link', { name })).toBeVisible();
	for (const name of names.slice(0, 11)) {
		const box = (await row.getByRole('link', { name }).boundingBox())!;
		expect(box.width).toBeGreaterThan(100);
	}
	expect(await noHScroll(page)).toBe(true);

	await row.getByRole('button', { name: 'Shorten path' }).click();
	await expect(row.getByRole('button', { name: /Show all 11 parent folders/ })).toBeFocused();
});

test('Scenario: Long names stay readable in the tree', async ({ page, request }) => {
	const long = Array.from({ length: 12 }, () => 'Lange Bezeichnung').join(' ').slice(0, 120);
	const unbroken = 'X'.repeat(60);
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: long }, { name: unbroken, parent: 0 }, { name: 'Ziel', parent: 1 }] });
	await calm(page);
	const tree = sidebar(page);

	await open(page, `/folders/${folders[0]}`);
	const child = tree.getByRole('link', { name: unbroken, exact: true });
	await expect(child).toHaveAttribute('title', unbroken);
	await expect(tree.getByText(long, { exact: true }).first()).toBeVisible();
	expect(await noHScroll(page)).toBe(true);
	expect((await child.boundingBox())!.width).toBeLessThanOrEqual((await tree.boundingBox())!.width);

	await open(page, `/folders/${folders[2]}`);
	const links = pathRow(page).getByRole('link');
	await expect(links.filter({ hasText: unbroken.slice(0, 5) })).toHaveAttribute('title', unbroken);
	await expect(links.filter({ hasText: 'Lange' })).toHaveAttribute('title', long);
	expect(await noHScroll(page)).toBe(true);
});

test('Scenario: Deleting the focused folder moves the focus up', async ({ page, request }) => {
	const { folders } = await japan(request);
	await calm(page);
	await open(page, `/folders/${folders[2]}`);

	await sidebar(page).getByRole('button', { name: 'Kyoto menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /^Delete “/ }).getByRole('button', { name: 'Delete' }).click();
	await page.waitForURL(`**/folders/${folders[1]}`);
	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: 'Japan menu' })).toBeVisible();

	await sidebar(page).getByRole('button', { name: 'Japan menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /^Delete “/ }).getByRole('button', { name: 'Delete' }).click();
	await page.waitForURL(`**/folders/${folders[0]}`);
	await sidebar(page).getByRole('button', { name: 'Reisen menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /^Delete “/ }).getByRole('button', { name: 'Delete' }).click();
	await page.waitForURL((url) => url.pathname === '/');
	await expect(pathRow(page)).toHaveCount(0);
	await expect(sidebar(page).getByRole('link', { name: 'Island', exact: true })).toBeVisible();
});

test('Scenario: Opening a note from search focuses its folder', async ({ page, request }) => {
	const { notes } = await japan(request);
	await calm(page);
	const focused = async (note: string) => {
		await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();
		await expect(sidebar(page).getByRole('link', { name: note, exact: true })).toHaveAttribute('aria-current', 'page');
	};

	await open(page, '/');
	await page.keyboard.press('ControlOrMeta+k');
	await page.getByRole('combobox', { name: 'Search notes' }).fill('Packliste');
	await page.getByRole('dialog', { name: 'Search' }).getByRole('option', { name: /Packliste/ }).click();
	await page.waitForURL(`**/notes/${notes[2]}`);
	await focused('Packliste');
	await expect(sidebar(page).getByRole('link', { name: 'Kyoto', exact: true })).toBeVisible();

	await open(page, '/search?q=Packliste');
	await page.getByRole('main').getByRole('link', { name: /Packliste/ }).first().click();
	await page.waitForURL(`**/notes/${notes[2]}`);
	await focused('Packliste');

	await open(page, '/');
	await page.getByRole('main').getByRole('link', { name: /Packliste/ }).first().click();
	await page.waitForURL(`**/notes/${notes[2]}`);
	await focused('Packliste');
});

test('Scenario: Top-level note shows the top level', async ({ page, request }) => {
	const { notes } = await japan(request);
	await calm(page);
	await open(page, `/notes/${notes[3]}`);

	await expect(pathRow(page)).toHaveCount(0);
	await expect(sidebar(page).getByRole('link', { name: 'Reisen', exact: true })).toBeVisible();
	await expect(sidebar(page).getByRole('link', { name: 'Lose Notiz', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('Scenario: Moving the open note moves the focus', async ({ page, request }) => {
	const { notes } = await japan(request);
	await calm(page);
	const saves = watchSaves(page);
	await open(page, `/notes/${notes[2]}`);
	await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));
	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Move to…' }).click();
	await page.getByRole('dialog', { name: 'Choose a folder' }).getByRole('option', { name: 'Island' }).click();
	await saves.settled();

	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toHaveCount(0);
	await expect(sidebar(page).locator('div[title="Island"]')).toBeVisible();
	await expect(sidebar(page).getByRole('link', { name: 'Packliste', exact: true })).toHaveAttribute('aria-current', 'page');
	expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
});

test('Scenario: Deleting the open note keeps its folder focused', async ({ page, request }) => {
	const { notes, folders } = await japan(request);
	await calm(page);
	await open(page, `/notes/${notes[2]}`);

	await page.getByRole('button', { name: 'Note menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete' }).click();
	await page.getByRole('alertdialog', { name: /Delete/ }).getByRole('button', { name: 'Delete' }).click();

	await page.waitForURL(`**/folders/${folders[1]}`);
	await expect(pathRow(page).getByRole('link', { name: 'Reisen' })).toBeVisible();
	await expect(sidebar(page).getByRole('button', { name: 'Japan menu' })).toBeVisible();
	await expect(sidebar(page).getByRole('link', { name: 'Packliste', exact: true })).toHaveCount(0);
});
