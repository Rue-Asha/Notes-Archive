import type { FolderDeleteCounts } from './types.ts';

export function count(n: number, word: string): string {
	return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export const COPY = {
	untitled: 'Untitled',
	untitledFolder: 'Untitled folder',
	emptyNote: 'Empty note',
	newNote: 'New note',
	newFolder: 'New folder',
	noFolders: 'No folders yet',
	emptyFolder: 'Nothing here yet',
	welcome: 'Write your first note',
	saving: 'Saving…',
	saved: 'Saved',
	saveFailed: "Couldn't save — try again",
	noteDeleted: 'This note was deleted',
	imageTooLarge: 'That image is too large',
	notAnImage: "That file isn't an image",
	fileTooLarge: 'Files can be up to 16 MB',
	uploadFailed: "Couldn't upload — try again",
	noResults: 'No results',
	seeAll: 'See all results',
	noMatch: (q: string) => `No notes match “${q}”`,
	deleteNote: (title: string) => `Delete “${title}”? This can't be undone.`,
	deleteFolder: (name: string, c: FolderDeleteCounts) =>
		c.folders + c.notes === 0
			? `Delete “${name}”? This can't be undone.`
			: `Delete “${name}”? This deletes ${count(c.folders, 'folder')} and ${count(c.notes, 'note')} inside it. This can't be undone.`,
	folderCounts: (folders: number, notes: number) => `${count(folders, 'folder')} · ${count(notes, 'note')}`,
	noteCount: (n: number) => count(n, 'note')
} as const;
