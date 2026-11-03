import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from './db.ts';
import { getFile, storeFile } from './files.ts';
import { seedArchive, useTestDb } from './testing.ts';

beforeEach(useTestDb);

const count = () => Number(getDb().prepare('SELECT count(*) AS n FROM files').get()!.n);

describe('files', () => {
	it('Scenario: Server stores files as-is with their names', () => {
		const { notes } = seedArchive({ notes: [{}] });
		const kb = new Uint8Array(1024).map((_, i) => i % 251);

		const empty = storeFile(notes[0], { name: 'leer.txt', mime: 'text/plain', bytes: new Uint8Array() });
		const named = storeFile(notes[0], { name: 'Übung 1 (final).txt', mime: 'text/plain', bytes: kb });

		expect(empty).toMatchObject({ name: 'leer.txt', size: 0 });
		expect(named).toMatchObject({ name: 'Übung 1 (final).txt', size: 1024, mime: 'text/plain' });
		expect(getFile(empty.id)!.bytes).toHaveLength(0);
		expect(Buffer.from(getFile(named.id)!.bytes).equals(Buffer.from(kb))).toBe(true);
		expect(() =>
			storeFile(notes[0], { name: 'gross.bin', mime: 'application/octet-stream', bytes: new Uint8Array(17 * 1024 * 1024) })
		).toThrowError(expect.objectContaining({ code: 'file-too-large' }));
		expect(count()).toBe(2);
	});

	it('accepts exactly 16 MiB and answers null for a missing id', () => {
		const { notes } = seedArchive({ notes: [{}] });
		const big = storeFile(notes[0], { name: 'a.bin', mime: 'application/octet-stream', bytes: new Uint8Array(16 * 1024 * 1024) });
		expect(big.size).toBe(16 * 1024 * 1024);
		expect(getFile(999)).toBeNull();
	});
});
