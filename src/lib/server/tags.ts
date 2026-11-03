import { NotFoundError } from '#lib/errors.ts';
import { fold } from '#lib/text.ts';
import type { Id, TagCount, TagRef } from '#lib/types.ts';
import { getDb } from './db.ts';
import { indexNote } from './search.ts';

const collator = new Intl.Collator('de', { numeric: true });

export function pruneTags(): void {
	getDb().prepare('DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM note_tags)').run();
}

// a savepoint, not BEGIN: updateNote calls this from inside its own transaction
export function setNoteTags(noteId: Id, names: string[]): TagRef[] {
	const db = getDb();
	if (!db.prepare('SELECT 1 FROM notes WHERE id = ?').get(noteId)) throw new NotFoundError('Note');
	const find = db.prepare('SELECT id, name FROM tags WHERE name_key = ?');
	const insert = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
	const link = db.prepare('INSERT INTO note_tags (note_id, tag_id, position) VALUES (?, ?, ?)');
	const tags: TagRef[] = [];
	db.exec('SAVEPOINT set_note_tags');
	db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId);
	for (const raw of names) {
		const key = fold(raw);
		if (!key) continue;
		const existing = find.get(key);
		const name = raw.trim().replace(/\s+/g, ' ');
		const tag: TagRef = existing
			? { id: Number(existing.id), name: String(existing.name) }
			: { id: Number(insert.run(name, key).lastInsertRowid), name };
		if (tags.some((t) => t.id === tag.id)) continue;
		link.run(noteId, tag.id, tags.length);
		tags.push(tag);
	}
	pruneTags();
	db.exec('RELEASE set_note_tags');
	indexNote(noteId);
	return tags;
}

export function listTags(): TagCount[] {
	return getDb()
		.prepare('SELECT tags.id, tags.name, count(*) AS count FROM tags JOIN note_tags ON note_tags.tag_id = tags.id GROUP BY tags.id')
		.all()
		.map((r) => ({ id: Number(r.id), name: String(r.name), count: Number(r.count) }))
		.sort((a, b) => collator.compare(a.name, b.name));
}

export function getTag(id: Id): TagRef | null {
	const row = getDb().prepare('SELECT id, name FROM tags WHERE id = ?').get(id);
	return row ? { id: Number(row.id), name: String(row.name) } : null;
}
