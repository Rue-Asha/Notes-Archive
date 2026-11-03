import { error } from '@sveltejs/kit';
import { getNote } from '#lib/server/notes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const note = /^\d+$/.test(params.id) ? getNote(Number(params.id)) : null;
	if (!note) error(404, 'Note not found');
	return { note };
};
