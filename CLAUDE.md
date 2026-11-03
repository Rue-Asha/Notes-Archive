# Notes Archive

Private notes archive for one person on her homelab: every note stays, filed in nested folders and cross-cutting tags,
findable by full-text search, written in a Notion-style block editor (Tiptap 3: slash menu, markdown shortcuts, bubble
toolbar, drag handle, toggles, callouts, code, tables, inline images, files and link previews), in a light, warm,
editorial look with frosted glass. SvelteKit 3 + Svelte 5 + Vite + TypeScript, adapter-node, npm, SQLite
(`node:sqlite`, FTS5), sharp. Single user, no login; desktop and phone.

## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- package: `npm run package` → dist/notes-archive-<version>.tgz + .sha256
- ship: ask
- release: none

SvelteKit 3: there is no `svelte.config.js` (config lives in `vite.config.ts`), and `$lib` is replaced by `#lib/...`
imports with the `.ts` extension (package.json `imports`).

`proof` = svelte-check (`--fail-on-warnings`), build, vitest. `proof:full` adds Playwright (projects `phone` 390×844
touch, `desktop` 1280×800, `workers: 1`) against `node build` on `$PORT` (default 4173) with
`DATABASE_PATH=.e2e/$PORT.db`, removed before each run, and `NOTES_ARCHIVE_TEST=1` so the `/__test/*` routes answer.
`MOCKUP_PHOTOS_DIR` points at `fixtures/mockups`. Every e2e test that touches data starts with the reset helper and
seeds what it needs, and waits for `html[data-hydrated]` before interacting. The server runs behind a proxy: without
`PROTOCOL_HEADER` (or `ORIGIN`) Kit's CSRF check rejects form posts and DELETEs over plain http; e2e sends
`x-forwarded-proto: http` for that reason, and `BODY_SIZE_LIMIT=17M` lets 16 MB uploads through. A test that reloads
right after typing awaits `watchSaves` `settled()` first. Tests that don't exercise motion call `calm(page)` (reduced
motion) so transitions can't make them flaky; navigation tests use `clientNav`. Unit tests live next to the code as
`src/**/*.test.ts` (plus `scripts/*.test.ts`); `scripts/server.test.ts` spawns the built server, so `build/` must exist
(`proof` builds before it tests). An e2e test that sets its own viewport or only uses `request` runs in one project
(`test.skip(info.project.name !== …)`); everything else runs in both.

## Specs
- Before changing design-system, read openspec/specs/design-system/spec.md.
- Before changing editor, read openspec/specs/editor/spec.md.
- Before changing folders, read openspec/specs/folders/spec.md.
- Before changing harness, read openspec/specs/harness/spec.md.
- Before changing home, read openspec/specs/home/spec.md.
- Before changing link-preview, read openspec/specs/link-preview/spec.md.
- Before changing media, read openspec/specs/media/spec.md.
- Before changing motion, read openspec/specs/motion/spec.md.
- Before changing notes, read openspec/specs/notes/spec.md.
- Before changing search, read openspec/specs/search/spec.md.
- Before changing shell, read openspec/specs/shell/spec.md.
- Before changing tags, read openspec/specs/tags/spec.md.

## Learnings
- **New e2e test over seeded names** → scope link/text locators to a section (tree, tags, cards), never a loose `/Reise/` regexp. (weil: real tree rows from the shell units made loose regexps in tags-section.test.ts match twice) [2026-11-03 · build-notes-archive]
- **Editor code importing a Tiptap extension** → add it to package.json, not only via starter-kit. (weil: core.ts imported @tiptap/extension-code, reachable only transitively) [2026-11-03 · build-notes-archive]
- **e2e on phone that clicks a shell control while the editor has focus** → expect the bottom bar to be inert there; make the test desktop-only or blur first. (weil: palette-editor passed in its worktree and failed on phone after the bottom bar went inert) [2026-11-03 · build-notes-archive]
