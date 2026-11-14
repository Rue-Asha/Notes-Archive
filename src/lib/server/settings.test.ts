import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/errors.ts';
import { closeDb } from './db.ts';
import { getTreeSort, setTreeSort } from './settings.ts';
import { getTree } from './folders.ts';
import { seedArchive, useTestDb } from './testing.ts';

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

describe('settings', () => {
	beforeEach(useTestDb);

	it('Scenario: Reading the preference defaults to mixed', () => {
		expect(getTreeSort()).toBe('mixed');
	});

	it('stores and overwrites the preference', () => {
		setTreeSort('edited');
		expect(getTreeSort()).toBe('edited');
		setTreeSort('created');
		expect(getTreeSort()).toBe('created');
	});

	it('Scenario: An unknown mode is refused', () => {
		setTreeSort('name');
		expect(() => setTreeSort('random' as never)).toThrow(ValidationError);
		expect(getTreeSort()).toBe('name');
	});
});

describe('settings on disk', () => {
	it('Scenario: The preference survives a restart', () => {
		process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'notes-archive-settings-')), 'archive.db');
		seedArchive({ folders: [{ name: 'B' }, { name: 'A' }], notes: [{ title: 'z' }, { title: 'y' }] });
		setTreeSort('name');
		closeDb();
		expect(getTreeSort()).toBe('name');
		expect(getTree(getTreeSort()).rootNotes.map((n) => n.title)).toEqual(['y', 'z']);
	});
});
