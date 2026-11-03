import { isHttpError } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { getFolder } from '#lib/server/folders.ts';
import { seedArchive, useTestDb } from '#lib/server/testing.ts';
import { POST } from './+server.ts';
import { DELETE, GET, PATCH } from './[id]/+server.ts';

beforeEach(useTestDb);
afterEach(closeDb);

const body = (data: unknown) => ({ request: new Request('http://localhost/api/folders', { method: 'POST', body: JSON.stringify(data) }) });
const withId = (id: number, data?: unknown) => ({ params: { id: String(id) }, ...body(data) });

async function status(call: () => Promise<Response> | Response): Promise<number> {
	try {
		return (await call()).status;
	} catch (e) {
		if (isHttpError(e)) return e.status;
		throw e;
	}
}

describe('folders api', () => {
	it('POST creates a folder and answers 201 with its id', async () => {
		const res = await POST(body({ name: 'Reisen' }) as never);
		expect(res.status).toBe(201);
		const { id } = await res.json();
		expect(getFolder(id)).toMatchObject({ name: 'Reisen', parentId: null });
		const child = await (await POST(body({ parentId: id }) as never)).json();
		expect(getFolder(child.id)).toMatchObject({ name: 'Untitled folder', parentId: id });
		expect(await status(() => POST(body({ parentId: 'x' }) as never))).toBe(400);
		expect(await status(() => POST(body({ parentId: 999 }) as never))).toBe(404);
	});

	it('GET answers the folder and its delete counts, 404 when missing', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }, { name: 'B', parent: 0 }], notes: [{ folder: 1 }] });
		expect(await (await GET(withId(folders[0]) as never)).json()).toMatchObject({
			folder: { id: folders[0], name: 'A' },
			counts: { folders: 1, notes: 1 }
		});
		expect(await status(() => GET(withId(999) as never))).toBe(404);
	});

	it('PATCH renames and moves', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }, { name: 'B' }] });
		await PATCH(withId(folders[1], { name: 'Archiv 2026', parentId: folders[0] }) as never);
		expect(getFolder(folders[1])).toMatchObject({ name: 'Archiv 2026', parentId: folders[0] });
		await PATCH(withId(folders[1], { parentId: null }) as never);
		expect(getFolder(folders[1])?.parentId).toBeNull();
	});

	it('PATCH answers 400 for a move into itself or a descendant and leaves the tree unchanged', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }, { name: 'B', parent: 0 }, { name: 'C', parent: 1 }] });
		expect(await status(() => PATCH(withId(folders[0], { parentId: folders[0] }) as never))).toBe(400);
		expect(await status(() => PATCH(withId(folders[0], { parentId: folders[2] }) as never))).toBe(400);
		expect(getFolder(folders[0])?.parentId).toBeNull();
		expect(await status(() => PATCH(withId(999, { name: 'x' }) as never))).toBe(404);
	});

	it('PATCH with a rename and an invalid move changes nothing', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }] });
		expect(await status(() => PATCH(withId(folders[0], { name: 'X', parentId: folders[0] }) as never))).toBe(400);
		expect(getFolder(folders[0])?.name).toBe('A');
	});

	it('DELETE removes the folder and answers its parent', async () => {
		const { folders } = seedArchive({ folders: [{ name: 'A' }, { name: 'B', parent: 0 }] });
		expect(await (await DELETE(withId(folders[1]) as never)).json()).toEqual({ parentId: folders[0] });
		expect(getFolder(folders[1])).toBeNull();
		expect(await status(() => DELETE(withId(folders[1]) as never))).toBe(404);
	});
});
