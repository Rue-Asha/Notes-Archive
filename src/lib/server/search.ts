import { foldSearch } from '#lib/text.ts';
import type { Id, NoteCard, SearchHit, SearchQuery, SnippetPart } from '#lib/types.ts';
import { getDb } from './db.ts';
import { cards } from './notes.ts';

const LIMIT = 50;

export function indexNote(id: Id): void {
	const db = getDb();
	const note = db.prepare('SELECT title, body_text FROM notes WHERE id = ?').get(id);
	db.prepare('DELETE FROM notes_fts WHERE rowid = ?').run(id);
	if (!note) return;
	const tags = db
		.prepare('SELECT tags.name FROM note_tags JOIN tags ON tags.id = note_tags.tag_id WHERE note_id = ? ORDER BY position')
		.all(id)
		.map((r) => String(r.name))
		.join(' ');
	db.prepare('INSERT INTO notes_fts (rowid, title, body, tags) VALUES (?, ?, ?, ?)').run(
		id,
		foldSearch(String(note.title)),
		foldSearch(String(note.body_text)),
		foldSearch(tags)
	);
}

function terms(q: string): string[] | null {
	const tokens = foldSearch(q.normalize('NFC')).match(/[\p{L}\p{N}]+/gu);
	return tokens ? tokens.map((t) => `"${t}"*`) : null;
}

export function toMatchQuery(q: string): string | null {
	return terms(q)?.join(' ') ?? null;
}

const ELLIPSIS = '…';

// snippet() cuts from the folded index text, so ß reads "ss" there; find the cut in the original text and slice that instead
function snippetParts(raw: string, sources: string[]): SnippetPart[] {
	const folded: SnippetPart[] = [];
	let hit = false;
	for (const piece of raw.split(/([\x02\x03])/)) {
		if (piece === '\x02') hit = true;
		else if (piece === '\x03') hit = false;
		else if (piece) folded.push({ text: piece, hit });
	}
	const flat = folded.map((p) => p.text).join('');
	const lead = flat.startsWith(ELLIPSIS) && flat.length > 1 ? 1 : 0;
	const trail = flat.endsWith(ELLIPSIS) && flat.length > 1 ? 1 : 0;
	const core = flat.slice(lead, flat.length - trail);
	for (const source of sources) {
		const at = foldSearch(source).indexOf(core);
		if (at < 0) continue;
		// offs[i] = offset in source of folded offset i
		const offs: number[] = [];
		for (let i = 0; i < source.length; i++) {
			offs.push(i);
			if (source[i] === 'ß' || source[i] === 'ẞ') offs.push(i);
		}
		offs.push(source.length);
		const parts: SnippetPart[] = [];
		let cursor = at - lead;
		for (const p of folded) {
			const from = Math.max(cursor, at);
			cursor += p.text.length;
			const text = source.slice(offs[from], offs[Math.min(cursor, at + core.length)]);
			if (text) parts.push({ text, hit: p.hit });
		}
		if (lead) parts.unshift({ text: ELLIPSIS, hit: false });
		if (trail) parts.push({ text: ELLIPSIS, hit: false });
		return parts;
	}
	return folded;
}

function filters(q: SearchQuery): { sql: string; params: number[] } {
	const sql: string[] = [];
	const params: number[] = [];
	if (q.folderId != null) {
		sql.push(
			`notes.folder_id IN (WITH RECURSIVE sub(id) AS (SELECT ? UNION ALL SELECT folders.id FROM folders JOIN sub ON folders.parent_id = sub.id) SELECT id FROM sub)`
		);
		params.push(q.folderId);
	}
	if (q.tagId != null) {
		sql.push('notes.id IN (SELECT note_id FROM note_tags WHERE tag_id = ?)');
		params.push(q.tagId);
	}
	return { sql: sql.map((c) => ` AND ${c}`).join(''), params };
}

export function searchNotes(q: SearchQuery): SearchHit[] {
	const match = toMatchQuery(q.q);
	const filter = filters(q);
	const limit = q.limit ?? LIMIT;
	if (!match) {
		if (!filter.params.length) return [];
		const ids = getDb()
			.prepare(`SELECT notes.id FROM notes WHERE 1${filter.sql} ORDER BY notes.updated_at DESC, notes.id DESC LIMIT ?`)
			.all(...filter.params, q.limit ?? -1);
		return withCards(ids.map((r) => Number(r.id))).map((note) => ({ note, parts: [] }));
	}
	// bm25 weights alone let a body that repeats the word beat a long title, so a title hit is its own sort key
	const inTitle = `title : (${terms(q.q)!.join(' OR ')})`;
	const rows = getDb()
		.prepare(
			`SELECT notes_fts.rowid AS id, snippet(notes_fts, -1, char(2), char(3), '${ELLIPSIS}', 12) AS snip, notes.title, notes.body_text
			FROM notes_fts JOIN notes ON notes.id = notes_fts.rowid
			WHERE notes_fts MATCH ?${filter.sql}
			ORDER BY notes_fts.rowid IN (SELECT rowid FROM notes_fts WHERE notes_fts MATCH ?) DESC, bm25(notes_fts, 10, 1, 5) LIMIT ?`
		)
		.all(match, ...filter.params, inTitle, limit);
	const found = withCards(rows.map((r) => Number(r.id)));
	return rows.map((r, i) => ({
		note: found[i],
		parts: snippetParts(String(r.snip), [String(r.body_text), String(r.title)])
	}));
}

// cards in the order of the given ids
function withCards(order: number[]): NoteCard[] {
	if (!order.length) return [];
	const found = new Map(cards(`id IN (${order.map(() => '?').join(', ')})`, order, 'id').map((n) => [n.id, n]));
	return order.map((id) => found.get(id)!);
}
