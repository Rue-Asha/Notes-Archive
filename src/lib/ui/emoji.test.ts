import { describe, expect, it } from 'vitest';
import { EMOJI, searchEmoji } from './emoji.ts';

describe('emoji catalogue', () => {
	it('holds about 240 distinct emoji', () => {
		const chars = EMOJI.map((e) => e.char);
		expect(chars.length).toBeGreaterThanOrEqual(230);
		expect(chars.length).toBeLessThanOrEqual(260);
		expect(new Set(chars).size).toBe(chars.length);
	});

	it('gives every emoji a name', () => {
		expect(EMOJI.every((e) => e.name.length > 0)).toBe(true);
	});
});

describe('searchEmoji', () => {
	it('finds 📚 for "book"', () => {
		expect(searchEmoji('book').map((e) => e.char)).toContain('📚');
	});

	it('is case and space insensitive', () => {
		expect(searchEmoji('  BOOK ').map((e) => e.char)).toContain('📚');
	});

	it('matches keywords as well as names', () => {
		expect(searchEmoji('journey').map((e) => e.char)).toContain('✈️');
	});

	it('returns the whole catalogue for an empty query', () => {
		expect(searchEmoji('')).toEqual(EMOJI);
		expect(searchEmoji('   ')).toEqual(EMOJI);
	});

	it('returns nothing for a query that matches nothing', () => {
		expect(searchEmoji('zzzzqq')).toEqual([]);
	});

	it('puts whole-word matches ahead of partial ones', () => {
		const chars = searchEmoji('book').map((e) => e.char);
		expect(chars[0]).toBe('📚');
		expect(chars.indexOf('📖')).toBeLessThan(chars.indexOf('🔖'));
	});
});
