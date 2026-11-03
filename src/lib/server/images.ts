import sharp from 'sharp';
import { UploadError } from '#lib/errors.ts';
import type { Id, UploadedImage } from '#lib/types.ts';
import { getDb } from './db.ts';

export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
// svg and pdf would be rasterised from author-controlled markup, so only photo formats count
const FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif']);

async function convert(bytes: Uint8Array, maxSide: number): Promise<{ data: Buffer; width: number; height: number }> {
	if (bytes.length > MAX_UPLOAD_BYTES) throw new UploadError('too-large');
	try {
		const meta = await sharp(bytes).metadata();
		// sharp reports AVIF and HEIC both as "heif"; only the AV1 flavour is accepted
		const format = meta.format === 'heif' && meta.compression === 'av1' ? 'avif' : meta.format;
		if (!format || !FORMATS.has(format)) throw new UploadError('not-image');
		const { data, info } = await sharp(bytes)
			.rotate()
			.resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 80 })
			.toBuffer({ resolveWithObject: true });
		return { data, width: info.width, height: info.height };
	} catch (e) {
		throw e instanceof UploadError ? e : new UploadError('not-image');
	}
}

export async function storeImage(
	bytes: Uint8Array,
	owner: { noteId: Id } | { folderId: Id },
	maxSide = 2400
): Promise<UploadedImage> {
	const image = await convert(bytes, maxSide);
	const { lastInsertRowid } = getDb()
		.prepare(
			'INSERT INTO images (mime, width, height, bytes, created_at, note_id, folder_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
		)
		.run(
			'image/webp',
			image.width,
			image.height,
			image.data,
			new Date().toISOString(),
			'noteId' in owner ? owner.noteId : null,
			'folderId' in owner ? owner.folderId : null
		);
	return { id: Number(lastInsertRowid), width: image.width, height: image.height };
}

export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null {
	const row = getDb().prepare('SELECT mime, bytes FROM images WHERE id = ?').get(id);
	return row ? { mime: String(row.mime), bytes: row.bytes as Uint8Array } : null;
}

export async function setFolderCover(folderId: Id, bytes: Uint8Array): Promise<UploadedImage> {
	const image = await convert(bytes, 2400);
	const db = getDb();
	db.exec('BEGIN');
	const old = db.prepare('UPDATE images SET folder_id = NULL, note_id = NULL WHERE folder_id = ? RETURNING id').get(folderId);
	const { lastInsertRowid } = db
		.prepare('INSERT INTO images (mime, width, height, bytes, created_at, folder_id) VALUES (?, ?, ?, ?, ?, ?)')
		.run('image/webp', image.width, image.height, image.data, new Date().toISOString(), folderId);
	if (old) db.prepare('DELETE FROM images WHERE id = ?').run(old.id);
	db.exec('COMMIT');
	return { id: Number(lastInsertRowid), width: image.width, height: image.height };
}

export function removeFolderCover(folderId: Id): void {
	getDb().prepare('DELETE FROM images WHERE folder_id = ?').run(folderId);
}
