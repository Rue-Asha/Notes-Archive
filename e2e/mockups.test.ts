import { expect, test, type Page } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { calm, open } from './helpers.ts';

const screens = ['home', 'folder', 'note', 'search', 'drawer'] as const;
type Screen = (typeof screens)[number];

const loaded = (page: Page, selector: string) =>
	page.locator(selector).evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0));

const blocks = [
	'.prose h1',
	'.prose h2',
	'.prose h3',
	'.prose ul:not([data-type])',
	'.prose ol',
	'.prose ul[data-type="taskList"]',
	'.prose blockquote',
	'.prose .callout',
	'.prose [data-type="details"]',
	'.prose pre code .hljs-keyword',
	'.prose table',
	'.prose hr',
	'.prose figure.image-block img',
	'.prose a.file-card',
	'.prose a.link-card',
	'[data-slash-menu]',
	'[data-bubble-menu]'
];

for (const screen of screens) {
	test.describe(`mockup ${screen}`, () => {
		const path = `/__mockups/${screen}`;

		test(`Scenario: Mockups render the five screens (${screen})`, async ({ page }, info) => {
			await calm(page);
			await open(page, path);
			await page.evaluate(() => document.fonts.ready);
			const root = page.locator(`[data-screen="${screen}"]`);
			await expect(root).toBeVisible();

			const landmarks: Record<Screen, () => Promise<void>> = {
				async home() {
					await expect(page.locator('h1.display')).toBeVisible();
					await expect(page.locator('h1.display em')).toHaveCount(1);
					await expect(page.locator('[data-search-bar]')).toBeVisible();
					await expect(page.locator('[data-pinned] [data-note-card]').first()).toBeVisible();
					expect(await page.locator('[data-recent] [data-note-card]').count()).toBe(8);
					expect(await page.locator('[data-folders] [data-folder-tile]').count()).toBeGreaterThanOrEqual(6);
					const tiles = await loaded(page, '[data-folder-tile] img');
					expect(tiles.length).toBeGreaterThanOrEqual(4);
					expect(tiles.every(Boolean)).toBe(true);
					expect(await page.locator('[data-folder-tile] img').count()).toBeGreaterThanOrEqual(4);
				},
				async folder() {
					await expect(page.locator('[data-cover-header] h1')).toBeVisible();
					await expect(page.locator('[data-cover-header]')).toContainText('folders · ');
					const covers = await loaded(page, '[data-cover-header] img');
					expect(covers.length).toBeGreaterThan(0);
					expect(covers.every(Boolean)).toBe(true);
					expect(await page.locator('[data-subfolders] [data-folder-tile]').count()).toBeGreaterThanOrEqual(3);
					expect(await page.locator('[data-note-card]').count()).toBeGreaterThanOrEqual(6);
				},
				async note() {
					await expect(page.locator('[data-note-title]')).toBeVisible();
					await expect(page.locator('[data-properties]')).toBeVisible();
					for (const block of blocks) expect(await page.locator(block).count(), block).toBeGreaterThan(0);
					const images = await loaded(page, '.prose img');
					expect(images.length).toBeGreaterThan(0);
					expect(images.every(Boolean)).toBe(true);
					const column = await page.locator('[data-note-column]').evaluate((el) => el.getBoundingClientRect().width);
					expect(column).toBeLessThanOrEqual(720);
				},
				async search() {
					await expect(page.locator('[data-palette]')).toBeVisible();
					expect(await page.locator('[data-palette] [data-result]').count()).toBeGreaterThanOrEqual(3);
					expect(await page.locator('[data-palette] mark').count()).toBeGreaterThanOrEqual(3);
					await expect(page.locator('[data-palette] [data-action]').first()).toBeVisible();
				},
				async drawer() {
					await expect(page.locator('[data-drawer]')).toBeVisible();
					expect(await page.locator('[data-drawer] [role="treeitem"]').count()).toBeGreaterThanOrEqual(6);
					await expect(page.locator('[data-bottom-bar]')).toBeVisible();
				}
			};
			await landmarks[screen]();

			if (screen !== 'drawer') {
				const shell = info.project.name === 'phone' ? '[data-bottom-bar]' : '[data-sidebar]';
				await expect(page.locator(shell)).toBeVisible();
				await expect(page.locator(info.project.name === 'phone' ? '[data-sidebar]' : '[data-bottom-bar]')).toBeHidden();
			}
		});

		test(`Scenario: Pages load no external resources (${screen})`, async ({ page, baseURL }) => {
			const origins = new Set<string>();
			page.on('request', (request) => {
				if (!request.url().startsWith('data:')) origins.add(new URL(request.url()).origin);
			});
			await open(page, path);
			await page.waitForLoadState('networkidle');

			expect([...origins]).toEqual([new URL(baseURL!).origin]);
		});

		test(`${screen} never scrolls sideways`, async ({ page }) => {
			await calm(page);
			await open(page, path);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

			expect(overflow).toBeLessThanOrEqual(0);
		});
	});
}

