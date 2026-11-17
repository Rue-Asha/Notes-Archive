## Context

Notes Archive moves from its own light warm look (local tokens, look switches, frosted glass, Newsreader/Figtree) onto the shared Design-System fingerprint 1.0.0, and its navigation is rebuilt around the folder tree, the main way into a note and the biggest pain on both devices. This change runs gates 3–8 of the ecosystem pipeline (`Design-System/openspec/changes/ecosystem-ui-revamp/specs/app-redesign-pipeline/spec.md`): gate 3 is `scope.md` (signed off 2026-11-14), gate 4 greyscale wireframes and gate 5 hi-fi each end with Rue's sign-off, gate 6 builds the UI layer only, gate 7 is flow's Verify and gate 8 is Ship (`ship: ask`).

Constraints that shape the plan:
- UI layer only. Server modules, `load` functions, API routes, schema and migrations stay. Pin order (`PUT /api/pinned`), tree sort (`GET`/`PATCH /api/settings`), folder counts and multi-line titles on the server come from change `gate-1-decisions`, which must be merged to `main` (and `main` merged here) before the build starts. Gates 4–5 mock pin order and sort with fixtures.
- Checkpoint A (ecosystem 10) sits between gate 5 and gate 6: Design-System resolves `requests.md`, makes at most one version bump and re-syncs all wave-1 apps before any enters gate 6.
- `proof` and `proof:full` runs are serialized across apps; pushes go one repo at a time.
- Editor menus are mounted imperatively from `.ts` files (R2): their entry points and prop APIs stay. Editor extensions stay unchanged (R3); the text-colour mark keeps its stored names.

## Goals / Non-Goals

**Goals:** S1–S27 of `scope.md`: the focus tree and phone drill-down, Home as the desk, folder page, note page, restyled editor, palette/search/tag pages, shared overlays, fingerprint + icon, cleanup of the old styling, WCAG 2.2 AA and English copy.

**Non-Goals:** as in the proposal: no server/load/API/schema/migration change (only the UI-only `/folders` page is new), no offline/PWA caching, no sharing/export/print, no new editor capabilities (split off as `editor-additions`), no custom 404 and no global New-note shortcut, no dark mode, no settings page.

## Decisions

### From scope (gate 3, Rue)

- **Navigation model: focus tree on desktop, drill-down on the phone** (2026-11-13). Desktop: the side tree "steps into" a folder and shows only its subtree with the path back as a row at the top, so indentation never runs deep. Phone: drill-down like Apple Notes, one level per screen with counts. References: Apple Notes iOS folders (mobbin 6a0eb785), Craft iOS home + drill-down (mobbin cf3931f4), Superlist web tree + editor + photo panel (mobbin aea5ea6c), Dropbox Paper web tree + path (mobbin 0e73a610). Rejected: Finder-like columns (takes width from writing), improved classic tree (only softens depth).
- **Desktop tree follows the open note**: opening a note, also from search, focuses the tree on its folder; the path row at the top goes up.
- **Phone levels are the folder pages**: each drill-down level is `/folders/[id]` with its own URL; back gesture and links work natively; no separate tree dialog.
- **Phone top level is a new UI-only `/folders` page** (2026-11-14): top-level folders, then tags, sort button, New folder; the Folders drawer goes away.
- **Capture lands in the current folder, else top level**: no Inbox folder.
- **Desktop writing: the tree stays and can be folded away**: visible by default; one control folds it into a narrow rail; remembered per browser. No auto-hiding focus mode.
- **Home is the desk: pinned + recently edited + search**: pinned in Rue's own order and the last 8 edited. Top-level folders leave Home. Folder covers (J10) stay on the folder page.
- **Home with no notes shows the welcome state, folders or not** (2026-11-14) — contract updated.
- **Phone bar: Home · Folders · Search as glass pills, plus a separate round "+" for capture**. Reference: Craft iOS (mobbin cf3931f4).
- **Pin order: drag plus "Move up" / "Move down" in each pinned entry's menu**: no separate reorder mode. A 409 reloads the list and shows a toast (2026-11-14).
- **Tags live below the tree, and on the phone's Folders top level after the folders**.
- **Tree sort picker: a quiet icon button with a menu in the tree header**; on the phone on `/folders`. No settings page.
- **Note properties: rows under the title on the white editor card, collapsible**: on the phone collapsed by default into one summary line.
- **Desktop tree: the chevron expands/collapses, the folder name opens the folder page in the frame**.
- **Editor additions split off** (2026-11-14): the redesign restyles today's editor; new capabilities follow as their own change on the new UI.
- **Appetite: several sessions, in phases**: gates 4 (wireframes) and 5 (hi-fi) each with Rue's sign-off, then the build in waves (shell → Home/folder → note page/editor → search/tags), per the pipeline spec's fixed gate order.
- Risks resolved in scope: R1 fixtures for gates 4–5, `gate-1-decisions` merged before gate 6; R3 extensions unchanged; R4 contract and affected e2e updated in the same wave as their UI; R5 WCAG 2.2 AA fixed in `PRODUCT.md` with the contract updates.

