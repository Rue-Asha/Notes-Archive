import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { indexNote } from './search.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(() => useTestDb());
afterEach(() => closeDb());

function ftsRows(): Record<string, unknown>[] {
	return getDb().prepare('SELECT rowid, title, body, tags FROM notes_fts').all();
}

describe('indexNote', () => {
	it('holds title, body text and tag names, with ß stored as ss', () => {
		const { notes } = seedArchive({
			notes: [{ title: 'Straße', body: 'Große Übung\nzweite Zeile', tags: ['Fußweg', 'Reise'] }]
		});

		expect(ftsRows()).toEqual([
			{ rowid: notes[0], title: 'Strasse', body: 'Grosse Übung\nzweite Zeile', tags: 'Fussweg Reise' }
		]);
	});

	it('a second call rewrites the row instead of adding one', () => {
		const { notes } = seedArchive({ notes: [{ title: 'Alt', body: 'alter Text' }] });
		getDb().prepare("UPDATE notes SET title = 'Neu', body_text = 'neuer Text' WHERE id = ?").run(notes[0]);

		indexNote(notes[0]);

		expect(ftsRows()).toEqual([{ rowid: notes[0], title: 'Neu', body: 'neuer Text', tags: '' }]);
	});

	it('follows tag changes in chip order', () => {
		const { notes } = seedArchive({ notes: [{ title: 'A', tags: ['Eins', 'Zwei'] }] });
		getDb().prepare('UPDATE note_tags SET position = 1 - position WHERE note_id = ?').run(notes[0]);

		indexNote(notes[0]);

		expect(ftsRows()[0].tags).toBe('Zwei Eins');
	});

	it('finds a note across ß, case and diacritics', () => {
		seedArchive({ notes: [{ title: 'Straße', body: 'Café' }] });
		const hit = (q: string) =>
			getDb().prepare('SELECT rowid FROM notes_fts WHERE notes_fts MATCH ?').all(q).length;

		expect(hit('"strasse"*')).toBe(1);
		expect(hit('"cafe"*')).toBe(1);
	});

	it('does nothing for an unknown note', () => {
		indexNote(999);

		expect(ftsRows()).toEqual([]);
	});
});
