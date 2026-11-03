import { getTree } from '#lib/server/folders.ts';
import { listTags } from '#lib/server/tags.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ depends }) => {
	depends('app:tree');
	return { tree: getTree(), tags: listTags() };
};
