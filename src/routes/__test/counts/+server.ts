import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

const TABLES = ['notes', 'folders', 'tags', 'note_tags', 'images', 'files', 'notes_fts'];

export const GET: RequestHandler = () => {
	requireTestFlag();
	const db = getDb();
	return json(
		Object.fromEntries(TABLES.map((t) => [t, Number(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n)]))
	);
};
