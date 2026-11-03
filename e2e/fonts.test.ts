import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('Scenario: Display and text fonts load from the app', async ({ page, baseURL }) => {
	const fontRequests: string[] = [];
	page.on('request', (request) => {
		if (request.resourceType() === 'font') fontRequests.push(request.url());
	});
	await page.goto('/');
	await expect(page.locator('html[data-hydrated]')).toBeAttached();

	const loaded = await page.evaluate(async () => {
		const faces = await Promise.all([
			document.fonts.load('380 40px "Newsreader"'),
			document.fonts.load('italic 340 40px "Newsreader"'),
			document.fonts.load('400 16px "Figtree"')
		]);
		return faces.map((f) => f.map((face) => face.family.replace(/"/g, '')));
	});
	expect(loaded[0]).toContain('Newsreader');
	expect(loaded[1]).toContain('Newsreader');
	expect(loaded[2]).toContain('Figtree');

	const origin = new URL(baseURL!).origin;
	for (const url of fontRequests) {
		expect(new URL(url).origin).toBe(origin);
		expect(new URL(url).pathname).toMatch(/^\/fonts\/.+\.woff2$/);
	}
	expect(fontRequests.map((u) => new URL(u).pathname)).toEqual(
		expect.arrayContaining([
			'/fonts/newsreader-latin-opsz-normal.woff2',
			'/fonts/newsreader-latin-opsz-italic.woff2',
			'/fonts/figtree-latin-wght-normal.woff2'
		])
	);

	const bodyFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily.split(',')[0].replace(/['"]/g, ''));
	expect(bodyFamily).toBe('Figtree');

	expect(existsSync('static/fonts/Newsreader-OFL.txt')).toBe(true);
	expect(existsSync('static/fonts/Figtree-OFL.txt')).toBe(true);
});
