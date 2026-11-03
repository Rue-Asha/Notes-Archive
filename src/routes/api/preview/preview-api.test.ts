import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { POST } from './+server.ts';

beforeEach(() => {
	useTestDb();
	process.env.NOTES_ARCHIVE_TEST = '1';
});
afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
	delete process.env.NOTES_ARCHIVE_TEST;
});

const post = (data: unknown): never =>
	({ request: new Request('http://localhost/api/preview', { method: 'POST', body: JSON.stringify(data) }) }) as never;

describe('POST /api/preview', () => {
	it('answers the preview for a URL', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const res = await POST(post({ url: 'https://garden.example/', noteId: notes[0] }));
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({ domain: 'garden.example', title: 'Garden Notes', siteName: 'Garden' });
	});

	it('answers domain and URL only for a private address', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const res = await POST(post({ url: 'http://192.168.1.10/admin', noteId: notes[0] }));
		expect(await res.json()).toEqual({
			url: 'http://192.168.1.10/admin',
			domain: '192.168.1.10',
			title: null,
			description: null,
			siteName: null,
			imageId: null
		});
	});

	it('answers 400 { error: "invalid-url" } for a URL that is not http or https', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const res = await POST(post({ url: 'htp:/kaputt', noteId: notes[0] }));
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({ error: 'invalid-url' });
	});

	it('answers 400 for a malformed body and 404 for a missing note', async () => {
		await expect(POST(post({ url: 'https://garden.example/' }))).rejects.toMatchObject({ status: 400 });
		await expect(POST(post({ url: 'https://garden.example/', noteId: 99 }))).rejects.toMatchObject({ status: 404 });
	});
});
