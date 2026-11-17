import type { Id, SearchHit, SearchQuery, SnippetPart } from '#lib/types.ts';

function id(raw: string | null): Id | undefined {
	return raw !== null && /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : undefined;
}

export function parseQuery(params: Pick<URLSearchParams, 'get'>): SearchQuery {
	return { q: params.get('q') ?? '', folderId: id(params.get('folder')), tagId: id(params.get('tag')) };
}

export function searchHref(query: SearchQuery): string {
	const params = new URLSearchParams();
	if (query.q.trim()) params.set('q', query.q);
	if (query.folderId != null) params.set('folder', String(query.folderId));
	if (query.tagId != null) params.set('tag', String(query.tagId));
	const search = params.toString();
	return search ? `/search?${search}` : '/search';
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// the words a hit marked, marked again in another text (the one-line title); the index marks whole words, so "an"
// never lights up inside "Plan"
export function markWords(text: string, words: string[]): SnippetPart[] {
	const unique = [...new Set(words.filter(Boolean))];
	if (!unique.length) return [{ text, hit: false }];
	const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(${unique.map(escape).join('|')})(?![\\p{L}\\p{M}\\p{N}])`, 'u');
	return text
		.split(pattern)
		.map((piece, i) => ({ text: piece, hit: i % 2 === 1 }))
		.filter((part) => part.text);
}

// a body hit highlights the snippet; a title hit highlights the title and leaves the card's own snippet, so the title
// never shows twice; a tag hit, which neither text holds, highlights the tag snippet
export function hitDisplay(hit: SearchHit, title: string): { title: SnippetPart[] | null; snippet: SnippetPart[] | null } {
	if (hit.inBody) return { title: null, snippet: hit.parts };
	const words = hit.parts.filter((p) => p.hit).map((p) => p.text);
	const marked = markWords(title, words);
	if (marked.some((p) => p.hit)) return { title: marked, snippet: null };
	return { title: null, snippet: hit.parts.length ? hit.parts : null };
}
