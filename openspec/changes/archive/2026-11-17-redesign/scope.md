# Scope: redesign

Triage: feature — from-scratch UI redesign of Notes Archive on fingerprint 2.0.0 (ecosystem-ui-revamp gates 3–8). Appetite: several sessions, in phases (gate 4 wireframes, gate 5 hi-fi, then the build in waves).

## Problem
Rue keeps uni notes, long documents and everyday lists in Notes Archive. Long writing happens on the desktop; quick capture and look-ups happen on the phone. The folder tree is the main way into a note and the biggest pain: deep nesting makes it unwieldy (long indents, truncated names, hard to keep an overview), on both devices. The UI also has to move onto the shared design fingerprint.

## Usage (Rue, 2026-11-13)
- Desktop: writing longer text.
- Phone: quick capture, and looking things up / reading.
- Main entry into a note: the folder tree.
- Biggest pain apart from the look: the tree gets unwieldy.

## Flows
From the contract (jobs J1–J11):
- Capture (J1, J2, J9): New note from the shell, Home, a folder page or the palette → untitled note in the current folder, else top level, title focused → type, autosave → leave; an untouched empty note is discarded silently.
- Find (J3): Cmd/Ctrl+K or the Search entry on touch → palette (empty: Recent + Actions; typing: ≤8 hits) → open the note. `/search` is the full page.
- Filtered search (J3, J11): `/search?q=&folder=&tag=` → filters → ≤50 results.
- Browse (J4): desktop: tree, chevron expands, name opens the folder page and focuses the tree there → note. Phone: Folders → `/folders` → drill-down `/folders/[id]` level by level → note; Back goes up.
- Organise (J5): tree / folder page → new folder / new note, rename, Move to…, Delete with counted confirm.
- Note properties (J5, J2): icon, Folder chooser, tags, Pinned toggle, each saves immediately.
- Pin and reorder (J6, J5): pin → Home Pinned (new first) → reorder by drag (pointer) or Move up / Move down (keyboard, touch); 409 reloads the list.
- Browse by tag (J7): tag in the tree footer / on `/folders` → `/tags/[id]` → note.
- Cover (J10): folder page → Add / Change / Remove cover, with error toasts.
- Attach (J8, J9): slash menu → Image / File, or paste a link → card.

## Screen inventory (gate 3)
Posture: *pointer* (desktop, side tree) and *touch* (phone, bar). Breakpoints are free; today's 1024 px split is a starting point for gate 4.
Decided (fingerprint 2.0.0): the bar (dock) applies below 1024 px, the side tree from 1024 px.

| # | Screen | Route | Jobs | Posture |
|---|---|---|---|---|
| SC1 | Home (the desk): search entry, New note, Pinned, Recently edited | `/` | J1, J3, J6 | both |
| SC2 | Folders top level: top-level folders with counts, then tags, sort button, New folder | `/folders` (new, UI-only) | J4, J5, J7 | touch first; desktop shows the same page with the tree at top level |
| SC3 | Folder page = drill-down level: path, cover, sub-folders, notes, New note / New folder, folder menu | `/folders/[id]` | J4, J5, J10, J1 | both |
| SC4 | Note page: title, collapsible properties, editor card, save status, note menu | `/notes/[id]` | J2, J5, J8, J9 | both |
| SC5 | Search page: query, folder and tag filters, results | `/search` | J3, J11 | both |
| SC6 | Tag page: tag heading, notes | `/tags/[id]` | J7 | both |
| G1 | Desktop shell: frame, side tree with focus + path row, rail fold, tags footer, sort picker, Home / Search / New note | layout | J1, J3, J4, J7 | pointer |
| G2 | Phone bar: Home · Folders · Search pills + round "+" | layout | J1, J3, J4 | touch |
| G3 | Command palette | overlay | J1, J3 | both |
| G4 | Editor overlays: slash menu, bubble toolbar, drag handle, block menu, table actions, code language, callout emoji, image caption, file card, link preview, toggle, task | overlay | J2, J8 | both |
| G5 | Dialogs and menus: delete confirm, Move to chooser, icon picker, cover menu, note and folder menus, sort menu | overlay | J5, J9, J10 | both |
| G6 | Toasts | overlay | J9 | both |

