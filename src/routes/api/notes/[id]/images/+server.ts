import { error, json } from '@sveltejs/kit';
import { UploadError } from '#lib/errors.ts';
import { storeImage } from '#lib/server/images.ts';
import { getNote } from '#lib/server/notes.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const noteId = Number(params.id);
	if (!getNote(noteId)) error(404, 'Not found');
	try {
		return json(await storeImage(new Uint8Array(await request.arrayBuffer()), { noteId }), { status: 201 });
	} catch (e) {
		if (e instanceof UploadError) return json({ error: e.code }, { status: e.code === 'not-image' ? 415 : 413 });
		throw e;
	}
};
