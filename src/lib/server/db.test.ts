import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb, loadMigrations, migrate, openDb } from './db.ts';
import { listPinned } from './notes.ts';

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'notes-archive-db-'));
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function applied(db: DatabaseSync): string[] {
	return db
		.prepare('SELECT name FROM schema_migrations ORDER BY name')
		.all()
		.map((r) => String(r.name));
}

function tables(db: DatabaseSync): string[] {
	return db
		.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
		.all()
		.map((r) => String(r.name));
}

describe('db', () => {
	it('Scenario: Fresh database gets the schema', () => {
		const db = openDb(join(dir, 'fresh.db'));

		migrate(db);

		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
		expect(applied(db)).toContain('0001_images.sql');
		expect(tables(db)).toContain('images');
		db.close();
	});

	it('Scenario: Only new migrations run on an existing database', () => {
		const db = openDb(join(dir, 'existing.db'));
		const [first] = loadMigrations();
		migrate(db, [first]);
		db.exec(
			"INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 1, 1, x'00', 'now')"
		);

		migrate(db, [first, { name: '9999_extra.sql', sql: 'CREATE TABLE extra (id INTEGER)' }]);
		migrate(db, [first, { name: '9999_extra.sql', sql: 'CREATE TABLE extra (id INTEGER)' }]);

		expect(applied(db)).toEqual([first.name, '9999_extra.sql']);
		expect(db.prepare('SELECT count(*) AS n FROM images').get()?.n).toBe(1);
		db.close();
	});

	it('upgrading keeps stored images and their ids', () => {
		const db = openDb(join(dir, 'upgrade.db'));
		const all = loadMigrations();
		migrate(db, all.slice(0, 2));
		db.exec("INSERT INTO images (id, mime, width, height, bytes, created_at) VALUES (7, 'image/webp', 3, 2, x'0102', 'now')");

		migrate(db, all);

		expect(db.prepare('SELECT id, mime, width, height, hex(bytes) AS b, note_id FROM images').all()).toEqual([
			{ id: 7, mime: 'image/webp', width: 3, height: 2, b: '0102', note_id: null }
		]);
		db.close();
	});

	it('creates a missing database directory', () => {
		const path = join(dir, 'does', 'not', 'exist', 'archive.db');
		process.env.DATABASE_PATH = path;

		const db = getDb();

		expect(existsSync(path)).toBe(true);
		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
	});

	it('opens with WAL and foreign keys', () => {
		const db = openDb(join(dir, 'pragmas.db'));

		expect(db.prepare('PRAGMA journal_mode').get()?.journal_mode).toBe('wal');
		expect(db.prepare('PRAGMA foreign_keys').get()?.foreign_keys).toBe(1);
		db.close();
	});

	it('a failing migration is rolled back, not recorded and named in the error', () => {
		const db = openDb(join(dir, 'rollback.db'));
		const run = () =>
			migrate(db, [
				{ name: '0001_ok.sql', sql: 'CREATE TABLE ok (id INTEGER)' },
				{ name: '0002_bad.sql', sql: 'CREATE TABLE half (id INTEGER); CREATE TABL nope' }
			]);

		expect(run).toThrow(/0002_bad\.sql/);
		expect(applied(db)).toEqual(['0001_ok.sql']);
		expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'half'").get()).toBeUndefined();
		db.close();
	});

	it('loads migrations in name order from the package root', () => {
		const names = loadMigrations().map((m) => m.name);

		expect(names).toEqual([...names].sort());
		expect(names[0]).toBe('0001_images.sql');
	});
	it('Scenario: Migration keeps the existing order', () => {
		const path = join(dir, 'pins.db');
		const old = openDb(path);
		migrate(old, loadMigrations().filter((m) => m.name < '0005'));
		const add = (title: string, pinnedAt: string | null) =>
			old
				.prepare('INSERT INTO notes (title, pinned_at, created_at, updated_at) VALUES (?, ?, ?, ?)')
				.run(title, pinnedAt, 'now', 'now');
		add('old', '2026-11-01T10:00:00.000Z');
		add('tie a', '2026-11-03T10:00:00.000Z');
		add('tie b', '2026-11-03T10:00:00.000Z');
		add('loose', null);
		add('new', '2026-11-05T10:00:00.000Z');
		old.close();
		process.env.DATABASE_PATH = path;

		const db = getDb();
		const order = listPinned().map((c) => c.title);

		expect(order).toEqual(['new', 'tie b', 'tie a', 'old']);
		expect(db.prepare('SELECT title, pin_order FROM notes ORDER BY pin_order, id').all()).toEqual([
			{ title: 'loose', pin_order: null },
			{ title: 'new', pin_order: 1 },
			{ title: 'tie b', pin_order: 2 },
			{ title: 'tie a', pin_order: 3 },
			{ title: 'old', pin_order: 4 }
		]);
	});

	it('0005 adds the settings table and the pin order index', () => {
		const db = openDb(join(dir, 'settings.db'));

		migrate(db);

		expect(tables(db)).toContain('settings');
		db.prepare("INSERT INTO settings (key, value) VALUES ('tree_sort', 'name')").run();
		expect(() => db.prepare("INSERT INTO settings (key, value) VALUES ('tree_sort', 'x')").run()).toThrow(/UNIQUE|PRIMARY/);
		expect(() => db.prepare("INSERT INTO settings (key, value) VALUES ('k', NULL)").run()).toThrow(/NOT NULL/);
		expect(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = 'notes_pin_order'").get()).toBeDefined();
		db.close();
	});

});
