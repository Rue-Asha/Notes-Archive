import { error, json } from '@sveltejs/kit';
import { FetchError } from '#lib/errors.ts';
import { getNote } from '#lib/server/notes.ts';
import { readPreview } from '#lib/server/preview.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body: unknown = await request.json().catch(() => null);
	const { url, noteId } = (body ?? {}) as { url?: unknown; noteId?: unknown };
	if (typeof url !== 'string' || typeof noteId !== 'number') error(400, 'Invalid body');
	if (!getNote(noteId)) error(404, 'Not found');
	try {
		return json(await readPreview(url.trim(), noteId));
	} catch (e) {
		if (e instanceof FetchError) return json({ error: 'invalid-url' }, { status: 400 });
		throw e;
	}
};
