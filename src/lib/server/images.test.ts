import sharp from 'sharp';
import { beforeEach, describe, expect, it } from 'vitest';
import { UploadError } from '#lib/errors.ts';
import { getDb } from './db.ts';
import { getImage, removeFolderCover, setFolderCover, storeImage } from './images.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);

const make = (width: number, height: number, format: 'png' | 'jpeg' = 'png') =>
	sharp({ create: { width, height, channels: 3, background: '#c05030' } })[format]().toBuffer();

const rows = (where: string, id: number) =>
	getDb().prepare(`SELECT mime, width, height, note_id, folder_id FROM images WHERE ${where} = ?`).all(id);

describe('storeImage', () => {
	it('Scenario: Uploaded image is stored as WebP', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const sources = [await make(40, 30), await make(40, 30, 'jpeg'), await make(3000, 1000)];

		const stored = [];
		for (const bytes of sources) stored.push(await storeImage(bytes, { noteId: notes[0] }));

		expect(rows('note_id', notes[0])).toHaveLength(3);
		for (const row of rows('note_id', notes[0])) {
			expect(row).toMatchObject({ mime: 'image/webp', note_id: notes[0], folder_id: null });
			expect(Math.max(Number(row.width), Number(row.height))).toBeLessThanOrEqual(2400);
		}
		expect(stored[2]).toMatchObject({ width: 2400, height: 800 });
		const image = getImage(stored[0].id)!;
		expect(image.mime).toBe('image/webp');
		expect((await sharp(image.bytes).metadata()).format).toBe('webp');
	});

	it('honours maxSide', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		expect(await storeImage(await make(300, 100), { noteId: notes[0] }, 100)).toMatchObject({ width: 100, height: 33 });
	});

	it('refuses non-images, HEIC included, and oversized input', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const heic = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypheic'), Buffer.alloc(32)]);
		for (const bytes of [Buffer.from('%PDF-1.4 hello'), heic, Buffer.alloc(0)]) {
			await expect(storeImage(bytes, { noteId: notes[0] })).rejects.toMatchObject({ code: 'not-image' });
		}
		await expect(storeImage(new Uint8Array(16 * 1024 * 1024 + 1), { noteId: notes[0] })).rejects.toBeInstanceOf(UploadError);
		expect(rows('note_id', notes[0])).toHaveLength(0);
	});

	it('getImage answers null for a missing id', () => {
		expect(getImage(999)).toBeNull();
	});
});

describe('folder covers', () => {
	it('Scenario: Server replaces covers and stores them as WebP', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'Reisen' }] });
		const first = await setFolderCover(folders[0], await make(60, 40, 'jpeg'));
		expect(rows('folder_id', folders[0])).toEqual([
			expect.objectContaining({ mime: 'image/webp', note_id: null, width: 60, height: 40 })
		]);
		const second = await setFolderCover(folders[0], await make(80, 20));
		expect(second.id).not.toBe(first.id);
		expect(rows('folder_id', folders[0])).toEqual([expect.objectContaining({ mime: 'image/webp', width: 80 })]);
		expect(getImage(first.id)).toBeNull();
		removeFolderCover(folders[0]);
		expect(rows('folder_id', folders[0])).toHaveLength(0);
	});

	it('keeps the old cover when the new file is refused', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'Reisen' }] });
		const first = await setFolderCover(folders[0], await make(60, 40));
		await expect(setFolderCover(folders[0], Buffer.from('%PDF'))).rejects.toMatchObject({ code: 'not-image' });
		expect(getImage(first.id)).not.toBeNull();
	});
});

describe('image ids', () => {
	it("Scenario: A removed image's id is never reused", async () => {
		const { folders, notes } = seedArchive({ folders: [{ name: 'Reisen' }], notes: [{}] });
		const cover = await setFolderCover(folders[0], await make(60, 40));
		removeFolderCover(folders[0]);

		const next = await setFolderCover(folders[0], await make(80, 20));

		expect(next.id).not.toBe(cover.id);
		const inline = await storeImage(await make(10, 10), { noteId: notes[0] });
		getDb().prepare('DELETE FROM images WHERE id = ?').run(inline.id);
		expect((await storeImage(await make(10, 10), { noteId: notes[0] })).id).not.toBe(inline.id);
	});
});
