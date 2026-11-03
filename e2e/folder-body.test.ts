import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

async function reisen(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, {
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0, cover: true }, { name: 'Island', parent: 0 }],
		notes: [
			{ title: 'Älteste', body: 'a', folder: 0, updatedAt: ago(9) },
			{ title: 'Neueste', body: 'b', folder: 0, updatedAt: ago(1) },
			{ title: 'Mittlere', body: 'c', folder: 0, updatedAt: ago(4) },
			{ title: 'Fjord', body: 'd', folder: 2 },
			{ title: 'Geysir', body: 'e', folder: 2 }
		]
	});
}

test('Scenario: Folder page shows sub-folders and notes by last edited', async ({ page, request }) => {
	const { folders } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const tiles = page.locator('[data-folder-tile]');
	await expect(tiles).toHaveCount(2);
	await expect(tiles.locator('[data-tile-name]')).toHaveText(['Island', 'Japan']);
	await expect(tiles.first().locator('[data-tile-count]')).toHaveText('2 notes');
	await expect(tiles.first()).toHaveAttribute('href', `/folders/${folders[2]}`);
	await expect(page.locator('[data-note-card] [data-card-title]')).toHaveText(['Neueste', 'Mittlere', 'Älteste']);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('Scenario: Folder without a cover shows a typographic tile', async ({ page, request }) => {
	const { folders } = await reisen(request);
	await calm(page);
	await open(page, `/folders/${folders[0]}`);

	const plain = page.locator('[data-folder-tile]', { hasText: 'Island' });
	await expect(plain.locator('img')).toHaveCount(0);
	const name = plain.locator('[data-tile-name]');
	expect(await name.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Newsreader');
	expect(await plain.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

	const covered = page.locator('[data-folder-tile]', { hasText: 'Japan' });
	await expect(covered.locator('img')).toHaveCount(1);
});

test('Unknown folder is a 404', async ({ request }) => {
	await reset(request);
	expect((await request.get('/folders/9999')).status()).toBe(404);
	expect((await request.get('/folders/abc')).status()).toBe(404);
});
