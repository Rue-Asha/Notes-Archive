import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Recently edited shows the eight latest notes', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		notes: Array.from({ length: 10 }, (_, i) => ({
			title: `Notiz ${i + 1}`,
			updatedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`
		}))
	});
	await calm(page);
	await open(page, '/');

	const recent = page.getByRole('region', { name: 'Recently edited' });
	await expect(recent.getByRole('article')).toHaveCount(8);
	await expect(recent.getByRole('heading', { level: 3 })).toHaveText(['Notiz 10', 'Notiz 9', 'Notiz 8', 'Notiz 7', 'Notiz 6', 'Notiz 5', 'Notiz 4', 'Notiz 3']);
});

test('Scenario: Folders tile lists top-level folders with covers and counts', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Reisen', cover: true }, { name: 'Japan', parent: 0 }, { name: 'Garten' }],
		notes: [{ title: 'A', folder: 0 }, { title: 'B', folder: 0 }, { title: 'C', folder: 1 }]
	});
	await calm(page);
	await open(page, '/');

	const folders = page.getByRole('region', { name: 'Folders' });
	const tiles = folders.getByRole('link');
	await expect(tiles).toHaveCount(2);
	await expect(tiles.nth(0).getByText('Garten', { exact: true })).toBeVisible();
	await expect(tiles.nth(1).getByText('Reisen', { exact: true })).toBeVisible();
	const reisen = tiles.filter({ hasText: 'Reisen' });
	await expect(reisen.getByRole('presentation')).toHaveCount(1);
	await expect(reisen.getByText('3 notes', { exact: true })).toBeVisible();
	const garten = tiles.filter({ hasText: 'Garten' });
	await expect(garten.getByRole('img').or(garten.getByRole('presentation'))).toHaveCount(0);
	await expect(garten.getByText('0 notes', { exact: true })).toBeVisible();
});
