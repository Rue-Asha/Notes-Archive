import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { useTestDb } from './testing.ts';

const NOW = '2026-11-02T10:00:00.000Z';

function insert(sql: string, ...args: (string | number | null)[]): number {
	return Number(getDb().prepare(sql).run(...args).lastInsertRowid);
}

function folder(name: string, parent: number | null = null): number {
	return insert('INSERT INTO folders (parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)', parent, name, NOW, NOW);
}

function note(folderId: number | null, title = ''): number {
	return insert('INSERT INTO notes (folder_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)', folderId, title, NOW, NOW);
}

function image(owner: { noteId?: number; folderId?: number }): number {
	return insert(
		"INSERT INTO images (mime, width, height, bytes, created_at, note_id, folder_id) VALUES ('image/webp', 1, 1, x'00', ?, ?, ?)",
		NOW,
		owner.noteId ?? null,
		owner.folderId ?? null
	);
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

function names(type: string): string[] {
	return getDb()
		.prepare('SELECT name FROM sqlite_master WHERE type = ? ORDER BY name')
		.all(type)
		.map((r) => String(r.name));
}

beforeEach(() => useTestDb());
afterEach(() => closeDb());

describe('schema 0002_core', () => {
	it('creates the tables, indexes and trigger', () => {
		expect(names('table')).toEqual(
			expect.arrayContaining(['files', 'folders', 'images', 'note_tags', 'notes', 'notes_fts', 'tags'])
		);
		expect(names('index')).toEqual(
			expect.arrayContaining([
				'files_note',
				'folders_parent',
				'images_folder_cover',
				'images_note',
				'notes_folder',
				'notes_pinned',
				'notes_updated'
			])
		);
		expect(names('trigger')).toContain('notes_fts_delete');
	});

	it('deleting a folder removes its sub-folders, notes, images and files', () => {
		const outer = folder('Outer');
		const inner = folder('Inner', outer);
		const n = note(inner, 'Deep');
		image({ noteId: n });
		image({ folderId: inner });
		insert(
			"INSERT INTO files (note_id, name, mime, size, bytes, created_at) VALUES (?, 'a.txt', 'text/plain', 1, x'00', ?)",
			n,
			NOW
		);

		getDb().prepare('DELETE FROM folders WHERE id = ?').run(outer);

		for (const t of ['folders', 'notes', 'images', 'files']) expect(count(t), t).toBe(0);
	});

	it('allows one cover per folder', () => {
		const f = folder('Trips');
		image({ folderId: f });

		expect(() => image({ folderId: f })).toThrow(/UNIQUE/);
	});

	it('deleting a note removes its notes_fts row', () => {
		const n = note(null, 'Alpha');
		getDb().prepare('INSERT INTO notes_fts (rowid, title, body, tags) VALUES (?, ?, ?, ?)').run(n, 'Alpha', '', '');

		getDb().prepare('DELETE FROM notes WHERE id = ?').run(n);

		expect(count('notes_fts')).toBe(0);
	});

	it('removes the notes_fts row of a note deleted by cascade', () => {
		const f = folder('Trips');
		const n = note(f, 'Alpha');
		getDb().prepare('INSERT INTO notes_fts (rowid, title, body, tags) VALUES (?, ?, ?, ?)').run(n, 'Alpha', '', '');

		getDb().prepare('DELETE FROM folders WHERE id = ?').run(f);

		expect(count('notes')).toBe(0);
		expect(count('notes_fts')).toBe(0);
	});

	it('rejects a blank folder name and invalid note content', () => {
		expect(() => folder('  ')).toThrow(/CHECK/);
		expect(() => insert("INSERT INTO notes (content, created_at, updated_at) VALUES ('{', ?, ?)", NOW, NOW)).toThrow(/CHECK/);
	});

	it('deleting a note removes its tag links but keeps the tag', () => {
		const n = note(null);
		const t = insert("INSERT INTO tags (name, name_key) VALUES ('Reise', 'reise')");
		getDb().prepare('INSERT INTO note_tags (note_id, tag_id, position) VALUES (?, ?, 0)').run(n, t);

		getDb().prepare('DELETE FROM notes WHERE id = ?').run(n);

		expect(count('note_tags')).toBe(0);
		expect(count('tags')).toBe(1);
	});
});
