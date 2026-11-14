import { error, json } from '@sveltejs/kit';
import { ValidationError } from '#lib/errors.ts';
import type { TreeSort } from '#lib/types.ts';
import { getTreeSort, setTreeSort } from '#lib/server/settings.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json({ treeSort: getTreeSort() });

export const PATCH: RequestHandler = async ({ request }) => {
	const body = (await request.json().catch(() => null)) as { treeSort?: unknown } | null;
	try {
		setTreeSort(body?.treeSort as TreeSort);
	} catch (e) {
		if (e instanceof ValidationError) error(400, e.message);
		throw e;
	}
	return json({ treeSort: getTreeSort() });
};
