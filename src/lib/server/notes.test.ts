import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { docFromText } from '#lib/editor/doc.ts';
import { NotFoundError, ValidationError } from '#lib/errors.ts';
import type { JSONContent } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { init } from '../../hooks.server.ts';
import {
	createNote,
	deleteNote,
	discardIfEmpty,
	getNote,
	listNotes,
	purgeOrphans,
	updateNote,
	UPLOAD_GRACE_MS
} from './notes.ts';
import { plainText } from './plaintext.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const ids = (table: 'images' | 'files', noteId: number) =>
	getDb()
		.prepare(`SELECT id FROM ${table} WHERE note_id = ? ORDER BY id`)
		.all(noteId)
		.map((r) => Number(r.id));

const marked = (table: 'images' | 'files', id: number) =>
	getDb().prepare(`SELECT orphaned_at FROM ${table} WHERE id = ?`).get(id)?.orphaned_at ?? null;

const exists = (table: 'images' | 'files', id: number) =>
	getDb().prepare(`SELECT 1 FROM ${table} WHERE id = ?`).get(id) !== undefined;

const afterGrace = () => Date.now() + UPLOAD_GRACE_MS + 1000;

const count = (table: string) => Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);

const image = (id: number | null): JSONContent => ({
	type: 'image',
	attrs: { id }
});
const doc = (...content: JSONContent[]): JSONContent => ({
	type: 'doc',
	content
});
const para = (text: string): JSONContent => ({
	type: 'paragraph',
	content: [{ type: 'text', text }]
});

describe('createNote and getNote', () => {
	it('Scenario: Server creates notes at the root or in a folder', () => {
		const { folders } = seedArchive({ folders: [{ name: 'Küche' }] });
		const a = createNote({});
		const b = createNote({ folderId: folders[0] });
		expect(getNote(a)).toMatchObject({
			folderId: null,
			title: '',
			icon: null,
			pinned: false,
			tags: []
		});
		expect(getNote(b)?.folderId).toBe(folders[0]);
		expect(getNote(a)?.content).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph' }]
		});
		expect(getNote(b)?.content).toEqual({
			type: 'doc',
			content: [{ type: 'paragraph' }]
		});
	});

	it('returns null for a missing note and refuses a missing folder', () => {
		expect(getNote(99)).toBeNull();
		expect(() => createNote({ folderId: 99 })).toThrow(ValidationError);
	});

	it('returns tags in chip order', () => {
		const { notes } = seedArchive({ notes: [{ tags: ['Zebra', 'Apfel'] }] });
		expect(getNote(notes[0])?.tags.map((t) => t.name)).toEqual(['Zebra', 'Apfel']);
	});
});

