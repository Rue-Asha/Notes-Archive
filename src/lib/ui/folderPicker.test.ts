import { describe, expect, it } from 'vitest';
import type { Tree, TreeFolder } from '#lib/types.ts';
import { pickable } from './folderPicker.ts';

const folder = (id: number, name: string, children: TreeFolder[] = []): TreeFolder => ({
	id,
	name,
	parentId: null,
	children,
	notes: []
});

const tree: Tree = {
	folders: [folder(1, 'Travel', [folder(2, 'Japan', [folder(3, 'Kyoto')]), folder(4, 'Italy')]), folder(5, 'Recipes')],
	rootNotes: []
};

describe('pickable', () => {
	it('lists Root first, then every folder depth first with its depth', () => {
		expect(pickable(tree)).toEqual([
			{ id: null, name: 'Root', depth: 0 },
			{ id: 1, name: 'Travel', depth: 1 },
			{ id: 2, name: 'Japan', depth: 2 },
			{ id: 3, name: 'Kyoto', depth: 3 },
			{ id: 4, name: 'Italy', depth: 2 },
			{ id: 5, name: 'Recipes', depth: 1 }
		]);
	});

	it('hides the excluded folder and everything below it', () => {
		expect(pickable(tree, 2).map((r) => r.id)).toEqual([null, 1, 4, 5]);
		expect(pickable(tree, 1).map((r) => r.id)).toEqual([null, 5]);
	});

	it('ignores an exclude id that is not in the tree', () => {
		expect(pickable(tree, 99)).toHaveLength(6);
	});

	it('still offers Root for an empty tree', () => {
		expect(pickable({ folders: [], rootNotes: [] })).toEqual([{ id: null, name: 'Root', depth: 0 }]);
	});
});
