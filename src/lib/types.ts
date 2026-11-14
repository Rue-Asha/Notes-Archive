export type Id = number;
export type IsoDateTime = string;

export interface JSONContent {
	type?: string;
	attrs?: Record<string, unknown>;
	content?: JSONContent[];
	marks?: { type: string; attrs?: Record<string, unknown> }[];
	text?: string;
}

export type TextColor = 'stone' | 'clay' | 'ochre' | 'moss' | 'sea' | 'plum';

export const TREE_SORTS = ['mixed', 'name', 'edited', 'created'] as const;
export type TreeSort = (typeof TREE_SORTS)[number];

export function isTreeSort(value: unknown): value is TreeSort {
	return TREE_SORTS.includes(value as TreeSort);
}

export interface Settings {
	treeSort: TreeSort;
}

export interface TagRef {
	id: Id;
	name: string;
}

export interface TagCount extends TagRef {
	count: number;
}

export interface Note {
	id: Id;
	folderId: Id | null;
	title: string;
	icon: string | null;
	content: JSONContent;
	tags: TagRef[];
	pinned: boolean;
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}

export interface NoteRef {
	id: Id;
	title: string;
	icon: string | null;
}

export interface NoteCard extends NoteRef {
	folderId: Id | null;
	snippet: string;
	tags: TagRef[];
	pinned: boolean;
	updatedAt: IsoDateTime;
}

// tags = the full list in chip order
export interface NotePatch {
	title?: string;
	icon?: string | null;
	content?: JSONContent;
	folderId?: Id | null;
	tags?: string[];
	pinned?: boolean;
}

export interface Folder {
	id: Id;
	parentId: Id | null;
	name: string;
	coverImageId: Id | null;
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}

export interface FolderTile {
	id: Id;
	name: string;
	coverImageId: Id | null;
	noteCount: number;
}

export interface TreeFolder {
	id: Id;
	name: string;
	parentId: Id | null;
	children: TreeFolder[];
	notes: NoteRef[];
}

// folders and notes sorted by name / last edited
export interface Tree {
	folders: TreeFolder[];
	rootNotes: NoteRef[];
}

// descendants (not the folder itself), all notes inside
export interface FolderDeleteCounts {
	folders: number;
	notes: number;
}

export interface Crumb {
	id: Id;
	name: string;
}

export interface SnippetPart {
	text: string;
	hit: boolean;
}

export interface SearchHit {
	note: NoteCard;
	parts: SnippetPart[];
}

export interface SearchQuery {
	q: string;
	folderId?: Id | null;
	tagId?: Id | null;
	limit?: number;
}

export interface UploadedImage {
	id: Id;
	width: number;
	height: number;
}

export interface UploadedFile {
	id: Id;
	name: string;
	size: number;
	mime: string;
}

export interface LinkPreview {
	url: string;
	domain: string;
	title: string | null;
	description: string | null;
	siteName: string | null;
	imageId: Id | null;
}

export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'deleted';
