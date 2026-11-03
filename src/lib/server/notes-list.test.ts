import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { listNotes, listPinned, listRecent, updateNote } from './notes.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const at = (day: number) => `2026-10-${String(day).padStart(2, '0')}T12:00:00.000Z`;
const titles = (cards: { title: string }[]) => cards.map((c) => c.title);

describe('listNotes', () => {
	it('lists direct children only, newest edit first', () => {
		const { folders } = seedArchive({
			folders: [{ name: 'A' }, { name: 'B', parent: 0 }],
			notes: [
				{ title: 'old', folder: 0, updatedAt: at(1) },
				{ title: 'new', folder: 0, updatedAt: at(3) },
				{ title: 'deep', folder: 1, updatedAt: at(5) },
				{ title: 'root', updatedAt: at(4) }
			]
		});
		expect(titles(listNotes({ folderId: folders[0] }))).toEqual(['new', 'old']);
		expect(titles(listNotes({ folderId: null }))).toEqual(['root']);
		expect(titles(listNotes({}))).toEqual(['root']);
	});

	it('maps a card with its snippet, pin state and tags in chip order', () => {
		const { notes } = seedArchive({
			notes: [
				{
					title: 'Garten',
					icon: '🌿',
					body: 'Erste  Zeile\nzweite Zeile',
					tags: ['Zebra', 'Apfel'],
					pinnedAt: at(2),
					updatedAt: at(3)
				}
			]
		});
		expect(listNotes({})).toEqual([
			{
				id: notes[0],
				title: 'Garten',
				icon: '🌿',
				folderId: null,
				snippet: 'Erste Zeile zweite Zeile',
				tags: [
					{ id: expect.any(Number), name: 'Zebra' },
					{ id: expect.any(Number), name: 'Apfel' }
				],
				pinned: true,
				updatedAt: at(3)
			}
		]);
	});

	it('filters by tag across folders', () => {
		const { folders } = seedArchive({
			folders: [{ name: 'A' }],
			notes: [
				{ title: 'one', folder: 0, tags: ['t'], updatedAt: at(1) },
				{ title: 'two', tags: ['t', 'u'], updatedAt: at(2) },
				{ title: 'three', tags: ['u'] }
			]
		});
		const tagId = listNotes({}).find((n) => n.title === 'two')!.tags[0].id;
		expect(titles(listNotes({ tagId }))).toEqual(['two', 'one']);
		expect(folders).toHaveLength(1);
	});

	it('Scenario: Snippet skips a leading image', () => {
		seedArchive({
			notes: [
				{
					title: 'Bild',
					content: {
						type: 'doc',
						content: [
							{ type: 'image', attrs: { id: 1 } },
							{
								type: 'paragraph',
								content: [{ type: 'text', text: 'Nach dem Bild' }]
							}
						]
					}
				}
			]
		});
		expect(listNotes({})[0].snippet.startsWith('Nach dem Bild')).toBe(true);
	});
});

describe('listRecent', () => {
	it('returns the 8 newest by default and honours a limit', () => {
		seedArchive({
			notes: Array.from({ length: 10 }, (_, i) => ({
				title: `n${i}`,
				updatedAt: at(i + 1)
			}))
		});
		expect(titles(listRecent())).toEqual(['n9', 'n8', 'n7', 'n6', 'n5', 'n4', 'n3', 'n2']);
		expect(titles(listRecent(2))).toEqual(['n9', 'n8']);
	});
});

describe('listPinned', () => {
	it('Scenario: Server orders pinned notes by pin time', () => {
		const { notes } = seedArchive({
			notes: [
				{ title: 'a', pinnedAt: at(1) },
				{ title: 'b', pinnedAt: at(3) },
				{ title: 'c', pinnedAt: at(2) },
				{ title: 'd' }
			]
		});
		expect(titles(listPinned())).toEqual(['b', 'c', 'a']);
		expect(listRecent().find((n) => n.title === 'b')!.pinned).toBe(true);
		expect(listRecent().find((n) => n.title === 'd')!.pinned).toBe(false);

		updateNote(notes[2], { pinned: false });
		expect(titles(listPinned())).toEqual(['b', 'a']);
	});
});
