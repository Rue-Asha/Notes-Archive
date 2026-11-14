import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { ConflictError } from '#lib/errors.ts';
import { getNote, listNotes, listPinned, listRecent, reorderPinned, updateNote } from './notes.ts';
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
	it('Scenario: Server orders pinned notes by pin order', () => {
		const { notes } = seedArchive({ notes: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] });
		for (const i of [0, 2, 1]) updateNote(notes[i], { pinned: true });
		// stamps that contradict the pin order: only the stored order can give b, c, a
		const stamp = getDb().prepare('UPDATE notes SET pinned_at = ? WHERE id = ?');
		[at(3), at(1), at(2)].forEach((day, i) => stamp.run(day, notes[i]));
		expect(titles(listPinned())).toEqual(['b', 'c', 'a']);
		expect(listRecent().find((n) => n.title === 'b')!.pinned).toBe(true);
		expect(listRecent().find((n) => n.title === 'd')!.pinned).toBe(false);

		updateNote(notes[2], { pinned: false });
		expect(titles(listPinned())).toEqual(['b', 'a']);
	});
});

describe('pinned order', () => {
	const pinAll = (ids: number[]) => ids.forEach((id) => updateNote(id, { pinned: true }));
	const abc = () => {
		const { notes } = seedArchive({ notes: [{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }] });
		pinAll([notes[0], notes[1], notes[2]]);
		return notes;
	};

	it('Scenario: Reorder sets the pinned order', () => {
		const [a, b, c] = abc();
		expect(titles(listPinned())).toEqual(['c', 'b', 'a']);
		reorderPinned([a, c, b]);
		expect(titles(listPinned())).toEqual(['a', 'c', 'b']);
	});

	it('Scenario: A new pin goes to the top of a custom order', () => {
		const [a, b, c, d] = abc();
		reorderPinned([a, c, b]);
		updateNote(d, { pinned: true });
		expect(titles(listPinned())).toEqual(['d', 'a', 'c', 'b']);
	});

	it('Scenario: Re-pinning does not keep the old position', () => {
		const [a, b, c] = abc();
		reorderPinned([a, c, b]);
		updateNote(b, { pinned: false });
		updateNote(b, { pinned: true });
		expect(titles(listPinned())).toEqual(['b', 'a', 'c']);
	});

	it('Scenario: A stale reorder is refused', () => {
		const [a, b, c, d] = abc();
		const before = listPinned().map((n) => n.id);
		expect(() => reorderPinned([a, b])).toThrow(ConflictError);
		expect(() => reorderPinned([a, b, c, d])).toThrow(ConflictError);
		expect(() => reorderPinned([a, a, b])).toThrow(ConflictError);
		expect(listPinned().map((n) => n.id)).toEqual(before);
	});

	it('Scenario: Reordering does not change updatedAt', () => {
		const [a, b, c] = abc();
		const stamps = [a, b, c].map((id) => getNote(id)!.updatedAt);
		reorderPinned([b, a, c]);
		expect([a, b, c].map((id) => getNote(id)!.updatedAt)).toEqual(stamps);
	});
});
