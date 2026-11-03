import { parseQuery } from '#lib/search/query.ts';
import { searchNotes } from '#lib/server/search.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const query = parseQuery(url.searchParams);
	return { query, hits: searchNotes(query) };
};
