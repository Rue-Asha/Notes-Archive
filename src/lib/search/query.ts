import type { Id, SearchQuery } from '#lib/types.ts';

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
