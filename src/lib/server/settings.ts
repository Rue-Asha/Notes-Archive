import { ValidationError } from '#lib/errors.ts';
import { isTreeSort, type TreeSort } from '#lib/types.ts';
import { getDb } from './db.ts';

export function getTreeSort(): TreeSort {
	const row = getDb().prepare("SELECT value FROM settings WHERE key = 'tree_sort'").get();
	return isTreeSort(row?.value) ? row.value : 'mixed';
}

export function setTreeSort(sort: TreeSort): void {
	if (!isTreeSort(sort)) throw new ValidationError('treeSort');
	getDb().prepare("INSERT INTO settings (key, value) VALUES ('tree_sort', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(sort);
}
