import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const CONFLICT = 'Pinned order changed elsewhere — reloaded';

// A, B, C pinned in this order; D and E stay unpinned
async function pinnedABC(request: APIRequestContext) {
	await reset(request);
	const { notes } = await seed(request, { notes: ['A', 'B', 'C', 'D', 'E'].map((title) => ({ title, body: `Text ${title}` })) });
	for (const id of notes.slice(0, 3)) expect((await request.patch(`/api/notes/${id}`, { data: { pinned: true } })).ok()).toBe(true);
	expect((await request.put('/api/pinned', { data: { ids: notes.slice(0, 3) } })).ok()).toBe(true);
	return notes;
}

const pinned = (page: Page) => page.getByRole('main').getByRole('region', { name: 'Pinned' });
const titles = (page: Page) => pinned(page).getByRole('heading', { level: 3 });
const entry = (page: Page, title: string): Locator => pinned(page).getByRole('article').filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) });
const menuOf = (page: Page, title: string): Locator => entry(page, title).getByRole('button', { name: 'Note actions' });

const isPut = (url: string, method: string) => new URL(url).pathname === '/api/pinned' && method === 'PUT';

test('Scenario: Drag a pinned note to a new place', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'dragging is for pointers');
	const notes = await pinnedABC(request);
	await calm(page);
	await open(page, '/');
	await expect(titles(page)).toHaveText(['A', 'B', 'C']);

	const handle = (await entry(page, 'C').getByRole('button', { name: 'Drag to reorder' }).boundingBox())!;
	const target = (await entry(page, 'A').boundingBox())!;
	const saved = page.waitForRequest((req) => isPut(req.url(), req.method()));
	await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
	await page.mouse.down();
	await page.mouse.move(handle.x + handle.width / 2, handle.y - 20, { steps: 4 });
	await page.mouse.move(handle.x + handle.width / 2, target.y + 4, { steps: 8 });
	await page.mouse.up();

	expect((await saved).postDataJSON()).toEqual({ ids: [notes[2], notes[0], notes[1]] });
	await expect(titles(page)).toHaveText(['C', 'A', 'B']);
	await page.reload();
	await expect(titles(page)).toHaveText(['C', 'A', 'B']);
});

test('Scenario: Move up and Move down reorder from the menu', async ({ page, request }, info) => {
	await pinnedABC(request);
	await calm(page);
	await open(page, '/');

	const choose = async (title: string, item: string) => {
		const saved = page.waitForRequest((req) => isPut(req.url(), req.method()));
		if (info.project.name === 'desktop') {
			await menuOf(page, title).focus();
			await page.keyboard.press('Enter');
			await expect(page.getByRole('menu', { name: 'Note actions' })).toBeVisible();
			await page.getByRole('menuitem', { name: item }).focus();
			await page.keyboard.press('Enter');
		} else {
			await menuOf(page, title).click();
			await page.getByRole('menuitem', { name: item }).click();
		}
		await saved;
	};

	await choose('A', 'Move down');
	await expect(titles(page)).toHaveText(['B', 'A', 'C']);
	await expect(menuOf(page, 'A')).toBeFocused();
	await choose('C', 'Move up');
	await expect(titles(page)).toHaveText(['B', 'C', 'A']);
	await expect(menuOf(page, 'C')).toBeFocused();

	await page.reload();
	await expect(titles(page)).toHaveText(['B', 'C', 'A']);
});

test('Scenario: Move up and Move down are disabled at the ends', async ({ page, request }) => {
	await pinnedABC(request);
	await calm(page);
	await open(page, '/');

	await menuOf(page, 'A').click();
	await expect(page.getByRole('menuitem', { name: 'Move up' })).toBeDisabled();
	await expect(page.getByRole('menuitem', { name: 'Move down' })).toBeEnabled();
	await page.keyboard.press('Escape');
	await menuOf(page, 'C').click();
	await expect(page.getByRole('menuitem', { name: 'Move down' })).toBeDisabled();
	await expect(page.getByRole('menuitem', { name: 'Move up' })).toBeEnabled();
});

