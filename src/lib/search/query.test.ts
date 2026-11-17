import { describe, expect, it } from 'vitest';
import type { SearchHit } from '#lib/types.ts';
import { hitDisplay, markWords, parseQuery, searchHref } from './query.ts';

const parse = (search: string) => parseQuery(new URLSearchParams(search));

describe('search URL query', () => {
	it('reads q, folder and tag', () => {
		expect(parse('q=garten&folder=3&tag=7')).toEqual({ q: 'garten', folderId: 3, tagId: 7 });
	});

	it('defaults to an empty query without filters', () => {
		expect(parse('')).toEqual({ q: '', folderId: undefined, tagId: undefined });
	});

	it('drops filter ids that are not positive integers', () => {
		for (const bad of ['abc', '0', '-2', '1.5', '', '1e3', '99999999999999999999']) {
			expect(parse(`folder=${bad}&tag=${bad}`)).toMatchObject({ folderId: undefined, tagId: undefined });
		}
	});

	it('writes only what is set', () => {
		expect(searchHref({ q: '' })).toBe('/search');
		expect(searchHref({ q: '   ' })).toBe('/search');
		expect(searchHref({ q: 'kyoto' })).toBe('/search?q=kyoto');
		expect(searchHref({ q: '', folderId: 2, tagId: null })).toBe('/search?folder=2');
		expect(searchHref({ q: 'a b', folderId: 2, tagId: 5 })).toBe('/search?q=a+b&folder=2&tag=5');
	});

	it('round-trips through the URL, including characters that need escaping', () => {
		const query = { q: 'Straße & „Übung“ 100%', folderId: 4, tagId: 9 };
		const href = searchHref(query);
		expect(parse(href.split('?')[1])).toEqual(query);
	});
});

describe('hit display', () => {
	const card = { id: 1, title: 'Kyoto Reise', snippet: 'Tempel am Morgen' } as SearchHit['note'];

	it('marks the hit words in another text', () => {
		expect(markWords('Kyoto Reise Kyoto', ['Kyoto'])).toEqual([
			{ text: 'Kyoto', hit: true },
			{ text: ' Reise ', hit: false },
			{ text: 'Kyoto', hit: true }
		]);
		expect(markWords('Reise', [])).toEqual([{ text: 'Reise', hit: false }]);
	});

	it('Regression: marks whole words only, umlauts included', () => {
		expect(markWords('Plan an', ['an'])).toEqual([
			{ text: 'Plan ', hit: false },
			{ text: 'an', hit: true }
		]);
		expect(markWords('Übung Übungen Vorübung', ['Übung'])).toEqual([
			{ text: 'Übung', hit: true },
			{ text: ' Übungen Vorübung', hit: false }
		]);
		expect(markWords('Grüße an Bär', ['Bär'])).toEqual([
			{ text: 'Grüße an ', hit: false },
			{ text: 'Bär', hit: true }
		]);
		expect(markWords('Garten-Plan', ['Plan'])).toEqual([
			{ text: 'Garten-', hit: false },
			{ text: 'Plan', hit: true }
		]);
	});

	it('Regression: a tag hit, in neither title nor body, keeps its marked snippet', () => {
		const parts = [{ text: 'Kirschblüte', hit: true }];
		expect(hitDisplay({ note: card, parts, inBody: false }, 'Kyoto Reise')).toEqual({ title: null, snippet: parts });
	});

	it('a hit without parts leaves the card its own snippet', () => {
		expect(hitDisplay({ note: card, parts: [], inBody: false }, 'Kyoto Reise')).toEqual({ title: null, snippet: null });
	});

	it('Regression: a title hit marks the title and leaves the snippet to the card', () => {
		const shown = hitDisplay({ note: card, parts: [{ text: 'Kyoto', hit: true }, { text: ' Reise', hit: false }], inBody: false }, 'Kyoto Reise');
		expect(shown).toEqual({ title: [{ text: 'Kyoto', hit: true }, { text: ' Reise', hit: false }], snippet: null });
	});

	it('a body hit keeps its snippet and a plain title', () => {
		const parts = [{ text: 'Tempel', hit: true }];
		expect(hitDisplay({ note: card, parts, inBody: true }, 'Kyoto Reise')).toEqual({ title: null, snippet: parts });
	});
});
