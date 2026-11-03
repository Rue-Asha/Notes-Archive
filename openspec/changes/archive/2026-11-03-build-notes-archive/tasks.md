Build mode: parallel units in worktrees (build.md); builders never touch `tasks.md`, the orchestrator checks boxes after
each wave merge. Nothing leaves the machine in this change (`ship: ask`, no remote).

Waves (max 3 builders each): W1 U1 · W2 U2 ∥ U3 · W3 U4 ∥ U5 ∥ U6 · W4 U7 ∥ U8 ∥ U9 · W5 U10 ∥ U11 ∥ U12 ·
W6 U13 ∥ U14 ∥ U15 · W7 U16 ∥ U17 ∥ U18 · W8 U19 ∥ U20 ∥ U21 · W9 U22.

**⏸ Taste stop:** no unit that builds themed UI (U9, U11–U22) starts before task 4.6 is checked. U7 and U8 (server
only) run while the pause lasts; U9 in the same wave starts once 4.6 is ticked. Task 4.6 is evidence-only: the U4
builder stops after 4.5 and reports `needs-human`. The orchestrator ticks 4.6 after Rue's approval and, **in the same
commit**, records her picks (accent, glass strength, card style) in design.md → Look pick **and** replaces every
`[pick: accent]`, `[pick: glass]`, `[pick: card]` marker in `specs/**/spec.md` and in this file with the picked name. Revision rounds run
on U4's branch until then.

Every task (rules for every builder):
- **Fail-first.** A behaviour task writes its scenario tests first, named "Scenario: <title>" exactly as in the specs,
  from the THEN clauses, runs them and watches them fail for the right reason — an e2e scenario must fail against the
  missing UI, not only a unit test — then writes the code, runs proof, and commits once per task. Each task names its
  fail-first check; a task whose behaviour may already hold says so, and the builder reports it if the test is green
  at once.
- **Proof.** `proof` after each task; `PORT=<unit port> npm run proof:full` (in the background, read only the exit code
  and the tail) when the task touched e2e tests or the pages they walk. Before a bare `playwright test` in a fresh
  worktree run `npm run build` once and check that nothing listens on the unit port (`ss -ltn | rg :<port>`).
- **E2E.** Conventions in design.md → E2E conventions: one e2e file per task, owned by its unit; `reset()` first;
  `calm(page)` unless motion is under test; `watchSaves(page)` + `settled()` before every reload after an edit;
  stored data is asserted through `storedNote` / `counts` / a reload, never a mocked response; `page.route` only to
  simulate failures. A new e2e file runs with `--repeat-each 5` before its commit. A unit needing a new e2e helper adds
  it in its own test file, never in `e2e/helpers.ts`. Window globals are named per file.
