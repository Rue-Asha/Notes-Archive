import { getTree } from '#lib/server/folders.ts';
import { getTreeSort } from '#lib/server/settings.ts';
import { listTags } from '#lib/server/tags.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ depends }) => {
	depends('app:tree');
	const treeSort = getTreeSort();
	return { tree: getTree(treeSort), tags: listTags(), treeSort };
};
