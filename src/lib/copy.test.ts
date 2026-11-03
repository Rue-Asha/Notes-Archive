import { describe, expect, it } from 'vitest';
import { COPY, count } from './copy.ts';

describe('copy', () => {
	it('count pluralises by number', () => {
		expect(count(0, 'note')).toBe('0 notes');
		expect(count(1, 'folder')).toBe('1 folder');
		expect(count(2, 'folder')).toBe('2 folders');
	});

	it('deleteFolder names the contents of a non-empty folder', () => {
		expect(COPY.deleteFolder('Trips', { folders: 1, notes: 3 })).toBe(
			'Delete “Trips”? This deletes 1 folder and 3 notes inside it. This can\'t be undone.'
		);
	});

	it('deleteFolder stays short for an empty folder', () => {
		expect(COPY.deleteFolder('Trips', { folders: 0, notes: 0 })).toBe('Delete “Trips”? This can\'t be undone.');
	});

	it('folderCounts and noteCount use the plural helper', () => {
		expect(COPY.folderCounts(1, 2)).toBe('1 folder · 2 notes');
		expect(COPY.noteCount(1)).toBe('1 note');
	});
});
