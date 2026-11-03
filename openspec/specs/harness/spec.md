# harness Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Proof commands
The repo SHALL provide `npm run proof` (svelte-check with `--fail-on-warnings`, build, vitest) and `npm run proof:full` (proof plus Playwright e2e), both printing the name of every passed test and exiting non-zero on any failure.
vitest runs with `--reporter=verbose`, Playwright with `--reporter=list`.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; its output is the evidence every other unit relies on, read in U1's report)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error or a failing unit or e2e test is present
- **THEN** `npm run proof` and `npm run proof:full` exit non-zero
- **proof:** manual (infrastructure; proven once in U1 with a deliberately failing test, then reverted)

### Requirement: E2E projects and isolation
Playwright SHALL run the projects `phone` (390×844, touch, mobile) and `desktop` (1280×800) with `workers: 1` against the built server (`node build`) on `$PORT` (default 4173) with `DATABASE_PATH=.e2e/$PORT.db` removed before the server starts.
The server also gets `NOTES_ARCHIVE_TEST=1`, `PROTOCOL_HEADER=x-forwarded-proto` (requests send `x-forwarded-proto: http`), `BODY_SIZE_LIMIT=17M` and `MOCKUP_PHOTOS_DIR` pointing at `fixtures/mockups`. Every e2e test waits for `html[data-hydrated]` before interacting.

#### Scenario: Proof-full runs e2e on an isolated database
- **WHEN** `PORT=4701 npm run proof:full` runs
- **THEN** Playwright lists every passed e2e test by name and the server used `.e2e/4701.db`, never the dev database
- **proof:** manual (infrastructure; proven by running it in U1 and by every unit on its own port)

#### Scenario: Each e2e test runs on phone and desktop
- **WHEN** `npm run proof:full` runs
- **THEN** the list output shows each device-independent test once under `[phone]` and once under `[desktop]`
- **proof:** manual (suite structure; read from the proof:full list output at Gate 2)

#### Scenario: App is hydrated before tests interact
- **WHEN** a page is opened with the `open` helper
- **THEN** the helper resolves only after `html[data-hydrated]` is present
- **proof:** e2e

### Requirement: Database and migrations
The server SHALL open the SQLite database at `DATABASE_PATH` (default `./data/notes-archive.db`) with WAL and foreign keys on, create its directory if missing, and apply every not yet applied `migrations/NNNN_*.sql` file in name order at startup, each in its own transaction recorded in `schema_migrations`.

#### Scenario: Fresh database gets the schema
- **WHEN** the server opens a database file that does not exist
- **THEN** the file is created and every migration is applied and recorded in `schema_migrations`
- **proof:** unit

#### Scenario: Only new migrations run on an existing database
- **WHEN** a database already has `0001_images.sql` recorded and a new migration file exists
- **THEN** only the new migration runs
- **proof:** unit

#### Scenario: Failing migration stops the server
- **WHEN** a migration contains invalid SQL and the built server starts
- **THEN** the server exits non-zero naming the failing migration, and the database keeps no part of that migration
- **proof:** unit

#### Scenario: Server starts from any working directory
- **WHEN** the built server is started from a directory other than the package root
- **THEN** it finds `migrations/` next to `package.json` and answers `/healthz` with 200
- **proof:** unit

### Requirement: Health route
`GET /healthz` SHALL answer 200 `ok` when the database answers a query and 503 otherwise.

#### Scenario: Healthy server answers 200
- **WHEN** `/healthz` is requested on a running server
- **THEN** the response is 200 with body `ok`
- **proof:** unit

#### Scenario: Unreadable database answers 503
- **WHEN** the database cannot answer a query
- **THEN** `/healthz` answers 503
- **proof:** unit

### Requirement: Test-only routes and helpers
`POST /__test/reset`, `POST /__test/seed`, `GET /__test/counts` and `GET /__test/note/[id]` SHALL answer only when `NOTES_ARCHIVE_TEST=1` and 404 otherwise; `e2e/helpers.ts` SHALL wrap them and provide `open`, `calm`, `photo` and `watchSaves`.
Reset deletes every row of every table including the search index; seed inserts folders and notes as described in design.md → E2E helpers and returns their ids; `note/[id]` returns the stored note row.

#### Scenario: Test routes answer 404 without the test flag
- **WHEN** the test routes are requested on a server started without `NOTES_ARCHIVE_TEST`
- **THEN** each answers 404 and changes nothing
- **proof:** unit

#### Scenario: Reset empties the archive
- **WHEN** notes, folders, tags and uploads exist and `reset` is called
- **THEN** `counts` reports 0 for notes, folders, tags, note_tags, images, files and notes_fts
- **proof:** e2e

#### Scenario: Seed returns the ids of what it inserted
- **WHEN** `seed` is called with two folders (the second inside the first) and three notes with bodies and tags
- **THEN** it returns two folder ids and three note ids in input order, and `storedNote` for each note returns its title, folder, tags and the derived body text
- **proof:** e2e

#### Scenario: Saves settle before a reload
- **WHEN** a test types into a note page and calls `settled()` from `watchSaves` before reloading
- **THEN** the reloaded page shows every typed character, repeated 10 times without a loss
- **proof:** e2e

### Requirement: Package tarball
`npm run package` SHALL build and write `dist/notes-archive-<version>.tgz` plus a `.sha256` file whose top level holds exactly `build`, `migrations`, `node_modules`, `package.json` and `package-lock.json`.

#### Scenario: Package produces a verifiable tarball
- **WHEN** `npm run package` runs
- **THEN** the tarball and its checksum exist, the checksum matches, and the top level holds exactly the five entries
- **proof:** unit

### Requirement: Harness declaration
`CLAUDE.md` SHALL declare `## Harness` with proof `npm run proof`, proof-full `npm run proof:full`, run `npm run dev` → http://localhost:5173, package `npm run package`, `ship: ask` and `release: none`, followed by the e2e conventions paragraph.

#### Scenario: Harness is declared in CLAUDE.md
- **WHEN** `CLAUDE.md` is read
- **THEN** its `## Harness` section lists proof, proof-full, run, package, `ship: ask` and `release: none` with those exact commands
- **proof:** unit

