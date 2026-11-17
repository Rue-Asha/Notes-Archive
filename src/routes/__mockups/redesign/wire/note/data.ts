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

export const TWELVE_LINES = Array.from({ length: 12 }, (_, i) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Packing', 'Trains', 'Hotel', 'Budget', 'Backup'][i]).join('\n');

const LONG_200 = 'Quarterly planning notes for the long-running archive migration, including every open question about folders, tags, pinned order, sorting, search ranking, link previews and attachments';

export function noteView(data: MockData): NoteView {
	const p = data.note.properties;
	// worst case: all 40 tags, not the fixture's 14
	return { title: data.note.title, icon: data.note.icon, path: data.note.folderPath, created: p.created, updated: p.updated, tags: data.worst ? data.tags.map((t) => t.name) : p.tags, pinned: p.pinned };
}

export const LONG_TITLE = LONG_200;
