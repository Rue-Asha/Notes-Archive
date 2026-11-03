import { UploadError } from '#lib/errors.ts';
import type { Id, UploadedFile } from '#lib/types.ts';
import { getDb } from './db.ts';
import { MAX_UPLOAD_BYTES } from './images.ts';

export function storeFile(noteId: Id, file: { name: string; mime: string; bytes: Uint8Array }): UploadedFile {
	if (file.bytes.length > MAX_UPLOAD_BYTES) throw new UploadError('file-too-large');
	// Node 22's node:sqlite binds the empty buffer from request.arrayBuffer() as NULL; a copy binds as an empty blob
	const { lastInsertRowid } = getDb()
		.prepare('INSERT INTO files (note_id, name, mime, size, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)')
		.run(noteId, file.name, file.mime, file.bytes.length, Buffer.from(file.bytes), new Date().toISOString());
	return { id: Number(lastInsertRowid), name: file.name, size: file.bytes.length, mime: file.mime };
}

export function getFile(id: Id): (UploadedFile & { bytes: Uint8Array }) | null {
	const row = getDb().prepare('SELECT id, name, mime, size, bytes FROM files WHERE id = ?').get(id);
	return row
		? { id: Number(row.id), name: String(row.name), mime: String(row.mime), size: Number(row.size), bytes: row.bytes as Uint8Array }
		: null;
}