### Planning decisions (planner, 2026-11-14; P1 and P5 confirmed by Rue at Gate 1, 2026-11-14)

- **P1 check-slop while the old UI still exists.** The slop-guard spec makes `check-slop` scan all of `src/**/*.{svelte,css}` outside `src/lib/styles/fingerprint/` with no exclude or baseline option, and ecosystem 9.1 wants `proof` green at sync time; it does not say how an app's pre-existing styling is treated until it is rebuilt. Today's UI has 103 violations (68 in `tokens.css`, 10 in `global.css`, the rest in old mockups and ~15 components). Plan: an app-owned filter `scripts/slop-baseline.mjs` runs the vendored `check-slop` unchanged, drops exactly the violations recorded in `scripts/slop-baseline.txt` at sync time (keyed by file, rule and declaration text, not line number) and fails on everything else; `proof` calls it in place of the bare `check-slop`. New code is checked in full from day one. The cleanup unit (S25) deletes both files and restores the exact line `sync.sh` writes. Alternatives: `proof` red until S25 (blocks every builder), or an exclude flag upstream (a Design-System change, not ours to make). The question is also listed for Rue / Design-System. Since fingerprint 2.0.0 (request #6) `check-slop --baseline <file>` does this natively, so `scripts/slop-baseline.mjs` and its test are deleted and `proof` calls `check-slop.mjs --baseline scripts/slop-baseline.txt`.
- **P2 Old and new styles side by side.** U1 moves the `global.css` import from the root layout into `(app)/+layout.svelte` and the old `__mockups/+layout.svelte`, so `/__mockups/redesign/*` (with `+layout@.svelte`, reset to root) loads only the fingerprint. The shell foundation (U11) imports the fingerprint CSS in `(app)/+layout.svelte` *after* `global.css`, so fingerprint roles win where names collide; screens not yet rebuilt look transitional until their wave. The cleanup removes `global.css`.
- **P3 Icon path.** The master icon is `Design-System/icons/Notes-Archive/icon.svg`, not `icons/notes/` as scope says: `sync.sh` matches `icons/$(basename <app-path>)` and `icons/TEMPLATE.md` fixes the repo folder name.
- **P4 Icon across repos.** The gate-5 unit designs the master in this repo (`src/routes/__mockups/redesign/hifi/icon/icon.svg`, per `icons/TEMPLATE.md`, slate field) with a preview at 16/32/180/512. Copying it into Design-System and running `build-icons.mjs` is the ecosystem orchestrator's step (flow units commit only here). `sync.sh` adds the `app.html` link tags and `manifest.webmanifest` on every sync; the 2.0.0 re-sync did.
- **P5 "Current folder"** for capture = the folder of the open folder page, or the folder of the open note (the folder the tree is focused on); anywhere else (Home, `/folders`, `/search`, a tag page) the note lands at the top level.
- **P6 Spec deltas.** `gate-1-decisions` modifies "Folder tree", "Pinning", "Folder page" and "Tag pages". This change only REMOVES requirements it replaces outright and ADDS new ones, so its deltas apply cleanly after `gate-1-decisions` is archived. Still-valid requirements that carry old-look wording ("typographic tile", "glass command palette", "Wide layouts", the motion set, note card parts) are reconciled after gate 5, once the hi-fi has fixed the visuals and `main` holds the gate-1 text (task 10.4).
- **P7 Kept names.** Landmarks stay "Sidebar" and "Bottom bar", the Home regions "Pinned" and "Recently edited": they are contract strings asserted across the e2e suite (S27).
- **P8 Drawer removal timing.** The Folders drawer goes in the Home/folder wave together with the drill-down, because the phone paths of the folder e2e tests move from the drawer's tree to the folder pages there. In the shell wave the phone bar's Folders pill still opens the drawer.
- **P9 Mockup photos stay.** S25's "fixtures" are `src/lib/mockups/*`; `fixtures/mockups/` photos stay because e2e (`helpers.photo`) and the redesign mockups use them.
- **P10 One owner per shared file per wave** (see Contracts): `docs/functional-contract.md`, `PRODUCT.md`, `src/lib/copy.ts`, `e2e/helpers.ts`, `(app)/+layout.svelte`, copied primitives.

## Contracts

**Redesign mockups (U1, used by U2–U4, U6–U8)**
- `src/routes/__mockups/redesign/+layout@.svelte` imports the fingerprint CSS only (`tokens`, `fonts`, `base`, `motion`, `layout`), sets `data-accent="slate"` on `<html>`; `+layout.server.ts` calls `requireTestFlag()`.
- `src/routes/__mockups/redesign/fixtures.ts`: `export function mockData(url: URL): MockData` — `?data=worst` selects the worst-case set (DESIGN-reference's worst-case list plus the scope's edges); `MockData` holds `tree` (12 levels in worst), `tags` with counts, `pinned` in a mocked manual order, `recent`, `sort: 'mixed' | 'name' | 'edited' | 'created'`, one folder page, one note (title, properties, every block type), search hits and a tag page. Fixtures are complete after U1; a unit that needs more data adds a local file next to its page, never edits `fixtures.ts`.
- `src/routes/__mockups/redesign/Frame.svelte`: `{ nav?: Snippet; children: Snippet; posture?: 'auto' }` — the app frame from `layout.css`. Owned by the shell unit of each mockup wave (U2, then U6), which replaces its placeholder nav; other units only use it.
- Screens: `wire/<screen>/+page.svelte` (gate 4) and `hifi/<screen>/+page.svelte` (gate 5). Slugs: U2/U6 `tree`, `folders`, `folder`; U3/U7 `home`, `note`, `editor`; U4/U8 `search`, `tag`, `palette`, `overlays` (+ U8 `icon`). `e2e/redesign-shots.test.ts` discovers every page directory and shoots 375/768/1280 × normal/worst into `test-results/shots/redesign/`.

**Shell foundation (U11, used by U12–U20)**
- `src/lib/shell/capture.ts`: `currentFolderId(page: Page, tree: Tree): Id | null` (P5) and `newNote(folderId: Id | null): Promise<void>` (POST, `invalidate('app:tree')`, `goto`). Every New note entry point calls these.
- `src/lib/shell/SideTree.svelte` (no props; reads `page` and layout data) and `src/lib/shell/PhoneBar.svelte` (`{ foldersOpen: boolean; onfolders: () => void }`, the old `BottomBar` props) are mounted by `(app)/+layout.svelte`. In U11 both wrap today's `Sidebar` / `BottomBar` so behaviour is unchanged; U12 and U13 replace their insides. Only U11 and U16 edit `(app)/+layout.svelte`.
- `src/lib/shell/SortMenu.svelte` (`{ placement: 'tree' | 'page' }`, real: reads the stored sort, `PATCH /api/settings`, toast + revert on failure, `invalidate('app:tree')`) and `src/lib/shell/TagList.svelte` (`{ tags: TagCount[] }`, real; absent when empty).
- `COPY` gets every new string fixed at gate 5: `sortLabel: Record<TreeSort, string>`, `sortMenu`, `pinnedConflict: 'Pinned order changed elsewhere — reloaded'`, `moveUp`, `moveDown`, `pathMore`, `backTo(name)`, `folders: 'Folders'`, `foldSidebar`, `unfoldSidebar`, `searchHint`. Units only import them.
- Primitives copied in once with `sync.sh <app-path> --primitive <name>` (`button`, `empty-state`, `field`, `list-row`, `select`, `sheet`, `toast`) into `src/lib/components/`. Edited only by U14 in its wave; later units use them as they are and report needed changes.
- Landmarks and names (P7): navigation "Sidebar" and "Bottom bar"; the tree is `role="tree"` named "Folders"; Home regions "Pinned" and "Recently edited".

**Data the UI reads (unchanged by this change)**
- Layout `{ tree, tags }` (`depends('app:tree')`, tree already in the stored sort after `gate-1-decisions`); Home `{ pinned, recent, tiles }`; folder `{ folder, breadcrumb, tiles, notes, counts }`; note `{ note }`; search `{ query, hits }`; tag `{ tag, notes }`. `/folders` uses layout data only. Every new mutation in the UI calls `invalidate('app:tree')`.

**Contract docs per wave** (R4, R5): U11 owns `docs/functional-contract.md`, `PRODUCT.md` and the copy list for the shell wave (W7–W8); U15 for Home, folder page, `/folders` and the drawer removal (W9); U17 for the note page and editor (W10); U19 for palette, search and tag page (W11). The other units of a wave report their contract deltas; they don't edit the file.

**Shared e2e files:** `e2e/helpers.ts` is edited only by U11 and U16. Each e2e spec file has one owner per wave (listed in the unit's `files=`).

## Risks / Trade-offs

- [Transitional look between waves: old screens render with fingerprint roles over old tokens] → accepted; gate 6 is judged after the last build wave, and e2e is decoupled from visuals.
- [Baseline filter hides a regression in a not-yet-rebuilt file] → keyed by declaration text, so a new or changed declaration fails; Verify also runs bare `check-slop` and reports what is left; U21 removes the baseline.
- [`check-slop` flags a comma-separated token list, e.g. `box-shadow: var(--a), var(--b)`, as `shadow-raw`] → use single shadow tokens; raise it in Design-System `requests.md` (listed for the orchestrator).
- [Gate 4/5 rework loops cost sessions] → each gate's units are parallel and own disjoint screens; the fixer reworks only the flagged screens.
- [`gate-1-decisions` or checkpoint A slips] → the build waits (group 10); gates 4–5 do not depend on either.
- [A primitive needs a change in a later wave] → the builder reports it and the orchestrator applies it between waves; fingerprint changes go to Design-System `requests.md`.
- [Imperatively mounted editor menus] → keep entry points and props (R2); the restyle touches markup and styles only.

## Migration Plan

UI-only; no data migration. Deploy (gate 8, Ship) only after Rue's explicit OK, recording the previous release tag; rollback redeploys that tag through the same playbook.

## Open Questions

- P1: is the check-slop baseline filter acceptable, or should Design-System add an exclude/baseline option to `check-slop` first?
- P5: does "current folder" include the open note's folder (as planned), or only an open folder page?
- The four sort labels and the path/back labels are chosen at gate 5 (S6, S27).

## Gate log

<!-- The orchestrator records each sign-off here: gate, date, Rue's feedback, picks (accent, sort labels). -->
- Gate 3 (flow Gate 0), 2026-11-14: scope.md approved by Rue.
- Gate 1 (flow), 2026-11-14: plan approved; P1 app-owned slop baseline confirmed (plus a Design-System request for an upstream option at checkpoint A); P5 capture from a note page lands in the note's folder.
- Gate 4, 2026-11-14: greyscale wireframes (13 screens × 375/768/1280 × normal/worst) signed off by Rue without changes ("die Screenshots sehen sehr gut aus").
- Gate 5 review round 1, 2026-11-14 (Rue, on the fresh-context review "partly"): note, editor and palette get a second hi-fi round toward the fingerprint (glass, positions, kicker, dark pill) with structure and function kept; the phone bar with round "+" stays (signed off at Gate 4, S7; review finding accepted); the master icon is redrawn from scratch with 2–3 variants for Gate 5 (the folder-with-line read as a stock folder-minus and blurred at 16 px).
- Gate 5, 2026-11-14: hi-fi signed off by Rue after three fresh-context review rounds (round 3 verdict "sibling") and a final polish. Picks: master icon variant a "Filed" (hifi/icon/variants/a.svg, recommended by all three reviews); sort labels Default / Name / Last edited / Created with hints "Folders A–Z, notes by last edit" / "Folders and notes A–Z" / "Newest first" / "Newest first"; note title and properties sit on the field as a glass seg bar above the white body card (supersedes "properties as rows on the editor card"); palette scope pills (All / Notes / Actions) and the slash-menu group rail are kept as new small behaviour; sidebar New note is a quiet row so the screen's arrow pill is the one dark primary. Accent cobalt kept as proposed (Rue did not object; recorded as confirmed). New English strings: see the hi-fi copy reported by units 6–8 and the fixers.
- 9.4 hand-over done 2026-11-14: icon in Design-System icons/Notes-Archive (built), 10 requests filed.
- Gate 7 polish, 2026-11-16 (Rue: "text cursor in text you can't edit", "creating notes and folders is rigid", "the note area is far too small on desktop", "not as polished as the signed artifacts"): chrome text shows the default cursor and controls don't start a selection; the shell becomes the signed frame over the lake colour field; the note column widens to 85ch from 1100 px; Rue decided menus and dialogs now also open and close softly (~160 ms, transform and opacity, instant under reduced motion). Motion inventory, all on fingerprint tokens and `src/lib/ui/motion.ts`: a created row arrives (opacity + 6 px drop + scale 0.98 → 1, `--motion-glide` 260 ms, `--ease-out`), a removed row departs (opacity + scale 0.98, `--motion-quick` 160 ms), the rows that stay reflow (FLIP, 260 ms, `--ease-in-out`) in the tree, folder lists, a folder's notes, Home's lists and tag pages, including empty → first row; menus and popovers pop from their trigger's side (opacity + scale 0.97 → 1, 160 ms in, 120 ms out); dialogs and sheets fade and rise (bottom sheet from its edge in 260 ms, centred dialog 8 px and 0.97 in 160 ms); pressed rows darken, sidebar and tag pills take `data-press`. Instant on purpose: navigation (hushed between onNavigate — only a navigation no guard cancelled — and the frame after afterNavigate), a folder opened by its chevron, the command palette (keyboard, many times a day), the slash menu and bubble toolbar (typing), rename fields (typing). DESIGN.md is vendored, so its Motion section ("Instant on purpose: menus … Notes") is a Design-System request, not an edit here.