describe('updateNote', () => {
	it('Scenario: Server update derives the body text and bumps the edit time', async () => {
		const id = createNote({});
		const before = getNote(id)!.updatedAt;
		await new Promise((r) => setTimeout(r, 3));
		const content = doc(para('Hallo Welt'), para('zweite Zeile'));
		const { updatedAt } = updateNote(id, { title: 'Garten', content });
		const row = getDb().prepare('SELECT body_text FROM notes WHERE id = ?').get(id);
		expect(row?.body_text).toBe(plainText(content));
		expect(updatedAt > before).toBe(true);
		expect(getNote(id)?.updatedAt).toBe(updatedAt);

		const pinned = updateNote(id, { pinned: true });
		expect(pinned.updatedAt).toBe(updatedAt);
		expect(getNote(id)).toMatchObject({ pinned: true, updatedAt });
	});

	it('indexes the new title and body', () => {
		const id = createNote({});
		updateNote(id, { title: 'Straße', content: doc(para('Gießkanne')) });
		const row = getDb().prepare('SELECT title, body FROM notes_fts WHERE rowid = ?').get(id);
		expect(row).toMatchObject({ title: 'Strasse' });
		expect(String(row?.body)).toContain('Giesskanne');
	});

	it('keeps the original pin time when pinning again and clears it on unpin', () => {
		const id = createNote({});
		updateNote(id, { pinned: true });
		const first = getDb().prepare('SELECT pinned_at FROM notes WHERE id = ?').get(id)?.pinned_at;
		updateNote(id, { pinned: true });
		expect(getDb().prepare('SELECT pinned_at FROM notes WHERE id = ?').get(id)?.pinned_at).toBe(first);
		updateNote(id, { pinned: false });
		expect(getNote(id)?.pinned).toBe(false);
	});

	it('sets and clears the icon', () => {
		const id = createNote({});
		updateNote(id, { icon: '🌿' });
		expect(getNote(id)?.icon).toBe('🌿');
		updateNote(id, { icon: null });
		expect(getNote(id)?.icon).toBeNull();
	});

	it('Scenario: Note content round-trips as ProseMirror JSON', () => {
		const content: JSONContent = doc(
			{
				type: 'heading',
				attrs: { level: 2 },
				content: [{ type: 'text', text: 'Titel' }]
			},
			{
				type: 'bulletList',
				content: [
					{
						type: 'listItem',
						content: [
							para('eins'),
							{
								type: 'bulletList',
								content: [{ type: 'listItem', content: [para('innen')] }]
							}
						]
					}
				]
			},
			{
				type: 'table',
				content: [
					{
						type: 'tableRow',
						content: [{ type: 'tableCell', content: [para('Zelle')] }]
					}
				]
			},
			{ type: 'callout', attrs: { emoji: '💡' }, content: [para('Hinweis')] }
		);
		const id = createNote({});
		updateNote(id, { content });
		expect(getNote(id)?.content).toEqual(content);
	});

	it('Scenario: Server moves a note and bumps its edit time', async () => {
		const { folders } = seedArchive({
			folders: [{ name: 'A' }, { name: 'B' }]
		});
		const id = createNote({ folderId: folders[0] });
		let last = getNote(id)!.updatedAt;
		for (const folderId of [folders[1], null]) {
			await new Promise((r) => setTimeout(r, 3));
			const { updatedAt } = updateNote(id, { folderId });
			expect(updatedAt > last).toBe(true);
			last = updatedAt;
			expect(listNotes({ folderId }).map((n) => n.id)).toContain(id);
		}
		expect(getNote(id)?.folderId).toBeNull();
	});

	it('throws NotFoundError for a missing note and ValidationError for a missing folder', () => {
		expect(() => updateNote(99, { title: 'x' })).toThrow(NotFoundError);
		const id = createNote({});
		expect(() => updateNote(id, { folderId: 99 })).toThrow(ValidationError);
	});

	describe('uploads', () => {
		function noteWith(content: JSONContent, images = 0, files = 0) {
			const { notes } = seedArchive({ notes: [{ images, files }] });
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(content), notes[0]);
			return notes[0];
		}

		it('Scenario: Removed uploads are marked on save, not deleted', () => {
			const { notes } = seedArchive({ notes: [{ images: 3, files: 1 }] });
			const id = notes[0];
			const [i1, i2, preview] = ids('images', id);
			const [f1] = ids('files', id);
			const stored = doc(
				image(i1),
				image(i2),
				{ type: 'fileCard', attrs: { id: f1 } },
				{ type: 'linkPreview', attrs: { imageId: preview } }
			);
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(stored), id);
			updateNote(id, { content: doc(image(i1)) });
			expect(ids('images', id)).toEqual([i1, i2, preview]);
			expect(ids('files', id)).toEqual([f1]);
			expect(marked('images', i1)).toBeNull();
			for (const [table, upload] of [
				['images', i2],
				['images', preview],
				['files', f1]
			] as const)
				expect(marked(table, upload), `${table} ${upload}`).not.toBeNull();
		});

		it('Scenario: A removed upload can still be pasted into another note', () => {
			const { notes } = seedArchive({ notes: [{ images: 1, files: 1 }, {}] });
			const [img] = ids('images', notes[0]);
			const [file] = ids('files', notes[0]);
			const blocks = doc(image(img), { type: 'fileCard', attrs: { id: file } });
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(blocks), notes[0]);

			updateNote(notes[0], { content: doc(para('ausgeschnitten')) });
			updateNote(notes[1], { content: blocks });
			purgeOrphans(afterGrace());

			expect(ids('images', notes[1])).toEqual([img]);
			expect(ids('files', notes[1])).toEqual([file]);
			expect(marked('images', img)).toBeNull();
			expect(marked('files', file)).toBeNull();
		});

		it('Scenario: Undo brings a removed upload back', () => {
			const { notes } = seedArchive({ notes: [{ images: 1 }] });
			const id = notes[0];
			const [img] = ids('images', id);
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(doc(image(img))), id);

			updateNote(id, { content: doc(para('weg')) });
			updateNote(id, { content: doc(image(img)) });

			expect(ids('images', id)).toEqual([img]);
			expect(marked('images', img)).toBeNull();
		});

		it('Scenario: An orphaned upload is purged after the grace period', () => {
			const { notes } = seedArchive({ notes: [{ images: 3, files: 1 }, {}] });
			const id = notes[0];
			const [img, atStart, onSave] = ids('images', id);
			const [file] = ids('files', id);
			getDb()
				.prepare('UPDATE notes SET content = ? WHERE id = ?')
				.run(JSON.stringify(doc(image(img), { type: 'fileCard', attrs: { id: file } })), id);
			updateNote(id, { content: doc(para('leer')) });

			purgeOrphans(Date.now() + UPLOAD_GRACE_MS - 60_000);
			expect(exists('images', img)).toBe(true);
			expect(exists('files', file)).toBe(true);
			purgeOrphans(afterGrace());
			expect(exists('images', img)).toBe(false);
			expect(exists('files', file)).toBe(false);

			const old = new Date(Date.now() - UPLOAD_GRACE_MS - 60_000).toISOString();
			const age = getDb().prepare('UPDATE images SET orphaned_at = ? WHERE id = ?');
			age.run(old, atStart);
			init();
			expect(exists('images', atStart)).toBe(false);
			age.run(old, onSave);
			updateNote(notes[1], { title: 'irgendeine Notiz' });
			expect(exists('images', onSave)).toBe(false);
		});

		it('Scenario: Uploads still in the body survive a save', () => {
			const { notes } = seedArchive({ notes: [{ images: 2, files: 1 }] });
			const id = notes[0];
			const [i1, i2] = ids('images', id);
			const [f1] = ids('files', id);
			const stored = doc(image(i1), image(i2), { type: 'fileCard', attrs: { id: f1 } }, para('alt'));
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(stored), id);
			updateNote(id, { title: 'nur der Titel' });
			expect(ids('images', id)).toEqual([i1, i2]);
			expect(ids('files', id)).toEqual([f1]);
			updateNote(id, {
				content: doc(image(i1), image(i2), { type: 'fileCard', attrs: { id: f1 } }, para('neu'))
			});
			expect(ids('images', id)).toEqual([i1, i2]);
			expect(ids('files', id)).toEqual([f1]);
		});

		it('Scenario: Uploads never saved are left alone', () => {
			const { notes } = seedArchive({ notes: [{ images: 1 }] });
			const id = notes[0];
			updateNote(id, { content: doc(para('ohne Bild')) });
			purgeOrphans(afterGrace());
			expect(ids('images', id)).toHaveLength(1);
			expect(marked('images', ids('images', id)[0])).toBeNull();
		});

		it("Scenario: A copied upload outlives its source note when the block is removed", () => {
			const { notes } = seedArchive({ notes: [{ images: 1, files: 1 }, {}] });
			const [img] = ids('images', notes[0]);
			const [file] = ids('files', notes[0]);
			const shared = doc(image(img), { type: 'fileCard', attrs: { id: file } });
			getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(shared), notes[0]);
			updateNote(notes[1], { content: shared });

			updateNote(notes[0], { content: doc(para('leer')) });

			expect(ids('images', notes[1])).toEqual([img]);
			expect(ids('files', notes[1])).toEqual([file]);
		});

		it('never touches another note or a folder cover', () => {
			const { notes, folders } = seedArchive({
				folders: [{ name: 'F', cover: true }],
				notes: [{ images: 1 }, { images: 1 }]
			});
			const [other] = ids('images', notes[1]);
			const [mine] = ids('images', notes[0]);
			getDb()
				.prepare('UPDATE notes SET content = ? WHERE id = ?')
				.run(JSON.stringify(doc(image(mine), image(other))), notes[0]);
			updateNote(notes[0], { content: doc(para('leer')) });
			expect(marked('images', mine)).not.toBeNull();
			expect(ids('images', notes[1])).toEqual([other]);
			expect(marked('images', other)).toBeNull();
			expect(count('images')).toBe(3);
			expect(folders).toHaveLength(1);
		});

		it('keeps uploads when the stored body has no references', () => {
			const id = noteWith(doc(para('x')), 1, 1);
			updateNote(id, { content: doc(para('y')) });
			expect(ids('images', id)).toHaveLength(1);
			expect(ids('files', id)).toHaveLength(1);
		});
	});
});

