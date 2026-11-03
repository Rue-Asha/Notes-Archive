import { COPY } from '#lib/copy.ts';
import { NotFoundError, ValidationError } from '#lib/errors.ts';
import type { Crumb, Folder, FolderDeleteCounts, FolderTile, Id, NoteRef, Tree, TreeFolder } from '#lib/types.ts';
import { getDb } from './db.ts';
import { handOverUploads } from './notes.ts';
import { pruneTags } from './tags.ts';

function cleanName(name: string | undefined): string {
	return name?.trim() || COPY.untitledFolder;
}

function isFolder(id: Id): boolean {
	return getDb().prepare('SELECT 1 FROM folders WHERE id = ?').get(id) !== undefined;
}

export function createFolder(input: { name?: string; parentId?: Id | null }): Id {
	const parentId = input.parentId ?? null;
	if (parentId !== null && !isFolder(parentId)) throw new NotFoundError('Folder');
	const now = new Date().toISOString();
	return Number(
		getDb()
			.prepare('INSERT INTO folders (parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
			.run(parentId, cleanName(input.name), now, now).lastInsertRowid
	);
}

export function renameFolder(id: Id, name: string): void {
	const { changes } = getDb()
		.prepare('UPDATE folders SET name = ?, updated_at = ? WHERE id = ?')
		.run(cleanName(name), new Date().toISOString(), id);
	if (!changes) throw new NotFoundError('Folder');
}

export function moveFolder(id: Id, parentId: Id | null): void {
	const db = getDb();
	if (!isFolder(id)) throw new NotFoundError('Folder');
	if (parentId !== null) {
		if (!isFolder(parentId)) throw new NotFoundError('Folder');
		const inside = db
			.prepare(
				`WITH RECURSIVE sub(id) AS (SELECT ? UNION ALL SELECT f.id FROM folders f JOIN sub ON f.parent_id = sub.id)
				SELECT 1 FROM sub WHERE id = ?`
			)
			.get(id, parentId);
		if (inside) throw new ValidationError("A folder can't move into itself");
	}
	db.prepare('UPDATE folders SET parent_id = ?, updated_at = ? WHERE id = ?').run(
		parentId,
		new Date().toISOString(),
		id
	);
}

export function deleteFolder(id: Id): { parentId: Id | null } {
	const db = getDb();
	const folder = getFolder(id);
	if (!folder) throw new NotFoundError('Folder');
	db.exec('BEGIN');
	handOverUploads(
		db
			.prepare(
				'WITH RECURSIVE tree(id) AS (SELECT ? UNION SELECT folders.id FROM folders JOIN tree ON folders.parent_id = tree.id) SELECT notes.id FROM notes JOIN tree ON notes.folder_id = tree.id'
			)
			.all(id)
			.map((r) => Number(r.id))
	);
	db.prepare('DELETE FROM folders WHERE id = ?').run(id);
	pruneTags();
	db.exec('COMMIT');
	return { parentId: folder.parentId };
}

export function getFolder(id: Id): Folder | null {
	const row = getDb()
		.prepare(
			`SELECT f.id, f.parent_id, f.name, f.created_at, f.updated_at,
				(SELECT i.id FROM images i WHERE i.folder_id = f.id) AS cover
			FROM folders f WHERE f.id = ?`
		)
		.get(id);
	if (!row) return null;
	return {
		id: Number(row.id),
		parentId: row.parent_id === null ? null : Number(row.parent_id),
		name: String(row.name),
		coverImageId: row.cover === null ? null : Number(row.cover),
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at)
	};
}

export function breadcrumb(id: Id): Crumb[] {
	return getDb()
		.prepare(
			`WITH RECURSIVE up(id, name, parent_id, depth) AS (
				SELECT id, name, parent_id, 0 FROM folders WHERE id = ?
				UNION ALL SELECT f.id, f.name, f.parent_id, up.depth + 1 FROM folders f JOIN up ON f.id = up.parent_id)
			SELECT id, name FROM up ORDER BY depth DESC`
		)
		.all(id)
		.map((r) => ({ id: Number(r.id), name: String(r.name) }));
}

export function folderCounts(id: Id): FolderDeleteCounts {
	const row = getDb()
		.prepare(
			`WITH RECURSIVE sub(id) AS (SELECT id FROM folders WHERE id = ? UNION ALL SELECT f.id FROM folders f JOIN sub ON f.parent_id = sub.id)
			SELECT (SELECT count(*) FROM sub) - 1 AS folders, (SELECT count(*) FROM notes WHERE folder_id IN sub) AS notes`
		)
		.get(id);
	return { folders: Math.max(Number(row?.folders), 0), notes: Number(row?.notes) };
}

const collator = new Intl.Collator('de', { numeric: true });

function byName(a: { name: string }, b: { name: string }): number {
	return collator.compare(a.name, b.name);
}

export function listFolderTiles(parentId: Id | null): FolderTile[] {
	return getDb()
		.prepare(
			`WITH RECURSIVE sub(root, id) AS (
				SELECT id, id FROM folders WHERE parent_id IS ?
				UNION ALL SELECT sub.root, f.id FROM folders f JOIN sub ON f.parent_id = sub.id)
			SELECT f.id, f.name, (SELECT i.id FROM images i WHERE i.folder_id = f.id) AS cover,
				(SELECT count(*) FROM notes n WHERE n.folder_id IN (SELECT id FROM sub WHERE root = f.id)) AS notes
			FROM folders f WHERE f.parent_id IS ?`
		)
		.all(parentId, parentId)
		.map((r) => ({
			id: Number(r.id),
			name: String(r.name),
			coverImageId: r.cover === null ? null : Number(r.cover),
			noteCount: Number(r.notes)
		}))
		.sort(byName);
}

export function getTree(): Tree {
	const db = getDb();
	const notes = new Map<Id | null, NoteRef[]>();
	for (const r of db.prepare('SELECT id, title, icon, folder_id FROM notes ORDER BY updated_at DESC, id DESC').all()) {
		const key = r.folder_id === null ? null : Number(r.folder_id);
		const list = notes.get(key) ?? [];
		list.push({ id: Number(r.id), title: String(r.title), icon: r.icon === null ? null : String(r.icon) });
		notes.set(key, list);
	}
	const nodes = new Map<Id, TreeFolder>();
	const rows = db.prepare('SELECT id, name, parent_id FROM folders').all();
	for (const r of rows) {
		const id = Number(r.id);
		nodes.set(id, {
			id,
			name: String(r.name),
			parentId: r.parent_id === null ? null : Number(r.parent_id),
			children: [],
			notes: notes.get(id) ?? []
		});
	}
	const folders: TreeFolder[] = [];
	for (const node of nodes.values()) (node.parentId === null ? folders : nodes.get(node.parentId)!.children).push(node);
	for (const node of nodes.values()) node.children.sort(byName);
	return { folders: folders.sort(byName), rootNotes: notes.get(null) ?? [] };
}
