import { ValidationError, NotFoundError } from '#lib/errors.ts';
import type { Id, IsoDateTime, Note, NoteCard, NotePatch, TagRef } from '#lib/types.ts';
import { getDb } from './db.ts';
import { isEmptyDoc, plainText, referencedUploads, snippet } from './plaintext.ts';
import { indexNote } from './search.ts';
import { pruneTags, setNoteTags } from './tags.ts';

const EMPTY_DOC = '{"type":"doc","content":[{"type":"paragraph"}]}';

function assertFolder(folderId: Id | null | undefined): void {
	if (folderId == null) return;
	if (!getDb().prepare('SELECT 1 FROM folders WHERE id = ?').get(folderId)) throw new ValidationError('folder');
}

function noteTags(id: Id): TagRef[] {
	return getDb()
		.prepare(
			'SELECT tags.id, tags.name FROM note_tags JOIN tags ON tags.id = note_tags.tag_id WHERE note_id = ? ORDER BY position'
		)
		.all(id)
		.map((r) => ({ id: Number(r.id), name: String(r.name) }));
}

type UploadTable = 'images' | 'files';

// copy-paste carries an upload's id into another note while the row stays owned by the first one
function otherReference(table: UploadTable, upload: Id, excluding: Id[]): Id | null {
	const rows = getDb().prepare('SELECT id, content FROM notes WHERE instr(content, ?) > 0').all(String(upload));
	for (const row of rows) {
		const id = Number(row.id);
		if (!excluding.includes(id) && referencedUploads(JSON.parse(String(row.content)))[table].includes(upload)) return id;
	}
	return null;
}

// a cut block pasted into another note, or brought back with undo, reaches the server only after the save that
// dropped it, so a released upload waits this long before it goes
export const UPLOAD_GRACE_MS = 60 * 60 * 1000;

// an upload another note still shows moves to that note instead of going with its owner; the rest is only marked
function releaseUploads(table: UploadTable, uploads: Id[], owners: Id[]): void {
	const db = getDb();
	for (const upload of uploads) {
		const keeper = otherReference(table, upload, owners);
		if (keeper === null)
			db.prepare(`UPDATE ${table} SET orphaned_at = ? WHERE id = ?`).run(new Date().toISOString(), upload);
		else db.prepare(`UPDATE ${table} SET note_id = ? WHERE id = ?`).run(keeper, upload);
	}
}

export function purgeOrphans(now = Date.now()): void {
	const before = new Date(now - UPLOAD_GRACE_MS).toISOString();
	for (const table of ['images', 'files'] as const)
		getDb().prepare(`DELETE FROM ${table} WHERE orphaned_at IS NOT NULL AND orphaned_at < ?`).run(before);
}

// call before the notes go: whatever they own and another note shows is handed over, the rest goes with the cascade
export function handOverUploads(owners: Id[]): void {
	if (!owners.length) return;
	const db = getDb();
	const marks = owners.map(() => '?').join(', ');
	for (const table of ['images', 'files'] as const) {
		const rows = db.prepare(`SELECT id, note_id FROM ${table} WHERE note_id IN (${marks})`).all(...owners);
		for (const row of rows) {
			const keeper = otherReference(table, Number(row.id), owners);
			if (keeper !== null) db.prepare(`UPDATE ${table} SET note_id = ? WHERE id = ?`).run(keeper, row.id);
		}
	}
}

export function createNote(input: { folderId?: Id | null }): Id {
	const folderId = input.folderId ?? null;
	assertFolder(folderId);
	const now = new Date().toISOString();
	const id = Number(
		getDb()
			.prepare('INSERT INTO notes (folder_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)')
			.run(folderId, EMPTY_DOC, now, now).lastInsertRowid
	);
	indexNote(id);
	return id;
}

export function getNote(id: Id): Note | null {
	const row = getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id);
	if (!row) return null;
	return {
		id,
		folderId: row.folder_id === null ? null : Number(row.folder_id),
		title: String(row.title),
		icon: row.icon === null ? null : String(row.icon),
		content: JSON.parse(String(row.content)),
		tags: noteTags(id),
		pinned: row.pinned_at !== null,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at)
	};
}

