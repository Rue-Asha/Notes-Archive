import { error } from '@sveltejs/kit';
import { listNotes } from '#lib/server/notes.ts';
import { getTag } from '#lib/server/tags.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const tag = /^\d+$/.test(params.id) ? getTag(Number(params.id)) : null;
	if (!tag) error(404, 'Tag not found');
	return { tag, notes: listNotes({ tagId: tag.id }) };
};
