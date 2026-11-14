import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { getDb } from './db.ts';
import { getTree, listFolderTiles } from './folders.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(closeDb);

describe('tree', () => {
	it('Scenario: Default sort keeps folders by name and notes by last edited: nests folders, keeps root notes', () => {
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

	const sortSeed = () =>
		seedArchive({
			folders: [
				{ name: 'B', createdAt: '2026-10-01T00:00:00.000Z' },
				{ name: 'a2', createdAt: '2026-10-03T00:00:00.000Z' },
				{ name: 'a10', createdAt: '2026-10-02T00:00:00.000Z' },
				{ name: 'Sub z', parent: 0, createdAt: '2026-10-05T00:00:00.000Z' },
				{ name: 'Sub a', parent: 0, createdAt: '2026-10-04T00:00:00.000Z' }
			],
			notes: [
				{ title: 'Zeta', folder: 0, createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z' },
				{ title: '', folder: 0, createdAt: '2026-09-02T00:00:00.000Z', updatedAt: '2026-09-02T00:00:00.000Z' },
				{ title: 'Alpha', folder: 0, createdAt: '2026-09-03T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' },
				{ title: 'n10', createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-03T00:00:00.000Z' },
				{ title: 'n2', createdAt: '2026-08-02T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z' }
			]
		});

	it('Scenario: Each mode orders folders and notes', () => {
		sortSeed();
		const names = (t: ReturnType<typeof getTree>) => t.folders.map((f) => f.name);
		const titles = (l: { title: string }[]) => l.map((n) => n.title);

		expect(names(getTree('mixed'))).toEqual(['a2', 'a10', 'B']);

		const byName = getTree('name');
		expect(names(byName)).toEqual(['a2', 'a10', 'B']);
		expect(titles(byName.rootNotes)).toEqual(['n2', 'n10']);
		expect(titles(byName.folders[2].notes)).toEqual(['Alpha', '', 'Zeta']);
		expect(byName.folders[2].children.map((f) => f.name)).toEqual(['Sub a', 'Sub z']);

		const edited = getTree('edited');
		expect(names(edited)).toEqual(['B', 'a2', 'a10']);
		expect(edited.folders[0].children.map((f) => f.name)).toEqual(['Sub z', 'Sub a']);
		expect(titles(edited.folders[0].notes)).toEqual(['Zeta', '', 'Alpha']);
		expect(titles(edited.rootNotes)).toEqual(['n10', 'n2']);

		const created = getTree('created');
		expect(names(created)).toEqual(['a2', 'a10', 'B']);
		expect(created.folders[2].children.map((f) => f.name)).toEqual(['Sub z', 'Sub a']);
		expect(titles(created.folders[2].notes)).toEqual(['Alpha', '', 'Zeta']);
		expect(titles(created.rootNotes)).toEqual(['n2', 'n10']);
	});

	it('Scenario: An edited note lifts its folder', () => {
		const { folders, notes } = seedArchive({
			folders: [
				{ name: 'Old', createdAt: '2026-01-01T00:00:00.000Z' },
				{ name: 'Mid', parent: 0, createdAt: '2026-01-01T00:00:00.000Z' },
				{ name: 'Deep', parent: 1, createdAt: '2026-01-01T00:00:00.000Z' },
				{ name: 'Other', createdAt: '2026-06-01T00:00:00.000Z' }
			],
			notes: [{ title: 'deep note', folder: 2, createdAt: '2026-01-02T00:00:00.000Z' }]
		});
		expect(getTree('edited').folders.map((f) => f.name)).toEqual(['Other', 'Old']);
		getDb().prepare('UPDATE notes SET updated_at = ? WHERE id = ?').run('2026-11-01T00:00:00.000Z', notes[0]);
		const tree = getTree('edited');
		expect(tree.folders.map((f) => f.id)).toEqual([folders[0], folders[3]]);
		expect(tree.folders[0].children[0].children[0].notes).toHaveLength(1);
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
