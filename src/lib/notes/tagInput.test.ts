import { describe, expect, it } from 'vitest';
import { addTag, splitCommas, suggest } from './tagInput.ts';

const known = [
	{ id: 1, name: 'Übung' },
	{ id: 2, name: 'Reise' },
	{ id: 3, name: 'Garten' }
];

describe('tag input helpers', () => {
	it('appends a new name in typing order, trimmed and collapsed', () => {
		expect(addTag(['Reise'], known, '  Neu   Name ')).toEqual(['Reise', 'Neu Name']);
	});

	it('ignores blank input and duplicates ignoring case and umlauts', () => {
		expect(addTag(['Übung'], known, '   ')).toEqual(['Übung']);
		expect(addTag(['Übung'], known, 'ÜBUNG ')).toEqual(['Übung']);
	});

	it('takes the stored spelling of an existing tag', () => {
		expect(addTag([], known, 'übung')).toEqual(['Übung']);
	});

	it('confirms what comes before each comma and keeps the tail', () => {
		expect(splitCommas([], known, 'Japan,')).toEqual({ selected: ['Japan'], rest: '' });
		expect(splitCommas(['Reise'], known, 'a, reise, b,c')).toEqual({ selected: ['Reise', 'a', 'b'], rest: 'c' });
		expect(splitCommas([], known, 'Jap')).toEqual({ selected: [], rest: 'Jap' });
	});

	it('suggests fold-matched tags that are not chips yet', () => {
		expect(suggest(known, [], 'ÜB').map((t) => t.name)).toEqual(['Übung']);
		expect(suggest(known, ['übung'], 'ub')).toEqual([]);
		expect(suggest(known, [], 'e').map((t) => t.name)).toEqual(['Reise', 'Garten']);
		expect(suggest(known, [], '  ')).toEqual([]);
	});
});
