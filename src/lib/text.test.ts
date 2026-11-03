import { describe, expect, it } from 'vitest';
import { fold, foldSearch } from './text.ts';

describe('fold', () => {
	it('lowercases umlauts, which SQLite NOCASE would not', () => {
		expect(fold('Übung')).toBe(fold('übung'));
	});

	it('normalises to NFC', () => {
		expect(fold('Übersicht')).toBe('übersicht');
	});

	it('trims and collapses whitespace', () => {
		expect(fold('  a \t b\n c  ')).toBe('a b c');
	});
});

describe('foldSearch', () => {
	it('maps ß to ss', () => {
		expect(foldSearch('Straße')).toBe('Strasse');
	});

	it('maps ẞ to ss', () => {
		expect(foldSearch('STRAẞE')).toBe('STRAssE');
	});

	it('leaves other text alone', () => {
		expect(foldSearch('Übung café')).toBe('Übung café');
	});
});
