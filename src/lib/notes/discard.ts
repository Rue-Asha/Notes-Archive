import type { Id, JSONContent, Note } from '#lib/types.ts';

// mirrors isEmptyDoc on the server, which decides for itself before it deletes anything
const ATOMS = new Set(['image', 'fileCard', 'linkPreview', 'horizontalRule']);

export function isBlankDoc(doc: JSONContent): boolean {
	if ((doc.text ?? '').trim() || (doc.type && ATOMS.has(doc.type))) return false;
	return (doc.content ?? []).every(isBlankDoc);
}

export function isEmptyNote(note: Pick<Note, 'title' | 'icon' | 'tags' | 'pinned'>, content: JSONContent): boolean {
	return !note.title.trim() && !note.icon && !note.tags.length && !note.pinned && isBlankDoc(content);
}

const url = (id: Id) => `/api/notes/${id}/discard`;

export async function discardNote(id: Id): Promise<void> {
	await fetch(url(id), { method: 'POST' });
}

// a closing tab doesn't wait for fetch; a beacon without a body carries no form content type, so Kit's CSRF check lets it in
export function beaconDiscard(id: Id): void {
	navigator.sendBeacon(url(id));
}
