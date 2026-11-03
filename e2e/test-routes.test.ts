import { expect, test } from '@playwright/test';
import { counts, open, reset, seed, storedNote } from './helpers.ts';

test('Scenario: Reset empties the archive', async ({ request }) => {
	await reset(request);
	await seed(request, {
		folders: [{ name: 'Trips', cover: true }],
		notes: [{ title: 'Alpha', body: 'text', folder: 0, tags: ['Reise'], images: 1, files: 1 }]
	});
	expect((await counts(request)).notes).toBe(1);

	await reset(request);

	expect(await counts(request)).toEqual({ notes: 0, folders: 0, tags: 0, note_tags: 0, images: 0, files: 0, notes_fts: 0 });
});

test('Scenario: Seed returns the ids of what it inserted', async ({ request }) => {
	await reset(request);

	const ids = await seed(request, {
		folders: [{ name: 'Trips' }, { name: 'Italy', parent: 0 }],
		notes: [
			{ title: 'First', body: 'one\ntwo', folder: 1, tags: ['Reise', 'Übung'] },
			{ title: 'Second', body: 'Straße' },
			{ title: 'Third', tags: ['übung'] }
		]
	});

	expect(ids.folders).toHaveLength(2);
	expect(ids.notes).toHaveLength(3);
	expect(await storedNote(request, ids.notes[0])).toMatchObject({
		title: 'First',
		folderId: ids.folders[1],
		tags: ['Reise', 'Übung'],
		bodyText: 'one\ntwo'
	});
	expect(await storedNote(request, ids.notes[1])).toMatchObject({ title: 'Second', folderId: null, bodyText: 'Straße' });
	expect(await storedNote(request, ids.notes[1])).toMatchObject({ tags: [] });
	expect(await storedNote(request, ids.notes[2])).toMatchObject({ title: 'Third', folderId: null, tags: ['Übung'], bodyText: '' });
	expect(await storedNote(request, 99999)).toBeNull();
});

test('Scenario: App is hydrated before tests interact', async ({ page }) => {
	await open(page, '/');

	expect(await page.locator('html[data-hydrated]').count()).toBe(1);
});
