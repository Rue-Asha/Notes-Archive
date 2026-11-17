## Why

Rue answered the eight open questions of `docs/functional-contract.md` (gate 1) before the full UI/UX redesign. Five of the answers change what the server stores or returns (manual pin order, one folder-count rule, a persisted tree sort, multi-line titles, tag-page redirect). They are cheaper and safer to land and test on the current UI than inside the redesign, and the designers need them as settled behaviour.

## What Changes

- Pinned notes get a stored manual order (new column, backfilled from today's most-recently-pinned-first order); a new pin goes to the top; one endpoint reorders the whole pinned list.
- Folder note counts mean "all notes in the folder including sub-folders" everywhere. Folder entries and delete dialog already do; the folder page summary (today direct children only) switches, and its folder count becomes "all descendant folders" to match the delete dialog.
- The folder tree sort becomes a server-stored preference (new `settings` table, one key) with four modes; `getTree` takes it; one endpoint reads and writes it.
- Note titles may contain line breaks: the server keeps them (CRLF normalised to LF), search and snippets must cope, single-line contexts show them as spaces. `NoteTitle.svelte` keeps stripping line breaks until the redesign.
- Tag page: when the last note of the open tag page is deleted from its card menu, the app goes Home instead of showing a 404. Unknown ids stay a plain 404 (decision 2, no change).
- Contract-only decisions, no code: unknown id keeps the framework 404; no global new-note shortcut; failed save keeps both retry status and toast.

Scope: server, data, load, migrations, API routes, unit and server tests, plus the one small tag-page redirect wiring. UI affordances (drag/keyboard reorder interaction for pinned notes, the sort picker, multi-line title editing and what Enter does) are built in the redesign, not here.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `notes`: Pinning (manual order, new pins first, reorder); new requirement for multi-line titles.
- `folders`: Folder page counts use the same rule as folder entries (descendants).
- `shell`: Folder tree sort is selectable and persisted; new requirement for the sort preference.
- `tags`: Tag pages go Home when their last note is deleted while open; unknown ids stay 404.

## Impact

- `migrations/0005_pin_order_settings.sql` (new): `notes.pin_order`, `settings` table.
- `src/lib/server/notes.ts`, `folders.ts`, new `settings.ts`, `src/lib/types.ts`, `src/lib/title.ts` (new helper).
- Routes: `src/routes/api/pinned/+server.ts` (new), `src/routes/api/settings/+server.ts` (new), `(app)/+layout.server.ts`, `(app)/folders/[id]/+page.server.ts`, tag page and `CardMenu.svelte` wiring.
- Tests: `schema`, `notes`, `notes-list`, `folders`, `tree`, `search`, new `settings` unit tests, API route tests, e2e `home-pinned`, `folder-header`, `tag-page`.
- Docs: `docs/functional-contract.md`, `PRODUCT.md`. Existing deployed databases migrate in place on start.

## Non-Goals

- No pinned-reorder UI, sort picker UI or title-editing UI (redesign).
- No sort direction toggle, no per-folder sort, no sort preference for the folder page, Home or search lists.
- No title length limit, no change to the title input's current line-break stripping.
- No custom not-found page, no new global shortcut, no change to save-failure feedback.
- No browser storage for the new preferences.

## Appetite

One evening for the server work; the UI follow-ups are budgeted in the redesign.

## Done criteria

- [ ] `npm run proof:full` is green.
- [ ] Opening a database created before this change keeps the exact pinned order Home showed before.
- [ ] Reordering, unpinning and re-pinning through the API gives the expected `listPinned` order, and a stale reorder is refused.
- [ ] A folder page summary and its parent's folder entry give the same note count for the same folder.
- [ ] The tree preference survives a server restart and is applied to the first server render.
- [ ] A title with a line break saves, reloads unchanged and is found by search with a correct highlight.
- [ ] Deleting the last note on a tag page lands on Home; a made-up tag id still shows the plain 404.
