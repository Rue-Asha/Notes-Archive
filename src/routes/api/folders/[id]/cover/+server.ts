import { error, json } from '@sveltejs/kit';
import { UploadError } from '#lib/errors.ts';
import { getFolder } from '#lib/server/folders.ts';
import { removeFolderCover, setFolderCover } from '#lib/server/images.ts';
import type { RequestHandler } from './$types';

function folderId(raw: string): number {
	const id = Number(raw);
	if (!getFolder(id)) error(404, 'Not found');
	return id;
}

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = folderId(params.id);
	try {
		return json(await setFolderCover(id, new Uint8Array(await request.arrayBuffer())));
	} catch (e) {
		if (e instanceof UploadError) return json({ error: e.code }, { status: e.code === 'not-image' ? 415 : 413 });
		throw e;
	}
};

export const DELETE: RequestHandler = ({ params }) => {
	removeFolderCover(folderId(params.id));
	return new Response(null, { status: 204 });
};
