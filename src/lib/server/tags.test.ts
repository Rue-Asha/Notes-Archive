import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { seedArchive, useTestDb } from './testing.ts';
import { getTag, listTags, setNoteTags } from './tags.ts';

beforeEach(useTestDb);
afterEach(closeDb);

const names = (tags: { name: string }[]) => tags.map((t) => t.name);
const stored = (noteId: number) =>
	getDb()
		.prepare('SELECT tags.name FROM note_tags JOIN tags ON tags.id = tag_id WHERE note_id = ? ORDER BY position')
		.all(noteId)
		.map((r) => String(r.name));

describe('tags', () => {
	it('Scenario: Tag names are unique ignoring case and umlauts', () => {
		const { notes } = seedArchive({ notes: [{}, {}, {}] });
		setNoteTags(notes[0], ['Übung']);
		setNoteTags(notes[1], ['übung']);
		const last = setNoteTags(notes[2], ['ÜBUNG ']);
		const tags = listTags();
		expect(tags).toHaveLength(1);
		expect(tags[0]).toMatchObject({ name: 'Übung', count: 3 });
		expect(last).toEqual([{ id: tags[0].id, name: 'Übung' }]);
		expect(stored(notes[2])).toEqual(['Übung']);
	});

	it('Scenario: Whitespace-only and duplicate tags are ignored', () => {
		const { notes } = seedArchive({ notes: [{}] });
		const result = setNoteTags(notes[0], ['Reise', '  ', 'reise', 'Japan']);
		expect(names(result)).toEqual(['Reise', 'Japan']);
		expect(stored(notes[0])).toEqual(['Reise', 'Japan']);
	});

	it('keeps chip order when the list is reordered and trims inner whitespace', () => {
		const { notes } = seedArchive({ notes: [{}] });
		setNoteTags(notes[0], ['A', 'B', 'C']);
		expect(names(setNoteTags(notes[0], ['C', ' b  b ', 'A']))).toEqual(['C', 'b b', 'A']);
		expect(stored(notes[0])).toEqual(['C', 'b b', 'A']);
	});

	it('Scenario: Unused tags disappear', () => {
		const { notes } = seedArchive({ notes: [{ tags: ['Einmalig', 'Bleibt'] }, { tags: ['Bleibt'] }] });
		setNoteTags(notes[0], ['Bleibt']);
		expect(names(listTags())).toEqual(['Bleibt']);
		expect(getDb().prepare('SELECT count(*) AS n FROM tags').get()?.n).toBe(1);
		setNoteTags(notes[0], []);
		setNoteTags(notes[1], []);
		expect(listTags()).toEqual([]);
	});

	it('Scenario: Tag counts include only notes using them', () => {
		const { notes } = seedArchive({
			notes: [{ tags: ['Zwei', 'Eins', 'Drei'] }, { tags: ['Drei', 'Zwei'] }, { tags: ['Drei'] }]
		});
		setNoteTags(notes[1], ['Drei']);
		setNoteTags(notes[0], ['Zwei', 'Drei']);
		expect(listTags().map((t) => [t.name, t.count])).toEqual([
			['Drei', 3],
			['Zwei', 1]
		]);
	});

	it('orders tags by name with the collator', () => {
		const { notes } = seedArchive({ notes: [{}] });
		setNoteTags(notes[0], ['zebra', 'Ärger', 'apfel']);
		expect(names(listTags())).toEqual(['apfel', 'Ärger', 'zebra']);
	});

	it('re-indexes the note so its tags are searchable', () => {
		const { notes } = seedArchive({ notes: [{ title: 'x' }] });
		setNoteTags(notes[0], ['Gartenbau']);
		const hit = (q: string) => getDb().prepare('SELECT rowid FROM notes_fts WHERE notes_fts MATCH ?').all(q);
		expect(hit('tags:gartenbau')).toHaveLength(1);
		setNoteTags(notes[0], []);
		expect(hit('tags:gartenbau')).toHaveLength(0);
	});

	it('getTag finds a tag by id', () => {
		const { notes } = seedArchive({ notes: [{}] });
		const [tag] = setNoteTags(notes[0], ['Reise']);
		expect(getTag(tag.id)).toEqual(tag);
		expect(getTag(999)).toBeNull();
	});
});
