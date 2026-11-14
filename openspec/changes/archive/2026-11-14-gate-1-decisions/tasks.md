> Post-merge, not a unit (manual, after deploy approval): ⚠ irreversible: copy `data/notes-archive.db` on the host before the first start of the new release; that start runs migration 0005 against the real database (see design.md "Migration").

## 1. Migration and shared types

> unit: depends=none · files=migrations/0005_pin_order_settings.sql, src/lib/types.ts, src/lib/errors.ts, src/lib/server/schema.test.ts, src/lib/server/db.test.ts

- [x] 1.1 Write the test "Scenario: Migration keeps the existing order" (seed through migration 0004, pin at different times, migrate, compare `listPinned`)
- [x] 1.2 Add `migrations/0005_pin_order_settings.sql` (`notes.pin_order`, partial index, `settings` table, `row_number()` backfill from `pinned_at DESC, id DESC`)
- [x] 1.3 Add `TreeSort`, `ConflictError` and the `Settings` contract types; extend schema/db tests for the new column and table

## 2. Pinned order

> unit: depends=1,5 · files=src/lib/server/notes.ts, src/routes/api/pinned/+server.ts, src/routes/api/pinned/pinned-api.test.ts, src/lib/server/notes-list.test.ts, src/lib/server/notes.test.ts

- [x] 2.1 Write the tests "Scenario: Reorder sets the pinned order", "A new pin goes to the top of a custom order", "Re-pinning does not keep the old position", "A stale reorder is refused", "Reordering does not change updatedAt", "Server orders pinned notes by pin order"
- [x] 2.2 Set `pin_order` on pin and clear it on unpin in `updateNote`; order `listPinned` by `pin_order, pinned_at DESC, id DESC`
- [x] 2.3 Add `reorderPinned` (transactional, set equality check, renumber 1..n) and `PUT /api/pinned` (409 on stale, 400 on malformed)

## 3. Folder counts

> unit: depends=none · files=src/lib/server/folders.ts, src/routes/(app)/folders/[id]/+page.server.ts, src/lib/server/folders.test.ts, e2e/folder-header.test.ts

- [x] 3.1 Write the test "Scenario: Header and parent tile count the same" and update the `folder-header` e2e to "Scenario: Folder page shows breadcrumb, cover header and counts" (1 folder · 6 notes)
- [x] 3.2 Return `counts: folderCounts(folder.id)` from the folder page load; keep tile and delete-dialog queries; check `FolderHeader.svelte` still reads `counts.folders` / `counts.notes`

## 4. Tree sort preference

> unit: depends=1,3 · files=src/lib/server/settings.ts, src/lib/server/settings.test.ts, src/lib/server/folders.ts, src/lib/server/tree.test.ts, src/routes/(app)/+layout.server.ts, src/routes/api/settings/+server.ts, src/routes/api/settings/settings-api.test.ts

- [x] 4.1 Write the tests "Scenario: Reading the preference defaults to mixed", "The preference survives a restart", "Each mode orders folders and notes", "An edited note lifts its folder", "An unknown mode is refused", "First render uses the stored sort", "Default sort keeps folders by name and notes by last edited"
- [x] 4.2 Add `settings.ts` (`getTreeSort`, `setTreeSort` with validation)
- [x] 4.3 Give `getTree` the sort argument and the four orderings; read the preference in `(app)/+layout.server.ts`
- [x] 4.4 Add `GET`/`PATCH /api/settings`

## 5. Multi-line titles

> unit: depends=none · files=src/lib/title.ts, src/lib/title.test.ts, src/lib/server/notes.ts, src/lib/server/notes.test.ts, src/lib/server/search.test.ts, src/routes/(app)/notes/[id]/NotePage.svelte

- [x] 5.1 Write the tests "Scenario: A multi-line title round-trips", "Words on every title line are found", "A line-break-only title is still untitled", "Single-line contexts collapse line breaks"
- [x] 5.2 Normalise CRLF/CR to LF for the title in `updateNote`
- [x] 5.3 Add `titleLine` and use it for the document title in `NotePage.svelte`; fix `snippetParts` only if the search test shows a mismatch

## 6. Tag page redirect

> unit: depends=none · files=src/lib/notes/CardMenu.svelte, src/routes/(app)/tags/[id]/+page.svelte, e2e/tag-page.test.ts

- [x] 6.1 Write the e2e tests "Scenario: Deleting the last tagged note goes Home", "Deleting one of several tagged notes stays", "Unknown tag id is a plain 404"
- [x] 6.2 Add `ondeleted` to `CardMenu` and `goto('/', { invalidateAll: true })` from the tag page when the last note goes; leave the tag `load` unchanged

## 7. Wrap-up

> unit: depends=1,2,3,4,5,6 · files=e2e/home-pinned.test.ts, graphify-out/*

- [x] 7.1 Extend the `home-pinned` e2e for new-pin-on-top and the unchanged most-recent-first default
- [x] 7.2 Run `npm run proof:full` green, then `graphify update .`
