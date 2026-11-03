import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { getNote } from '#lib/server/notes.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { POST as discard } from './[id]/discard/+server.ts';
import { DELETE, PATCH } from './[id]/+server.ts';
import { POST } from './+server.ts';

beforeEach(useTestDb);
afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const body = (method: string, data?: unknown): never =>
	({ request: new Request('http://localhost/api/notes', { method, body: JSON.stringify(data) }) }) as never;
const withId = (id: number | string, method: string, data?: unknown): never =>
	({ params: { id: String(id) }, ...(body(method, data) as object) }) as never;

describe('POST /api/notes', () => {
	it('creates a root note and answers 201 with the id', async () => {
		const res = await POST(body('POST', {}));
		expect(res.status).toBe(201);
		const { id } = await res.json();
		expect(getNote(id)).toMatchObject({ folderId: null, title: '' });
	});

	it('creates a note in a folder', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }] });
		const { id } = await (await POST(body('POST', { folderId: folders[0] }))).json();
		expect(getNote(id)?.folderId).toBe(folders[0]);
	});

	it('answers 400 for a folder that does not exist', async () => {
		expect((await POST(body('POST', { folderId: 99 }))).status).toBe(400);
	});
});

describe('PATCH /api/notes/[id]', () => {
	it('answers { updatedAt, tags } and stores the patch', async () => {
		const { notes } = seedArchive({ notes: [{ title: 'a', tags: ['x', 'y'] }] });
		const res = await PATCH(withId(notes[0], 'PATCH', { title: 'b' }));
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.updatedAt).toBe(getNote(notes[0])?.updatedAt);
		expect(json.tags.map((t: { name: string }) => t.name)).toEqual(['x', 'y']);
		expect(getNote(notes[0])?.title).toBe('b');
	});

	it('answers 404 { error: "deleted" } for a missing note', async () => {
		const res = await PATCH(withId(99, 'PATCH', { title: 'b' }));
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'deleted' });
	});

	it('answers 400 with a message for a ValidationError', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		const res = await PATCH(withId(notes[0], 'PATCH', { folderId: 99 }));
		expect(res.status).toBe(400);
		expect(typeof (await res.json()).error).toBe('string');
	});
});

describe('DELETE /api/notes/[id]', () => {
	it('answers { folderId } and removes the note', async () => {
		const { folders, notes } = seedArchive({ folders: [{ name: 'A' }], notes: [{ folder: 0 }] });
		const res = await DELETE(withId(notes[0], 'DELETE'));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ folderId: folders[0] });
		expect(getDb().prepare('SELECT count(*) AS n FROM notes').get()?.n).toBe(0);
	});

	it('answers 404 { error: "deleted" } the second time', async () => {
		const { notes } = seedArchive({ notes: [{}] });
		await DELETE(withId(notes[0], 'DELETE'));
		const res = await DELETE(withId(notes[0], 'DELETE'));
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({ error: 'deleted' });
	});
});

describe('POST /api/notes/[id]/discard', () => {
	it('answers { discarded } for an empty and a filled note', async () => {
		const { notes } = seedArchive({ notes: [{}, { title: 'keep' }] });
		expect(await (await discard(withId(notes[0], 'POST'))).json()).toEqual({ discarded: true });
		expect(await (await discard(withId(notes[1], 'POST'))).json()).toEqual({ discarded: false });
		expect(getNote(notes[1])).not.toBeNull();
	});
});
