import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY, count } from './copy.ts';
import { TREE_SORTS } from './types.ts';

// the English-target column of the contract's §8 copy list ("same" stands for the first column)
function contractTargets(): Set<string> {
	const doc = readFileSync(new URL('../../docs/functional-contract.md', import.meta.url), 'utf8');
	const list = doc.slice(doc.indexOf('## 8. Copy list'), doc.indexOf('## 9.'));
	const targets = new Set<string>();
	for (const line of list.split('\n')) {
		if (!line.startsWith('| ')) continue;
		const [current, target] = line.split('|').slice(1, 3).map((cell) => cell.trim());
		if (current === 'current string') continue;
		// "same, in this order" names the order, not the text
		for (const part of (target.startsWith('same') ? current : target).split(' / ')) targets.add(part);
	}
	return targets;
}

// the app's own source: every file under src/ except tests and the design mockups
function appSource(): string {
	const root = new URL('../', import.meta.url);
	return readdirSync(root, { recursive: true, encoding: 'utf8' })
		.filter((file) => /\.(svelte|ts)$/.test(file) && !/\.test\.ts$/.test(file) && !file.includes('__mockups'))
		.map((file) => readFileSync(new URL(file, root), 'utf8'))
		.join('\n');
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// a literal target is in the app when the source holds it as a whole string or text node: a dynamic part (<q>, <n>, N)
// stands for any {expression} or ${expression}
function inSource(target: string, source: string): boolean {
	const pattern = target
		.split(/<[^>]+>|\b[NM]\b/)
		.map(escape)
		.join('\\$?\\{[^}]+\\}');
	return new RegExp(`(['"\`>]|\\})${pattern}(['"\`<]|\\$?\\{)`).test(source);
}

describe('copy', () => {
	it('count pluralises by number', () => {
		expect(count(0, 'note')).toBe('0 notes');
		expect(count(1, 'folder')).toBe('1 folder');
		expect(count(2, 'folder')).toBe('2 folders');
	});

	it('deleteFolder names the contents of a non-empty folder', () => {
		expect(COPY.deleteFolder({ folders: 1, notes: 3 })).toBe('This deletes 1 folder and 3 notes inside it. This can\'t be undone.');
	});

	it('Scenario: Folder delete leaves out a zero count', () => {
		expect(COPY.deleteFolder({ folders: 0, notes: 1 })).toBe("This deletes 1 note inside it. This can't be undone.");
		expect(COPY.deleteFolder({ folders: 2, notes: 0 })).toBe("This deletes 2 folders inside it. This can't be undone.");
	});

	it('deleteFolder stays short for an empty folder', () => {
		expect(COPY.deleteFolder({ folders: 0, notes: 0 })).toBe("This can't be undone.");
	});

	it('folderCounts and noteCount use the plural helper', () => {
		expect(COPY.folderCounts(1, 2)).toBe('1 folder · 2 notes');
		expect(COPY.noteCount(1)).toBe('1 note');
	});

	it('Scenario: Contract strings stay', () => {
		// every contract row the app renders from COPY, with the exact text the row asserts
		const pinned: [string, string][] = [
			['Untitled', COPY.untitled],
			['Untitled folder', COPY.untitledFolder],
			['Empty note', COPY.emptyNote],
			['New note', COPY.newNote],
			['New folder', COPY.newFolder],
			['No folders yet', COPY.noFolders],
			['Nothing here yet', COPY.emptyFolder],
			['Write your first note', COPY.welcome],
			['Saving…', COPY.saving],
			['Saved', COPY.saved],
			["Couldn't save — try again", COPY.saveFailed],
			['This note was deleted', COPY.noteDeleted],
			['That image is too large', COPY.imageTooLarge],
			["That file isn't an image", COPY.notAnImage],
			['Files can be up to 16 MB', COPY.fileTooLarge],
			["Couldn't upload — try again", COPY.uploadFailed],
			["Couldn't load — try again", COPY.loadFailed],
			['Remove icon', COPY.removeIcon],
			['No results', COPY.noResults],
			['See all results', COPY.seeAll],
			['No notes match “<q>”', COPY.noMatch('<q>')],
			['Delete “<title>”?', COPY.deleteAsk('<title>')],
			["This can't be undone.", COPY.cantUndo],
			['Delete note', COPY.deleteNoteLabel],
			['Delete folder', COPY.deleteFolderLabel],
			['Folders', COPY.folders],
			['Search notes', COPY.searchHint],
			['Fold sidebar', COPY.foldSidebar],
			['Unfold sidebar', COPY.unfoldSidebar],
			['Sort folders', COPY.sortMenu],
			['Default', COPY.sortLabel.mixed],
			['Name', COPY.sortLabel.name],
			['Last edited', COPY.sortLabel.edited],
			['Created', COPY.sortLabel.created],
			['Folders A–Z, notes by last edit', COPY.sortHint.mixed],
			['Folders and notes A–Z', COPY.sortHint.name],
			['Newest first', COPY.sortHint.edited],
			['Newest first', COPY.sortHint.created],
			['Pinned order changed elsewhere — reloaded', COPY.pinnedConflict],
			['Move up', COPY.moveUp],
			['Move down', COPY.moveDown],
			['Show all <n> parent folders', COPY.pathMore('<n>' as unknown as number)],
			['Back to <name>', COPY.backTo('<name>')],
			['Collapse <name>', COPY.collapse('<name>')],
			['Expand <name>', COPY.expand('<name>')]
		];
		const targets = contractTargets();
		for (const [target, value] of pinned) {
			expect(value, target).toBe(target);
			expect(targets.has(target), `${target} is in the contract copy list`).toBe(true);
		}
		// rows whose target describes text instead of spelling it, each pinned by its own test
		const described = new Set([
			'Folder: <name>', // FolderField builds "Folder: " + the path; move-note asserts it
			'clay', // a TEXT_COLORS name, rendered as the option label; text colours test
			'<n> notes (e.g. "0 notes", "1 note", "3 notes")', // COPY.noteCount, unit-tested above
			'<n> folder(s) · <m> note(s)', // COPY.folderCounts, unit-tested above
			'Delete “<name>”?', // COPY.deleteAsk, pinned as Delete “<title>”?
			'This deletes N folders and M notes inside it. This can\'t be undone.', // COPY.deleteFolder above
			'+<n>', // NoteCard's overflow count; cards test
			'<n>h ago' // relativeTime; time.test.ts
		]);
		// the rest are literals outside COPY: each must sit in the app source as a whole string
		const covered = new Set(pinned.map(([target]) => target));
		const source = appSource();
		const missing = [...targets].filter((target) => !covered.has(target) && !described.has(target) && !inSource(target, source));
		expect(missing).toEqual([]);
	});

	it('Scenario: New strings are in the contract', () => {
		const targets = contractTargets();
		expect(Object.keys(COPY.sortLabel).sort()).toEqual([...TREE_SORTS].sort());
		const labels = TREE_SORTS.map((mode) => COPY.sortLabel[mode]);
		expect(labels).toEqual(['Default', 'Name', 'Last edited', 'Created']);
		for (const label of labels) expect(targets.has(label), label).toBe(true);
		for (const mode of TREE_SORTS) expect(targets.has(COPY.sortHint[mode]), COPY.sortHint[mode]).toBe(true);

		expect(COPY.pinnedConflict).toBe('Pinned order changed elsewhere — reloaded');
		expect(COPY.pathMore(3)).toBe('Show all 3 parent folders');
		expect(COPY.backTo('Japan')).toBe('Back to Japan');
		expect(COPY.sortMenu).toBe('Sort folders');
		expect([COPY.moveUp, COPY.moveDown, COPY.folders, COPY.foldSidebar, COPY.unfoldSidebar, COPY.searchHint]).toEqual([
			'Move up',
			'Move down',
			'Folders',
			'Fold sidebar',
			'Unfold sidebar',
			'Search notes'
		]);
		for (const text of [COPY.pinnedConflict, COPY.sortMenu, COPY.moveUp, COPY.folders, COPY.foldSidebar, COPY.unfoldSidebar, COPY.searchHint]) {
			expect(targets.has(text), text).toBe(true);
		}
		expect(targets.has('Show all <n> parent folders')).toBe(true);
		expect(targets.has('Back to <name>')).toBe(true);
	});
});