describe('deleteNote', () => {
	it('Scenario: Server delete removes tag links, uploads and the index row', () => {
		const { folders, notes } = seedArchive({
			folders: [{ name: 'F' }],
			notes: [{ folder: 0, tags: ['solo', 'shared'], images: 2, files: 1 }, { tags: ['shared'] }]
		});
		expect(deleteNote(notes[0])).toEqual({ folderId: folders[0] });
		expect(count('note_tags')).toBe(1);
		expect(count('images')).toBe(0);
		expect(count('files')).toBe(0);
		expect(count('notes_fts')).toBe(1);
		expect(
			getDb()
				.prepare('SELECT name FROM tags')
				.all()
				.map((r) => r.name)
		).toEqual(['shared']);
		expect(getNote(notes[0])).toBeNull();
	});

	it("Scenario: A copied upload outlives its source note when that note is deleted", () => {
		const { notes } = seedArchive({ notes: [{ images: 1, files: 1 }, {}] });
		const [img] = ids('images', notes[0]);
		const [file] = ids('files', notes[0]);
		const shared = doc(image(img), { type: 'fileCard', attrs: { id: file } });
		getDb().prepare('UPDATE notes SET content = ? WHERE id = ?').run(JSON.stringify(shared), notes[0]);
		updateNote(notes[1], { content: shared });

		deleteNote(notes[0]);

		expect(ids('images', notes[1])).toEqual([img]);
		expect(ids('files', notes[1])).toEqual([file]);
	});

	it('returns a null folder for a root note and throws for a missing one', () => {
		const id = createNote({});
		expect(deleteNote(id)).toEqual({ folderId: null });
		expect(() => deleteNote(id)).toThrow(NotFoundError);
	});
});

