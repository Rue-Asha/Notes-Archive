import { isHttpError } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { getTreeSort, setTreeSort } from '#lib/server/settings.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { load as layoutLoad } from '../../(app)/+layout.server.ts';
import { GET, PATCH } from './+server.ts';

beforeEach(useTestDb);
afterEach(closeDb);

const patch = (data: unknown) => ({ request: new Request('http://localhost/api/settings', { method: 'PATCH', body: JSON.stringify(data) }) });

async function status(call: () => Promise<Response> | Response): Promise<number> {
	try {
		return (await call()).status;
	} catch (e) {
		if (isHttpError(e)) return e.status;
		throw e;
	}
}

describe('settings api', () => {
	it('GET answers the stored sort, mixed by default', async () => {
		expect(await (await GET({} as never)).json()).toEqual({ treeSort: 'mixed' });
		setTreeSort('created');
		expect(await (await GET({} as never)).json()).toEqual({ treeSort: 'created' });
	});

	it('PATCH stores a valid mode and answers it', async () => {
		const res = await PATCH(patch({ treeSort: 'edited' }) as never);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ treeSort: 'edited' });
		expect(getTreeSort()).toBe('edited');
	});

	it('Scenario: An unknown mode is refused', async () => {
		setTreeSort('name');
		expect(await status(() => PATCH(patch({ treeSort: 'random' }) as never))).toBe(400);
		expect(await status(() => PATCH(patch({}) as never))).toBe(400);
		expect(getTreeSort()).toBe('name');
	});

	it('answers 400 for a null or non-JSON body', async () => {
		const raw = (body: string) => ({ request: new Request('http://localhost/api/settings', { method: 'PATCH', body }) });
		expect(await status(() => PATCH(raw('null') as never))).toBe(400);
		expect(await status(() => PATCH(raw('not json') as never))).toBe(400);
	});

	it('Scenario: First render uses the stored sort', () => {
		seedArchive({
			folders: [{ name: 'Alpha' }, { name: 'Zeta' }],
			notes: [
				{ title: 'old', folder: 0, updatedAt: '2026-10-01T00:00:00.000Z' },
				{ title: 'new', folder: 1, updatedAt: '2026-10-03T00:00:00.000Z' },
				{ title: 'mid', updatedAt: '2026-10-02T00:00:00.000Z' },
				{ title: 'aaa', updatedAt: '2026-10-01T12:00:00.000Z' }
			]
		});
		setTreeSort('edited');
		const data = layoutLoad({ depends: () => {} } as never) as { tree: { folders: { name: string }[]; rootNotes: { title: string }[] } };
		expect(data.tree.folders.map((f) => f.name)).toEqual(['Zeta', 'Alpha']);
		expect(data.tree.rootNotes.map((n) => n.title)).toEqual(['mid', 'aaa']);
	});
});
