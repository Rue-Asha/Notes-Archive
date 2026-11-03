import { error } from '@sveltejs/kit';
import { breadcrumb, getFolder, listFolderTiles } from '#lib/server/folders.ts';
import { listNotes } from '#lib/server/notes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const folder = /^\d+$/.test(params.id) ? getFolder(Number(params.id)) : null;
	if (!folder) error(404, 'Folder not found');
	const tiles = listFolderTiles(folder.id);
	const notes = listNotes({ folderId: folder.id });
	return { folder, breadcrumb: breadcrumb(folder.id), tiles, notes, counts: { folders: tiles.length, notes: notes.length } };
};
