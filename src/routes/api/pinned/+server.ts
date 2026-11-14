import { json } from '@sveltejs/kit';
import { ConflictError } from '#lib/errors.ts';
import { reorderPinned } from '#lib/server/notes.ts';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
	const ids = body?.ids;
	if (!Array.isArray(ids) || !ids.every((id) => Number.isInteger(id))) return json({ error: 'ids' }, { status: 400 });
	try {
		reorderPinned(ids as number[]);
		return json({ ids });
	} catch (e) {
		if (e instanceof ConflictError) return json({ error: 'stale' }, { status: 409 });
		throw e;
	}
};
