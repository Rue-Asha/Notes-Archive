import { error, json } from '@sveltejs/kit';
import { NotFoundError, ValidationError } from '#lib/errors.ts';
import { deleteFolder, folderCounts, getFolder, moveFolder, renameFolder } from '#lib/server/folders.ts';
import type { RequestHandler } from './$types';

function folderId(raw: string): number {
	const id = Number(raw);
	if (!getFolder(id)) error(404, 'Not found');
	return id;
}

export const GET: RequestHandler = ({ params }) => {
	const id = folderId(params.id);
	return json({ folder: getFolder(id), counts: folderCounts(id) });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = folderId(params.id);
	const body = await request.json();
	try {
		// the move is the call that can refuse, so it goes first and a refused PATCH leaves the name alone
		if ('parentId' in body) moveFolder(id, body.parentId);
		if (typeof body.name === 'string') renameFolder(id, body.name);
	} catch (e) {
		if (e instanceof ValidationError) error(400, e.message);
		if (e instanceof NotFoundError) error(404, e.message);
		throw e;
	}
	return json({ folder: getFolder(id) });
};

export const DELETE: RequestHandler = ({ params }) => json(deleteFolder(folderId(params.id)));