Unknown ids keep the plain framework 404 (gate-1 decision 2).

## In scope

Shell and navigation
- **S1** On desktop, opening a folder (its name in the tree, or any link to it) shows its page in the frame and focuses the tree on it: a path row at the top (ancestors, each one a link up) and that folder's subtree below, so indentation starts from the focused level.
  - edges: top level → no path row; 10+ levels → path row shortens the middle, every full name stays available; long names wrap or shorten with the full name available; the focused folder is deleted → focus moves to its parent or top level.
- **S2** The tree follows the open note: opening a note from anywhere (tree, folder page, Home, search, palette) focuses the tree on the note's folder and marks the note current.
  - edges: note at top level → tree at top level; note moved via Move to… → focus follows; note deleted → focus stays on its folder.
- **S3** The chevron expands or collapses a folder in place without navigating; the manual open state lasts until reload; the tree has tree/treeitem semantics (arrows move, Right/Left expand/collapse).
  - edges: a folder with nothing inside has no chevron; current item's ancestors auto-expand.
- **S4** The tree can be folded into a narrow rail and back with one control; the state is remembered per browser and applied on first render without a flash; the toggle exposes its expanded state.
  - edges: storage unavailable → expanded; rail controls (Home, Search, New note, expand) keep accessible names.
- **S5** Tags sit below the tree on desktop and after the folders on `/folders`, with a count each; the section is absent when there are no tags; counts update without reload.
- **S6** Tree sort picker: a quiet icon button with a menu in the tree header (desktop) and on `/folders` (phone); four modes `mixed` / `name` / `edited` / `created` with English labels chosen at gate 5; the current mode is marked; choosing one re-sorts the tree without reload and persists on the server.
  - edges: save fails → toast and the previous mode returns; the sort affects the tree and `/folders` only (not folder page, Home, tag or search lists).
- **S7** Phone bar: Home · Folders · Search as glass pills plus a separate round "+" that captures a note; the current section is marked; the bar is hidden, inert and aria-hidden while the editor has focus and returns on blur.
  - edges: 320 px width; safe-area insets; soft keyboard open.
- **S8** `/folders` (new UI-only route, layout data only) shows the top-level folders with counts, then tags, the sort button and New folder; it replaces the Folders drawer.
  - edges: no folders → "No folders yet" + New folder; no tags → tags section absent; on desktop the page renders with the tree at top level.
- **S9** On the phone each drill-down level is `/folders/[id]`: sub-folders with counts and notes, one level per screen; the back gesture and browser Back go up; a back affordance names the parent.
  - edges: 10+ levels; long names; empty folder → "Nothing here yet" + New note / New folder.

Home
- **S10** Home is the desk: search entry, New note, Pinned in Rue's order, Recently edited (8). Top-level folders are not on Home.
  - edges: no notes (with or without folders) → welcome state "Write your first note" + New note; no pinned → Pinned absent; one pinned → no reorder controls; long titles and snippets; "1 note" singular.
- **S11** Pinned reorder: drag with a handle on pointer devices; "Move up" / "Move down" in each pinned entry's menu (disabled at the ends) for keyboard and touch; each move saves at once.
  - edges: 409 → the list reloads in the current order and a polite toast says "Pinned order changed elsewhere — reloaded"; save fails → toast, order reverts; reduced motion → no movement animation; new pins appear first.

Folder page
- **S12** Folder page: path, cover (Add / Change / Remove cover), sub-folders with server-provided counts (including sub-folders), the folder's notes newest edited first, New note, New folder, folder menu (Rename, Move to…, Delete).
  - edges: empty → "Nothing here yet"; only sub-folders or only notes → the other section is omitted; no cover → Add cover; upload errors → toasts; "1 folder" / "1 note"; long names; new "Untitled folder" appears in the tree and the list without reload.

