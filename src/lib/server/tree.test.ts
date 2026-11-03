import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { getTree, listFolderTiles } from './folders.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(closeDb);

describe('tree', () => {
	it('nests folders, sorts folders by name and notes by last edited, keeps root notes', () => {
		const { folders, notes } = seedArchive({
			folders: [{ name: 'Zebra' }, { name: 'Ärger' }, { name: 'apfel' }, { name: 'Japan', parent: 0 }, { name: 'Island', parent: 0 }],
			notes: [
				{ title: 'Old', folder: 0, updatedAt: '2026-10-01T00:00:00.000Z' },
				{ title: 'New', folder: 0, icon: '🌿', updatedAt: '2026-10-03T00:00:00.000Z' },
				{ title: 'Mid', folder: 0, updatedAt: '2026-10-02T00:00:00.000Z' },
				{ title: 'Deep', folder: 3 },
				{ title: 'Loose old', updatedAt: '2026-09-01T00:00:00.000Z' },
				{ title: '', updatedAt: '2026-09-02T00:00:00.000Z' }
			]
		});
		const tree = getTree();
		expect(tree.folders.map((f) => f.name)).toEqual(['apfel', 'Ärger', 'Zebra']);
		const zebra = tree.folders[2];
		expect(zebra).toMatchObject({ id: folders[0], parentId: null });
		expect(zebra.children.map((f) => f.name)).toEqual(['Island', 'Japan']);
		expect(zebra.children[0]).toMatchObject({ parentId: folders[0], children: [], notes: [] });
		expect(zebra.notes).toEqual([
			{ id: notes[1], title: 'New', icon: '🌿' },
			{ id: notes[2], title: 'Mid', icon: null },
			{ id: notes[0], title: 'Old', icon: null }
		]);
		expect(zebra.children[1].notes).toEqual([{ id: notes[3], title: 'Deep', icon: null }]);
		expect(tree.rootNotes).toEqual([
			{ id: notes[5], title: '', icon: null },
			{ id: notes[4], title: 'Loose old', icon: null }
		]);
	});

	it('is empty without data', () => {
		expect(getTree()).toEqual({ folders: [], rootNotes: [] });
	});

	it('listFolderTiles counts notes including descendants and orders by name', () => {
		const { folders } = seedArchive({
			folders: [
				{ name: 'Reisen' },
				{ name: 'Japan', parent: 0, cover: true },
				{ name: 'Island', parent: 0 },
				{ name: 'Kyoto', parent: 1 },
				{ name: 'Öl', parent: 0 },
				{ name: 'Other' }
			],
			notes: [{ folder: 0 }, { folder: 1 }, { folder: 1 }, { folder: 3 }, { folder: 5 }]
		});
		const tiles = listFolderTiles(folders[0]);
		expect(tiles.map((t) => [t.name, t.noteCount])).toEqual([
			['Island', 0],
			['Japan', 3],
			['Öl', 0]
		]);
		expect(tiles[1].coverImageId).toEqual(expect.any(Number));
		expect(tiles[0].coverImageId).toBeNull();
		expect(listFolderTiles(null).map((t) => [t.name, t.noteCount])).toEqual([
			['Other', 1],
			['Reisen', 4]
		]);
		expect(listFolderTiles(folders[3])).toEqual([]);
	});
});
