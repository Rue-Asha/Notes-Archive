import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, folderOrder, open, reset, seed, setSort, sidebar } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'the sort picker sits in the sidebar tree header');
});

const sortButton = (page: Page) => sidebar(page).getByRole('button', { name: 'Sort folders' });
const modes = (page: Page) => page.getByRole('menu', { name: 'Sort folders' }).getByRole('menuitemradio');

// created oldest to newest: Alpha, Mike, Zulu; by name the same order reversed for "created"
async function seedFolders(request: Parameters<typeof seed>[0]) {
	return seed(request, {
		folders: [
			{ name: 'Alpha', createdAt: ago(3) },
			{ name: 'Zulu', createdAt: ago(1) },
			{ name: 'Mike', createdAt: ago(2) }
		]
	});
}

const checked = async (items: Locator) => items.evaluateAll((els) => els.filter((el) => el.getAttribute('aria-checked') === 'true').map((el) => (el.textContent ?? '').trim()));

test('Scenario: Sort picker marks the current mode', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');

	await sortButton(page).click();
	await expect(modes(page)).toHaveCount(4);
	await expect(modes(page)).toHaveText([/Default/, /Name/, /Last edited/, /Created/]);
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Default/)]);

	await setSort(request, 'edited');
	await open(page, '/');
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Last edited/)]);
});

test('Scenario: Choosing a mode re-sorts and persists', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');
	expect(await folderOrder(sidebar(page))).toEqual(['Alpha', 'Mike', 'Zulu']);

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await expect.poll(() => folderOrder(sidebar(page))).toEqual(['Zulu', 'Mike', 'Alpha']);
	await expect(page.getByRole('menu', { name: 'Sort folders' })).toHaveCount(0);

	await open(page, '/');
	expect(await folderOrder(sidebar(page))).toEqual(['Zulu', 'Mike', 'Alpha']);
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Created/)]);
});

test('Scenario: Failed sort save reverts with a toast', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');
	await page.route('**/api/settings', (route) => (route.request().method() === 'PATCH' ? route.fulfill({ status: 500, body: 'nope' }) : route.continue()));

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	expect(await folderOrder(sidebar(page))).toEqual(['Alpha', 'Mike', 'Zulu']);
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Default/)]);
});

test('Scenario: Sort leaves the other lists alone', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, {
		folders: [{ name: 'Japan' }],
		notes: [
			{ title: 'Zeta', body: 'garten', folder: 0, tags: ['Reise'], updatedAt: ago(1) },
			{ title: 'Alpha', body: 'garten', folder: 0, tags: ['Reise'], updatedAt: ago(5) },
			{ title: 'Mike', body: 'garten', folder: 0, tags: ['Reise'], updatedAt: ago(3) }
		]
	});
	await calm(page);
	const tagPath = (await (await request.get('/')).text()).match(/href="(\/tags\/\d+)"/)?.[1];
	const paths = ['/', `/folders/${folders[0]}`, tagPath!, '/search?q=garten'];

	const lists = async () => {
		const out: string[][] = [];
		for (const path of paths) {
			await open(page, path);
			out.push((await page.getByRole('main').locator('a[href^="/notes/"]').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim()));
		}
		return out;
	};
	const before = await lists();
	expect(before.every((list) => list.length >= 3)).toBe(true);

	await setSort(request, 'name');
	expect(await lists()).toEqual(before);
});

test('Regression: the picker hands the focus back to its button', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');

	await sortButton(page).click();
	await expect(modes(page).first()).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(sortButton(page)).toBeFocused();

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Name/ }).click();
	await expect(page.getByRole('menu', { name: 'Sort folders' })).toHaveCount(0);
	await expect(sortButton(page)).toBeFocused();
});

test('Regression: a second choice outlives the first answer', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');
	let release!: () => void;
	const held = new Promise<void>((resolve) => (release = resolve));
	let patches = 0;
	await page.route('**/api/settings', async (route) => {
		if (route.request().method() !== 'PATCH') return route.continue();
		if (++patches > 1) return route.continue();
		await held;
		await route.fulfill({ status: 500, body: 'nope' });
	});

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Created/)]);
	await page.getByRole('menuitemradio', { name: /^Last edited/ }).click();
	await expect.poll(() => patches).toBe(2);
	release();

	await page.waitForTimeout(300);
	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toHaveCount(0);
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Last edited/)]);
	await open(page, '/');
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Last edited/)]);
});

test('Regression: an older choice that lands after a failed one is what the picker shows', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');
	let release!: () => void;
	const held = new Promise<void>((resolve) => (release = resolve));
	let patches = 0;
	let landed = false;
	await page.route('**/api/settings', async (route) => {
		if (route.request().method() !== 'PATCH') return route.continue();
		if (++patches > 1) return route.fulfill({ status: 500, body: 'nope' });
		await held;
		await route.continue();
		landed = true;
	});

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Last edited/ }).click();
	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	release();
	await expect.poll(() => landed).toBe(true);

	await expect.poll(() => folderOrder(sidebar(page))).toEqual(['Zulu', 'Mike', 'Alpha']);
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Created/)]);
	await open(page, '/');
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Created/)]);
});

test('Regression: a choice made while a failed one reloads keeps its tick', async ({ page, request }) => {
	await reset(request);
	await seedFolders(request);
	await calm(page);
	await open(page, '/');
	let releaseReload!: () => void;
	const reloadHeld = new Promise<void>((resolve) => (releaseReload = resolve));
	let releaseSecond!: () => void;
	const secondHeld = new Promise<void>((resolve) => (releaseSecond = resolve));
	let patches = 0;
	let reloads = 0;
	await page.route('**/api/settings', async (route) => {
		if (route.request().method() !== 'PATCH') return route.continue();
		if (++patches === 1) return route.fulfill({ status: 500, body: 'nope' });
		await secondHeld;
		await route.continue();
	});
	await page.route('**/__data.json*', async (route) => {
		if (++reloads === 1) await reloadHeld;
		await route.continue();
	});

	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Created/ }).click();
	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect.poll(() => reloads).toBe(1);
	// the failed choice's reload is still running when the next choice is made
	await sortButton(page).click();
	await page.getByRole('menuitemradio', { name: /^Last edited/ }).click();
	await expect.poll(() => patches).toBe(2);
	releaseReload();
	await expect.poll(() => reloads).toBeGreaterThanOrEqual(1);
	await page.waitForTimeout(300);

	// the newer choice's answer has not come yet: the picker shows it, not the server's Default
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Last edited/)]);
	await page.keyboard.press('Escape');
	releaseSecond();
	await expect.poll(() => folderOrder(sidebar(page))).not.toEqual([]);
	await sortButton(page).click();
	expect(await checked(modes(page))).toEqual([expect.stringMatching(/^Last edited/)]);
});