export function updateNote(id: Id, patch: NotePatch): { updatedAt: IsoDateTime } {
	const db = getDb();
	const row = db.prepare('SELECT content, pinned_at, updated_at FROM notes WHERE id = ?').get(id);
	if (!row) throw new NotFoundError('note');
	if (patch.folderId !== undefined) assertFolder(patch.folderId);
	if (patch.content !== undefined && (typeof patch.content !== 'object' || patch.content === null))
		throw new ValidationError('content');

	const sets: string[] = [];
	const values: (string | number | null)[] = [];
	const set = (column: string, value: string | number | null) => {
		sets.push(`${column} = ?`);
		values.push(value);
	};
	if (patch.title !== undefined) set('title', patch.title);
	if (patch.icon !== undefined) set('icon', patch.icon);
	if (patch.folderId !== undefined) set('folder_id', patch.folderId);
	if (patch.content !== undefined) {
		set('content', JSON.stringify(patch.content));
		set('body_text', plainText(patch.content));
	}
	if (patch.pinned !== undefined)
		set('pinned_at', patch.pinned ? ((row.pinned_at as string | null) ?? new Date().toISOString()) : null);

	const previous = String(row.updated_at);
	let updatedAt = previous;
	if (
		patch.title !== undefined ||
		patch.icon !== undefined ||
		patch.folderId !== undefined ||
		patch.content !== undefined ||
		patch.tags !== undefined
	) {
		const now = new Date().toISOString();
		// two writes in one millisecond still have to order
		updatedAt = now > previous ? now : new Date(Date.parse(previous) + 1).toISOString();
		set('updated_at', updatedAt);
	}

	db.exec('BEGIN');
	try {
		if (sets.length) db.prepare(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
		if (patch.content !== undefined) {
			const kept = referencedUploads(patch.content);
			const gone = referencedUploads(JSON.parse(String(row.content)));
			for (const [table, before, after] of [
				['images', gone.images, kept.images],
				['files', gone.files, kept.files]
			] as const) {
				const adopt = db.prepare(
					`UPDATE ${table} SET note_id = ?, orphaned_at = NULL WHERE id = ? AND orphaned_at IS NOT NULL`
				);
				for (const upload of after) adopt.run(id, upload);
				const mine = db.prepare(`SELECT 1 FROM ${table} WHERE id = ? AND note_id = ?`);
				releaseUploads(
					table,
					before.filter((upload) => !after.includes(upload) && mine.get(upload, id)),
					[id]
				);
			}
		}
		db.exec('COMMIT');
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}

	if (patch.tags !== undefined) setNoteTags(id, patch.tags);
	indexNote(id);
	purgeOrphans();
	return { updatedAt };
}

export function deleteNote(id: Id): { folderId: Id | null } {
	const db = getDb();
	const row = db.prepare('SELECT folder_id FROM notes WHERE id = ?').get(id);
	if (!row) throw new NotFoundError('note');
	handOverUploads([id]);
	db.prepare('DELETE FROM notes WHERE id = ?').run(id);
	pruneTags();
	return { folderId: row.folder_id === null ? null : Number(row.folder_id) };
}

export function discardIfEmpty(id: Id): boolean {
	const note = getNote(id);
	if (!note || note.title.trim() !== '' || note.icon !== null || note.pinned || note.tags.length) return false;
	if (!isEmptyDoc(note.content)) return false;
	deleteNote(id);
	return true;
}

export function cards(where: string, params: (string | number)[], order: string, limit?: number): NoteCard[] {
	const db = getDb();
	const rows = db
		.prepare(
			`SELECT id, folder_id, title, icon, body_text, pinned_at, updated_at FROM notes WHERE ${where} ORDER BY ${order}${limit === undefined ? '' : ' LIMIT ?'}`
		)
		.all(...params, ...(limit === undefined ? [] : [limit]));
	const tags = new Map<number, TagRef[]>();
	if (rows.length) {
		const marks = rows.map(() => '?').join(', ');
		const found = db
			.prepare(
				`SELECT note_tags.note_id, tags.id, tags.name FROM note_tags JOIN tags ON tags.id = note_tags.tag_id WHERE note_tags.note_id IN (${marks}) ORDER BY note_tags.position`
			)
			.all(...rows.map((r) => Number(r.id)));
		for (const t of found) {
			const list = tags.get(Number(t.note_id)) ?? [];
			list.push({ id: Number(t.id), name: String(t.name) });
			tags.set(Number(t.note_id), list);
		}
	}
	return rows.map((r) => ({
		id: Number(r.id),
		folderId: r.folder_id === null ? null : Number(r.folder_id),
		title: String(r.title),
		icon: r.icon === null ? null : String(r.icon),
		snippet: snippet(String(r.body_text)),
		tags: tags.get(Number(r.id)) ?? [],
		pinned: r.pinned_at !== null,
		updatedAt: String(r.updated_at)
	}));
}

const NEWEST = 'updated_at DESC, id DESC';

export function listNotes(q: { folderId?: Id | null; tagId?: Id }): NoteCard[] {
	const where: string[] = [];
	const params: number[] = [];
	if (q.tagId !== undefined) {
		where.push('id IN (SELECT note_id FROM note_tags WHERE tag_id = ?)');
		params.push(q.tagId);
	}
	if (q.tagId === undefined || q.folderId !== undefined) {
		if (q.folderId == null) where.push('folder_id IS NULL');
		else {
			where.push('folder_id = ?');
			params.push(q.folderId);
		}
	}
	return cards(where.join(' AND '), params, NEWEST);
}

export function listRecent(limit = 8): NoteCard[] {
	return cards('1', [], NEWEST, limit);
}

export function listPinned(): NoteCard[] {
	return cards('pinned_at IS NOT NULL', [], 'pinned_at DESC, id DESC');
}
