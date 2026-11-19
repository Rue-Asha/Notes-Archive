import type { FolderDeleteCounts, TreeSort } from './types.ts';

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
	loadFailed: "Couldn't load — try again",
	removeIcon: 'Remove icon',
	noResults: 'No results',
	seeAll: 'See all results',
	noMatch: (q: string) => `No notes match “${q}”`,
	// a delete confirmation: the title is the question, the message its consequence (signed hi-fi, gate 7)
	deleteAsk: (name: string) => `Delete “${name}”?`,
	cantUndo: "This can't be undone.",
	deleteFolder: (c: FolderDeleteCounts) =>
		c.folders + c.notes === 0
			? "This can't be undone."
			: `This deletes ${[c.folders && count(c.folders, 'folder'), c.notes && count(c.notes, 'note')].filter(Boolean).join(' and ')} inside it. This can't be undone.`,
	deleteNoteLabel: 'Delete note',
	deleteFolderLabel: 'Delete folder',
	folderCounts: (folders: number, notes: number) => `${count(folders, 'folder')} · ${count(notes, 'note')}`,
	noteCount: (n: number) => count(n, 'note'),
	folders: 'Folders',
	searchHint: 'Search notes',
	foldSidebar: 'Fold sidebar',
	unfoldSidebar: 'Unfold sidebar',
	expandAll: 'Expand all folders',
	collapseAll: 'Collapse all folders',
	sortMenu: 'Sort folders',
	sortLabel: { mixed: 'Default', name: 'Name', edited: 'Last edited', created: 'Created' } satisfies Record<TreeSort, string>,
	sortHint: {
		mixed: 'Folders A–Z, notes by last edit',
		name: 'Folders and notes A–Z',
		edited: 'Newest first',
		created: 'Newest first'
	} satisfies Record<TreeSort, string>,
	pinnedConflict: 'Pinned order changed elsewhere — reloaded',
	moveUp: 'Move up',
	moveDown: 'Move down',
	pathMore: (n: number) => `Show all ${n} parent folders`,
	backTo: (name: string) => `Back to ${name}`,
	collapse: (name: string) => `Collapse ${name}`,
	expand: (name: string) => `Expand ${name}`
} as const;
