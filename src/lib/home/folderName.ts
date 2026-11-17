import type { Id, TreeFolder } from '#lib/types.ts';

export function folderName(folders: TreeFolder[], id: Id | null): string | null {
	if (id === null) return null;
	for (const folder of folders) {
		if (folder.id === id) return folder.name;
		const inside = folderName(folder.children, id);
		if (inside) return inside;
	}
	return null;
}
