import { invalidateAll } from '$app/navigation';
import { newFolder } from '#lib/notes/api.ts';
import type { Id } from '#lib/types.ts';

export async function createFolder(parentId: Id | null): Promise<Id> {
	const id = await newFolder(parentId);
	await invalidateAll();
	return id;
}

export async function renameFolder(id: Id, name: string): Promise<void> {
	await fetch(`/api/folders/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
	await invalidateAll();
}