test('Scenario: A stale reorder reloads the list with a toast', async ({ page, request }) => {
	const notes = await pinnedABC(request);
	await calm(page);
	await open(page, '/');
	await expect(titles(page)).toHaveText(['A', 'B', 'C']);

	// another window unpins B, so the page's list no longer matches the pinned set
	expect((await request.patch(`/api/notes/${notes[1]}`, { data: { pinned: false } })).ok()).toBe(true);
	await menuOf(page, 'A').click();
	await page.getByRole('menuitem', { name: 'Move down' }).click();

	await expect(titles(page)).toHaveText(['A', 'C']);
	const toast = page.getByRole('status').filter({ hasText: CONFLICT });
	await expect(toast).toBeVisible();
	await expect(toast).toHaveAttribute('aria-live', 'polite');
});

test('Scenario: Failed reorder reverts with a toast', async ({ page, request }) => {
	await pinnedABC(request);
	await calm(page);
	await open(page, '/');
	await page.route('**/api/pinned', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"boom"}' }));

	await menuOf(page, 'A').click();
	await page.getByRole('menuitem', { name: 'Move down' }).click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(titles(page)).toHaveText(['A', 'B', 'C']);
});

for (const [status, message] of [[500, "Couldn't save — try again"], [409, CONFLICT]] as const) {
	test(`Regression: moves queued behind a ${status} are dropped with one toast`, async ({ page, request }) => {
		await pinnedABC(request);
		await calm(page);
		await open(page, '/');
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		let puts = 0;
		await page.route('**/api/pinned', async (route) => {
			puts++;
			await held;
			await route.fulfill({ status, contentType: 'application/json', body: '{"error":"no"}' });
		});

		await menuOf(page, 'A').click();
		await page.getByRole('menuitem', { name: 'Move down' }).click();
		await expect(titles(page)).toHaveText(['B', 'A', 'C']);
		await menuOf(page, 'C').click();
		await page.getByRole('menuitem', { name: 'Move up' }).click();
		await expect(titles(page)).toHaveText(['B', 'C', 'A']);
		release();

		await expect(page.getByRole('status').filter({ hasText: message })).toHaveCount(1);
		await expect(titles(page)).toHaveText(['A', 'B', 'C']);
		await page.waitForTimeout(300);
		expect(puts).toBe(1);
		await expect(page.getByRole('status').filter({ hasText: message })).toHaveCount(1);
	});
}

test('Scenario: New pins appear first', async ({ page, request }) => {
	const notes = await pinnedABC(request);
	expect((await request.put('/api/pinned', { data: { ids: [notes[1], notes[2], notes[0]] } })).ok()).toBe(true);
	await calm(page);
	await open(page, '/');
	await expect(titles(page)).toHaveText(['B', 'C', 'A']);

	const row = page.getByRole('main').getByRole('region', { name: 'Recently edited' }).getByRole('article').filter({ has: page.getByRole('heading', { level: 3, name: 'D', exact: true }) });
	await row.getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Pin', exact: true }).click();

	await expect(titles(page)).toHaveText(['D', 'B', 'C', 'A']);
});

// counts the animations that run on the pinned entries themselves while a note moves down
async function animationsDuringMove(page: Page) {
	await page.evaluate(() => {
		const list = document.querySelector<HTMLElement>('[data-pinned-list]')!;
		const probe = { max: 0, transitions: 0, done: false };
		(window as unknown as { __probe: typeof probe }).__probe = probe;
		const stop = performance.now() + 700;
		const tick = () => {
			probe.max = Math.max(probe.max, ...[...list.children].map((li) => li.getAnimations().length));
			for (const li of list.children) if (parseFloat(getComputedStyle(li).transitionDuration) > 0 && getComputedStyle(li).transitionProperty.includes('transform')) probe.transitions++;
			if (performance.now() < stop) requestAnimationFrame(tick);
			else probe.done = true;
		};
		requestAnimationFrame(tick);
	});
	await menuOf(page, 'A').click();
	await page.getByRole('menuitem', { name: 'Move down' }).click();
	await expect(titles(page)).toHaveText(['B', 'A', 'C']);
	await page.waitForFunction(() => (window as unknown as { __probe: { done: boolean } }).__probe.done);
	return page.evaluate(() => (window as unknown as { __probe: { max: number; transitions: number } }).__probe);
}

test('Scenario: Reduced motion moves without animation', async ({ page, request }) => {
	await pinnedABC(request);
	await calm(page);
	await open(page, '/');

	const probe = await animationsDuringMove(page);
	expect(probe.max).toBe(0);
	expect(probe.transitions).toBe(0);
});

test('A move animates without reduced motion', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'one run proves the probe sees motion');
	await pinnedABC(request);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await open(page, '/');

	expect((await animationsDuringMove(page)).max).toBeGreaterThan(0);
});
