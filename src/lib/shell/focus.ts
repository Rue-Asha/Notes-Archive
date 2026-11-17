import type { Crumb, Id, NoteRef, Tree, TreeFolder } from '#lib/types.ts';

export type FocusTarget = { folder: Id } | { note: Id } | null;

export interface FocusView {
	path: Crumb[];
	focus: TreeFolder | null;
	folders: TreeFolder[];
	notes: NoteRef[];
	current: Id | null;
	expand: Id[];
}

// the folders from the top level down to and including the one holding the target, or null when the tree doesn't know it
function chainTo(folders: TreeFolder[], target: Exclude<FocusTarget, null>, chain: TreeFolder[] = []): TreeFolder[] | null {
	for (const f of folders) {
		const here = [...chain, f];
		if ('folder' in target && f.id === target.folder) return here;
		if ('note' in target && f.notes.some((n) => n.id === target.note)) return here;
		const below = chainTo(f.children, target, here);
		if (below) return below;
	}
	return null;
}

function below(folder: TreeFolder, target: Exclude<FocusTarget, null>): Id[] {
	const chain = chainTo(folder.children, target);
	return chain ? chain.slice(0, 'folder' in target ? -1 : undefined).map((f) => f.id) : [];
}

// A folder page focuses its folder, a note its folder (a top-level note the top level), anything else the top level.
// The ancestors of the current item below the focus expand on their own.
export function focusView(tree: Tree, target: FocusTarget): FocusView {
	const top: FocusView = { path: [], focus: null, folders: tree.folders, notes: tree.rootNotes, current: target && 'note' in target ? target.note : null, expand: [] };
	if (!target) return top;
	const chain = chainTo(tree.folders, target);
	if (!chain) return top;
	const focus = chain.at(-1)!;
	return {
		path: chain.slice(0, -1).map((f) => ({ id: f.id, name: f.name })),
		focus,
		folders: focus.children,
		notes: focus.notes,
		current: 'note' in target ? target.note : null,
		expand: below(focus, target)
	};
}

// twelve levels deep keeps the first and the two nearest ancestors; the middle becomes one control
export const SHORTEN_FROM = 10;

export function shortenPath(path: Crumb[], all: boolean): { head: Crumb[]; hidden: number; tail: Crumb[] } {
	if (all || path.length < SHORTEN_FROM) return { head: path, hidden: 0, tail: [] };
	return { head: path.slice(0, 1), hidden: path.length - 3, tail: path.slice(-2) };
}
