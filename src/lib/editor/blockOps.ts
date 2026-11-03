import type { Editor } from '@tiptap/core';
import { Fragment, type Node } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';

export type Direction = 'up' | 'down';

export function moveBlock(doc: Node, index: number, direction: Direction): Node | null {
	const other = direction === 'up' ? index - 1 : index + 1;
	if (index < 0 || index >= doc.childCount || other < 0 || other >= doc.childCount) return null;
	const blocks: Node[] = [];
	doc.forEach((block) => blocks.push(block));
	[blocks[index], blocks[other]] = [blocks[other], blocks[index]];
	return doc.copy(Fragment.fromArray(blocks));
}

// Swaps the two blocks in place, so only they are replaced and the cursor goes with the moved one
export function moveBlockIn(editor: Editor, index: number, direction: Direction): boolean {
	const { state, view } = editor;
	const moved = moveBlock(state.doc, index, direction);
	if (!moved) return false;
	const [first, second] = direction === 'up' ? [index - 1, index] : [index, index + 1];
	let from = 0;
	for (let i = 0; i < first; i++) from += state.doc.child(i).nodeSize;
	const to = from + state.doc.child(first).nodeSize + state.doc.child(second).nodeSize;
	const tr = state.tr.replaceWith(from, to, Fragment.fromArray([moved.child(first), moved.child(second)]));
	let start = 0;
	for (let i = 0; i < (direction === 'up' ? index - 1 : index + 1); i++) start += moved.child(i).nodeSize;
	view.dispatch(tr.setSelection(TextSelection.near(tr.doc.resolve(start + 1))).scrollIntoView());
	return true;
}

export function blockIndexAt(editor: Editor, pos: number): number {
	return editor.state.doc.resolve(pos).index(0);
}
