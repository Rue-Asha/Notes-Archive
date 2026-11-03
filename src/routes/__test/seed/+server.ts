import { json } from '@sveltejs/kit';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import { seedArchive, type SeedInput } from '#lib/server/testing.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	requireTestFlag();
	return json(seedArchive((await request.json()) as SeedInput));
};
