import { fakeImage } from '#lib/server/fake/pages.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	requireTestFlag();
	return new Response(fakeImage(params.name), { headers: { 'content-type': 'image/png' } });
};