describe('discardIfEmpty', () => {
	it('Scenario: Server discards only empty notes', () => {
		const { notes } = seedArchive({
			notes: [{}, { title: 'Titel' }, { icon: '🌿' }, { pinnedAt: '2026-10-01T00:00:00.000Z' }]
		});
		expect(notes.map(discardIfEmpty)).toEqual([true, false, false, false]);
		expect(getNote(notes[0])).toBeNull();
		for (const id of notes.slice(1)) expect(getNote(id)).not.toBeNull();
	});

	it('treats a whitespace-only title as empty', () => {
		const { notes } = seedArchive({ notes: [{ title: ' ' }, { title: ' ', body: 'Text' }] });
		expect(notes.map(discardIfEmpty)).toEqual([true, false]);
	});

	it('keeps notes with body text, an image block or tags, and ignores missing ids', () => {
		const { notes } = seedArchive({
			notes: [{ body: 'Text' }, { content: docFromText('') }, { tags: ['t'] }]
		});
		getDb()
			.prepare('UPDATE notes SET content = ? WHERE id = ?')
			.run(JSON.stringify(doc(image(1))), notes[1]);
		expect(notes.map(discardIfEmpty)).toEqual([false, false, false]);
		expect(discardIfEmpty(999)).toBe(false);
	});
});