Note page
- **S13** Multi-line title: Enter inserts a line break; Cmd/Ctrl+Enter or ArrowDown on the last line puts the caret at the body start; the title acts as the page heading.
  - edges: 200+ characters; many short lines; pasted CRLF text.
- **S14** Properties as rows under the title on the white editor card (icon, Folder chooser, tags, Pinned), collapsible; on the phone collapsed by default into one summary line (path · tag count) that expands on tap; each change saves immediately.
  - edges: many tags wrap with no horizontal scroll; long folder path; no tags; tag input keys per contract.
- **S15** Save status shows "Saving…" / "Saved"; a failed save turns it into the actionable "Couldn't save — try again" plus one toast per run of failures; a note deleted elsewhere shows "This note was deleted" and saving stops; the status is not a live region.
- **S16** The editor keeps every block, mark, menu and shortcut it has today and gets the fingerprint look (all G4 surfaces). Touch rules hold: the slash menu stays above the soft keyboard, the bubble toolbar never covers the native selection menu, the drag handle targets the cursor block without drag.
  - edges: wide tables scroll inside; long unbroken words wrap; very long notes; unknown blocks render as paragraphs; text colours (`data-color`) keep their stored names.
- **S17** A new note opens with the title focused and placeholders shown, in the current folder or else at top level; left untouched it is discarded silently.

Search, palette, tags
- **S18** Command palette per contract (Cmd/Ctrl+K anywhere; Recent + Actions when empty; ≤8 highlighted hits; See all results; touch history entry; editor selection restored on close; Cmd/Ctrl+K on a selection edits a link).
- **S19** `/search` page with query, folder (with sub-folders) and tag filters, shareable URL (200 ms replace while typing, push on filter change), ≤50 results.
  - edges: idle hint; "No notes match “<q>”"; filter-only "No results"; "1 result"; long queries; typed text survives reload.
- **S20** Tag page: tag heading and its notes; deleting the last note on the page goes Home.
  - edges: long tag name heading; "1 note".

Shared surfaces
- **S21** Dialogs, menus and choosers use the fingerprint primitives with contract behaviour: delete confirm with counts (shown once counts are known), Move to chooser (Root + tree order, self and descendants excluded), icon picker, cover menu, note and folder menus, sort menu; modal focus trap, Escape and outside click cancel, focus returns to the opener.
- **S22** Toasts restyled; ~4 s, polite status; a toast raised before a redirect survives to the next page.

Fingerprint, icon, cleanup
- **S23** Fingerprint 1.0.0 vendored with `sync.sh`; `check-slop` and `check-drift` run in `proof` and pass (ecosystem task 9.1). Accent: slate, confirmed at gate 5.
- **S24** App icon: master icon designed at gate 5 in Design-System (`icons/notes/icon.svg`), vendored by `sync.sh` (favicons, apple-touch, manifest, theme-color); the icon check passes.
- **S25** Old styling removed in this change: `src/lib/styles/{tokens.css,tokens.ts,global.css,look.ts}` and their guard tests, the old `/__mockups` routes and fixtures; the gate 4/5 mockups live under `/__mockups/redesign/*`.

Cross-cutting
- **S26** Every screen meets WCAG 2.2 AA (incl. target size ≥ 24 px, focus visible and not obscured), respects reduced motion, and has no horizontal page scroll from 320 px to 1920 px.
- **S27** All copy is English; contract strings stay unless the contract is updated in this change; new strings (sort labels, 409 toast, path/back labels) are added to the contract copy list.

