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
			...(i < 2 ? { pinnedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00.000Z` } : {}),
			updatedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`
		}))
	});
}

const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

const lists = async (page: Page) => {
	const pinned = (await page.getByRole('main').getByRole('region', { name: 'Pinned' }).boundingBox())!;
	const recent = (await page.getByRole('main').getByRole('region', { name: 'Recently edited' }).boundingBox())!;
	return { pinned, recent };
};

test('Scenario: Home lists sit side by side on wide screens', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await twelve(request);
	await calm(page);

	for (const width of [1280, 1600]) {
		await page.setViewportSize({ width, height: 900 });
		await open(page, '/');
		const { pinned, recent } = await lists(page);
		expect(pinned.x + pinned.width, `${width}`).toBeLessThanOrEqual(recent.x + 1);
		expect(Math.abs(pinned.y - recent.y), `${width}`).toBeLessThan(4);
	}
});

test('Scenario: Mid-width shows the sidebar with stacked lists', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await twelve(request);
	await calm(page);

	await page.setViewportSize({ width: 1050, height: 800 });
	await open(page, '/');
	await expect(page.getByRole('navigation', { name: 'Sidebar' })).toBeVisible();
	const { pinned, recent } = await lists(page);
	expect(pinned.y + pinned.height).toBeLessThanOrEqual(recent.y + 1);
	expect(await noScroll(page)).toBe(true);
});

test('No horizontal page scroll on phone over every main screen', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	const { folders, notes } = await twelve(request);
	await calm(page);

	await open(page, '/');
	await open(page, '/folders');
	const tagPath = await page.getByRole('main').getByRole('region', { name: 'Tags' }).getByRole('link', { name: /Reise/ }).getAttribute('href');

	const paths = ['/', '/folders', `/folders/${folders[0]}`, `/notes/${notes[0]}`, '/search', '/search?q=Satz', tagPath!];
	for (const path of paths) {
		await open(page, path);
		expect(await noScroll(page), path).toBe(true);
	}
});

test('Scenario: Controls keep a 44 px target below the wide layout', async ({ page, request }, info) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }], notes: [{ title: 'Kyoto', body: 'Tempel', folder: 0 }, { title: 'Lissabon', body: 'Tram', folder: 0 }] });
	await calm(page);
	const height = (name: string) => page.getByRole('navigation', { name: 'Sidebar' }).getByRole('button', { name }).evaluate((el) => el.getBoundingClientRect().height);
	const rows = () => page.locator('[data-note-row] a').evaluateAll((links) => links.map((a) => a.getBoundingClientRect().height));

	if (info.project.name === 'phone') {
		await open(page, `/folders/${folders[0]}`);
		for (const h of await rows()) expect(h).toBeGreaterThanOrEqual(44);
		return;
	}
	await page.setViewportSize({ width: 1024, height: 800 });
	await open(page, `/folders/${folders[0]}`);
	for (const name of ['Fold sidebar', 'New folder', 'Sort folders']) expect(await height(name), `${name} at 1024`).toBeGreaterThanOrEqual(44);
	for (const h of await rows()) expect(h).toBeGreaterThanOrEqual(44);

	await page.setViewportSize({ width: 1280, height: 800 });
	for (const name of ['Fold sidebar', 'New folder', 'Sort folders']) await expect.poll(() => height(name), `${name} at 1280`).toBe(30);
});
