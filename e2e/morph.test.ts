import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

interface Probe {
	calls: number;
	before: string[];
	after: string[];
}

declare global {
	interface Window {
		__morphProbe: Probe;
	}
}

// Wraps startViewTransition: records the names the old state carries when the transition starts and the
// names the new state carries once Kit has swapped the page.
async function probe(page: Page) {
	await page.evaluate(() => {
		const probe: Probe = { calls: 0, before: [], after: [] };
		const named = () =>
			[...document.querySelectorAll<HTMLElement>('[data-morph]')]
				.map((el) => ({ el, name: getComputedStyle(el).viewTransitionName }))
				.filter(({ name }) => name !== 'none')
				.map(({ el, name }) => `${el.hasAttribute('data-note-header') ? 'header' : 'card'}:${name}`);
		const original = document.startViewTransition.bind(document);
		document.startViewTransition = ((update: () => Promise<void>) => {
			probe.calls++;
			probe.before = named();
			return original(async () => {
				await update();
				probe.after = named();
			});
		}) as typeof document.startViewTransition;
		window.__morphProbe = probe;
	});
}

const state = (page: Page) => page.evaluate(() => window.__morphProbe);

async function folderWith(request: Parameters<typeof reset>[0], titles: string[]) {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Reisen' }],
		notes: titles.map((title, i) => ({ title, body: `Text ${i}`, folder: 0, updatedAt: new Date(Date.now() - i * 60_000).toISOString() }))
	});
	return { folder: folders[0], notes };
}

test('Scenario: Note card morphs into the note page', async ({ page, request }) => {
	const { folder, notes } = await folderWith(request, ['Packliste']);
	await open(page, `/folders/${folder}`);
	await probe(page);

	await page.locator('[data-note-card]').click();
	await expect(page.locator('[data-note-page]')).toBeVisible();

	const seen = await state(page);
	expect(seen.calls).toBeGreaterThan(0);
	expect(seen.before).toEqual([`card:note-${notes[0]}`]);
	expect(seen.after).toEqual([`header:note-${notes[0]}`]);
});

test('the clicked card is the one that morphs when a note shows twice on Home', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Doppelt', pinnedAt: new Date().toISOString() }] });
	await open(page, '/');
	await page.evaluate(() => {
		const original = document.startViewTransition.bind(document);
		document.startViewTransition = ((update: () => Promise<void>) => {
			const source = document.querySelector<HTMLElement>('[data-morph][style*="view-transition-name"]');
			(window as unknown as { __source: string | undefined }).__source = source?.closest('[aria-labelledby]')?.getAttribute('aria-labelledby') ?? undefined;
			return original(update);
		}) as typeof document.startViewTransition;
	});

	await page.getByRole('region', { name: 'Recently edited' }).locator('[data-note-card] a.open').click();
	await expect(page.locator('[data-note-page]')).toBeVisible();

	expect(await page.evaluate(() => (window as unknown as { __source: string }).__source)).toBe('home-recent');
	expect(notes).toHaveLength(1);
});

test('Scenario: Back from a note reverses the morph', async ({ page, request }) => {
	const { folder, notes } = await folderWith(request, ['Packliste']);
	await open(page, `/folders/${folder}`);
	await page.locator('[data-note-card]').click();
	await expect(page.locator('[data-note-page]')).toBeVisible();
	await probe(page);

	await page.goBack();
	await expect(page.locator('[data-note-card]')).toBeVisible();

	const seen = await state(page);
	expect(seen.calls).toBeGreaterThan(0);
	expect(seen.before).toEqual([`header:note-${notes[0]}`]);
	expect(seen.after).toEqual([`card:note-${notes[0]}`]);
});

test('Scenario: Reduced motion skips the morph', async ({ page, request }) => {
	const { folder, notes } = await folderWith(request, ['Packliste']);
	await calm(page);
	await open(page, `/folders/${folder}`);
	await probe(page);

	await page.locator('[data-note-card]').click();
	await expect(page).toHaveURL(`/notes/${notes[0]}`);
	await expect(page.locator('[data-note-page]')).toBeVisible();

	const seen = await state(page);
	expect(seen.before).toEqual([]);
	expect(seen.after).toEqual([]);
});

test('Scenario: Cards stagger in', async ({ page, request }) => {
	const { folder } = await folderWith(request, ['A', 'B', 'C', 'D', 'E', 'F']);
	await open(page, `/folders/${folder}`);

	const cards = page.locator('[data-note-card]');
	await expect(cards).toHaveCount(6);
	for (let i = 0; i < 6; i++) await cards.nth(i).evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await expect(page.locator('[data-note-card]:not([data-revealed])')).toHaveCount(0);

	const delay = (i: number) => cards.nth(i).evaluate((el) => parseFloat(el.style.getPropertyValue('--stagger')));
	expect(await delay(0)).toBeLessThan(await delay(5));
});

test('Scenario: Reduced motion shows lists at once', async ({ page, request }) => {
	const { folder } = await folderWith(request, ['A', 'B', 'C', 'D', 'E', 'F']);
	await calm(page);
	await open(page, `/folders/${folder}`);

	const cards = page.locator('[data-note-card]');
	await expect(cards).toHaveCount(6);
	await expect(page.locator('[data-note-card][data-revealed]')).toHaveCount(6);
	for (const card of await cards.all()) {
		expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
		expect(await card.evaluate((el) => el.style.getPropertyValue('--stagger'))).toBe('');
	}
});

test('Scenario: Glass cards glow on hover', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop-only');
	const { folder } = await folderWith(request, ['Packliste']);
	await open(page, `/folders/${folder}`);

	const card = page.locator('[data-note-card]');
	const glow = card.locator('[data-card-glow]');
	const opacity = () => glow.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
	expect(await opacity()).toBe(0);

	await card.hover();
	await expect.poll(opacity).toBeGreaterThan(0);
	await page.mouse.move(0, 0);
	await expect.poll(opacity).toBe(0);
});