## Non-goals
- Server, load, API, schema or migration changes (gate 6 rule: UI layer only). The only URL change is the new UI-only `/folders` page. Server work for pin order, tree sort and counts is change `gate-1-decisions` (ecosystem 2.7).
- Offline mode / PWA caching (Rue).
- Sharing, export, print view (Rue).
- New editor capabilities (Rue: split off, see below). The redesign restyles today's editor.
- A custom 404 / error page (gate-1 decision 2) and a global New-note shortcut (decision 3).
- Dark mode: not in this change; decided for all apps at ecosystem checkpoint B (12.2).
- A settings page: the sort picker is the only preference UI.

## Codebase touchpoints
From explorer reports (2026-11-13, 2026-11-14):
- Shell: `src/routes/(app)/+layout.svelte`, `src/lib/shell/{Sidebar,TagsSection,BottomBar,Drawer}.svelte`, `sidebar.ts` (collapsed rail, `html[data-rail]`), one breakpoint at 1024 px. `Drawer` is replaced by `/folders`.
- New route `src/routes/(app)/folders/+page.svelte` (layout data only).
- Command palette: `src/lib/search/CommandPalette.svelte` (+ `palette.svelte.ts`), fetches `/api/search`.
- Editor: `src/lib/editor/*` (Tiptap 3.32.2; menus mounted imperatively from `.ts` — keep entry points and prop APIs; `floating.ts` holds the visualViewport helpers), `styles/prose.css`.
- Note page: `src/routes/(app)/notes/[id]/NotePage.svelte`, `src/lib/notes/*` (icon, properties, title, save status, menu, autosave, api).
- Data per route: layout `{tree, tags}` (`depends('app:tree')`); Home `{pinned, recent, tiles}`; folder `{folder, breadcrumb, tiles, notes, counts}`; note `{note}`; search `{query, hits}`; tag `{tag, notes}`.
- All mutations are client `fetch` to `/api/*`; new mutation UI must `invalidate('app:tree')`. Pinned reorder uses `PUT /api/pinned`, the sort picker `GET`/`PATCH /api/settings` — both come with `gate-1-decisions`.
- Styles: `src/lib/styles/{tokens.css,tokens.ts,global.css,prose.css,look.ts}` with guard tests (`tokens.test.ts`, `guard.test.ts`, `global.test.ts`) — replaced by the vendored fingerprint.
- `/__mockups` (Mock* copies) is rebuilt under `/__mockups/redesign/*`.
- `docs/functional-contract.md` and the e2e suite: updated where this scope deviates (see Decisions).

## Risks
- R1 Pin order and tree sort have no server side on `main` yet (`/api/pinned`, `/api/settings`, migration 0005 come with `gate-1-decisions`). → resolved (Rue, 2026-11-14): gates 4–5 mock them with fixtures; Notes 2.7 runs alongside and must be merged before gate 6 starts.
- R2 Editor menus are mounted imperatively from `.ts` files; a rebuild must keep their entry points. → accepted, noted for the planner.
- R3 Stored doc content depends on the `TextColor` attribute format. → resolved: editor extensions stay unchanged; restyle only.
- R4 Contract deviations (Folders drawer → `/folders`, no folders on Home, welcome state whenever there are no notes, 409 toast) break assertions in the decoupled e2e suite. → resolved: the contract and the affected e2e specs are updated in this change, in the same wave as the UI they cover.
- R5 `PRODUCT.md` says both "WCAG 2.2 AA" and "no formal standard set". → resolved: WCAG 2.2 AA (Rue, ecosystem decision); fixed in `PRODUCT.md` with the contract updates.

