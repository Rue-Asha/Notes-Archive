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
	await expect(pinned.getByRole('heading', { level: 3 })).toHaveText(['Neu', 'Alt', 'Mitte']);
});

test('Scenario: Unpinning the last note hides the Pinned list', async ({ page, request }) => {
	await reset(request);
	await seed(request, { notes: [{ title: 'Einzig', pinnedAt: '2026-10-01T10:00:00.000Z' }] });
	await calm(page);
	await open(page, '/');

	const pinned = page.getByRole('region', { name: 'Pinned' });
	await pinned.getByRole('button', { name: 'Note actions' }).click();
	await page.getByRole('menuitem', { name: 'Unpin' }).click();

	await expect(pinned).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Recently edited' }).getByRole('article')).toHaveCount(1);
});

test('Regression: a pinned card keeps its date on the meta line', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Tempel' }],
		notes: [{ title: 'Kyoto Reiseplan', body: 'Tag 1 — Ankunft. Wir sind früh am Bahnhof angekommen.', folder: 0, tags: ['Reise', 'Japan', 'Planung'], pinnedAt: '2026-11-01T10:00:00.000Z' }]
	});
	await calm(page);
	await open(page, '/');

	const card = page.getByRole('region', { name: 'Pinned' }).getByRole('article');
	const time = (await card.locator('[data-card-time]').boundingBox())!;
	for (const part of await card.locator('[data-card-folder], [data-card-tag]').all()) {
		const box = (await part.boundingBox())!;
		expect(Math.abs(box.y + box.height / 2 - (time.y + time.height / 2)), await part.innerText()).toBeLessThan(2);
	}
});
