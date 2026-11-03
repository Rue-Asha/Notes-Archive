import { error, json } from '@sveltejs/kit';
import { UploadError } from '#lib/errors.ts';
import { storeFile } from '#lib/server/files.ts';
import { getNote } from '#lib/server/notes.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const noteId = Number(params.id);
	if (!getNote(noteId)) error(404, 'Not found');
	let name: string;
	try {
		name = decodeURIComponent(request.headers.get('x-filename') ?? '') || 'file';
	} catch {
		error(400, 'Bad filename');
	}
	const mime = request.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream';
	try {
		const bytes = new Uint8Array(await request.arrayBuffer());
		return json(storeFile(noteId, { name, mime, bytes }), { status: 201 });
	} catch (e) {
		if (e instanceof UploadError) return json({ error: e.code }, { status: 413 });
		throw e;
	}
};
