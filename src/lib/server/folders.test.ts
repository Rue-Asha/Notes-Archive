import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError, ValidationError } from '#lib/errors.ts';
import { closeDb, getDb } from './db.ts';
import { breadcrumb, createFolder, deleteFolder, folderCounts, getFolder, moveFolder, renameFolder } from './folders.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(closeDb);

describe('folders', () => {
	it('creates folders at the root and inside a folder', () => {
		const a = createFolder({ name: 'Reisen' });
		const b = createFolder({ name: 'Japan', parentId: a });
		expect(getFolder(a)).toMatchObject({ id: a, parentId: null, name: 'Reisen', coverImageId: null });
		expect(getFolder(b)?.parentId).toBe(a);
		expect(getFolder(999)).toBeNull();
	});

	it('Scenario: Blank names become Untitled folder', () => {
		const id = createFolder({ name: '   ' });
		expect(getFolder(id)?.name).toBe('Untitled folder');
		expect(getFolder(createFolder({}))?.name).toBe('Untitled folder');
		const other = createFolder({ name: 'Named' });
		renameFolder(other, '');
		expect(getFolder(other)?.name).toBe('Untitled folder');
	});

	it('renames and trims', () => {
		const id = createFolder({ name: 'Old' });
		renameFolder(id, '  Archiv 2026 ');
		expect(getFolder(id)?.name).toBe('Archiv 2026');
	});

	it('Scenario: Duplicate sibling names are allowed', () => {
		const parent = createFolder({ name: 'P' });
		const a = createFolder({ name: 'Ideen', parentId: parent });
		const b = createFolder({ name: 'Ideen', parentId: parent });
		expect(a).not.toBe(b);
		expect(getFolder(a)?.name).toBe('Ideen');
		expect(getFolder(b)?.name).toBe('Ideen');
	});

	it('moves a folder to another folder and to the root', () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }, { name: 'B' }] });
		moveFolder(folders[1], folders[0]);
		expect(getFolder(folders[1])?.parentId).toBe(folders[0]);
		moveFolder(folders[1], null);
		expect(getFolder(folders[1])?.parentId).toBeNull();
	});

	it('Scenario: Server refuses moving a folder into its own descendant', () => {
		const { folders } = seedArchive({
			folders: [{ name: 'A' }, { name: 'B', parent: 0 }, { name: 'C', parent: 1 }]
		});
		const before = getDb().prepare('SELECT id, parent_id FROM folders ORDER BY id').all();
		expect(() => moveFolder(folders[0], folders[0])).toThrow(ValidationError);
		expect(() => moveFolder(folders[0], folders[2])).toThrow(ValidationError);
		expect(getDb().prepare('SELECT id, parent_id FROM folders ORDER BY id').all()).toEqual(before);
	});

	it('breadcrumb runs root first and ends with the folder', () => {
		const { folders } = seedArchive({
			folders: [{ name: 'Reisen' }, { name: 'Japan', parent: 0 }, { name: 'Kyoto', parent: 1 }]
		});
		expect(breadcrumb(folders[2])).toEqual([
			{ id: folders[0], name: 'Reisen' },
			{ id: folders[1], name: 'Japan' },
			{ id: folders[2], name: 'Kyoto' }
		]);
		expect(breadcrumb(folders[0])).toEqual([{ id: folders[0], name: 'Reisen' }]);
		expect(breadcrumb(999)).toEqual([]);
	});
});

describe('folder delete', () => {
	const count = (table: string) => Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);

	it('Scenario: Server folder delete removes descendants, notes and uploads', () => {
		const { folders } = seedArchive({
			folders: [
				{ name: 'Keep' },
				{ name: 'Reisen', parent: 0, cover: true },
				{ name: 'Japan', parent: 1 },
				{ name: 'Kyoto', parent: 2, cover: true }
			],
			notes: [
				{ title: 'Outside', folder: 0, tags: ['Shared', 'Kept'], images: 1 },
				{ title: 'One', folder: 1, tags: ['Shared', 'Einmalig'], images: 2, files: 1 },
				{ title: 'Two', folder: 2, tags: ['Einmalig2'], files: 2 },
				{ title: 'Three', folder: 3, body: 'text', images: 1 }
			]
		});
		expect(folderCounts(folders[1])).toEqual({ folders: 2, notes: 3 });
		expect(folderCounts(folders[3])).toEqual({ folders: 0, notes: 1 });

		expect(deleteFolder(folders[1])).toEqual({ parentId: folders[0] });

		expect(count('folders')).toBe(1);
		expect(count('notes')).toBe(1);
		expect(count('notes_fts')).toBe(1);
		expect(count('note_tags')).toBe(2);
		expect(count('files')).toBe(0);
		expect(count('images')).toBe(1);
		expect(getDb().prepare('SELECT name FROM tags ORDER BY name').all().map((r) => r.name)).toEqual([
			'Kept',
			'Shared'
		]);
		expect(getFolder(folders[2])).toBeNull();
	});

	it('Scenario: A copied upload outlives its source note when its folder is deleted', () => {
		const { folders, notes } = seedArchive({ folders: [{ name: 'Weg' }], notes: [{ folder: 0, images: 1, files: 1 }, {}] });
		const [img] = getDb().prepare('SELECT id FROM images WHERE note_id = ?').all(notes[0]).map((r) => Number(r.id));
		const [file] = getDb().prepare('SELECT id FROM files WHERE note_id = ?').all(notes[0]).map((r) => Number(r.id));
		const shared = {
			type: 'doc',
			content: [
				{ type: 'image', attrs: { id: img } },
				{ type: 'fileCard', attrs: { id: file } }
			]
		};
		getDb().prepare('UPDATE notes SET content = ? WHERE id IN (?, ?)').run(JSON.stringify(shared), notes[0], notes[1]);

		deleteFolder(folders[0]);

		expect(getDb().prepare('SELECT note_id FROM images WHERE id = ?').get(img)).toEqual({ note_id: notes[1] });
		expect(getDb().prepare('SELECT note_id FROM files WHERE id = ?').get(file)).toEqual({ note_id: notes[1] });
	});

	it('answers a root folder delete with a null parent and throws for a missing folder', () => {
		const id = createFolder({ name: 'Root' });
		expect(deleteFolder(id)).toEqual({ parentId: null });
		expect(() => deleteFolder(id)).toThrow(NotFoundError);
	});
});
