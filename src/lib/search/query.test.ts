import { describe, expect, it } from 'vitest';
import { parseQuery, searchHref } from './query.ts';

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
