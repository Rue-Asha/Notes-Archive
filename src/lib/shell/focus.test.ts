import { describe, expect, it } from 'vitest';
import type { Tree, TreeFolder } from '#lib/types.ts';
import { focusView, shortenPath } from './focus.ts';

const note = (id: number, title = `N${id}`) => ({ id, title, icon: null }) as Tree['rootNotes'][number];
const folder = (id: number, name: string, parentId: number | null, children: TreeFolder[] = [], notes: Tree['rootNotes'] = []): TreeFolder => ({ id, name, parentId, children, notes });

const kyoto = folder(3, 'Kyoto', 2, [], [note(30)]);
const japan = folder(2, 'Japan', 1, [kyoto], [note(20)]);
const reisen = folder(1, 'Reisen', null, [japan], []);
const tree: Tree = { folders: [reisen, folder(4, 'Essen', null)], rootNotes: [note(90)] };

describe('focusView', () => {
	it('shows the top level without a path for no target', () => {
		const view = focusView(tree, null);
		expect(view.focus).toBeNull();
		expect(view.path).toEqual([]);
		expect(view.folders.map((f) => f.name)).toEqual(['Reisen', 'Essen']);
		expect(view.notes.map((n) => n.id)).toEqual([90]);
	});

	it('focuses an opened folder with its ancestors as the path', () => {
		const view = focusView(tree, { folder: 3 });
		expect(view.focus?.name).toBe('Kyoto');
		expect(view.path.map((c) => c.name)).toEqual(['Reisen', 'Japan']);
		expect(view.notes.map((n) => n.id)).toEqual([30]);
		expect(view.current).toBeNull();
	});

	it('focuses the folder of an opened note and marks the note', () => {
		const view = focusView(tree, { note: 20 });
		expect(view.focus?.name).toBe('Japan');
		expect(view.path.map((c) => c.name)).toEqual(['Reisen']);
		expect(view.current).toBe(20);
	});

	it('shows the top level for a top-level note', () => {
		const view = focusView(tree, { note: 90 });
		expect(view.focus).toBeNull();
		expect(view.path).toEqual([]);
		expect(view.current).toBe(90);
	});

	it('falls back to the top level for an id the tree does not know', () => {
		expect(focusView(tree, { folder: 999 }).focus).toBeNull();
	});

	it('expands the folders between the focus and a deeper item', () => {
		const view = focusView(tree, { note: 30 });
		expect(view.focus?.name).toBe('Kyoto');
		expect(view.expand).toEqual([]);
	});
});

describe('shortenPath', () => {
	const path = Array.from({ length: 12 }, (_, i) => ({ id: i, name: `L${i}` }));

	it('keeps short paths whole', () => {
		expect(shortenPath(path.slice(0, 9), false)).toEqual({ head: path.slice(0, 9), hidden: 0, tail: [] });
	});

	it('keeps the first and the two nearest ancestors of a deep path', () => {
		const s = shortenPath(path, false);
		expect(s.head.map((c) => c.name)).toEqual(['L0']);
		expect(s.hidden).toBe(9);
		expect(s.tail.map((c) => c.name)).toEqual(['L10', 'L11']);
	});

	it('shows every ancestor when asked', () => {
		expect(shortenPath(path, true).head).toHaveLength(12);
	});
});
