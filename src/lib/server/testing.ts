import { crc32, deflateSync } from 'node:zlib';
import { docFromText } from '#lib/editor/doc.ts';
import { fold } from '#lib/text.ts';
import type { Id, IsoDateTime, JSONContent } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { plainText } from './plaintext.ts';
import { indexNote } from './search.ts';

export interface SeedFolder {
	name: string;
	// index of an earlier folder
	parent?: number;
	cover?: boolean;
	createdAt?: IsoDateTime;
}

export interface SeedNote {
	title?: string;
	icon?: string;
	body?: string;
	content?: JSONContent;
	folder?: number;
	tags?: string[];
	pinnedAt?: IsoDateTime;
	createdAt?: IsoDateTime;
	updatedAt?: IsoDateTime;
	images?: number;
	files?: number;
}

export interface SeedInput {
	folders?: SeedFolder[];
	notes?: SeedNote[];
}

export interface SeedResult {
	folders: Id[];
	notes: Id[];
}

export function useTestDb(): void {
	closeDb();
	process.env.DATABASE_PATH = ':memory:';
	getDb();
}

function png(width: number, height: number, index: number): Uint8Array<ArrayBuffer> {
	const chunk = (type: string, data: Buffer) => {
		const body = Buffer.concat([Buffer.from(type), data]);
		const out = Buffer.alloc(body.length + 8);
		out.writeUInt32BE(data.length, 0);
		body.copy(out, 4);
		out.writeUInt32BE(crc32(body), body.length + 4);
		return out;
	};
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header.set([8, 2, 0, 0, 0], 8);
	const hue = (index * 67) % 256;
	const raw = Buffer.alloc((width * 3 + 1) * height);
	for (let y = 0; y < height; y++) {
		const row = y * (width * 3 + 1);
		for (let x = 0; x < width; x++) raw.set([hue, (120 + x * 2) % 256, (255 - hue + y) % 256], row + 1 + x * 3);
	}
	return new Uint8Array(
		Buffer.concat([
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			chunk('IHDR', header),
			chunk('IDAT', deflateSync(raw)),
			chunk('IEND', Buffer.alloc(0))
		])
	);
}

const WIDTH = 64;
const HEIGHT = 48;

export function testImage(index = 0): Uint8Array<ArrayBuffer> {
	return png(WIDTH, HEIGHT, index);
}

let images = 0;

// plain SQL, no validation: what a seeded row looks like is up to the test
export function seedArchive(input: SeedInput, now: IsoDateTime = new Date().toISOString()): SeedResult {
	const db = getDb();
	const result: SeedResult = { folders: [], notes: [] };
	const insertImage = db.prepare(
		"INSERT INTO images (mime, width, height, bytes, created_at, note_id, folder_id) VALUES ('image/png', ?, ?, ?, ?, ?, ?)"
	);
	const insertFolder = db.prepare(
		'INSERT INTO folders (parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)'
	);
	const insertNote = db.prepare(
		'INSERT INTO notes (folder_id, title, icon, content, body_text, pinned_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	);
	const findTag = db.prepare('SELECT id FROM tags WHERE name_key = ?');
	const insertTag = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
	const linkTag = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id, position) VALUES (?, ?, ?)');
	const insertFile = db.prepare(
		'INSERT INTO files (note_id, name, mime, size, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)'
	);

	db.exec('BEGIN');
	for (const f of input.folders ?? []) {
		const createdAt = f.createdAt ?? now;
		const parent = f.parent === undefined ? null : result.folders[f.parent];
		const id = Number(insertFolder.run(parent, f.name, createdAt, createdAt).lastInsertRowid);
		if (f.cover) insertImage.run(WIDTH, HEIGHT, testImage(images++), now, null, id);
		result.folders.push(id);
	}
	for (const n of input.notes ?? []) {
		const content = n.content ?? docFromText(n.body ?? '');
		const createdAt = n.createdAt ?? now;
		const id = Number(
			insertNote.run(
				n.folder === undefined ? null : result.folders[n.folder],
				n.title ?? '',
				n.icon ?? null,
				JSON.stringify(content),
				plainText(content),
				n.pinnedAt ?? null,
				createdAt,
				n.updatedAt ?? createdAt
			).lastInsertRowid
		);
		let position = 0;
		for (const name of n.tags ?? []) {
			const key = fold(name);
			if (!key) continue;
			const tagId =
				(findTag.get(key)?.id as number | undefined) ??
				Number(insertTag.run(name.trim().replace(/\s+/g, ' '), key).lastInsertRowid);
			if (linkTag.run(id, tagId, position).changes) position++;
		}
		for (let i = 0; i < (n.images ?? 0); i++) insertImage.run(WIDTH, HEIGHT, testImage(images++), now, id, null);
		for (let i = 0; i < (n.files ?? 0); i++) {
			const bytes = new TextEncoder().encode(`seeded file ${i + 1}`);
			insertFile.run(id, `file-${i + 1}.txt`, 'text/plain', bytes.length, bytes, now);
		}
		result.notes.push(id);
	}
	db.exec('COMMIT');
	for (const id of result.notes) indexNote(id);
	return result;
}

export interface StoredNote {
	title: string;
	icon: string | null;
	content: JSONContent;
	bodyText: string;
	folderId: Id | null;
	pinnedAt: IsoDateTime | null;
	tags: string[];
	updatedAt: IsoDateTime;
}
