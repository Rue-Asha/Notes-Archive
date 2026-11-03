import sharp from 'sharp';
import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '#lib/server/db.ts';
import { getFile as readFile, storeFile } from '#lib/server/files.ts';
import { storeImage } from '#lib/server/images.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { DELETE as deleteCover, PUT as putCover } from './api/folders/[id]/cover/+server.ts';
import { POST as postFile } from './api/notes/[id]/files/+server.ts';
import { POST as postImage } from './api/notes/[id]/images/+server.ts';
import { GET as getFile } from './files/[id]/+server.ts';
import { GET as getImage } from './images/[id]/+server.ts';

beforeEach(useTestDb);

async function call(handler: (e: never) => Response | Promise<Response>, id: string, query = ''): Promise<Response> {
	try {
		return await handler({ params: { id }, url: new URL(`http://localhost/x/${id}${query}`) } as never);
	} catch (e) {
		return new Response(null, { status: (e as { status: number }).status });
	}
}

describe('GET /images/[id]', () => {
	it('Scenario: Image is served with caching headers', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const { id } = await storeImage(
			await sharp({ create: { width: 32, height: 24, channels: 3, background: '#c05030' } }).png().toBuffer(),
			{ noteId: notes[0] }
		);

		const res = await call(getImage, String(id));

		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toBe('image/webp');
		expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
		expect((await sharp(Buffer.from(await res.arrayBuffer())).metadata()).format).toBe('webp');
		expect((await call(getImage, String(id + 1))).status).toBe(404);
		expect((await call(getImage, 'abc')).status).toBe(404);
	});
});

describe('GET /files/[id]', () => {
	const put = (name: string, mime: string, text = 'hello') => {
		const { notes } = seedArchive({ notes: [{}] });
		return String(storeFile(notes[0], { name, mime, bytes: new TextEncoder().encode(text) }).id);
	};

	it('Scenario: Files are served safely with a download fallback', async () => {
		const pdf = await call(getFile, put('Mietvertrag Köln.pdf', 'application/pdf'));
		const html = await call(getFile, put('seite.html', 'text/html', '<script>alert(1)</script>'));
		const forced = await call(getFile, put('a.pdf', 'application/pdf'), '?download=1');

		expect(pdf.status).toBe(200);
		expect(pdf.headers.get('content-type')).toBe('application/pdf');
		expect(pdf.headers.get('content-disposition')).toMatch(/^inline;/);
		expect(html.headers.get('content-disposition')).toMatch(/^attachment;/);
		expect(forced.headers.get('content-disposition')).toMatch(/^attachment;/);
		for (const res of [pdf, html, forced]) {
			expect(res.headers.get('x-content-type-options')).toBe('nosniff');
			expect(res.headers.get('content-security-policy')).toBe('sandbox');
		}
		expect(pdf.headers.get('content-disposition')).toContain("filename*=UTF-8''Mietvertrag%20K%C3%B6ln.pdf");
		expect(await html.text()).toBe('<script>alert(1)</script>');
		expect((await call(getFile, '999')).status).toBe(404);
		expect((await call(getFile, 'abc')).status).toBe(404);
	});

	it('escapes quotes in the plain filename and encodes quote-like characters in filename*', async () => {
		const res = await call(getFile, put('a"b\'c(1).txt', 'text/plain'));
		const header = res.headers.get('content-disposition')!;
		expect(header).toContain("filename*=UTF-8''a%22b%27c%281%29.txt");
		expect(header).toContain("filename=\"a_b'c(1).txt\"");
	});
});

const count = (table: 'images' | 'files') => Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()!.n);

async function upload(handler: (e: never) => Response | Promise<Response>, id: number, body: BodyInit, headers: Record<string, string> = {}) {
	try {
		return await handler({ params: { id: String(id) }, request: new Request('http://localhost/up', { method: 'POST', body, headers }) } as never);
	} catch (e) {
		return new Response(null, { status: (e as { status: number }).status });
	}
}

