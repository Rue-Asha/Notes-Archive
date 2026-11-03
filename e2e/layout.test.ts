import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

async function twelve(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Reisen', cover: true }, { name: 'Japan', parent: 0 }],
		notes: Array.from({ length: 12 }, (_, i) => ({
			title: `Notiz ${i + 1}`,
			body: 'Ein Satz, der lang genug ist, um den Schnipsel der Karte zu füllen und zwei Zeilen zu brauchen.',
			folder: 0,
			tags: ['Reise'],
			updatedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`
		}))
	});
}

async function cards(page: Page, root: string) {
	const boxes = await page.locator(`${root} [data-note-card]`).evaluateAll((els) =>
		els.map((el) => {
			const r = el.getBoundingClientRect();
			return { x: Math.round(r.x), y: Math.round(r.y), width: r.width };
		})
	);
	const firstRow = boxes.filter((b) => Math.abs(b.y - boxes[0].y) < 4);
	return { columns: firstRow.length, widest: Math.max(...boxes.map((b) => b.width)) };
}

const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('Scenario: Grids add columns instead of stretching cards', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	const { folders } = await twelve(request);
	await calm(page);

	const at = async (width: number) => {
		await page.setViewportSize({ width, height: 900 });
		await open(page, '/');
		const home = await cards(page, '[data-recent]');
		await open(page, `/folders/${folders[0]}`);
		const folder = await cards(page, 'main');
		return { home, folder };
	};
	const w1280 = await at(1280);
	const w1600 = await at(1600);

	for (const grid of [w1280.home, w1280.folder, w1600.home, w1600.folder]) expect(grid.widest).toBeLessThanOrEqual(320);
	expect(w1600.home.columns).toBeGreaterThan(w1280.home.columns);
	expect(w1600.folder.columns).toBeGreaterThan(w1280.folder.columns);
});

test('Scenario: Mid-width shows the sidebar with fewer columns', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	const { folders } = await twelve(request);
	await calm(page);

	await page.setViewportSize({ width: 1280, height: 800 });
	await open(page, '/');
	const wideHome = await cards(page, '[data-recent]');
	await open(page, `/folders/${folders[0]}`);
	const wide = await cards(page, 'main');

	await page.setViewportSize({ width: 1100, height: 800 });
	await open(page, '/');
	await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeVisible();
	expect(await noScroll(page)).toBe(true);
	const home = await cards(page, '[data-recent]');
	await open(page, `/folders/${folders[0]}`);
	const folder = await cards(page, 'main');

	expect(folder.columns).toBeLessThan(wide.columns);
	expect(home.columns).toBeLessThan(wideHome.columns);
	expect(await noScroll(page)).toBe(true);
});

test('No horizontal page scroll on phone over every main screen', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	const { folders, notes } = await twelve(request);
	await calm(page);

	await open(page, '/');
	await page.getByRole('button', { name: 'Folders' }).click();
	const tagPath = await page.getByRole('link', { name: /Reise/ }).first().getAttribute('href');
	await page.keyboard.press('Escape');

	const paths = ['/', `/folders/${folders[0]}`, `/notes/${notes[0]}`, '/search', '/search?q=Satz', tagPath!];
	for (const path of paths) {
		await open(page, path);
		expect(await noScroll(page), path).toBe(true);
	}
});
