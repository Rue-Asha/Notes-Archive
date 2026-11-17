import type { MockData } from '../../fixtures.ts';

export type Status = 'saving' | 'saved' | 'error' | 'deleted';

export interface NoteView {
	title: string;
	icon: string | null;
	path: string[];
	created: string;
	updated: string;
	tags: string[];
	pinned: boolean;
}

export const TWELVE_LINES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Packing', 'Trains', 'Hotel', 'Budget', 'Backup'].join('\n');

export const LONG_TAG = 'regional-reference-notes-for-the-long-running-archive-migration-and-everything-around-it';

export const LONG_TITLE =
	'Quarterly planning notes for the long-running archive migration, including every open question about folders, tags, pinned order, sorting, search ranking, link previews and attachments';

export function noteView(data: MockData): NoteView {
	const p = data.note.properties;
	return { title: data.note.title, icon: data.note.icon, path: data.note.folderPath, created: p.created, updated: p.updated, tags: data.worst ? data.tags.map((t) => t.name) : p.tags, pinned: p.pinned };
}
