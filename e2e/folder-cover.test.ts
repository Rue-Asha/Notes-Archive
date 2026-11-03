import { expect, test } from '@playwright/test';
import { calm, counts, open, photo, reset, seed } from './helpers.ts';

const cover = (page: import('@playwright/test').Page) => page.locator('[data-cover-header] img');

async function bare(request: Parameters<typeof reset>[0]) {
	await reset(request);
	return seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }] });
}

test('Scenario: Upload and replace a folder cover', async ({ page, request }) => {
	const { folders } = await bare(request);
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	const main = page.getByRole('main');
	await expect(cover(page)).toHaveCount(0);

	await main.getByLabel('Add cover').setInputFiles(photo('house-solitude.jpg'));
	await expect(cover(page)).toHaveCount(1);
	const first = await cover(page).getAttribute('src');
	expect(first).toMatch(/^\/images\/\d+$/);

	await main.getByLabel('Change cover').setInputFiles(photo('lake-greek.jpg'));
	await expect(cover(page)).not.toHaveAttribute('src', first!);
	await expect(cover(page)).toHaveAttribute('src', /^\/images\/\d+$/);
	expect((await counts(request)).images).toBe(1);
});

test('Scenario: Removing the cover brings back the typographic tile', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0, cover: true }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	await expect(cover(page)).toHaveCount(1);

	await page.getByRole('main').getByRole('button', { name: 'Remove cover' }).click();
	await expect(cover(page)).toHaveCount(0);

	await open(page, `/folders/${folders[0]}`);
	const tile = page.locator('[data-folder-tile]', { hasText: 'Japan' });
	await expect(tile).toBeVisible();
	await expect(tile.locator('img')).toHaveCount(0);
});

test('Scenario: Wrong cover file is refused with a toast', async ({ page, request }) => {
	await reset(request);
	const { folders } = await seed(request, { folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0, cover: true }] });
	await calm(page);
	await open(page, `/folders/${folders[1]}`);
	const kept = await cover(page).getAttribute('src');
	const input = page.getByRole('main').getByLabel('Change cover');

	await input.setInputFiles({ name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
	await expect(page.getByRole('status').filter({ hasText: "That file isn't an image" })).toBeVisible();

	await input.setInputFiles({ name: 'big.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(17 * 1024 * 1024) });
	await expect(page.getByRole('status').filter({ hasText: 'That image is too large' })).toBeVisible();

	await expect(cover(page)).toHaveAttribute('src', kept!);
	expect((await counts(request)).images).toBe(1);
});
