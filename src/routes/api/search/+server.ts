import { error, json } from '@sveltejs/kit';
import { listRecent } from '#lib/server/notes.ts';
import { searchNotes } from '#lib/server/search.ts';
import type { RequestHandler } from './$types';

function positiveInt(raw: string | null): number | undefined {
	if (raw === null || raw === '') return undefined;
	if (!/^\d+$/.test(raw) || Number(raw) < 1) error(400, 'Invalid number');
	return Number(raw);
}

export const GET: RequestHandler = ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const folderId = positiveInt(url.searchParams.get('folder'));
	const tagId = positiveInt(url.searchParams.get('tag'));
	const limit = positiveInt(url.searchParams.get('limit'));
	const empty = !q.trim() && folderId === undefined && tagId === undefined;
	return json({ hits: searchNotes({ q, folderId, tagId, limit }), recent: empty ? listRecent(8) : [] });
};
