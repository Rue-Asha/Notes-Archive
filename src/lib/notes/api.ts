import type { Id, NotePatch } from '#lib/types.ts';

const JSON_HEADERS = { 'content-type': 'application/json' };

export { newNote } from '#lib/shell/capture.ts';

export async function newFolder(parentId: Id | null = null): Promise<Id> {
	const res = await fetch('/api/folders', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ parentId }) });
	return ((await res.json()) as { id: Id }).id;
}

export function patchNote(id: Id, patch: NotePatch): Promise<Response> {
	return fetch(`/api/notes/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(patch) });
}

export async function deleteNoteRequest(id: Id): Promise<void> {
	await fetch(`/api/notes/${id}`, { method: 'DELETE' });
}
