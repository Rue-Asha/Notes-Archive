import { error, json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { StoredNote } from '#lib/server/testing.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	requireTestFlag();
	const db = getDb();
	const id = Number(params.id);
	const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
	if (!row) error(404, 'Not found');
	const tags = db
		.prepare('SELECT tags.name FROM note_tags JOIN tags ON tags.id = note_tags.tag_id WHERE note_id = ? ORDER BY position')
		.all(id)
		.map((r) => String(r.name));
	const note: StoredNote = {
		title: String(row.title),
		icon: row.icon === null ? null : String(row.icon),
		content: JSON.parse(String(row.content)),
		bodyText: String(row.body_text),
		folderId: row.folder_id === null ? null : Number(row.folder_id),
		pinnedAt: row.pinned_at === null ? null : String(row.pinned_at),
		tags,
		updatedAt: String(row.updated_at)
	};
	return json(note);
};
