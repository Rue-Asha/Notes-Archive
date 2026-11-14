import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { updateNote } from './notes.ts';
import { searchNotes, toMatchQuery } from './search.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(() => useTestDb());
afterEach(() => closeDb());

const ids = (q: string) => searchNotes({ q }).map((h) => h.note.id);
const joined = (hit: { parts: { text: string }[] }) => hit.parts.map((p) => p.text).join('');

describe('toMatchQuery', () => {
	it('quotes each token as a prefix term and folds ß', () => {
		expect(toMatchQuery('Kirsch blüte')).toBe('"Kirsch"* "blüte"*');
		expect(toMatchQuery('Straße')).toBe('"Strasse"*');
	});

	it('keeps a decomposed umlaut in one token', () => {
		expect(toMatchQuery('u\u0308ber')).toBe('"über"*');
	});

	it('returns null without a token', () => {
		for (const q of ['', '   ', '"', '*', '-()']) expect(toMatchQuery(q)).toBeNull();
	});
});

describe('searchNotes with a query', () => {
	it('Scenario: Search finds notes by title, body and tag', () => {
		const { notes } = seedArchive({
			notes: [{ title: 'Kirschblüte' }, { body: 'Die Kirschblüte beginnt' }, { tags: ['Kirschblüte'] }, { title: 'Anderes' }]
		});
		expect(ids('kirschblüte').sort()).toEqual(notes.slice(0, 3).sort());
	});

	it('Scenario: Prefix matches while typing', () => {
		const { notes } = seedArchive({ notes: [{ title: 'Kirschblüte' }, { title: 'Apfel' }] });
		expect(ids('kirsch')).toEqual([notes[0]]);
	});

	it('Scenario: Search ignores diacritics', () => {
		const { notes } = seedArchive({ notes: [{ body: 'über den Wolken' }, { body: 'ein Café' }] });
		expect(ids('uber')).toEqual([notes[0]]);
		expect(ids('cafe')).toEqual([notes[1]]);
	});

	it('Scenario: Search treats ß as ss', () => {
		const { notes } = seedArchive({ notes: [{ body: 'Die Straße war leer' }, { title: 'Strasse' }] });
		expect(ids('strasse').sort()).toEqual([...notes].sort());
		expect(ids('straße').sort()).toEqual([...notes].sort());
	});

	it('Scenario: Search ignores case including umlauts', () => {
		const { notes } = seedArchive({ notes: [{ body: 'eine übung' }] });
		expect(ids('ÜBUNG')).toEqual(notes);
	});

	it('requires every token', () => {
		const { notes } = seedArchive({ notes: [{ body: 'rote Tulpen' }, { body: 'rote Rosen' }] });
		expect(ids('rote tulpen')).toEqual([notes[0]]);
	});

	it('Scenario: Title matches rank first', () => {
		const { notes } = seedArchive({ notes: [{ title: 'Reise', body: 'Kyoto im Herbst' }, { title: 'Kyoto' }] });
		expect(ids('kyoto')).toEqual([notes[1], notes[0]]);
	});

	it('ranks a title match above a body that repeats the word, however long the title', () => {
		const filler = Array.from({ length: 7 }, (_, i) => ({ title: `Kurz ${i}` }));
		const { notes } = seedArchive({
			notes: [
				...filler,
				{ title: 'Kyoto im Herbst mit dem Zug durch die Berge und zu den Tempeln' },
				{ title: 'Notiz', body: 'Kyoto Kyoto Kyoto Kyoto Kyoto Kyoto' }
			]
		});
		expect(ids('kyoto')).toEqual([notes[7], notes[8]]);
	});

	it('Scenario: Special characters never cause an error', () => {
		seedArchive({ notes: [{ title: 'Kirschblüte' }] });
		for (const q of ['"', '*', '-', '(', 'a AND', 'NEAR(', '"kirsch*']) expect(() => searchNotes({ q })).not.toThrow();
	});

	it('Scenario: Empty query returns no results', () => {
		seedArchive({ notes: [{ title: 'Kirschblüte' }] });
		expect(searchNotes({ q: '' })).toEqual([]);
		expect(searchNotes({ q: '   ' })).toEqual([]);
	});

	it('returns note cards and honours limit', () => {
		seedArchive({ notes: [{ title: 'Tee', tags: ['Trank'] }, { title: 'Tee 2' }, { title: 'Tee 3' }] });
		const hits = searchNotes({ q: 'tee', limit: 2 });
		expect(hits).toHaveLength(2);
		expect(hits.every((h) => h.note.title.startsWith('Tee'))).toBe(true);
	});
});

describe('snippet parts', () => {
	it('Scenario: Snippet highlights the match', () => {
		seedArchive({ notes: [{ body: 'Im Garten blühen Tulpen' }] });
		const [hit] = searchNotes({ q: 'garten' });
		expect(joined(hit)).toContain('Garten');
		expect(hit.parts.filter((p) => p.hit)).toEqual([{ text: 'Garten', hit: true }]);
	});

	it('Scenario: Snippet keeps the original ß', () => {
		seedArchive({ notes: [{ body: 'Die Straße war leer' }] });
		const [hit] = searchNotes({ q: 'strasse' });
		expect(joined(hit)).toContain('Straße');
		expect(joined(hit)).not.toContain('Strasse');
		expect(hit.parts.find((p) => p.hit)).toEqual({ text: 'Straße', hit: true });
	});

	it('maps offsets after earlier ß in a long body', () => {
		const body = `${'Fußweg Größe Maß '.repeat(30)}am Ende der Straße Ruhe`;
		seedArchive({ notes: [{ body }] });
		const [hit] = searchNotes({ q: 'strasse' });
		expect(hit.parts.find((p) => p.hit)).toEqual({ text: 'Straße', hit: true });
		expect(body).toContain(joined(hit).replace(/^…|…$/g, ''));
	});
});

describe('multi-line titles', () => {
	it('Scenario: Words on every title line are found', () => {
		seedArchive({ notes: [{ title: 'Kirschblüte\nÜbersicht' }] });
		const [hit] = searchNotes({ q: 'uber' });
		expect(hit).toBeDefined();
		expect(hit.parts.find((p) => p.hit)).toEqual({ text: 'Übersicht', hit: true });
	});
});

describe('search follows edits', () => {
	it('Scenario: Search reflects edits on save', () => {
		const { notes } = seedArchive({ notes: [{ body: 'Apfel' }] });
		updateNote(notes[0], { content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Birne' }] }] }, tags: ['Obst'] });
		expect(ids('birne')).toEqual(notes);
		expect(ids('obst')).toEqual(notes);
		expect(ids('apfel')).toEqual([]);
	});
});