- **UI.** Menus, popovers, sheets, dialogs and toasts with Svelte outro transitions use `hideOnOutro` (aria-hidden on
  outrostart). No raw colours, no `clip-path` or non-transform/opacity animation (U2's guard tests). Failures use the
  `error` toast tone (`--danger`); strings tests assert come from `src/lib/copy.ts`. Each UI unit ends with a
  **look walk** inside its budget: screenshots on its own port to `test-results/shots/U<n>-<project>-<slug>.png` at
  phone and desktop (and 1600 where noted), compared with the approved mockups, fixed before reporting.
- **Shared components** (`src/lib/ui/*`, `src/lib/shell/Toast.svelte`, `Dialog`, `Menu`, `Sheet`, `FolderPicker`,
  `EmojiPicker`) belong to U9; a later unit that needs a change to one reports it under `deviations` and the fix lands
  in U22 (or, if it blocks, in a separate commit listed under `deviations`). No two units of a wave edit one file.
- **Copying.** Files to copy are in design.md → Reference files; shapes in design.md → Contracts. vitest runs as
  `node_modules/.bin/vitest run <file>`. Each builder uses its own scratchpad subdir (`scratchpad/U<n>/`). No web
  requests except task 4.1; no npm installs except U1 and U3.

## 1. Establish the harness

> unit: depends=none · scope=S1 · files=package.json, package-lock.json, vite.config.ts, tsconfig.json, playwright.config.ts, .gitignore, src/app.html, src/app.d.ts, src/hooks.server.ts, src/routes/+layout.svelte, src/routes/(app)/+page.svelte, src/routes/healthz/+server.ts, src/routes/healthz/healthz.test.ts, src/lib/server/db.ts, src/lib/server/db.test.ts, src/lib/server/test-flag.ts, migrations/0001_images.sql, scripts/package.mjs, scripts/package.test.ts, scripts/server.test.ts, scripts/claude-md.test.ts, e2e/smoke.test.ts, CLAUDE.md, README.md

- [x] 1.1 Scaffold Kit 3 by copying Creative Archive's `package.json` (scripts `dev`, `build`, `preview`, `prepare`, `check` with `--fail-on-warnings`, `test:unit`, `test:e2e`, `proof`, `proof:full`, `package`; `imports` `#lib`/`#lib/*`; `engines.node >=22.18`; its devDependency ranges; no runtime deps yet), `vite.config.ts` (`test.include` `src/**/*.test.ts`, `scripts/**/*.test.ts`), `tsconfig.json`, `.gitignore` (+ `.e2e/`, `data/`, `dist/`, `test-results/`), `src/app.d.ts`, `src/app.html` (`lang="en"`, title "Notes Archive"), root `+layout.svelte` (sets `html[data-hydrated]` on mount), placeholder `src/routes/(app)/+page.svelte` (one empty `<div>`); name `notes-archive`, version `0.1.0`; `npm install` (`npm ls @sveltejs/kit` says 3.x), `npx playwright install chromium`. No behaviour; fail-first n/a (`proof` must run green on the scaffold once 1.2 adds a test).
- [x] 1.2 `db.ts` from Creative Archive (default `./data/notes-archive.db`, no `resetDb` yet) and `migrations/0001_images.sql` (design.md → Schema) with `db.test.ts`; fail-first: the tests red against an empty `db.ts` (Scenario: Fresh database gets the schema · Only new migrations run on an existing database)
- [x] 1.3 `hooks.server.ts` `init` opens the DB; `GET /healthz`; `test-flag.ts` on `NOTES_ARCHIVE_TEST`; fail-first: `healthz.test.ts` red before the route exists (Scenario: Healthy server answers 200 · Unreadable database answers 503)
- [x] 1.4 `playwright.config.ts` from Creative Archive (phone 390×844 touch, desktop 1280×800, `workers: 1`, `.e2e/$PORT.db` removed before start, `x-forwarded-proto`, env `NOTES_ARCHIVE_TEST=1`, `BODY_SIZE_LIMIT=17M`, `MOCKUP_PHOTOS_DIR=<repo>/fixtures/mockups`), `e2e/smoke.test.ts` opening `/` and waiting for `html[data-hydrated]` (freely named), `scripts/server.test.ts`; fail-first: `server.test.ts` red with a deliberately broken migration lookup, then fixed (Scenario: Failing migration stops the server · Server starts from any working directory)
- [x] 1.5 `scripts/package.mjs` + `scripts/package.test.ts` (name `notes-archive`; exact top-level entries); fail-first: the test red before `package.mjs` exists (Scenario: Package produces a verifiable tarball)
- [x] 1.6 `CLAUDE.md`: keep the planner's description and `## Harness`, add `- package: npm run package → dist/notes-archive-<version>.tgz + .sha256`, the Kit 3 note (no `svelte.config.js`, `#lib/...` imports with `.ts`) and Creative Archive's e2e paragraph adapted (`NOTES_ARCHIVE_TEST`, 17M, `MOCKUP_PHOTOS_DIR`, reset first, `watchSaves` before reloads, `calm`, `clientNav`); `scripts/claude-md.test.ts`; README (setup, dev with `NOTES_ARCHIVE_TEST=1` for the mockups, checks, env vars incl. `BODY_SIZE_LIMIT=17M`). Fail-first: `claude-md.test.ts` red before the package line. Run `proof:full` green, then once with a deliberately failing unit test and e2e test to see both exit non-zero, then revert (Scenario: Harness is declared in CLAUDE.md · Proof prints test names and passes · Proof fails on a failing check · Proof-full runs e2e on an isolated database · Each e2e test runs on phone and desktop)

## 2. Design system: tokens, glass, fonts, atoms, motion

> unit: depends=1 · scope=S2 · files=src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/tokens.test.ts, src/lib/styles/global.css, src/lib/styles/global.test.ts, src/lib/styles/prose.css, src/lib/styles/look.ts, src/lib/styles/guard.test.ts, src/lib/motion.ts, src/lib/motion.test.ts, static/fonts/*, src/app.html, src/hooks.server.ts, src/routes/+layout.svelte, src/lib/ui/GlassPanel.svelte, src/lib/ui/Button.svelte, src/lib/ui/ArrowButton.svelte, src/lib/ui/IconButton.svelte, src/lib/ui/Icon.svelte, src/lib/ui/Chip.svelte, src/lib/ui/Eyebrow.svelte, e2e/fonts.test.ts

Runs in parallel with U3: no imports from `types.ts` or `copy.ts`. Inputs: design.md → Visual brief (world, look
candidates, type, components, motion) and the five inspo images.

- [x] 2.1 `tokens.css` + `tokens.ts`: one light scheme, the three accent, glass and card blocks, danger set, six text colours, syntax tokens, radii / spacing / type / duration / easing; `look.ts` (`LOOK` provisional `{ accent: 'bronze', glass: 'clear', card: 'glass' }`, `lookAttrs(override?)`); fail-first: `tokens.test.ts` red on an empty `tokens.ts` (Scenario: Token set is complete · Text contrast meets AA)
- [x] 2.2 `global.css` (base type in Figtree, display headline with accent word, eyebrow, focus ring, `.glass` with the `@supports not (backdrop-filter …)` fallback, ambient accent-wash glows, `[data-accent]` / `[data-glass]` / `[data-card]` selectors); `hooks.server.ts` `transformPageChunk` writes `lookAttrs()` into `<html>` (`%look%` in `app.html`); fail-first: `global.test.ts` red before the rules exist (Scenario: Glass falls back to a solid surface · Text on glass meets AA)
- [x] 2.3 Fonts: copy Newsreader (normal + italic) + Figtree woff2 and both OFL files from Creative Archive, `@font-face` in `global.css`, preload in `app.html`, root `+layout.svelte` imports `global.css`; fail-first: `e2e/fonts.test.ts` red before the faces exist (Scenario: Display and text fonts load from the app)
- [x] 2.4 Atoms `GlassPanel`, `Button` (cta / secondary / ghost / danger, `arrow`), `ArrowButton`, `IconButton`, `Icon` (inline SVG map with every icon later units need: home, search, plus, folder, folder-open, chevron, tag, pin, more, trash, move, grip, image, file, link, bold, italic, strike, code, palette, arrow-right, close, check, sidebar, smile), `Chip`, `Eyebrow`; `prose.css` styling every block class in design.md → Node JSON shapes. No behaviour; their scenarios run on U4's components page; fail-first n/a
- [x] 2.5 `motion.ts` from Creative Archive (`noteName`, `stagger` 30 ms capped at 10, `hideOnOutro`, `reveal`) with freely named `motion.test.ts`; `guard.test.ts` over `src/**/*.svelte` and `src/**/*.css` except `tokens.css`; fail-first: add a temporary hex colour and a `transition: width` to a scratch component, see both scenarios red, remove them (Scenario: Components use no raw colours · Only transform and opacity animate)

## 3. Contract: types, schema, plain text, stubs, test routes, e2e helpers

> unit: depends=1 · scope=S1,S23 · files=package.json, package-lock.json, src/lib/types.ts, src/lib/copy.ts, src/lib/copy.test.ts, src/lib/errors.ts, src/lib/text.ts, src/lib/text.test.ts, migrations/0002_core.sql, src/lib/server/schema.test.ts, src/lib/server/db.ts, src/lib/server/plaintext.ts, src/lib/server/plaintext.test.ts, src/lib/server/search.ts, src/lib/server/search-index.test.ts, src/lib/server/notes.ts, src/lib/server/folders.ts, src/lib/server/tags.ts, src/lib/server/images.ts, src/lib/server/files.ts, src/lib/server/testing.ts, src/lib/server/testing.test.ts, src/lib/editor/context.ts, src/lib/editor/doc.ts, src/lib/editor/extensions.ts, src/lib/editor/core.ts, src/lib/editor/codeBlock.ts, src/lib/editor/blocks.ts, src/lib/editor/slash.ts, src/lib/editor/bubble.ts, src/lib/editor/handle.ts, src/lib/editor/media.ts, src/lib/editor/preview.ts, src/lib/notes/api.ts, src/lib/search/palette.svelte.ts, src/lib/shell/keyboard.svelte.ts, src/lib/folders/FolderTree.svelte, src/lib/notes/NoteProperties.svelte, src/lib/notes/NoteMenu.svelte, src/lib/search/CommandPalette.svelte, src/routes/(app)/+layout.svelte, src/routes/(app)/+layout.server.ts, src/routes/(app)/notes/[id]/+page.svelte, src/routes/(app)/folders/[id]/+page.svelte, src/routes/(app)/tags/[id]/+page.svelte, src/routes/(app)/search/+page.svelte, src/routes/__test/reset/+server.ts, src/routes/__test/seed/+server.ts, src/routes/__test/counts/+server.ts, src/routes/__test/note/[id]/+server.ts, src/routes/__test/test-routes.test.ts, e2e/helpers.ts, e2e/test-routes.test.ts

Runs in parallel with U2. Everything in design.md → Contracts marked real is real here; server functions are stubs
with final signatures returning typed empty defaults (`null`, `[]`, `0`, an empty tree), never throwing.

- [x] 3.1 Runtime deps with exact pins (`sharp`, the `@tiptap/*` list at `3.32.2`, `lowlight`; design.md → Stack); `types.ts`, `copy.ts` (with `count`), `errors.ts`, `text.ts` (`fold`, `foldSearch`: `ß`/`ẞ` → `ss`); fail-first: freely named `copy.test.ts` (plurals, both delete-folder messages) and `text.test.ts` ("Übung"/"übung", NFC, whitespace, `foldSearch("Straße")` = "Strasse", `"STRAẞE"` too) red before the modules exist
- [x] 3.2 `migrations/0002_core.sql` per design.md → Schema; `resetDb()` in `db.ts`; `testing.ts` (`useTestDb`, `seedArchive`, `testImage`); fail-first: freely named `schema.test.ts` (tables and indexes exist; folder → notes → images/files cascade; one cover per folder; deleting a note, also by cascade, removes its `notes_fts` row) and `testing.test.ts` red before the migration
- [x] 3.3 `plaintext.ts` (`plainText`, `snippet`, `isEmptyDoc`, `referencedUploads(doc)` → `{ images: Id[], files: Id[] }` from `image.id`, `linkPreview.imageId`, `fileCard.id`), `editor/doc.ts` (`docFromText`), `search.ts` `indexNote` (real, writes title, body and tag names through `foldSearch`), `tags.ts` `pruneTags` (real); fail-first: `plaintext.test.ts` and freely named `search-index.test.ts` (row holds title, body text and tag names with `ß` stored as `ss`; a second call rewrites it) red against empty modules, `plaintext.test.ts` also covers `referencedUploads` (nested in toggle and table, none → empty) (Scenario: Plain text walker extracts block text · Unknown nodes still index)
- [x] 3.4 Stubs with final signatures: `notes.ts`, `folders.ts`, `tags.ts` (rest), `images.ts`, `files.ts`, `search.ts` (`toMatchQuery` → `null`, `searchNotes` → `[]`); editor `context.ts`, `extensions.ts` (real composition), `core.ts` / `blocks.ts` / `slash.ts` / `bubble.ts` / `handle.ts` / `media.ts` / `preview.ts` factories returning `[]` (plus `blockSlashItems` / `mediaSlashItems` = `[]`), `codeBlock.ts` (plain `CodeBlockLowlight` with lowlight `common`); `notes/api.ts`, `palette.svelte.ts`, `keyboard.svelte.ts`; `(app)/+layout.server.ts` (real: `{ tree: getTree(), tags: listTags() }`, `depends('app:tree')`); placeholders — `(app)/+layout.svelte` (children only), the `notes/[id]`, `folders/[id]`, `tags/[id]` and `search` pages, `FolderTree`, `NoteProperties`, `NoteMenu`, `CommandPalette` (one empty element each, final props, no heading). No behaviour; fail-first n/a, `proof` green
- [x] 3.5 Test routes `reset`, `seed` (through `seedArchive`), `counts`, `note/[id]`, each behind `requireTestFlag()`; `e2e/helpers.ts` (`reset`, `seed`, `counts`, `storedNote`, `open`, `calm`, `photo`, `watchSaves`, `clientNav`); fail-first: `test-routes.test.ts` and `e2e/test-routes.test.ts` red before the routes exist (Scenario: Test routes answer 404 without the test flag · Reset empties the archive · Seed returns the ids of what it inserted · App is hydrated before tests interact)

## 4. Mockups, photos and the look checkpoint (⏸)

> unit: depends=2,3 · scope=S2,S3 · files=package.json, fixtures/mockups/*, scripts/synthetic-photo.mjs, scripts/synthetic-photo.test.ts, src/lib/mockups/fixtures.ts, src/lib/mockups/credits.test.ts, src/routes/__mockups/+layout.server.ts, src/routes/__mockups/+layout.svelte, src/routes/__mockups/mockups-guard.test.ts, src/routes/__mockups/photo/[name]/+server.ts, src/routes/__mockups/home/+page.svelte, src/routes/__mockups/folder/+page.svelte, src/routes/__mockups/note/+page.svelte, src/routes/__mockups/search/+page.svelte, src/routes/__mockups/drawer/+page.svelte, src/routes/__mockups/components/+page.svelte, src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/global.css, src/lib/styles/prose.css, src/lib/ui/*.svelte, e2e/mockups.test.ts, e2e/mockup-look.test.ts, e2e/components.test.ts

Inputs: design.md → Visual brief (screens, look candidates, motion, layout rule, Mobbin references) and all five
images in `/home/Rue/Pictures/UI-inspo/`. Further UI research only via the Mobbin MCP in a subagent, citing screens by
URL. Mockups are static markup over loose fixtures (`src/lib/mockups/fixtures.ts`), no server data. The mockup layout
applies `?accent=&glass=&card=` onto `<html>`, overriding `LOOK`. Budget: ~10 web fetches in 4.1, ~30 min look walk in 4.5.

- [x] 4.1 Mockup photos — the only web requests in the build, capped at about 10 fetches in total (searches + downloads). First the Openverse API (`https://api.openverse.org/v1/images/?q=<term>&license=cc0&page_size=20`; StockSnap results worked before) for architecture, interior, landscape and warm-stone folder covers; expect it to be down — then Wikimedia Commons (`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=<term>&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=2000&format=json`, keeping only files whose `LicenseShortName` is CC0 or Public domain). Keep 6–8 JPEGs in `fixtures/mockups/` (long side ≤ 2000 px), list each in `CREDITS.txt` in Creative Archive's format; a cover still missing is generated with `scripts/synthetic-photo.mjs` (copied from Creative Archive, warm stone / sand gradients) and credited as generated; nothing in `static/`. Fail-first: `credits.test.ts` and `synthetic-photo.test.ts` red on the empty folder (Scenario: Every mockup photo is credited · Missing photo is generated · Mockup photos stay out of the product)
- [x] 4.2 `/__mockups` layout guard (`requireTestFlag`), look override, `photo/[name]` from `MOCKUP_PHOTOS_DIR`, components page (atoms, CTA, eyebrow, chips, glass panels per strength over a photo and over the ground, the three card styles side by side); fail-first: `mockups-guard.test.ts` red before `+layout.server.ts`, the e2e red before the page (Scenario: Mockup routes are hidden without the test flag · Call to action is a dark pill with a round arrow · Eyebrow is small tracked uppercase · Switching the look is a data change)
- [x] 4.3 Screens `home`, `folder`, `note` (every block type in `prose.css` markup, slash menu and bubble toolbar shown open), `search` (palette with recent and results with marked snippets), `drawer` (phone) — desktop with the sidebar, phone with the bottom bar — per design.md → Visual brief → Screens; fail-first: `e2e/mockups.test.ts` red before the pages (Scenario: Mockups render the five screens · Pages load no external resources)
- [x] 4.4 Script `shots:mockups` (`npm run build && playwright test e2e/mockups.test.ts --reporter=list`) writing `test-results/shots/mockups/<project>-<screen>.png` with the default look after fonts and animations settle, plus desktop Home and note shots per accent, per glass strength and per card style for comparison (Scenario: Mockup screenshots are produced for both viewports)
- [x] 4.5 Look walk (~30 min): open every shot yourself, compare with the five inspo images and the brief (glass reads as glass on light, contrast, alignment, type rhythm, warmth), fix what the brief would reject, re-shoot, then stop and report `needs-human` with the screenshot paths and the switch URLs (`/__mockups/<screen>?accent=…&glass=…&card=…`, dev server with `NOTES_ARCHIVE_TEST=1`). No scenario; fail-first n/a
- [x] 4.6 ⏸ Rue approves the mockups — evidence-only; the builder never ticks it. The orchestrator ticks it after Rue's approval and, in the same commit, records her picks (accent, glass strength, card style) in design.md → Look pick and replaces every `[pick: …]` marker in `specs/**/spec.md` and `tasks.md` (Scenario: Rue approves the mockups)

## 5. Notes store (server)

> unit: depends=3 · scope=S9,S11,S12,S13,S14,S20,S23,S27 · files=src/lib/server/notes.ts, src/lib/server/notes.test.ts, src/lib/server/notes-list.test.ts, src/routes/api/notes/+server.ts, src/routes/api/notes/[id]/+server.ts, src/routes/api/notes/[id]/discard/+server.ts, src/routes/api/notes/notes-api.test.ts

Runs in parallel with U6: `setNoteTags` is still a stub — don't assert tags through `updateNote` here; tag rows for
tests come from `seedArchive`.

- [x] 5.1 `createNote`, `getNote`, `updateNote` (title, icon, content → `body_text` via `plainText`, folder, pin, `updated_at` rule, `indexNote`, tags delegated to `setNoteTags`; when `content` changes, delete the note's `images` / `files` rows that `referencedUploads` finds in the stored body but not in the new one, in the same transaction); fail-first: `notes.test.ts` red against the stubs (Scenario: Removed uploads are marked on save, not deleted · Uploads still in the body survive a save · Uploads never saved are left alone · Server creates notes at the root or in a folder · Server update derives the body text and bumps the edit time · Note content round-trips as ProseMirror JSON · Server moves a note and bumps its edit time)
- [x] 5.2 `deleteNote` (returns `folderId`, `pruneTags`) and `discardIfEmpty`; fail-first: tests red against the stubs (Scenario: Server delete removes tag links, uploads and the index row · Server discards only empty notes)
- [x] 5.3 `listNotes`, `listRecent`, `listPinned` mapping to `NoteCard` (snippet on read, tags in chip order); fail-first: `notes-list.test.ts` red against the stubs, plus freely named tests (recent = 8 newest; `listNotes` direct children only) (Scenario: Snippet skips a leading image · Server orders pinned notes by pin time)
- [x] 5.4 `POST /api/notes`, `PATCH` / `DELETE /api/notes/[id]` (404 `{ error: 'deleted' }`, `ValidationError` → 400), `POST /api/notes/[id]/discard`; fail-first: freely named `notes-api.test.ts` (status codes and JSON shapes from design.md → Routes) red before the routes

## 6. Folders and tags store (server)

> unit: depends=3 · scope=S24,S25,S28,S29,S30 · files=src/lib/server/folders.ts, src/lib/server/folders.test.ts, src/lib/server/tree.test.ts, src/lib/server/tags.ts, src/lib/server/tags.test.ts, src/routes/api/folders/+server.ts, src/routes/api/folders/[id]/+server.ts, src/routes/api/folders/folders-api.test.ts

Runs in parallel with U5: note rows through `seedArchive` or plain SQL, never through `notes.ts`.

- [x] 6.1 `createFolder`, `renameFolder`, `moveFolder`, `getFolder`, `breadcrumb`; fail-first: `folders.test.ts` red against the stubs (Scenario: Blank names become Untitled folder · Duplicate sibling names are allowed · Server refuses moving a folder into its own descendant)
- [x] 6.2 `deleteFolder` (recursive CTE, one transaction, `pruneTags`) and `folderCounts`; fail-first: test red against the stub (Scenario: Server folder delete removes descendants, notes and uploads)
- [x] 6.3 `getTree` and `listFolderTiles` (`noteCount` including descendants, `Intl.Collator` order); fail-first: freely named `tree.test.ts` (nesting, notes per folder by last edited, root notes, untitled notes keep `''`) red against the stubs
- [x] 6.4 `setNoteTags` (fold, first spelling wins, blanks and duplicates ignored, chip order, prune, `indexNote`), `listTags`, `getTag`; fail-first: `tags.test.ts` red against the stubs (Scenario: Tag names are unique ignoring case and umlauts · Whitespace-only and duplicate tags are ignored · Unused tags disappear · Tag counts include only notes using them)
- [x] 6.5 `POST /api/folders`, `GET` / `PATCH` / `DELETE /api/folders/[id]` (400 on a move into itself or a descendant); fail-first: freely named `folders-api.test.ts` red before the routes

## 7. Uploads (server): images, files and folder covers

> unit: depends=3 · scope=S20,S21,S26 · files=src/lib/server/images.ts, src/lib/server/images.test.ts, src/lib/server/files.ts, src/lib/server/files.test.ts, src/routes/images/[id]/+server.ts, src/routes/files/[id]/+server.ts, src/routes/api/notes/[id]/images/+server.ts, src/routes/api/notes/[id]/files/+server.ts, src/routes/api/folders/[id]/cover/+server.ts, src/routes/uploads.test.ts

Server only; may run during the ⏸ pause. Test images are generated with sharp in the test.

- [x] 7.1 `storeImage` from Creative Archive (format list, WebP, owner columns, `maxSide` default 2400), `getImage`, `setFolderCover`, `removeFolderCover`; fail-first: `images.test.ts` red against the stubs (Scenario: Uploaded image is stored as WebP · Server replaces covers and stores them as WebP)
- [x] 7.2 `storeFile`, `getFile` (bytes as-is, name kept, 16 MiB); fail-first: freely named `files.test.ts` red against the stubs
- [x] 7.3 `GET /images/[id]` (from Creative Archive) and `GET /files/[id]` (inline safe list, attachment otherwise and for `?download=1`, `nosniff`, `CSP: sandbox`, `filename*=UTF-8''`); fail-first: `uploads.test.ts` cases red before the routes (Scenario: Image is served with caching headers · Files are served safely with a download fallback)
- [x] 7.4 `POST /api/notes/[id]/images`, `POST /api/notes/[id]/files` (`x-filename`), `PUT` / `DELETE /api/folders/[id]/cover` (413 / 415 / 404 shapes from design.md → Routes); then `npm run package` and check the tarball holds `node_modules/@img/sharp-linux-x64`; fail-first: `uploads.test.ts` cases red before the routes (Scenario: Server refuses oversized and non-image uploads · Server stores files as-is with their names)

## 8. Search (server)

> unit: depends=3,5,6 · scope=S31,S33 · files=src/lib/server/search.ts, src/lib/server/search.test.ts, src/lib/server/search-filters.test.ts, src/routes/api/search/+server.ts, src/routes/api/search/search-api.test.ts

Server only; may run during the ⏸ pause. `indexNote` (U3) stays as it is; it already folds `ß`.

- [x] 8.1 `toMatchQuery` (tokens through `foldSearch`) and `searchNotes` with a query (bm25 weights 10/1/5, prefix tokens, AND); fail-first: `search.test.ts` red against the stubs (Scenario: Search finds notes by title, body and tag · Prefix matches while typing · Search ignores diacritics · Search treats ß as ss · Search ignores case including umlauts · Title matches rank first · Special characters never cause an error · Empty query returns no results)
- [x] 8.2 Snippet parts from `snippet()` with the `char(2)` / `char(3)` sentinels, mapped back onto the original `body_text` (find the folded snippet in `foldSearch(body_text)`, map offsets with a prefix table, fall back to the folded text if not found), and the index following real writes (`updateNote`, `setNoteTags`); fail-first: tests red before the parts split (Scenario: Snippet keeps the original ß · Snippet highlights the match · Search reflects edits on save)
- [x] 8.3 Filters (folder subtree via recursive CTE, tag) with and without a query; `GET /api/search` (`recent` = `listRecent(8)` when q and filters are empty); fail-first: `search-filters.test.ts` and freely named `search-api.test.ts` red before the code (Scenario: Server filters without a query by folder subtree and tag)

## 9. UI primitives and the picked look

> unit: depends=3,4 · scope=S2,S11 · files=src/lib/styles/look.ts, src/lib/shell/Toast.svelte, src/lib/shell/toast.ts, src/lib/shell/toast.test.ts, src/routes/+layout.svelte, src/lib/ui/Dialog.svelte, src/lib/ui/Menu.svelte, src/lib/ui/Sheet.svelte, src/lib/ui/FolderPicker.svelte, src/lib/ui/folderPicker.ts, src/lib/ui/folderPicker.test.ts, src/lib/ui/EmojiPicker.svelte, src/lib/ui/emoji.ts, src/lib/ui/emoji.test.ts, src/routes/__mockups/primitives/+page.svelte, e2e/look.test.ts, e2e/primitives.test.ts

Themed UI: needs 4.6 checked. Owns the shared primitives (rules above). Components follow the approved mockups.

- [x] 9.1 `LOOK` = design.md → Look pick, "provisional" comment dropped; fail-first: `e2e/look.test.ts` red with the provisional values (if the pick equals the provisional default, say so in the report) (Scenario: The app uses the picked look)
- [x] 9.2 `toast.ts` (queue, `tone`) + `Toast.svelte` (`role="status"`, error tone in `--danger`, `fadeSlide` + `hideOnOutro`, auto-hide 4 s) mounted in the root `+layout.svelte`; fail-first: freely named `toast.test.ts` red before `toast.ts`
- [x] 9.3 `Dialog` (focus trap, Escape cancels, `danger` confirm), `Menu` (`role="menu"`, arrow keys, Escape, disabled items), `Sheet` (left / bottom / full, Escape, history back via `pushState` / `popstate`, `hideOnOutro`), specimen page `/__mockups/primitives`; fail-first: freely named `e2e/primitives.test.ts` (dialog traps focus and cancels on Escape; menu keys skip disabled items; sheet closes on back) red before the components
- [x] 9.4 `FolderPicker` (tree with "Root", `exclude` subtree hidden; `folderPicker.ts` `pickable(tree, exclude)`) and `EmojiPicker` (curated ~240 emoji in `emoji.ts`, keyword search, "Remove", full-width sheet on phone); fail-first: freely named `folderPicker.test.ts` and `emoji.test.ts` ("book" → 📚) red before the modules

## 10. Link preview (server)

> unit: depends=7 · scope=S22 · files=src/lib/server/net.ts, src/lib/server/net.test.ts, src/lib/server/remote.ts, src/lib/server/remote.test.ts, src/lib/server/fake/remote.ts, src/lib/server/fake/pages.ts, src/lib/server/preview.ts, src/lib/server/preview.test.ts, src/routes/api/preview/+server.ts, src/routes/__test/image/[name]/+server.ts

Tests use a `node:http` server bound to `127.0.0.2` exempted via `allowAddresses`, an injected `lookup`, and a short
`timeoutMs` where noted (as Creative Archive).

- [x] 10.1 `net.ts` `safeFetch` + `isBlockedAddress` from Creative Archive; fail-first: `net.test.ts` red against an empty module (Scenario: Only http and https URLs are fetched · Private addresses are refused · Hostname resolving to a private address is refused · Redirect to a private address is refused · Slow page times out · Oversized page is cut at 1 MB)
- [x] 10.2 `remote.ts` (`getRemote()`: fake when `testFlag()`; real `fetchPage` 1 MB `text/html` only, `fetchImage` 16 MB `image/*` only, User-Agent `Notes-Archive/<version> (private archive)`), `fake/remote.ts` + `fake/pages.ts` with the canned pages in design.md → Link preview, `/__test/image/[name]`; fail-first: freely named `remote.test.ts` (test mode uses the fake; production never) red before the switch
- [x] 10.3 `parsePreview` (regex over meta / title, entities decoded, relative URLs resolved); fail-first: tests red against the stub (Scenario: Open Graph tags fill the preview · Page without Open Graph falls back to its title)
- [x] 10.4 `readPreview(url, noteId)` (IP-literal private hosts refused before the remote, domain-only on any failure, image via `storeImage(bytes, { noteId }, 1600)`) and `POST /api/preview`; fail-first: tests red before `readPreview` (Scenario: Non-HTML page gives no preview · Preview image is stored and never hotlinked)

## 11. App shell: layout, sidebar, bottom bar, drawer and transitions

> unit: depends=5,6,9 · scope=S4,S5,S7,S9,S30 · files=src/routes/(app)/+layout.svelte, src/lib/shell/Sidebar.svelte, src/lib/shell/BottomBar.svelte, src/lib/shell/Drawer.svelte, src/lib/shell/TagsSection.svelte, src/lib/shell/sidebar.ts, src/lib/shell/sidebar.test.ts, src/lib/shell/morph.ts, src/lib/shell/morph.test.ts, e2e/sidebar.test.ts, e2e/sidebar-collapse.test.ts, e2e/bottom-bar.test.ts, e2e/drawer.test.ts, e2e/tags-section.test.ts, e2e/transitions.test.ts

Themed UI: needs 4.6 checked. The tree is U3's empty `FolderTree` (U13 fills it; the Folders section renders only its
heading and mounts `FolderTree`, which brings its own "New folder" action). Search buttons call `openPalette()`; the
palette is U3's placeholder (U18). The phone keyboard behaviour of the bottom bar is U16's.

- [x] 11.1 `(app)/+layout.svelte`: content area per design.md → Layout rule, `Sidebar` (≥ 1024 px, glass, Home, Search, New note via `newNote()`, Folders heading + `FolderTree`, `TagsSection` slot), `CommandPalette` mounted; fail-first: `e2e/sidebar.test.ts` red on the placeholder layout (Scenario: Desktop shows the glass sidebar)
- [x] 11.2 Collapse to the 64 px icon rail, remembered in `localStorage` (`sidebar.ts`, reads and writes in try/catch, freely named test); fail-first: `e2e/sidebar-collapse.test.ts` red before the toggle (Scenario: Collapsed sidebar stays collapsed after reload)
- [x] 11.3 `BottomBar` (< 1024 px: Home, Search, + New note as the dark round button, Folders) and `Drawer` (`Sheet` left holding `FolderTree`, closes on `afterNavigate`); fail-first: `e2e/bottom-bar.test.ts` and `e2e/drawer.test.ts` red before the components (Scenario: Phone shows the bottom bar · Folders opens the tree in a drawer · Escape or back closes the drawer · New note from the sidebar or bottom bar opens a root note)
- [x] 11.4 `TagsSection` from `page.data.tags`; fail-first: `e2e/tags-section.test.ts` red before it (Scenario: Sidebar lists tags with counts · Tags section is hidden without tags)
- [x] 11.5 `morph.ts` (`morphTarget`, `pageTransition` naming `[data-morph="note-<id>"]` on both sides) wired into `onNavigate`, root fade + 8 px slide, reduced motion ≤ 120 ms fade; fail-first: freely named `morph.test.ts` and `e2e/transitions.test.ts` red before the wiring (Scenario: Other navigations fade · Reduced motion uses a short fade · Browser without View Transitions navigates plainly)
- [x] 11.6 Look walk (~20 min): sidebar, collapsed rail, bottom bar and drawer at phone, 1100 and 1280 against the approved mockups. No scenario; fail-first n/a

## 12. Note page, editor core and autosave

> unit: depends=5,9 · scope=S6,S7,S9,S10,S11,S15,S23 · files=src/routes/(app)/notes/[id]/+page.svelte, src/routes/(app)/notes/[id]/+page.server.ts, src/lib/notes/NoteHeader.svelte, src/lib/notes/NoteTitle.svelte, src/lib/notes/NoteIcon.svelte, src/lib/notes/SaveStatus.svelte, src/lib/notes/autosave.ts, src/lib/notes/autosave.test.ts, src/lib/notes/discard.ts, src/lib/editor/Editor.svelte, src/lib/editor/core.ts, src/lib/editor/sanitize.ts, src/lib/editor/sanitize.test.ts, e2e/note-page.test.ts, e2e/note-icon.test.ts, e2e/autosave.test.ts, e2e/autosave-errors.test.ts, e2e/discard.test.ts, e2e/shortcuts.test.ts

Themed UI: needs 4.6 checked. Runs in parallel with U11: there is no sidebar yet, so tests leave a page with
`clientNav`, open notes created through `POST /api/notes` or `seed`, and compute the note column's centre against the
sidebar's right edge when a sidebar exists (0 otherwise). Mount U3's `NoteProperties` / `NoteMenu` placeholders with
their final props. The header root carries `data-morph="note-<id>"`. Research.md → Editor spike is binding.

- [x] 12.1 Route + load (404 for a missing note), `NoteHeader` (icon slot, `NoteTitle` as an auto-growing textarea labelled "Title" with the "Untitled" placeholder, focused when the note is empty; tab title `<title or Untitled> · Notes Archive`), placeholders mounted, `Editor.svelte` (vanilla `Editor` in `onMount`, `$state.raw` + version counter, `data-editor-root`, `softKeyboard.open` on focus / blur under `(pointer: coarse)`), `core.ts` (design.md → Editor), `sanitize.ts` with freely named `sanitize.test.ts`; fail-first: `e2e/note-page.test.ts` red on the placeholder page (Scenario: Note page shows icon, title and body · Opening a new empty note focuses the title · Untitled note's tab title reads Untitled · Very long title wraps · Unknown blocks render as text)
- [x] 12.2 `NoteIcon` ("Add icon", click to change, "Remove") with `EmojiPicker`; fail-first: `e2e/note-icon.test.ts` red before it (Scenario: Pick, change and remove the note icon · Emoji picker is usable on phone)
- [x] 12.3 `autosave.ts` (design.md → Autosave) with freely named `autosave.test.ts` (fake timers: merge, debounce, one request in flight, discrete fields at once, retry, deleted), `SaveStatus` (`[data-save-state]`, "Saving…" / "Saved"), wiring incl. `beforeNavigate` flush and `invalidate('app:tree')`; fail-first: `e2e/autosave.test.ts` red before the wiring (Scenario: Typing saves automatically · Leaving flushes a pending save · Saves settle before a reload · Last write wins between two tabs)
- [x] 12.4 Failure paths: error state + `COPY.saveFailed` toast once, retry on next change or a click on the status, `deleted` notice (`role="alert"`, `COPY.noteDeleted`); fail-first: `e2e/autosave-errors.test.ts` red before them (Scenario: Failed save shows a toast and keeps the content · Unreachable server retries on the next change · Deleted note shows a notice on its next save)
- [x] 12.5 `discard.ts` (`beforeNavigate` → `POST /api/notes/[id]/discard` when empty; `pagehide` → `sendBeacon`); fail-first: `e2e/discard.test.ts` red before it (Scenario: Empty new note is discarded on leaving · Note with only a title is kept)
- [x] 12.6 Shortcuts, quiet editor and the reading column (720 px, centred); fail-first: `e2e/shortcuts.test.ts` red where core config is missing (e.g. `[] `, Cmd/Ctrl+E) — the parts StarterKit already covers may be green at once, report which (Scenario: Markdown shortcuts turn into blocks · Keyboard marks and undo · Shortcuts do not fire inside code blocks · Typing in the editor runs no animations · Note column is capped and centred on wide screens). Look walk (~20 min): note page at phone, 1280 and 1600 against the note mockup

## 13. Folder tree and folder actions

> unit: depends=6,9,11 · scope=S4,S5,S9,S10,S24,S28 · files=src/lib/folders/FolderTree.svelte, src/lib/folders/TreeRow.svelte, src/lib/folders/FolderMenu.svelte, src/lib/folders/DeleteFolder.svelte, src/lib/folders/tree.ts, src/lib/folders/tree.test.ts, e2e/tree.test.ts, e2e/tree-edges.test.ts, e2e/folder-create.test.ts, e2e/folder-rename-move.test.ts, e2e/folder-delete.test.ts

Themed UI: needs 4.6 checked. `FolderTree` renders in U11's Sidebar and Drawer; it owns the Folders section's
"New folder" action and the empty state. Writes call `invalidate('app:tree')`.

- [x] 13.1 `FolderTree` + `TreeRow`: expand / collapse (in memory; ancestors of the current item expanded), `aria-current="page"`, note rows with "Untitled", `tree.ts` (`indentLevel` capped at 6, `ancestorsOf`) with freely named tests; fail-first: `e2e/tree.test.ts` red on the placeholder (Scenario: Tree shows folders with their sub-folders and notes · Current item is highlighted in the tree · Untitled note in the tree reads Untitled)
- [x] 13.2 Empty state, truncation with `title`, indent cap, and the drawer path; fail-first: `e2e/tree-edges.test.ts` red before them (the drawer case is red because the placeholder tree has no rows) (Scenario: Empty tree offers New folder · Long names truncate with a tooltip · Deep nesting caps the indent · Choosing a tree item closes the drawer)
- [x] 13.3 `FolderMenu` (New note, New folder, Rename, Move to…, Delete) and the section's "New folder" — a new folder opens in inline rename; fail-first: `e2e/folder-create.test.ts` red before them (Scenario: Create a folder at the root · Create a folder inside a folder · New note from a folder's menu lands in that folder)
- [x] 13.4 Inline rename (Enter saves, Escape cancels, blank → "Untitled folder") and Move to… with `FolderPicker`; fail-first: `e2e/folder-rename-move.test.ts` red before them (Scenario: Rename a folder inline in the tree · Move a folder with Move to · Move to excludes the folder and its descendants)
- [x] 13.5 `DeleteFolder` (`Dialog`, counts from `GET /api/folders/[id]`, `COPY.deleteFolder`, navigate to the parent when the open note or folder is inside); fail-first: `e2e/folder-delete.test.ts` red before it (Scenario: Deleting a folder asks with counts · Empty folder asks without counts · Cancelled folder delete keeps everything · Deleting the folder of the open note navigates to its parent)
- [x] 13.6 Look walk (~15 min): tree in the sidebar and the drawer against the mockups. No scenario; fail-first n/a

## 14. Note cards, folder tiles, folder page body and tag pages

> unit: depends=5,6,9,11,12 · scope=S7,S8,S10,S12,S13,S14,S25,S27,S30 · files=src/lib/notes/NoteCard.svelte, src/lib/notes/CardMenu.svelte, src/lib/notes/NoteGrid.svelte, src/lib/notes/time.ts, src/lib/notes/time.test.ts, src/lib/folders/FolderTile.svelte, src/lib/folders/FolderGrid.svelte, src/routes/(app)/folders/[id]/+page.svelte, src/routes/(app)/folders/[id]/+page.server.ts, src/routes/(app)/tags/[id]/+page.svelte, src/routes/(app)/tags/[id]/+page.server.ts, e2e/cards.test.ts, e2e/folder-body.test.ts, e2e/tag-page.test.ts, e2e/card-menu.test.ts, e2e/morph.test.ts

Themed UI: needs 4.6 checked. Card style `glass`. The folder page here is its body only (load, sub-folder
tiles, note grid); breadcrumb, header, cover and actions are U20's. `NoteCard` carries `data-morph="note-<id>"` and
takes optional `parts` (search snippets, U18).

- [x] 14.1 `time.ts` (`relativeTime`), `NoteCard` (icon, title / "Untitled", 3-line snippet / "Empty note", 3 chips + "+n", time, pin marker), `NoteGrid`, folder page load (404, `listFolderTiles`, `listNotes`) with the note grid; fail-first: `time.test.ts` and `e2e/cards.test.ts` red before them (Scenario: Edited time reads relative · Note card shows its parts · Card shows at most three tags and +n · Note without text shows Empty note · Untitled note card reads Untitled)
- [x] 14.2 `FolderTile` (cover image or typographic warm tint, name, `COPY.noteCount`) and `FolderGrid` on the folder page; fail-first: `e2e/folder-body.test.ts` red before them (Scenario: Folder page shows sub-folders and notes by last edited · Folder without a cover shows a typographic tile)
- [x] 14.3 Tag page (`getTag` 404, title, `listNotes({ tagId })`); fail-first: `e2e/tag-page.test.ts` red on the placeholder (Scenario: Tag page lists its notes by last edited)
- [x] 14.4 `CardMenu` (Pin / Unpin via `patchNote`, Move to… via `FolderPicker`, Delete via `Dialog` with `COPY.deleteNote`; `invalidateAll()` + `invalidate('app:tree')`); fail-first: `e2e/card-menu.test.ts` red before it (Scenario: Pin from a card menu · Move a note from its card · Delete a note from its card)
- [x] 14.5 Motion on cards: `data-morph`, `reveal` + `stagger`, hover glow layer (fine pointer, opacity only); fail-first: `e2e/morph.test.ts` red before the attributes (Scenario: Note card morphs into the note page · Back from a note reverses the morph · Reduced motion skips the morph · Cards stagger in · Reduced motion shows lists at once · Glass cards glow on hover)
- [x] 14.6 Look walk (~20 min): folder page body and tag page at phone and 1280 against the folder mockup. No scenario; fail-first n/a

## 15. Editor menus: slash menu, bubble toolbar, block handle

> unit: depends=12 · scope=S7,S15,S16,S17,S18 · files=src/lib/editor/slash.ts, src/lib/editor/SlashMenu.svelte, src/lib/editor/bubble.ts, src/lib/editor/BubbleToolbar.svelte, src/lib/editor/LinkField.svelte, src/lib/editor/handle.ts, src/lib/editor/BlockMenu.svelte, src/lib/editor/blockOps.ts, src/lib/editor/blockOps.test.ts, src/lib/editor/floating.ts, e2e/slash.test.ts, e2e/slash-phone.test.ts, e2e/bubble.test.ts, e2e/bubble-link.test.ts, e2e/handle.test.ts, e2e/block-menu.test.ts

Themed UI: needs 4.6 checked. Each module builds its floating element and mounts its Svelte component before the
extension is configured (design.md → Editor mount). Core slash items: Text, Heading 1–3, Bullet list, Numbered list,
Task list, Quote, Code, Divider; `blockSlashItems` and `mediaSlashItems` are appended (still `[]` here). Turn into
offers callout only when `editor.can()` has the command (U17).

- [x] 15.1 `slash.ts` on `@tiptap/suggestion` (`/` at block start or after a space, `allowSpaces: false`, fold filter on label + keywords) and `SlashMenu` (listbox, arrows, Enter, Escape, "No results"); fail-first: `e2e/slash.test.ts` red against the stub (Scenario: Slash opens the block menu at a block start or after a space · Typing filters the slash menu · Arrow keys and Enter choose a block · Escape closes the slash menu and keeps the text · Space with no match closes the slash menu)
- [x] 15.2 `floating.ts` placement against `visualViewport` and the menus' open animation (fade + 4 px rise ≤ 160 ms, none under reduced motion); fail-first: `e2e/slash-phone.test.ts` red before them (Scenario: Slash menu stays within the visible viewport on phone · Editor menus open with a short animation)
- [x] 15.3 `bubble.ts` (BubbleMenu, shown for non-empty text selections outside code blocks, placement bottom on touch) and `BubbleToolbar` (marks with pressed state, colour palette + Default via `data-color`); fail-first: `e2e/bubble.test.ts` red against the stub (Scenario: Selecting text shows the bubble toolbar · Bubble toolbar applies marks · Text colour from the palette · Bubble toolbar is hidden in code blocks · On touch the toolbar sits below the selection)
- [x] 15.4 `LinkField` (add, edit, remove) and Mod-k with a selection (`preventDefault`); fail-first: `e2e/bubble-link.test.ts` red before them (Scenario: Add, edit and remove a link · Cmd or Ctrl+K on a selection edits the link)
- [x] 15.5 `blockOps.ts` (`moveBlock` over `@tiptap/pm` docs) and `handle.ts` (DragHandle on desktop with the drop indicator; on touch the handle sits at the cursor's block); fail-first: `blockOps.test.ts` and `e2e/handle.test.ts` red against the stubs (Scenario: Moving blocks is a pure document transform · Hovering a block shows the handle · Dragging the handle moves the block)
- [x] 15.6 `BlockMenu` (Move up / down with edge disabling, Turn into, Delete); fail-first: `e2e/block-menu.test.ts` red before it (Scenario: Block menu moves a block up and down · First and last blocks can't move past the edge · Turn a block into another type · Delete a block from the block menu · Tapping the handle on phone opens the block menu). Look walk (~20 min): menus against the note mockup on phone and desktop

## 16. Note properties, note menu and the bottom bar while typing

> unit: depends=6,9,11,12,13 · scope=S5,S11,S13,S14,S27,S29 · files=src/lib/notes/NoteProperties.svelte, src/lib/notes/NoteMenu.svelte, src/lib/notes/FolderField.svelte, src/lib/notes/TagInput.svelte, src/lib/notes/tagInput.ts, src/lib/notes/tagInput.test.ts, src/lib/shell/BottomBar.svelte, e2e/properties-pin.test.ts, e2e/tag-input.test.ts, e2e/move-note.test.ts, e2e/note-delete.test.ts, e2e/bottom-bar-typing.test.ts

Themed UI: needs 4.6 checked. Properties and menu changes go through the note page's `onchange(patch)` (autosave,
discrete fields at once). `BottomBar.svelte` is edited only here in this wave.

- [x] 16.1 `NoteProperties` row (Folder, Tags, Pinned in small glass chips) with the Pinned switch; fail-first: `e2e/properties-pin.test.ts` red on the placeholder (Scenario: Pin from the properties row)
- [x] 16.2 `TagInput` from Creative Archive + `tagInput.ts` (fold-matched suggestions from `page.data.tags`, Enter / comma add, Backspace removes the last chip) with freely named tests; fail-first: `e2e/tag-input.test.ts` red before it (Scenario: Add tags with Enter and comma · Autocomplete suggests existing tags ignoring case · Backspace on an empty input removes the last chip · Typing a new name creates a tag)
- [x] 16.3 `FolderField` with `FolderPicker`; fail-first: `e2e/move-note.test.ts` red before it (Scenario: Move a note from its properties row)
- [x] 16.4 `NoteMenu` (Pin / Unpin, Move to…, Delete → `Dialog` with `COPY.deleteNote` → `deleteNoteRequest` → `/folders/<id>` or `/`); fail-first: `e2e/note-delete.test.ts` red on the placeholder (Scenario: Deleting the open note asks first and lands on its folder · Cancelled note delete keeps everything)
- [x] 16.5 `BottomBar` hides (`aria-hidden`, translated out) while `softKeyboard.open`; fail-first: `e2e/bottom-bar-typing.test.ts` red before the change (Scenario: Bottom bar hides while typing in the editor). Look walk (~15 min): properties row and note menu against the note mockup

## 17. Extra blocks: toggle, callout, code, table, task list

> unit: depends=12,15 · scope=S18,S19 · files=src/lib/editor/blocks.ts, src/lib/editor/callout.ts, src/lib/editor/codeBlock.ts, src/lib/editor/languages.ts, src/lib/editor/TableMenu.svelte, e2e/blocks-slash.test.ts, e2e/toggle.test.ts, e2e/callout.test.ts, e2e/code-block.test.ts, e2e/table.test.ts, e2e/task-list.test.ts

Themed UI: needs 4.6 checked. Node shapes and classes in design.md → Node JSON shapes; styles from `prose.css`.

- [x] 17.1 `blocks.ts`: Details (`persist: false`), `callout` node, TableKit (`resizable: false`); `blockSlashItems` (Toggle, Callout, Table with a header row); fail-first: `e2e/blocks-slash.test.ts` red against the stub (Scenario: Slash menu inserts toggle, callout and table)
- [x] 17.2 Toggle behaviour and nesting; fail-first: `e2e/toggle.test.ts` red before the details node renders (Scenario: Toggle opens and closes and doesn't save its state · Nested lists and toggles inside toggles work)
- [x] 17.3 `callout.ts` node view (emoji button with `EmojiPicker`, `--accent-wash` panel), Turn into → Callout command; fail-first: `e2e/callout.test.ts` red before the node view (Scenario: Callout shows an emoji and a tinted panel)
- [x] 17.4 `codeBlock.ts` language picker node view + `languages.ts` (subset of lowlight `common` with labels); fail-first: `e2e/code-block.test.ts` red on the stub (Scenario: Code block highlights syntax and switches language)
- [x] 17.5 `TableMenu` (glass menu when the cursor is in a table: Add row below, Add column right, Delete row, Delete column), `div.table-scroll` wrapper; fail-first: `e2e/table.test.ts` red before it (Scenario: Table adds and removes rows and columns · Wide table scrolls inside its block on phone)
- [x] 17.6 Task list persistence and toggle drag — behaviour may already hold (TaskItem from U12, DragHandle from U15); write the tests first and report if green at once (Scenario: Task checkbox persists after reload · Dragging a toggle moves its content). Look walk (~15 min): every block against the note mockup

## 18. Command palette and search page

> unit: depends=8,11,14 · scope=S31,S32,S33 · files=src/lib/search/CommandPalette.svelte, src/lib/search/Highlight.svelte, src/lib/search/SearchFilters.svelte, src/lib/search/query.ts, src/lib/search/query.test.ts, src/routes/(app)/search/+page.svelte, src/routes/(app)/search/+page.server.ts, e2e/palette.test.ts, e2e/palette-results.test.ts, e2e/palette-actions.test.ts, e2e/palette-editor.test.ts, e2e/search-page.test.ts

Themed UI: needs 4.6 checked. Mobbin: Loop, Pitch, v0 palettes (design.md). Snippets render only through
`Highlight` (text + `mark`), never as HTML.

- [x] 18.1 `CommandPalette`: opens on `palette.open` and on Mod-k (ignoring `defaultPrevented`), centred glass on desktop, `Sheet` full on phone, input, "Recent" from `/api/search`; fail-first: `e2e/palette.test.ts` red on the placeholder (Scenario: Cmd or Ctrl+K opens the palette anywhere · Search buttons open the palette · Empty palette shows recent notes · Palette is full-screen on phone)
- [x] 18.2 Results (debounced, aborted on change) with `Highlight`, keys, Escape, "No notes match"; fail-first: `e2e/palette-results.test.ts` red before them (Scenario: Typing shows results with highlighted snippets · No hits shows No notes match · Arrow keys and Enter open a result · Escape closes the palette)
- [x] 18.3 Actions "New note", "New folder" (root "Untitled folder", then its page) and "See all results"; fail-first: `e2e/palette-actions.test.ts` red before them (Scenario: Palette offers New note and New folder · See all results opens the search page)
- [x] 18.4 Focus and selection restore on close; fail-first: `e2e/palette-editor.test.ts` red before the restore (Scenario: Palette keeps the editor's selection and content)
- [x] 18.5 Search page: `query.ts` (URL ⇄ `SearchQuery`, freely named tests), load via `searchNotes`, `SearchFilters` (folder from the tree, tag), cards with `parts`; filter changes push history; fail-first: `e2e/search-page.test.ts` red on the placeholder (Scenario: Search page lists results for the query in the URL · Folder filter includes sub-folders · Folder and tag filters combine and stay in the URL · Search page with only filters lists matching notes)
- [x] 18.6 Look walk (~15 min): palette and search page against the search mockup. No scenario; fail-first n/a

## 19. Home

> unit: depends=11,14,18 · scope=S8,S9,S14,S27,S32 · files=src/routes/(app)/+page.svelte, src/routes/(app)/+page.server.ts, src/lib/home/Hero.svelte, src/lib/home/Bento.svelte, src/lib/home/Welcome.svelte, e2e/home-hero.test.ts, e2e/home-bento.test.ts, e2e/home-pinned.test.ts, e2e/home-welcome.test.ts

Themed UI: needs 4.6 checked. Follows the approved Home mockup; accent `bronze`.

- [x] 19.1 `Hero` (eyebrow, two-line display headline with one accent word, glass search bar → `openPalette()`, CTA → `newNote()`); fail-first: `e2e/home-hero.test.ts` red on the placeholder (Scenario: Home shows the typographic hero · Home search bar opens the palette · Home New note opens a root note)
- [x] 19.2 Load (`listPinned`, `listRecent(8)`, `listFolderTiles(null)`) and `Bento` with Recently edited and Folders; fail-first: `e2e/home-bento.test.ts` red before it (Scenario: Recently edited shows the eight latest notes · Folders tile lists top-level folders with covers and counts)
- [x] 19.3 Pinned region; fail-first: `e2e/home-pinned.test.ts` red before it (Scenario: Pinned notes appear on Home most recently pinned first · Pinned tile is hidden without pinned notes · Unpinning the last note hides the Pinned tile)
- [x] 19.4 `Welcome` and fresh data after card actions; fail-first: `e2e/home-welcome.test.ts` red before them (Scenario: Empty archive shows the welcome state · Home reflects a move without reload)
- [x] 19.5 Look walk (~20 min): Home at phone, 1280 and 1600 against the Home mockup. No scenario; fail-first n/a

## 20. Folder page header and cover

> unit: depends=7,14 · scope=S9,S25,S26 · files=src/routes/(app)/folders/[id]/+page.svelte, src/routes/(app)/folders/[id]/+page.server.ts, src/lib/folders/FolderHeader.svelte, src/lib/folders/Breadcrumb.svelte, src/lib/folders/CoverControl.svelte, e2e/folder-header.test.ts, e2e/folder-actions.test.ts, e2e/folder-cover.test.ts

Themed UI: needs 4.6 checked. U14's folder page tests must stay green.

- [x] 20.1 Load adds `breadcrumb` and counts; `Breadcrumb`, `FolderHeader` (cover with glass title panel, or typographic band; name; `COPY.folderCounts`); fail-first: `e2e/folder-header.test.ts` red before them (Scenario: Folder page shows breadcrumb, cover header and counts)
- [x] 20.2 "New note" (`newNote(folderId)`), "New folder" (`newFolder(folderId)` + `invalidateAll()`), empty state `COPY.emptyFolder`; fail-first: `e2e/folder-actions.test.ts` red before them (Scenario: Empty folder offers New note and New folder · New note from a folder page lands in that folder · New folder from a folder page creates a sub-folder)
- [x] 20.3 `CoverControl` (Add / Change / Remove cover; browser-side type and 16 MB checks with `COPY.notAnImage` / `COPY.imageTooLarge`; `PUT` / `DELETE` cover); fail-first: `e2e/folder-cover.test.ts` red before it (Scenario: Upload and replace a folder cover · Removing the cover brings back the typographic tile · Wrong cover file is refused with a toast)
- [x] 20.4 Look walk (~15 min): folder page with and without cover against the folder mockup. No scenario; fail-first n/a

## 21. Media and link-preview blocks

> unit: depends=7,10,12,15 · scope=S20,S21,S22 · files=src/lib/editor/media.ts, src/lib/editor/image.ts, src/lib/editor/fileCard.ts, src/lib/editor/upload.ts, src/lib/editor/upload.test.ts, src/lib/editor/preview.ts, src/lib/editor/linkPreview.ts, src/lib/editor/urls.ts, src/lib/editor/urls.test.ts, e2e/image-insert.test.ts, e2e/image-block.test.ts, e2e/file-card.test.ts, e2e/link-preview.test.ts, e2e/link-preview-fallback.test.ts

Themed UI: needs 4.6 checked. Uploads go to U7's routes, previews to U10's (fake remote in e2e). Paste and drop in
tests dispatch `ClipboardEvent` / `DragEvent` with a `DataTransfer` on `.ProseMirror`.

- [x] 21.1 `image.ts` node (node view, caption input, `uploading` placeholder not saved), `upload.ts` (browser-side checks → `COPY` toasts, POST, placeholder replace / remove) with freely named tests, FileHandler paste / drop, "/image" in `mediaSlashItems`; fail-first: `e2e/image-insert.test.ts` red against the stub (Scenario: Paste an image into a note · Drop an image into a note · Insert an image with the slash command)
- [x] 21.2 Width, caption, errors and placeholder lifecycle; fail-first: `e2e/image-block.test.ts` red before them, plus a case that pastes an image, deletes its block, waits for the save and checks `counts` shows no image (Scenario: Deleting an image block releases the upload · Image block shows at column width with a caption · Oversized or non-image upload is refused in the editor · Upload shows a placeholder and a failure removes it)
- [x] 21.3 `fileCard.ts` (type icon, name, size, `target="_blank"` to `/files/<id>`), non-image drop and "/file"; fail-first: `e2e/file-card.test.ts` red before it (Scenario: Drop a file to insert a file card · Insert a file with the slash command · File card opens in a new tab · Oversized file is refused in the editor)
- [x] 21.4 `urls.ts` (`standaloneUrl`: http/https only, `URL.canParse`) with freely named tests, `linkPreview.ts` node, `preview.ts` paste handling (two history steps, attrs filled with `addToHistory: false`); fail-first: `e2e/link-preview.test.ts` red against the stub (Scenario: Pasting a URL alone makes a preview card · URL inside a sentence stays an inline link · Undo turns the card back into a link · Invalid URL stays plain text)
- [x] 21.5 Domain-only cards; fail-first: `e2e/link-preview-fallback.test.ts` red before the fallback rendering (Scenario: Failed preview shows domain and URL only · Private address gives a domain-only card). Look walk (~15 min): image, file card and link card against the note mockup

## 22. Layout check, slash completeness and the Done journey

> unit: depends=2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21 · scope=S3,S5,S6,S7,S16,S17,S18,S22 · files=e2e/layout.test.ts, e2e/slash-all.test.ts, e2e/journey.test.ts

Any fix to a shared component that the checks force (and the fixes deferred from earlier units' `deviations`) belongs
to this unit: commit each separately and list every screen it reaches under `deviations`.

- [x] 22.1 `e2e/layout.test.ts` with seeded data at 1100, 1280 and 1600 (desktop project) plus a freely named "no horizontal page scroll on phone" over every main screen; fail-first: write it, and if green at once report it (grids were built in U14 / U19) (Scenario: Grids add columns instead of stretching cards · Mid-width shows the sidebar with fewer columns)
- [x] 22.2 `e2e/slash-all.test.ts`: the full slash list in order and each item inserting its block (Scenario: Slash menu lists every block type)
- [x] 22.3 `e2e/journey.test.ts` walks proposal.md → Done criteria through the real UI with the fakes, one freely named test per criterion ("Done: …"): create and format a note with slash, shortcuts and the bubble toolbar; add toggle, callout, code, table, image, PDF and link preview; reorder by drag (desktop) and block menu (phone); file it in a nested folder, tag and pin it; find it with Cmd/Ctrl+K by a body word; delete it and a folder after confirmation; reload shows everything as left
- [x] 22.4 Full look walk (~30 min) over every screen at phone, 1280 and 1600 against the approved mockups; report the Gate 2 manual checks with exact steps (dev server; `npm run dev -- --host` for the phone): Built screens match the approved mockups · Motion feels smooth on real devices · Editor menus work on real phones · Bottom bar on a real phone keyboard · Previewing a real site (Scenario: Built screens match the approved mockups · Motion feels smooth on real devices · Editor menus work on real phones · Bottom bar on a real phone keyboard · Previewing a real site)

## 23. Search in the note menu

> unit: depends=16,18 · scope=S34 · files=src/lib/notes/NoteMenu.svelte, e2e/note-menu-search.test.ts

Added 2026-11-03 after the build, Rue-approved. No bar change, no palette change.

- [x] 23.1 "Search" item in `NoteMenu` (icon `search`, first in the list, calls `openPalette()`, menu closes); fail-first: `e2e/note-menu-search.test.ts` red before the item (phone with the editor focused, and desktop) (Scenario: Search in the note menu opens the palette)
