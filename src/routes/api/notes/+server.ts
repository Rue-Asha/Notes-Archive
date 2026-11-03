import { json } from '@sveltejs/kit';
import { ValidationError } from '#lib/errors.ts';
import { createNote } from '#lib/server/notes.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { folderId } = (await request.json()) as { folderId?: number | null };
	try {
		return json({ id: createNote({ folderId }) }, { status: 201 });
	} catch (e) {
		if (e instanceof ValidationError) return json({ error: e.message }, { status: 400 });
		throw e;
	}
};
