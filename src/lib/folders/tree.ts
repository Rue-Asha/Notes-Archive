import type { Id, Tree, TreeFolder } from '#lib/types.ts';

export const MAX_INDENT = 6;

// level counts from one; deeper levels keep the sixth level's indent
export function indentLevel(level: number): number {
	return Math.min(level, MAX_INDENT);
}

export type Target = { note: Id } | { folder: Id };

// the folders above the target, outermost first; the target folder itself is not included
export function ancestorsOf(tree: Tree, target: Target): Id[] {
	const walk = (folders: TreeFolder[], path: Id[]): Id[] | null => {
		for (const f of folders) {
			if ('folder' in target && f.id === target.folder) return path;
			if ('note' in target && f.notes.some((n) => n.id === target.note)) return [...path, f.id];
			const below = walk(f.children, [...path, f.id]);
			if (below) return below;
		}
		return null;
	};
	return walk(tree.folders, []) ?? [];
}
