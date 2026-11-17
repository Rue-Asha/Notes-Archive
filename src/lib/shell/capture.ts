import { goto, invalidate } from '$app/navigation';
import { page } from '$app/state';
import type { Id, Tree, TreeFolder } from '#lib/types.ts';

export type CapturePage = Pick<typeof page, 'params'> & { route: { id: string | null } };

function findFolder(folders: TreeFolder[], id: Id): TreeFolder | null {
	for (const folder of folders) {
		if (folder.id === id) return folder;
		const inside = findFolder(folder.children, id);
		if (inside) return inside;
	}
	return null;
}

function folderOfNote(folders: TreeFolder[], id: Id): Id | null {
	for (const folder of folders) {
		if (folder.notes.some((n) => n.id === id)) return folder.id;
		const inside = folderOfNote(folder.children, id);
		if (inside !== null) return inside;
	}
	return null;
}

// the folder of the open folder page or of the open note; anywhere else a new note lands at the top level
export function currentFolderId(at: CapturePage, tree: Tree): Id | null {
	const id = Number(at.params.id);
	if (!Number.isInteger(id)) return null;
	if (at.route.id === '/(app)/folders/[id]') return findFolder(tree.folders, id)?.id ?? null;
	if (at.route.id === '/(app)/notes/[id]') return folderOfNote(tree.folders, id);
	return null;
}

// without a folder the current one is used; an entry point that names a folder passes it
export async function newNote(folderId?: Id | null): Promise<void> {
	const target = folderId === undefined ? currentFolderId(page, page.data.tree as Tree) : folderId;
	const res = await fetch('/api/notes', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ folderId: target })
	});
	const { id } = (await res.json()) as { id: Id };
	await invalidate('app:tree');
	await goto(`/notes/${id}`);
}
