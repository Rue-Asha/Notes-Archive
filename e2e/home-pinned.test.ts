import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Pinned notes appear on Home most recently pinned first', async ({ page, request }) => {
	await reset(request);
	const { notes } = await seed(request, { notes: [{ title: 'Alt' }, { title: 'Neu' }, { title: 'Mitte' }, { title: 'Lose' }] });
	for (const id of [notes[2], notes[0], notes[1]]) {
		expect((await request.patch(`/api/notes/${id}`, { data: { pinned: true } })).ok()).toBe(true);
	}
	await calm(page);
	await open(page, '/');

	const pinned = page.getByRole('region', { name: 'Pinned' });
	await expect(pinned.locator('[data-card-title]')).toHaveText(['Neu', 'Alt', 'Mitte']);
});

test('Scenario: Pinned tile is hidden without pinned notes', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Lose' }] });
	await calm(page);
	await open(page, '/');

	await expect(page.getByRole('region', { name: 'Recently edited' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Pinned' })).toHaveCount(0);
});

test('Scenario: Unpinning the last note hides the Pinned tile', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', pinnedAt: '2026-10-01T10:00:00.000Z' }] });
	await calm(page);
	await open(page, '/');

	const pinned = page.getByRole('region', { name: 'Pinned' });
	await pinned.getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Unpin' }).click();

	await expect(pinned).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Recently edited' }).locator('[data-note-card]')).toHaveCount(1);
});
