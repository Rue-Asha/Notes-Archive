import { listFolderTiles } from '#lib/server/folders.ts';
import { listPinned, listRecent } from '#lib/server/notes.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ pinned: listPinned(), recent: listRecent(8), tiles: listFolderTiles(null) });
