import { error, json } from '@sveltejs/kit';
import { NotFoundError } from '#lib/errors.ts';
import { createFolder } from '#lib/server/folders.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const parentId = body.parentId ?? null;
	if (parentId !== null && !Number.isInteger(parentId)) error(400, 'Invalid parent');
	try {
		return json({ id: createFolder({ name: body.name, parentId }) }, { status: 201 });
	} catch (e) {
		if (e instanceof NotFoundError) error(404, e.message);
		throw e;
	}
};