## Decisions
- **Navigation model: focus tree on desktop, drill-down on the phone** (Rue, 2026-11-13). The gate-3 structural decision that departs from a generic list → detail layout. Desktop: the side tree can "step into" a folder; it then shows only that folder's subtree, with the path back as a row at the top, so indentation never runs deep. Phone: drill-down like Apple Notes, one level per screen with counts. References: Apple Notes iOS folders (mobbin 6a0eb785), Craft iOS home + drill-down (mobbin cf3931f4), Superlist web tree + editor + photo panel (mobbin aea5ea6c), Dropbox Paper web tree + path (mobbin 0e73a610). Rejected: Finder-like columns (takes width from writing), improved classic tree (only softens depth).
- **Desktop tree follows the open note** (Rue): opening a note, also from search, focuses the tree on its folder; the path row at the top goes up.
- **Phone levels are the folder pages** (Rue): each drill-down level is `/folders/[id]` with its own URL; back gesture and links work natively; no separate tree dialog.
- **Phone top level is a new UI-only `/folders` page** (Rue, 2026-11-14): top-level folders, then tags, sort button, New folder; the Folders drawer goes away.
- **Capture lands in the current folder, else top level** (Rue): no Inbox folder.
- **Desktop writing: the tree stays and can be folded away** (Rue): visible by default; one control folds it into a narrow rail; remembered per browser. No auto-hiding focus mode.
- **Home is the desk: pinned + recently edited + search** (Rue): pinned in Rue's own order and the last 8 edited. Top-level folders leave Home. Folder covers (J10) stay on the folder page.
- **Home with no notes shows the welcome state, folders or not** (Rue, 2026-11-14) — contract updated.
- **Phone bar: Home · Folders · Search as glass pills, plus a separate round "+" for capture** (Rue). Reference: Craft iOS (mobbin cf3931f4).
- **Pin order: drag plus "Move up" / "Move down" in each pinned entry's menu** (Rue): no separate reorder mode. A 409 reloads the list and shows a toast (Rue, 2026-11-14).
- **Tags live below the tree, and on the phone's Folders top level after the folders** (Rue).
- **Tree sort picker: a quiet icon button with a menu in the tree header** (Rue); on the phone on `/folders`. No settings page.
- **Note properties: rows under the title on the white editor card, collapsible** (Rue): on the phone collapsed by default into one summary line.
- **Desktop tree: the chevron expands/collapses, the folder name opens the folder page in the frame** (Rue).
- **Editor additions split off** (Rue, 2026-11-14): the redesign restyles today's editor; new capabilities follow as their own change on the new UI.
- **Appetite: several sessions, in phases** (Rue): gates 4 (wireframes) and 5 (hi-fi) each with Rue's sign-off, then the build in waves (shell → Home/folder → note page/editor → search/tags), per the pipeline spec's fixed gate order.

## Done when
- Gates 4–7 of the ecosystem pipeline are signed off by Rue (wireframes, hi-fi incl. icon, build, evidence).
- `proof:full` is green, with `check-slop` and `check-drift` in `proof`.
- A WCAG 2.2 AA review passes, and screenshots at 375 / 768 / 1280 have been looked at.
- No old styling is left: old tokens/global/look files, their guard tests and the old `/__mockups` are gone.
- Deployed after Rue's OK (gate 8), with the previous release tag recorded.

## Split off
- **editor-additions** (after the redesign ships, on the new UI). Rue's picks, 2026-11-14:
  - Columns block (2–3 columns, stacking on the phone) — custom `columns`/`column` nodes (no official free Tiptap package).
  - Embeds by URL: YouTube (`@tiptap/extension-youtube`, nocookie), maps, and any https URL — custom `embed` atom with a host list; no CSP exists today; add `embed` to `ATOMS` in `src/lib/server/plaintext.ts` so an embed-only note isn't "empty".
  - Highlight mark (`@tiptap/extension-highlight`) and footnotes (custom node; community `tiptap-footnotes` unverified on Tiptap 3).
  - Bubble toolbar: Turn into (reuse `BlockMenu.svelte` `turnItems`) and Highlight.
  - `[[` note links: a second `@tiptap/suggestion` trigger with its own plugin key, items from `/api/search` (empty query → `recent`), inserts a link to `/notes/<id>`; folder path mapped client-side from the tree.
  - Touch formatting bar above the soft keyboard, built on `floating.ts` `visibleViewport()`/`watchViewport()`.
