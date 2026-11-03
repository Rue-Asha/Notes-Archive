import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { searchNotes } from './search.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(() => useTestDb());
afterEach(() => closeDb());

const tagId = (name: string) => Number(getDb().prepare('SELECT id FROM tags WHERE name = ?').get(name)!.id);

function archive() {
	return seedArchive({
		folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Küche' }],
		notes: [
			{ title: 'Alt', folder: 0, tags: ['Reise'], body: 'Garten', updatedAt: '2026-01-01T00:00:00.000Z' },
			{ title: 'Kyoto', folder: 1, tags: ['Reise'], body: 'Garten', updatedAt: '2026-01-03T00:00:00.000Z' },
			{ title: 'Suppe', folder: 2, tags: ['Reise'], body: 'Garten', updatedAt: '2026-01-02T00:00:00.000Z' },
			{ title: 'Ohne Tag', folder: 1, body: 'Garten', updatedAt: '2026-01-04T00:00:00.000Z' },
			{ title: 'Lose', tags: ['Reise'], updatedAt: '2026-01-05T00:00:00.000Z' }
		]
	});
}

describe('searchNotes filters without a query', () => {
	it('Scenario: Server filters without a query by folder subtree and tag', () => {
		const { folders, notes } = archive();
		const hits = searchNotes({ q: '', folderId: folders[0], tagId: tagId('Reise') });
		expect(hits.map((h) => h.note.id)).toEqual([notes[1], notes[0]]);
		expect(hits.every((h) => h.parts.length === 0)).toBe(true);
	});

	it('lists every note of a filter, past the query limit', () => {
		seedArchive({ notes: Array.from({ length: 51 }, (_, i) => ({ title: `n${i}`, tags: ['Reise'] })) });
		expect(searchNotes({ q: '', tagId: tagId('Reise') })).toHaveLength(51);
		expect(searchNotes({ q: '', tagId: tagId('Reise'), limit: 5 })).toHaveLength(5);
	});

	it('lists the folder subtree by last edited with empty parts', () => {
		const { folders, notes } = archive();
		const hits = searchNotes({ q: '', folderId: folders[0] });
		expect(hits.map((h) => h.note.id)).toEqual([notes[3], notes[1], notes[0]]);
		expect(hits.every((h) => h.parts.length === 0)).toBe(true);
	});

	it('lists a tag across folders', () => {
		const { notes } = archive();
		expect(searchNotes({ q: ' ', tagId: tagId('Reise') }).map((h) => h.note.id)).toEqual([notes[4], notes[1], notes[2], notes[0]]);
	});

	it('combines folder subtree and tag', () => {
		const { folders, notes } = archive();
		expect(searchNotes({ q: '', folderId: folders[0], tagId: tagId('Reise') }).map((h) => h.note.id)).toEqual([notes[1], notes[0]]);
	});

	it('returns nothing without query or filters', () => {
		archive();
		expect(searchNotes({ q: '' })).toEqual([]);
		expect(searchNotes({ q: '', folderId: null })).toEqual([]);
	});
});

describe('searchNotes filters with a query', () => {
	it('restricts matches to the folder subtree and tag', () => {
		const { folders, notes } = archive();
		expect(searchNotes({ q: 'garten', folderId: folders[0] }).map((h) => h.note.id).sort()).toEqual([notes[0], notes[1], notes[3]].sort());
		expect(searchNotes({ q: 'garten', folderId: folders[0], tagId: tagId('Reise') }).map((h) => h.note.id).sort()).toEqual([notes[0], notes[1]].sort());
		expect(searchNotes({ q: 'garten', folderId: folders[2], tagId: tagId('Reise') }).map((h) => h.note.id)).toEqual([notes[2]]);
	});
});
