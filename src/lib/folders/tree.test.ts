import { describe, expect, it } from 'vitest';
import type { Tree, TreeFolder } from '#lib/types.ts';
import { ancestorsOf, indentLevel } from './tree.ts';

const folder = (id: number, children: TreeFolder[] = [], noteIds: number[] = []): TreeFolder => ({
	id,
	name: `f${id}`,
	parentId: null,
	children,
	notes: noteIds.map((n) => ({ id: n, title: '', icon: null }))
});

const tree: Tree = {
	folders: [folder(1, [folder(2, [folder(3, [], [30])], [20])]), folder(4)],
	rootNotes: [{ id: 99, title: '', icon: null }]
};

describe('indentLevel', () => {
	it('counts levels from one and stops at six', () => {
		expect([1, 2, 5, 6, 7, 10].map(indentLevel)).toEqual([1, 2, 5, 6, 6, 6]);
	});
});

describe('ancestorsOf', () => {
	it('lists the folders above a note, outermost first', () => {
		expect(ancestorsOf(tree, { note: 30 })).toEqual([1, 2, 3]);
		expect(ancestorsOf(tree, { note: 20 })).toEqual([1, 2]);
	});

	it('lists the folders above a folder, not the folder itself', () => {
		expect(ancestorsOf(tree, { folder: 3 })).toEqual([1, 2]);
		expect(ancestorsOf(tree, { folder: 1 })).toEqual([]);
	});

	it('is empty for root notes and unknown ids', () => {
		expect(ancestorsOf(tree, { note: 99 })).toEqual([]);
		expect(ancestorsOf(tree, { folder: 404 })).toEqual([]);
	});
});
