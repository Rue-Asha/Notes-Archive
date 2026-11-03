import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { seedArchive, testImage, useTestDb } from './testing.ts';

beforeEach(() => useTestDb());
afterEach(() => closeDb());

function rows(sql: string, ...args: (string | number)[]): Record<string, unknown>[] {
	return getDb().prepare(sql).all(...args);
}

describe('testing helpers', () => {
	it('useTestDb gives a migrated in-memory database', () => {
		expect(rows("SELECT name FROM sqlite_master WHERE name = 'notes'")).toHaveLength(1);
	});

	it('testImage is a PNG and differs by index', () => {
		const a = testImage(0);

		expect([...a.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
		expect(Buffer.from(testImage(1)).equals(Buffer.from(a))).toBe(false);
	});

	it('seedArchive returns folder and note ids in input order and links parents', () => {
		const ids = seedArchive({
			folders: [{ name: 'Trips' }, { name: 'Italy', parent: 0 }],
			notes: [{ title: 'A', folder: 1 }, { title: 'B' }, { title: 'C', folder: 0 }]
		});

		expect(ids.folders).toHaveLength(2);
		expect(ids.notes).toHaveLength(3);
		expect(rows('SELECT parent_id FROM folders WHERE id = ?', ids.folders[1])[0].parent_id).toBe(ids.folders[0]);
		expect(rows('SELECT folder_id FROM notes WHERE id = ?', ids.notes[0])[0].folder_id).toBe(ids.folders[1]);
		expect(rows('SELECT folder_id FROM notes WHERE id = ?', ids.notes[1])[0].folder_id).toBeNull();
	});

	it('seedArchive stores timestamps, icon, pin and a folder cover', () => {
		const ids = seedArchive({
			folders: [{ name: 'Trips', cover: true }],
			notes: [{ title: 'A', icon: '🌿', pinnedAt: '2026-10-02T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-03T00:00:00.000Z' }]
		});

		expect(rows('SELECT icon, pinned_at, created_at, updated_at FROM notes WHERE id = ?', ids.notes[0])[0]).toEqual({
			icon: '🌿',
			pinned_at: '2026-10-02T00:00:00.000Z',
			created_at: '2026-10-01T00:00:00.000Z',
			updated_at: '2026-10-03T00:00:00.000Z'
		});
		expect(rows('SELECT mime FROM images WHERE folder_id = ?', ids.folders[0])).toHaveLength(1);
	});

	it('seedArchive stores content as given', () => {
		const content = { type: 'doc', content: [{ type: 'heading', content: [{ type: 'text', text: 'Hi' }] }] };
		const ids = seedArchive({ notes: [{ content }] });

		expect(JSON.parse(String(rows('SELECT content FROM notes WHERE id = ?', ids.notes[0])[0].content))).toEqual(content);
	});

	it('seedArchive shares tags by folded name, first spelling wins, and keeps chip order', () => {
		const ids = seedArchive({ notes: [{ tags: ['Übung', 'Reise'] }, { tags: ['übung', ' ', 'Reise'] }] });

		expect(rows('SELECT name, name_key FROM tags ORDER BY id')).toEqual([
			{ name: 'Übung', name_key: 'übung' },
			{ name: 'Reise', name_key: 'reise' }
		]);
		expect(rows('SELECT position FROM note_tags WHERE note_id = ? ORDER BY position', ids.notes[1])).toEqual([
			{ position: 0 },
			{ position: 1 }
		]);
	});

	it('seedArchive adds the requested images and files to a note', () => {
		const ids = seedArchive({ notes: [{ images: 2, files: 1 }] });

		expect(rows('SELECT id FROM images WHERE note_id = ?', ids.notes[0])).toHaveLength(2);
		expect(rows('SELECT name, mime FROM files WHERE note_id = ?', ids.notes[0])).toEqual([
			{ name: 'file-1.txt', mime: 'text/plain' }
		]);
	});

	it('seedArchive with nothing returns empty lists', () => {
		expect(seedArchive({})).toEqual({ folders: [], notes: [] });
	});
});
