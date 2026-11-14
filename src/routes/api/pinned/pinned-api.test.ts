import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { listPinned, updateNote } from '#lib/server/notes.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { PUT } from './+server.ts';

beforeEach(useTestDb);
afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const put = (data: unknown): never =>
	({ request: new Request('http://localhost/api/pinned', { method: 'PUT', body: JSON.stringify(data) }) }) as never;

const setup = () => {
	const { notes } = seedArchive({ notes: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] });
	for (const id of notes.slice(0, 3)) updateNote(id, { pinned: true });
	return notes;
};

describe('PUT /api/pinned', () => {
	it('stores the order and answers 200 with the ids', async () => {
		const [a, b, c] = setup();
		const res = await PUT(put({ ids: [a, c, b] }));
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ids: [a, c, b] });
		expect(listPinned().map((n) => n.id)).toEqual([a, c, b]);
	});

	it('Scenario: A stale reorder is refused with 409 and changes nothing', async () => {
		const [a, b, c, d] = setup();
		const before = listPinned().map((n) => n.id);
		for (const ids of [[a, b], [a, b, c, d], [a, a, b]]) {
			const res = await PUT(put({ ids }));
			expect(res.status).toBe(409);
			expect(await res.json()).toEqual({ error: 'stale' });
		}
		expect(listPinned().map((n) => n.id)).toEqual(before);
	});

	it('answers 400 for a malformed body', async () => {
		setup();
		for (const data of [{}, { ids: 'x' }, { ids: [1, 'a'] }, { ids: [1.5] }, null]) {
			expect((await PUT(put(data))).status).toBe(400);
		}
	});
});
