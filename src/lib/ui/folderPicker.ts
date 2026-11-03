import type { Id, Tree, TreeFolder } from '#lib/types.ts';

export interface PickRow {
	id: Id | null;
	name: string;
	depth: number;
}

// "Root" first, then every folder depth first; the excluded folder and what lies below it are left out
export function pickable(tree: Tree, exclude?: Id): PickRow[] {
	const rows: PickRow[] = [{ id: null, name: 'Root', depth: 0 }];
	const walk = (folders: TreeFolder[], depth: number) => {
		for (const f of folders) {
			if (f.id === exclude) continue;
			rows.push({ id: f.id, name: f.name, depth });
			walk(f.children, depth + 1);
		}
	};
	walk(tree.folders, 1);
	return rows;
}
