import { expect, test } from '@playwright/test';
import { open, reset } from './helpers.ts';

const FILES = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop', 'static files and <head> do not depend on the posture');
});

test('Scenario: Icon files are served', async ({ request }) => {
	for (const file of FILES) {
		const res = await request.get(`/${file}`);
		expect(res.status(), file).toBe(200);
		expect(res.headers()['content-type'], file).toMatch(/^image\//);
	}
	const manifest = await request.get('/manifest.webmanifest');
	expect(manifest.status()).toBe(200);
	expect(manifest.headers()['content-type']).toMatch(/manifest|json/);
});

test('Scenario: Manifest references existing icons', async ({ request }) => {
	const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
		name: string;
		short_name: string;
		theme_color: string;
		background_color: string;
		icons: { src: string; sizes: string; purpose?: string }[];
	};
	for (const key of ['name', 'short_name', 'theme_color', 'background_color'] as const) expect(manifest[key], key).toBeTruthy();
	expect([manifest.name, manifest.short_name]).toEqual(['Notes Archive', 'Notes Archive']);
	const has = (sizes: string, maskable: boolean) =>
		manifest.icons.some((icon) => icon.sizes === sizes && (icon.purpose === 'maskable') === maskable);
	expect(has('192x192', false)).toBe(true);
	expect(has('512x512', false)).toBe(true);
	expect(has('512x512', true)).toBe(true);
	for (const icon of manifest.icons) expect((await request.get(icon.src)).status(), icon.src).toBe(200);
});

test('Scenario: Head carries the icon links', async ({ page, request }) => {
	await reset(request);
	await open(page, '/');

	const links = await page.evaluate(() => ({
		links: [...document.head.querySelectorAll('link')].map((l) => ({ rel: l.rel, href: new URL(l.href, location.href).pathname, sizes: l.getAttribute('sizes') })),
		themeColor: document.head.querySelectorAll('meta[name="theme-color"]').length
	}));
	expect(links.links).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ rel: 'icon', href: '/favicon.svg' }),
			expect.objectContaining({ rel: 'icon', href: '/favicon.ico', sizes: '32x32' }),
			expect.objectContaining({ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }),
			expect.objectContaining({ rel: 'manifest', href: '/manifest.webmanifest' })
		])
	);
	expect(links.themeColor).toBe(1);
});
