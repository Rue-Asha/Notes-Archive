## Context

Pinned order today is `ORDER BY pinned_at DESC, id DESC` (`listPinned`, `notes.ts`); `pinned_at` is also the pinned flag. Folder counts: `listFolderTiles` and `folderCounts` count descendants, the folder page passes `counts: { folders: tiles.length, notes: notes.length }` (direct). `getTree` sorts folders with `byName` (de collator, numeric) and notes by `updated_at DESC` in SQL. The tree comes from `(app)/+layout.server.ts` (`depends('app:tree')`). The browser stores only the sidebar flag. Titles are free text in SQLite; only `NoteTitle.svelte` strips line breaks. The tag page 404s in `load` when the tag is gone, and `CardMenu.svelte` refreshes with `invalidateAll()`, so deleting the last tagged note on the tag page reloads into a 404 today.

## Goals / Non-Goals

**Goals:** server-side, tested support for all five behaviour changes before the redesign, with zero visible change for existing data.
**Non-Goals:** reorder, sort-picker and title-editing UI; sort direction; sort for other lists; title length limit; a not-found page.

## Decisions

**Pinned order.** Migration `0005_pin_order_settings.sql` adds `notes.pin_order INTEGER` (null when unpinned) and a partial index on it. Backfill ranks the pinned rows by `pinned_at DESC, id DESC` with `row_number()` so the list stays exactly as shown. Pin: `pin_order = coalesce(min(pin_order), 1) - 1` (top; negatives are fine, no renumbering on pin). Unpin: `pin_order = NULL`, so a re-pin goes to the top. `pinned_at` stays: it is the flag, the pin time and still tie-break (`ORDER BY pin_order, pinned_at DESC, id DESC`). Reorder is one request, `PUT /api/pinned` with `{ ids: number[] }`: in a transaction, the set must equal the pinned set (no missing, extra or duplicate id) else 409 `{ error: 'stale' }` (a second device pinned or unpinned meanwhile; the client reloads the list); on success renumber 1..n. A whole-list endpoint was chosen over "move note to index" because it is idempotent and has no index race. `updated_at` is untouched (same as pinning today). `NotePatch.pinned` keeps working unchanged for the API.

**Folder counts.** One rule: notes in the folder and all sub-folders. `folderCounts(id)` (already recursive, used by the delete dialog) becomes the single source; the folder page load returns `counts: folderCounts(folder.id)` and `listFolderTiles` keeps its recursive query. The summary's folder count becomes all descendants (matches the delete dialog wording "N folders and M notes inside it"). Section item counts that name the items listed on the page (sub-folder tiles, note cards) are lists, not folder counts, and stay as they are. Chosen over "direct children everywhere" because three of four places already counted descendants and a direct count under a parent folder reads as zero for a folder that only holds sub-folders.

**Tree sort preference.** Server-side, not localStorage: the tree is rendered on the server, so a browser-only value would flash the wrong order on first paint, and the archive is used from two devices. Storage is a new generic `settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)` table in the same migration; key `tree_sort`, default `mixed` when absent. New `src/lib/server/settings.ts` (`getTreeSort`, `setTreeSort`, mode type and validation in `types.ts`). `getTree(sort)` applies it: `mixed` is today's behaviour; `name` sorts notes by the same collator on their trimmed title ("Untitled" for empty); `created` uses `created_at DESC`; `edited` sorts a folder by the max `updated_at` over its descendant notes, else its own `updated_at`, computed in one bottom-up pass over the already loaded maps. `(app)/+layout.server.ts` reads the preference and passes it to `getTree`. `PATCH /api/settings` with `{ treeSort }` validates, stores, and answers `{ treeSort }`; the future picker calls it, then `invalidate('app:tree')`. `dataTables()` (test reset) must include `settings` (it lists every table automatically). Four modes instead of a free key plus direction: the smaller design; a direction toggle would be a second setting.

**Multi-line titles.** No schema change (`title TEXT NOT NULL`, no CHECK). `updateNote` normalises `\r\n` and `\r` to `\n` for the title. FTS: `foldSearch(title)` is indexed as is; `unicode61` treats `\n` as a separator so every line matches. Risk is `snippetParts`, which maps `snippet()` output back to original spelling using body text and title; a unit test with a two-line title covers it, and the fix, if needed, is collapsing whitespace runs in the title before it is passed in. "Untitled" and the empty-note discard already use `trim()`, which covers line breaks. A small `titleLine(title)` helper in `src/lib/title.ts` (`title.replace(/\s*[\r\n]+\s*/g, ' ').trim() || 'Untitled'`) is the one place the single-line contexts will use; it is added and unit-tested here and wired into existing call sites that show a title on one line only where that is a one-line change (document title in `NotePage.svelte`); the rest are the redesign's. `NoteTitle.svelte` is not changed: it still strips line breaks, so no multi-line title can be created from the UI until the redesign.

**Tag page redirect.** `load` cannot do it: when `invalidateAll()` reruns it after the last note is deleted, "tag gone" and "id never existed" look identical, and decision 2 says the latter stays a 404. The redirect is therefore a client step. `CardMenu` gets an optional `ondeleted(note)` callback; the tag page passes one that, when the deleted note was the last in `data.notes`, calls `goto('/', { invalidateAll: true })` instead of the usual `invalidateAll()` that would rerun the tag load and 404. Other tabs and stale pages are not observed (they still 404 on reload, as decided).

## Contracts

- `Settings`: `type TreeSort = 'mixed' | 'name' | 'edited' | 'created'`; `getTreeSort(): TreeSort`, `setTreeSort(sort: TreeSort): void` (throws `ValidationError`).
- `getTree(sort: TreeSort = 'mixed'): Tree`.
- `reorderPinned(ids: Id[]): void` throws `ConflictError` (new, maps to 409) when the set is stale; `listPinned()` signature unchanged.
- `PUT /api/pinned` body `{ ids: number[] }` -> 200 `{ ids }` | 409 `{ error: 'stale' }` | 400 on a malformed body. `PATCH /api/settings` body `{ treeSort }` -> 200 `{ treeSort }` | 400. `GET /api/settings` -> `{ treeSort }`.
- `titleLine(title: string): string`.
- Folder page load: `counts: FolderDeleteCounts`.

## Migration

`0005_pin_order_settings.sql`, applied on start in the existing transaction runner; additive only (one nullable column, one index, one table), no data is deleted. Backfill is deterministic and reproduces today's order. Rolling back the code leaves a harmless extra column and table. `⚠ irreversible` in the practical sense that the production database file is changed on first start: copy `data/notes-archive.db` before deploying.

## Risks / Trade-offs

- A second device reordering while the first pins: handled by the 409; the client must refetch (redesign task).
- Negative `pin_order` values are legal but surprising; a reorder renumbers 1..n.
- `edited` sort recomputes folder recency on every tree load; the tree already reads every note, so the extra cost is one pass.
- Existing e2e tests assert "1 folder · 4 notes" style direct counts (`folder-header`); they change with the rule.
- Titles with line breaks are stored by the server before the UI can make them; harmless, and covered by tests.

## Gate-1 sign-off

Confirmed by Rue on 2026-11-13 (gate 1 / task 2.5), as written in this design: title Enter inserts a line break and Cmd/Ctrl+Enter or ArrowDown on the last line moves to the body; four tree sort modes stored on the server; tag page redirect done client-side; folder counts include all sub-folders. No open questions remain for these points. Storing the pin order across devices was not part of the sign-off.
