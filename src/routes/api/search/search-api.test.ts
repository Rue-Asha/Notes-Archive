import { isHttpError } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { GET } from './+server.ts';

beforeEach(useTestDb);
afterEach(closeDb);

const call = (query: string) => GET({ url: new URL(`http://localhost/api/search${query}`) } as never);

describe('search api', () => {
	it('answers hits for a query and no recent notes', async () => {
		const { notes } = seedArchive({ notes: [{ title: 'Kyoto' }, { title: 'Suppe' }] });
		const body = await (await call('?q=kyoto')).json();
		expect(body.hits.map((h: { note: { id: number } }) => h.note.id)).toEqual([notes[0]]);
		expect(body.recent).toEqual([]);
	});

	it('answers the eight most recent notes when q and filters are empty', async () => {
		seedArchive({ notes: Array.from({ length: 10 }, (_, i) => ({ title: `N${i}`, updatedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` })) });
		const body = await (await call('?q=%20')).json();
		expect(body.hits).toEqual([]);
		expect(body.recent.map((n: { title: string }) => n.title)).toEqual(['N9', 'N8', 'N7', 'N6', 'N5', 'N4', 'N3', 'N2']);
	});

	it('filters by folder subtree and tag without a query', async () => {
		const { folders, notes } = seedArchive({
			folders: [{ name: 'A' }, { name: 'B', parent: 0 }],
			notes: [{ title: 'x', folder: 1, tags: ['T'] }, { title: 'y', folder: 0 }, { title: 'z' }]
		});
		const body = await (await call(`?folder=${folders[0]}`)).json();
		expect(body.hits.map((h: { note: { id: number } }) => h.note.id).sort()).toEqual([notes[0], notes[1]].sort());
		expect(body.recent).toEqual([]);
		const tagged = await (await call(`?folder=${folders[0]}&tag=1`)).json();
		expect(tagged.hits.map((h: { note: { id: number } }) => h.note.id)).toEqual([notes[0]]);
	});

	it('rejects a non-numeric filter or limit with 400', async () => {
		for (const q of ['?folder=x', '?tag=1.5', '?limit=0']) {
			try {
				await call(q);
				expect.unreachable();
			} catch (e) {
				expect(isHttpError(e) && e.status).toBe(400);
			}
		}
	});
});
