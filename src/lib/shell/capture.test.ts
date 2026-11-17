import { describe, expect, it } from 'vitest';
import type { Tree } from '#lib/types.ts';
import { currentFolderId, type CapturePage } from './capture.ts';

const note = (id: number) => ({ id, title: `Note ${id}`, icon: null });

const tree: Tree = {
	folders: [
		{
			id: 1,
			name: 'Japan',
			parentId: null,
			notes: [note(11)],
			children: [{ id: 2, name: 'Kyoto', parentId: 1, children: [], notes: [note(21)] }]
		}
	],
	rootNotes: [note(5)]
};

function at(routeId: string, params: Record<string, string> = {}): CapturePage {
	return { route: { id: routeId }, params };
}

describe('currentFolderId', () => {
	it('Scenario: New note from the shell lands in the current folder (folder page and note page)', () => {
		expect(currentFolderId(at('/(app)/folders/[id]', { id: '2' }), tree)).toBe(2);
		expect(currentFolderId(at('/(app)/notes/[id]', { id: '11' }), tree)).toBe(1);
		expect(currentFolderId(at('/(app)/notes/[id]', { id: '21' }), tree)).toBe(2);
	});

	it('Scenario: New note without a current folder lands at the top level', () => {
		expect(currentFolderId(at('/(app)'), tree)).toBeNull();
		expect(currentFolderId(at('/(app)/folders'), tree)).toBeNull();
		expect(currentFolderId(at('/(app)/search'), tree)).toBeNull();
		expect(currentFolderId(at('/(app)/tags/[id]', { id: '3' }), tree)).toBeNull();
		expect(currentFolderId(at('/(app)/notes/[id]', { id: '5' }), tree)).toBeNull();
	});

	it('ignores an id the tree does not know', () => {
		expect(currentFolderId(at('/(app)/folders/[id]', { id: '99' }), tree)).toBeNull();
		expect(currentFolderId(at('/(app)/notes/[id]', { id: '99' }), tree)).toBeNull();
	});
});