describe('POST /api/notes/[id]/images', () => {
	it('Scenario: Server refuses oversized and non-image uploads', async () => {
		const { notes } = seedArchive({ notes: [{}] });

		const big = await upload(postImage, notes[0], new Uint8Array(17 * 1024 * 1024), { 'content-type': 'image/png' });
		const pdf = await upload(postImage, notes[0], new TextEncoder().encode('%PDF-1.4'), { 'content-type': 'application/pdf' });

		expect(big.status).toBe(413);
		expect(await big.json()).toEqual({ error: 'too-large' });
		expect(pdf.status).toBe(415);
		expect(await pdf.json()).toEqual({ error: 'not-image' });
		expect(count('images')).toBe(0);
	});

	it('answers 201 with the stored image and 404 for a missing note', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const png = await sharp({ create: { width: 30, height: 20, channels: 3, background: '#103050' } }).png().toBuffer();

		const res = await upload(postImage, notes[0], png, { 'content-type': 'image/png' });

		expect(res.status).toBe(201);
		expect(await res.json()).toMatchObject({ width: 30, height: 20 });
		expect((await upload(postImage, 999, png)).status).toBe(404);
	});
});

describe('POST /api/notes/[id]/files', () => {
	it('Scenario: Server stores files as-is with their names', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const name = encodeURIComponent('Übung 1 (final).txt');

		const empty = await upload(postFile, notes[0], new Uint8Array(), { 'x-filename': encodeURIComponent('leer.txt'), 'content-type': 'text/plain' });
		const kb = await upload(postFile, notes[0], new Uint8Array(1024).fill(7), { 'x-filename': name, 'content-type': 'text/plain' });
		const big = await upload(postFile, notes[0], new Uint8Array(17 * 1024 * 1024), { 'x-filename': 'big.bin' });

		expect(empty.status).toBe(201);
		expect(await empty.json()).toMatchObject({ name: 'leer.txt', size: 0 });
		const stored = await kb.json();
		expect(kb.status).toBe(201);
		expect(stored).toMatchObject({ name: 'Übung 1 (final).txt', size: 1024, mime: 'text/plain' });
		expect(readFile(stored.id)!.bytes).toEqual(new Uint8Array(1024).fill(7));
		expect(big.status).toBe(413);
		expect(await big.json()).toEqual({ error: 'file-too-large' });
		expect(count('files')).toBe(2);
	});

	it('answers 400 for a filename that is not valid percent-encoding', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		expect((await upload(postFile, notes[0], new Uint8Array(3), { 'x-filename': '50%.txt' })).status).toBe(400);
		expect(count('files')).toBe(0);
	});

	it('defaults the type and answers 404 for a missing note', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const res = await upload(postFile, notes[0], new Uint8Array(3), { 'x-filename': 'x' });
		expect(await res.json()).toMatchObject({ mime: 'application/octet-stream' });
		expect((await upload(postFile, 999, new Uint8Array(3), { 'x-filename': 'x' })).status).toBe(404);
	});
});

describe('folder cover routes', () => {
	it('PUT replaces the cover, refuses bad files and DELETE removes it', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'Reisen' }] });
		const png = await sharp({ create: { width: 30, height: 20, channels: 3, background: '#103050' } }).png().toBuffer();

		expect((await upload(putCover, folders[0], png)).status).toBe(200);
		expect((await upload(putCover, folders[0], new TextEncoder().encode('%PDF'))).status).toBe(415);
		expect((await upload(putCover, folders[0], new Uint8Array(17 * 1024 * 1024))).status).toBe(413);
		expect((await upload(putCover, 999, png)).status).toBe(404);
		expect(count('images')).toBe(1);

		expect((await deleteCover({ params: { id: String(folders[0]) } } as never)).status).toBe(204);
		expect(count('images')).toBe(0);
		expect(() => deleteCover({ params: { id: '999' } } as never)).toThrowError(expect.objectContaining({ status: 404 }));
	});
});