test('search palette also shows recent searches', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/search?state=recent');

	await expect(page.locator('[data-palette] [data-recent-search]').first()).toBeVisible();
	await expect(page.locator('[data-palette] mark')).toHaveCount(0);
});

test('every screen applies the look from the query', async ({ page }) => {
	await calm(page);
	for (const screen of screens) {
		await open(page, `/__mockups/${screen}?accent=moss&glass=soft&card=outline`);
		const html = page.locator('html');
		await expect(html).toHaveAttribute('data-accent', 'moss');
		await expect(html).toHaveAttribute('data-glass', 'soft');
		await expect(html).toHaveAttribute('data-card', 'outline');
	}
});

const shots = 'test-results/shots/mockups';
let viewport: { width: number; height: number } | undefined;

// a tall viewport lets the fixed sidebar, bottom bar and ambient glows span the whole page
async function shoot(page: Page, path: string, name: string): Promise<void> {
	mkdirSync(shots, { recursive: true });
	viewport ??= page.viewportSize()!;
	await page.setViewportSize(viewport);
	await calm(page);
	await open(page, path);
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(300);
	await page.screenshot({ path: `${shots}/${name}-fold.png` });
	const { width } = page.viewportSize()!;
	const height = await page.evaluate(() => document.documentElement.scrollHeight);
	await page.setViewportSize({ width, height });
	await page.waitForTimeout(200);
	await page.screenshot({ path: `${shots}/${name}.png` });
}

test('Scenario: Mockup screenshots are produced for both viewports', async ({ page }, info) => {
	viewport = undefined;
	test.setTimeout(60_000);
	for (const screen of screens) await shoot(page, `/__mockups/${screen}?bare=1`, `${info.project.name}-${screen}`);
	await shoot(page, '/__mockups/search?bare=1&state=recent', `${info.project.name}-search-recent`);
	await shoot(page, '/__mockups/components?bare=1', `${info.project.name}-components`);

	for (const screen of screens) expect(existsSync(`${shots}/${info.project.name}-${screen}.png`), screen).toBe(true);
});

test('desktop look comparisons: accent, glass and card style on Home and the note', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'the comparison set is desktop only');
	viewport = undefined;
	test.setTimeout(120_000);
	const looks = [
		...['bronze', 'moss', 'slate'].map((v) => ['accent', v]),
		...['soft', 'clear', 'frosted'].map((v) => ['glass', v]),
		...['glass', 'paper', 'outline'].map((v) => ['card', v])
	];
	for (const [axis, value] of looks)
		for (const screen of ['home', 'note'])
			await shoot(page, `/__mockups/${screen}?bare=1&${axis}=${value}`, `desktop-${screen}-${axis}-${value}`);

	expect(existsSync(`${shots}/desktop-home-card-paper.png`)).toBe(true);
});
