import { json } from '@sveltejs/kit';
import { NotFoundError, ValidationError } from '#lib/errors.ts';
import { deleteNote, getNote, updateNote } from '#lib/server/notes.ts';
import type { NotePatch } from '#lib/types.ts';
import type { RequestHandler } from './$types';

function failure(e: unknown): Response {
	if (e instanceof NotFoundError) return json({ error: 'deleted' }, { status: 404 });
	if (e instanceof ValidationError) return json({ error: e.message }, { status: 400 });
	throw e;
}

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = Number(params.id);
	try {
		const { updatedAt } = updateNote(id, (await request.json()) as NotePatch);
		return json({ updatedAt, tags: getNote(id)?.tags ?? [] });
	} catch (e) {
		return failure(e);
	}
};

export const DELETE: RequestHandler = ({ params }) => {
	try {
		return json(deleteNote(Number(params.id)));
	} catch (e) {
		return failure(e);
	}
};
