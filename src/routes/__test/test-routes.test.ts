import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { useTestDb, type SeedInput, type SeedResult } from '#lib/server/testing.ts';
import { GET as counts } from './counts/+server.ts';
import { GET as storedNote } from './note/[id]/+server.ts';
import { POST as reset } from './reset/+server.ts';
import { POST as seed } from './seed/+server.ts';

const TABLES = ['files', 'folders', 'images', 'note_tags', 'notes', 'notes_fts', 'tags'];

function post(body: unknown): never {
	return {
		request: new Request('http://localhost/__test', { method: 'POST', body: JSON.stringify(body) })
	} as never;
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

async function seeded(input: SeedInput): Promise<SeedResult> {
	return (await seed(post(input))).json();
}

const FULL: SeedInput = {
	folders: [{ name: 'Trips', cover: true }, { name: 'Italy', parent: 0 }],
	notes: [
		{ title: 'Straße', body: 'one\ntwo', folder: 1, tags: ['Reise', 'Übung'], images: 1, files: 1 },
		{ title: 'Second', icon: '🌿', tags: ['übung'], pinnedAt: '2026-10-02T00:00:00.000Z' },
		{ title: 'Third', folder: 0 }
	]
};

beforeEach(() => {
	useTestDb();
	process.env.NOTES_ARCHIVE_TEST = '1';
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
	delete process.env.NOTES_ARCHIVE_TEST;
});

describe('test routes', () => {
	it('Scenario: Test routes answer 404 without the test flag', async () => {
		await seeded({ notes: [{ title: 'Keep' }] });
		delete process.env.NOTES_ARCHIVE_TEST;

		const later = (call: () => unknown) => Promise.resolve().then(call);
		await expect(later(() => reset(post({})))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => seed(post({ notes: [{ title: 'More' }] })))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => counts({} as never))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => storedNote({ params: { id: '1' } } as never))).rejects.toMatchObject({ status: 404 });

		expect(count('notes')).toBe(1);
	});

	it('reset deletes every row of every table, notes_fts included, and keeps the migration record', async () => {
		await seeded(FULL);
		for (const t of TABLES) expect(count(t), t).toBeGreaterThan(0);

		const res = await reset(post({}));

		expect(res.status).toBe(204);
		for (const t of TABLES) expect(count(t), t).toBe(0);
		expect(count('schema_migrations')).toBeGreaterThan(0);
	});

	it('seed returns folder and note ids in input order', async () => {
		const ids = await seeded(FULL);

		expect(ids.folders).toHaveLength(2);
		expect(ids.notes).toHaveLength(3);
		expect(getDb().prepare('SELECT parent_id FROM folders WHERE id = ?').get(ids.folders[1])?.parent_id).toBe(ids.folders[0]);
	});

	it('counts reports the rows of every table', async () => {
		await seeded(FULL);

		const res = await counts({} as never);

		expect(await res.json()).toEqual({
			files: 1,
			folders: 2,
			images: 2,
			note_tags: 3,
			notes: 3,
			notes_fts: 3,
			tags: 2
		});
	});

	it('note/[id] answers the stored note with its derived body text and tags', async () => {
		const ids = await seeded(FULL);

		const res = await storedNote({ params: { id: String(ids.notes[0]) } } as never);

		expect(await res.json()).toMatchObject({
			title: 'Straße',
			icon: null,
			bodyText: 'one\ntwo',
			folderId: ids.folders[1],
			pinnedAt: null,
			tags: ['Reise', 'Übung']
		});
	});

	it('note/[id] answers 404 for a missing note', () => {
		expect(() => storedNote({ params: { id: '999' } } as never)).toThrow(expect.objectContaining({ status: 404 }));
	});
});
