import { readdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { open, reset, seed } from './helpers.ts';

const SLATE = '#626d92';

test('Scenario: App renders with the slate accent', async ({ page, request }) => {
	await reset(request);
	await open(page, '/');

	const html = page.locator('html');
	await expect(html).toHaveAttribute('lang', 'en');
	await expect(html).toHaveAttribute('data-accent', 'slate');
	const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase());
	expect(accent).toBe(SLATE);
});

test('Scenario: Fingerprint fonts load from the app', async ({ page, request, baseURL }) => {
	await reset(request);
	const fontRequests: string[] = [];
	page.on('request', (req) => {
		if (req.resourceType() === 'font') fontRequests.push(req.url());
	});
	await open(page, '/');

	const loaded = await page.evaluate(async () => {
		const faces = await Promise.all([document.fonts.load('400 40px "Gilda Display"'), document.fonts.load('400 16px "DM Sans"')]);
		return faces.map((list) => list.map((face) => face.family.replace(/"/g, '')));
	});
	expect(loaded[0]).toContain('Gilda Display');
	expect(loaded[1]).toContain('DM Sans');

	const origin = new URL(baseURL!).origin;
	const fingerprint = fontRequests.map((u) => new URL(u)).filter((u) => u.pathname.startsWith('/fonts/fingerprint/'));
	expect(fingerprint.length).toBeGreaterThanOrEqual(2);
	for (const url of fingerprint) expect(url.origin).toBe(origin);
	expect(fingerprint.map((u) => u.pathname)).toEqual(
		expect.arrayContaining(['/fonts/fingerprint/gilda-display-latin.woff2', '/fonts/fingerprint/dm-sans-latin.woff2'])
	);

	const bodyFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily.split(',')[0].replace(/['"]/g, '').trim());
	expect(bodyFamily).toBe('DM Sans');
});

function mockupPaths(): string[] {
	const root = 'src/routes/__mockups/redesign';
	return ['wire', 'hifi'].flatMap((kind) =>
		readdirSync(`${root}/${kind}`, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => `/__mockups/redesign/${kind}/${entry.name}`)
	);
}

test('Scenario: App pages load nothing from other origins', async ({ page, request, baseURL }) => {
	await reset(request);
	const { folders, notes } = await seed(request, {
		folders: [{ name: 'Japan' }],
		notes: [{ title: 'Kyoto', folder: 0, tags: ['Reise'] }]
	});
	const origin = new URL(baseURL!).origin;
	const foreign: string[] = [];
	page.on('request', (req) => {
		const url = new URL(req.url());
		if (url.protocol.startsWith('http') && url.origin !== origin) foreign.push(req.url());
	});

	const tagId = (await (await request.get('/')).text()).match(/href="(\/tags\/\d+)"/)?.[1];
	expect(tagId).toBeDefined();
	const paths = ['/', '/folders', `/folders/${folders[0]}`, `/notes/${notes[0]}`, '/search?q=Kyoto', tagId!, ...mockupPaths()];
	for (const path of paths) {
		await page.goto(path, { waitUntil: 'networkidle' });
	}
	expect(foreign).toEqual([]);
});
