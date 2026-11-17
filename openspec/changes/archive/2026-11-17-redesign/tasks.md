<!--
Waves (max 3 builders each; ⛔ = human stop, the orchestrator ticks it):
W1: 1 · W2: 2 ∥ 3 ∥ 4 · W3: 5 ⛔ gate 4 · W4: 6 ∥ 7 ∥ 8 · W5: 9 ⛔ gate 5 · W6: 10 ⛔ build preconditions
W7: 11 · W8: 12 ∥ 13 ∥ 14 · W9: 15 ∥ 16 · W10: 17 ∥ 18 · W11: 19 ∥ 20 · W12: 21
Gate 7 = flow Verify (proof:full, WCAG 2.2 AA review, review-animations, mobile-native, screenshots at 375/768/1280 looked at,
fresh-context review, icon check, Rue's real-phone checks). Gate 8 = Ship (ship: ask). Neither is a builder unit.
Every builder: load DESIGN.md through `impeccable context` before UI work, style with fingerprint roles only (check-slop),
take Playwright screenshots at 375/768/1280 and look at them before reporting; the brief (DESIGN.md, scope) beats skill taste.
Fingerprint changes go to Design-System requests.md (report them); never edit vendored files.
-->

## 1. Vendor fingerprint 1.0.0 and the redesign mockup scaffold

> unit: depends=none · scope=S23,S25 · files=DESIGN.md, DESIGN.json, DESIGN-reference.md, fingerprint.lock, src/lib/styles/fingerprint/*, scripts/fingerprint/*, static/fonts/fingerprint/*, package.json, AGENTS.md, scripts/slop-baseline.mjs, scripts/slop-baseline.txt, scripts/slop-baseline.test.ts, scripts/proof-guards.test.ts, src/routes/+layout.svelte, src/routes/(app)/+layout.svelte, src/routes/__mockups/+layout.svelte, src/routes/__mockups/redesign/+layout@.svelte, src/routes/__mockups/redesign/+layout.server.ts, src/routes/__mockups/redesign/+page.svelte, src/routes/__mockups/redesign/fixtures.ts, src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/redesign-guard.test.ts, e2e/redesign-shots.test.ts

- [x] 1.1 Run `/home/Rue/Repos/RA-Echosystem/Design-System/scripts/sync.sh /home/Rue/Repos/RA-Echosystem/Notes-Archive` (default invocation, no flags); check that the vendored files, `fingerprint.lock` (1.0.0), the `proof` wiring and the `## Design fingerprint` section in AGENTS.md are in place. sync.sh also appends this repo to Design-System `apps.txt`: leave that file uncommitted there and report it (ecosystem 9.1)
- [x] 1.2 Write the tests "Scenario: Baseline tolerates only recorded violations" (`scripts/slop-baseline.test.ts`) and "Scenario: Proof runs the fingerprint guards" (`scripts/proof-guards.test.ts`), then add `scripts/slop-baseline.mjs` (spawns the vendored `check-slop` unchanged, drops violations listed in `slop-baseline.txt` keyed by file + rule + declaration text, prints the rest with file, line and rule, exits non-zero on any) and generate `slop-baseline.txt` from today's UI before any new code exists (design.md → P1); point `proof` at the filter in place of the bare `check-slop`, keep `check-drift`
- [x] 1.3 Move the `global.css` import from `src/routes/+layout.svelte` into `src/routes/(app)/+layout.svelte` and `src/routes/__mockups/+layout.svelte` (design.md → P2); app and old mockups unchanged
- [x] 1.4 Write "Scenario: Redesign mockups are hidden without the test flag", then add `/__mockups/redesign/`: `+layout@.svelte` (fingerprint CSS only, `data-accent="cobalt"`), `+layout.server.ts` (`requireTestFlag()`), an index page linking every screen, `Frame.svelte` with a placeholder nav, and `fixtures.ts` with the normal and the worst-case set incl. mocked pin order and tree sort (design.md → Contracts; R1)
- [x] 1.5 Write "Scenario: Every mockup screen is shot at three widths" and "Scenario: Worst-case data switches the fixtures" in `e2e/redesign-shots.test.ts` (discovers every page under `/__mockups/redesign/`, 375/768/1280 × normal/worst, waits for fonts, desktop project only)
- [x] 1.6 `npm run proof` green with the guards in it; then `npm run proof:full` once (serialized with the other apps' proofs)

## 2. Gate 4 wireframes: shell, Folders, folder page

> unit: depends=1 · scope=S1,S2,S3,S4,S5,S6,S7,S8,S9,S12 · files=src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/wire/tree/**, src/routes/__mockups/redesign/wire/folders/**, src/routes/__mockups/redesign/wire/folder/**

- [x] 2.1 Load `impeccable` (shape/craft for structure) and use the Mobbin references from design.md (Apple Notes 6a0eb785, Craft cf3931f4, Superlist aea5ea6c, Dropbox Paper 0e73a610); greyscale only: fingerprint type scale and spacing, neutral roles, no accent, imagery, shadows or decoration
- [x] 2.2 `Frame.svelte`: the desktop shell (sidebar with Home / Search / New note, focus tree with path row, chevrons, rail fold, tags footer, sort button) and the phone bar (Home · Folders · Search pills, round "+", current section marked)
- [x] 2.3 `wire/tree`: focus-tree states (top level without path row, focused folder, 12-level path with the shortened middle, note current with expanded ancestors, rail folded, empty tree "No folders yet"); `wire/folders`: `/folders` with counts, tags, sort button, New folder, and its empty states; `wire/folder`: folder page and phone drill-down level (path/back affordance naming the parent, cover / Add cover, sub-folders with counts, notes, "Nothing here yet", only-folders / only-notes, "1 folder" / "1 note")
- [x] 2.4 Load `break-ui` and run it on these screens with the worst-case set; fix what breaks; screenshots at 375/768/1280 looked at; report the screen list for the gate

## 3. Gate 4 wireframes: Home, note page, editor

> unit: depends=1 · scope=S10,S11,S13,S14,S15,S16,S17 · files=src/routes/__mockups/redesign/wire/home/**, src/routes/__mockups/redesign/wire/note/**, src/routes/__mockups/redesign/wire/editor/**

- [x] 3.1 Load `impeccable`; greyscale only (as 2.1); screens sit in `Frame.svelte` (owned by unit 2)
- [x] 3.2 `wire/home`: the desk (search entry, New note, Pinned with drag handle and entry menu Move up / Move down, Recently edited 8), welcome state with and without folders, no pins, one pin (no reorder controls)
- [x] 3.3 `wire/note`: multi-line title, properties as rows on the editor card, phone summary line (path · tag count) collapsed and expanded, save status in every state (Saving…, Saved, Couldn't save — try again, This note was deleted), new note with placeholders; `wire/editor`: every G4 surface (slash menu, bubble toolbar, handle, block menu, table actions, code language, callout emoji, image caption, file card, link preview, toggle, task)
- [x] 3.4 Load `break-ui`, worst case (200-character and 12-line titles, 40 tags, 12-level path, wide table, unbroken words); fix; screenshots at 375/768/1280 looked at; report

## 4. Gate 4 wireframes: search, tag page, palette, overlays

> unit: depends=1 · scope=S18,S19,S20,S21,S22 · files=src/routes/__mockups/redesign/wire/search/**, src/routes/__mockups/redesign/wire/tag/**, src/routes/__mockups/redesign/wire/palette/**, src/routes/__mockups/redesign/wire/overlays/**

- [x] 4.1 Load `impeccable`; greyscale only (as 2.1); screens sit in `Frame.svelte` (owned by unit 2)
- [x] 4.2 `wire/search`: query, folder and tag filters, idle hint, results, "No notes match “<q>”", "No results", "1 result"; `wire/tag`: heading and notes, "1 note"; `wire/palette`: empty (Recent + Actions), typing (≤8 hits, See all results), no hits, phone full-screen
- [x] 4.3 `wire/overlays`: delete confirm (note; folder with counts, before and after counts load), Move to chooser (Root + tree order), icon picker, cover menu, note and folder menus, sort menu, toast
- [x] 4.4 Load `break-ui`, worst case (long queries, long tag names, many hits); fix; screenshots at 375/768/1280 looked at; report

## 5. ⛔ Gate 4 sign-off (human stop)

> unit: depends=2,3,4 · scope=none · files=openspec/changes/redesign/design.md

- [x] 5.1 Orchestrator: run `e2e/redesign-shots.test.ts` once (serialized), check every `wire/*` screen has 375/768/1280 × normal/worst shots, and present them to Rue with the hierarchy question (primary action and main content identifiable without colour)
- [x] 5.2 ⛔ Rue signs off gate 4 (or asks for a rework, which goes to a fixer on the named screens); record date and feedback in design.md → Gate log

## 6. Gate 5 hi-fi: shell, Folders, folder page

> unit: depends=5 · scope=S1,S2,S3,S4,S5,S6,S7,S8,S9,S12 · files=src/routes/__mockups/redesign/Frame.svelte, src/routes/__mockups/redesign/hifi/tree/**, src/routes/__mockups/redesign/hifi/folders/**, src/routes/__mockups/redesign/hifi/folder/**

- [x] 6.1 Load `impeccable` (craft on the vendored fingerprint, accent cobalt) and `emil-design-eng` for the tree, rail and drill-down interactions; start from the signed-off wireframes
- [x] 6.2 `Frame.svelte` in hi-fi: sidebar, focus tree, path row, rail, tags footer, sort picker with four mode labels proposed in English (S6), phone bar glass pills and round "+"
- [x] 6.3 `hifi/tree`, `hifi/folders`, `hifi/folder`: every contract state of the shell, `/folders`, folder page and drill-down level, English copy (new strings proposed for the copy list: sort labels, path "more" control, back label)
- [x] 6.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean for these files; screenshots at 375/768/1280 looked at; report

## 7. Gate 5 hi-fi: Home, note page, editor

> unit: depends=5 · scope=S10,S11,S13,S14,S15,S16,S17 · files=src/routes/__mockups/redesign/hifi/home/**, src/routes/__mockups/redesign/hifi/note/**, src/routes/__mockups/redesign/hifi/editor/**

- [x] 7.1 Load `impeccable` and `emil-design-eng` (pinned drag and Move up / Move down feedback, reduced motion); start from the signed-off wireframes
- [x] 7.2 `hifi/home`: every Home state incl. the 409 toast "Pinned order changed elsewhere — reloaded"; `hifi/note`: title, property rows and phone summary, every save state, new-note placeholders
- [x] 7.3 `hifi/editor`: every G4 surface on the fingerprint, text colours from `--text-<name>`, code block syntax roles
- [x] 7.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean; screenshots at 375/768/1280 looked at; report

## 8. Gate 5 hi-fi: search, tag page, palette, overlays, master icon

> unit: depends=5 · scope=S18,S19,S20,S21,S22,S24 · files=src/routes/__mockups/redesign/hifi/search/**, src/routes/__mockups/redesign/hifi/tag/**, src/routes/__mockups/redesign/hifi/palette/**, src/routes/__mockups/redesign/hifi/overlays/**, src/routes/__mockups/redesign/hifi/icon/**

- [x] 8.1 Load `impeccable`; start from the signed-off wireframes; `hifi/search`, `hifi/tag`, `hifi/palette` with every contract state and English copy
- [x] 8.2 `hifi/overlays`: dialogs, menus, choosers and toasts on the fingerprint primitives (read Design-System `primitives/`), focus states visible
- [x] 8.3 Master icon with `impeccable` per Design-System `icons/TEMPLATE.md` (grid, safe zone, cobalt field), glyph from the main jobs (capture, find, file in folders): `hifi/icon/icon.svg` plus a preview page at 16/32/180/512 (design.md → P3, P4)
- [x] 8.4 Load `break-ui` with the worst-case set; fix; `check-slop` clean; screenshots at 375/768/1280 looked at; report

## 9. ⛔ Gate 5 review and sign-off (human stop)

> unit: depends=6,7,8 · scope=none · files=openspec/changes/redesign/design.md, src/routes/__mockups/redesign/hifi/**

- [x] 9.1 Orchestrator: run `e2e/redesign-shots.test.ts` (serialized) and check every contract state is rendered (contract §4 states per route, §7 cross-cutting)
- [x] 9.2 Orchestrator: fresh-context review by an agent that gets only `DESIGN.md`, `scripts/fingerprint/banned.md` and the hifi screenshots at 375/768/1280, normal and worst case, plus the icon at 16/32/180/512 (Design-System `scripts/review-brief.md`); its findings go to a fixer on `hifi/**` or are accepted by Rue with a recorded reason
- [x] 9.3 ⛔ Rue signs off gate 5 with the master icon; record in design.md → Gate log: date, accent cobalt confirmed, the four sort labels and the other new strings
- [x] 9.4 Hand-over for the ecosystem orchestrator: the master icon goes to Design-System `icons/Notes-Archive/icon.svg` and through `build-icons.mjs --from <app-path>`; fingerprint requests from units 6–8 go to `requests.md` (not done by flow units)

## 10. ⛔ Build preconditions (human stop, orchestrator)

> unit: depends=9 · scope=S23,S24 · files=src/lib/styles/fingerprint/*, scripts/fingerprint/*, DESIGN.md, DESIGN.json, DESIGN-reference.md, fingerprint.lock, static/*, openspec/changes/redesign/specs/**

- [x] 10.1 ⛔ Checkpoint A closed (ecosystem 10): `requests.md` resolved, at most one fingerprint bump, and `sync.sh <app-path>` re-run here (also vendors the icon set into `static/`); `proof` green
- [x] 10.2 ⛔ `gate-1-decisions` merged to `main`; `git fetch` and merge `origin/main` into `flow/redesign` (pin order, settings API, migration 0005, folder counts, multi-line titles, tag-page redirect)
- [x] 10.3 Confirm the merge and the re-sync added no new `check-slop` violation: `check-slop --baseline scripts/slop-baseline.txt` stays green (since fingerprint 2.0.0 the baseline is the vendored option; `scripts/slop-baseline.mjs` is gone and the file holds only entries that still match; never add entries)
- [x] 10.4 Planner: reconcile still-valid requirements that carry old-look wording with the signed-off hi-fi ("Folder page" typographic tile, "Folder cover", "Command palette" glass, "Note cards", "Wide layouts", the motion set): MODIFIED or REMOVED deltas against the post-gate-1 text; `openspec validate redesign --strict`
- [x] 10.5 `npm run proof:full` green on `flow/redesign` before wave W7

## 11. Shell foundation: fingerprint switch, icon links, capture, sort menu, tag list, copy

> unit: depends=10 · scope=S5,S6,S17,S23,S24,S26,S27 · files=src/app.html, src/hooks.server.ts, src/routes/(app)/+layout.svelte, src/lib/shell/capture.ts, src/lib/shell/capture.test.ts, src/lib/shell/SideTree.svelte, src/lib/shell/PhoneBar.svelte, src/lib/shell/SortMenu.svelte, src/lib/shell/TagList.svelte, src/lib/components/*, src/lib/copy.ts, src/lib/copy.test.ts, static/manifest.webmanifest, e2e/helpers.ts, e2e/fingerprint.test.ts, e2e/icons.test.ts, e2e/sort-picker.test.ts, e2e/capture.test.ts, e2e/fonts.test.ts, e2e/home-hero.test.ts, e2e/note-page.test.ts, e2e/folder-body.test.ts, docs/functional-contract.md, PRODUCT.md

- [x] 11.1 Write "Scenario: App renders with the slate accent", "Scenario: Fingerprint fonts load from the app", "Scenario: App pages load nothing from other origins" (`e2e/fingerprint.test.ts`); then `<html lang="en" data-accent="slate">` in `app.html` in place of `%look%`, drop the `%look%` transform from `hooks.server.ts`, fingerprint font preloads, fingerprint CSS imported in `(app)/+layout.svelte` after `global.css` (design.md → P2). Delete `e2e/fonts.test.ts` and the old-look assertions (Newsreader, bronze) in `home-hero`, `note-page`, `folder-body` (requirements "Fonts", "Look switches" are removed)
- [x] 11.2 Write "Scenario: Icon files are served", "Scenario: Manifest references existing icons", "Scenario: Head carries the icon links" (`e2e/icons.test.ts`); add the `app.html` link tags, `theme-color` and `static/manifest.webmanifest` per the app-icons spec if the re-sync didn't (design.md → P4)
- [x] 11.3 Copy in the primitives with `sync.sh <app-path> --primitive <name>` (button, empty-state, field, list-row, select, sheet, toast); add the new `COPY` keys from design.md → Gate log / Contracts; write "Scenario: Contract strings stay" and "Scenario: New strings are in the contract" in `copy.test.ts`
- [x] 11.4 Write "Scenario: New note from the shell lands in the current folder", "Scenario: New note without a current folder lands at the top level", "Scenario: New note shows its placeholders" (`e2e/capture.test.ts`, `capture.test.ts`); add `capture.ts` (design.md → P5) and route every existing New note entry point through it
- [x] 11.5 Write "Scenario: Sort picker marks the current mode", "Scenario: Choosing a mode re-sorts and persists", "Scenario: Failed sort save reverts with a toast", "Scenario: Sort leaves the other lists alone" (`e2e/sort-picker.test.ts`, desktop); add `SortMenu.svelte` and `TagList.svelte` (real), `SideTree.svelte` and `PhoneBar.svelte` as wrappers around today's `Sidebar` / `BottomBar` with the sort menu in the tree header; mount them in `(app)/+layout.svelte`; add the posture helpers the later units need to `e2e/helpers.ts`
- [x] 11.6 Contract and product docs for the shell wave (R4, R5): `docs/functional-contract.md` §7 (focus tree, rail, sort picker, phone bar pills, capture into the current folder), §8 copy list with every new string, §9 allow-list unchanged; `PRODUCT.md` accessibility line → WCAG 2.2 AA only; `proof:full` green

## 12. Desktop focus tree, rail and tags

> unit: depends=11 · scope=S1,S2,S3,S4,S5,S26 · files=src/lib/shell/SideTree.svelte, src/lib/shell/Sidebar.svelte, src/lib/shell/TagsSection.svelte, src/lib/shell/sidebar.ts, src/lib/shell/sidebar.test.ts, src/lib/shell/tree/*, src/lib/shell/focus.ts, src/lib/shell/focus.test.ts, e2e/sidebar.test.ts, e2e/sidebar-collapse.test.ts, e2e/tree.test.ts, e2e/tree-edges.test.ts, e2e/tree-focus.test.ts, e2e/tree-keyboard.test.ts, e2e/tags-section.test.ts, e2e/folder-create.test.ts, e2e/folder-rename-move.test.ts, e2e/layout.test.ts, e2e/drawer.test.ts

- [x] 12.1 Load `impeccable` (build from the signed-off `hifi/tree` and `Frame.svelte`), `emil-design-eng` (the tree expands, collapses and folds into the rail instantly: DESIGN.md allows motion only for press, the gliding pill, settle and confirm-line, so no tree or rail animation). New tree components under `src/lib/shell/tree/`; leave `src/lib/folders/FolderTree.svelte` and `TreeRow.svelte` alone (the phone drawer still uses them until unit 16)
- [x] 12.2 Write "Scenario: Opening a folder focuses the tree on it", "Scenario: Path row links go up", "Scenario: Top level has no path row", "Scenario: Deep path shortens the middle", "Scenario: Long names stay readable in the tree", "Scenario: Deleting the focused folder moves the focus up" (`e2e/tree-focus.test.ts`) and the `focus.ts` unit tests; then build the focus tree with the path row; keep "Empty tree offers New folder" and "Untitled note in the tree reads Untitled" green
- [x] 12.3 Write "Scenario: Opening a note from search focuses its folder", "Scenario: Top-level note shows the top level", "Scenario: Moving the open note moves the focus", "Scenario: Deleting the open note keeps its folder focused"; then make the tree follow the open note
- [x] 12.4 Write "Scenario: Chevron expands without navigating", "Scenario: Manual open state lasts until reload", "Scenario: Empty folder has no chevron", "Scenario: Tree focuses the open note folder and marks its row", "Scenario: Arrow keys move through the tree" (`e2e/tree-keyboard.test.ts`); then chevrons, open state and `tree`/`treeitem` keyboard handling; folder row menu keeps New note / New folder / Rename / Move to… / Delete
- [x] 12.5 Write "Scenario: One control folds the tree into a rail", "Scenario: Rail state survives a reload without a flash", "Scenario: Storage unavailable falls back to expanded", "Scenario: Rail controls keep accessible names", "Scenario: Tags sit below the tree with counts", "Scenario: Tags section is absent without tags", "Scenario: Tag counts update without reload"; then the rail (in `sidebar.ts`) and `TagList` below the tree; delete `Sidebar.svelte` and `TagsSection.svelte`
- [x] 12.6 Migrate the desktop paths of the listed e2e files that pinned the old sidebar/tree (indent cap, ellipsis tooltip, glass); keep phone paths working; screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at wave merge (orchestrator))

## 13. Phone bar

> unit: depends=11 · scope=S7,S26 · files=src/lib/shell/PhoneBar.svelte, src/lib/shell/BottomBar.svelte, e2e/bottom-bar.test.ts, e2e/bottom-bar-typing.test.ts

- [x] 13.1 Load `impeccable` (from `hifi` `Frame.svelte`) and `mobile-native` (safe areas, tap highlight, 100vh, keyboard)
- [x] 13.2 Write "Scenario: Phone bar shows three pills and New note", "Scenario: Current section is marked", "Scenario: Bar hides while the editor has focus", "Scenario: Bar fits 320 px with safe areas"; then build the pills and the round "+" (through `capture.ts`) in `PhoneBar.svelte`; the Folders pill still opens the drawer through the `onfolders` prop (design.md → P8); delete `BottomBar.svelte`
- [x] 13.3 Screenshots at 320/375/768 looked at; `proof:full` green (proof:full at the W8 merge: exit 0, 466 e2e passed, 2026-11-16)

## 14. Dialogs, menus, choosers and toasts

> unit: depends=11 · scope=S21,S22,S26 · files=src/lib/ui/*, src/lib/components/*, src/lib/shell/Toast.svelte, src/lib/shell/toast.ts, src/lib/shell/toast.test.ts, e2e/dialogs.test.ts, e2e/toasts.test.ts, e2e/card-menu.test.ts, e2e/note-delete.test.ts, e2e/folder-delete.test.ts, e2e/move-note.test.ts, e2e/note-icon.test.ts

- [x] 14.1 Load `impeccable` (from `hifi/overlays`) and `emil-design-eng` (press feedback only; menus, dialogs and popovers open and close instantly, with no animation, as DESIGN.md says)
- [x] 14.2 Write "Scenario: Delete confirm shows counts once known", "Scenario: Move to chooser starts with Root in tree order", "Scenario: Modal dialog traps focus and returns it", "Scenario: Outside click cancels a menu or dialog" (`e2e/dialogs.test.ts`); then rebuild `Dialog`, `Menu`, `Sheet`, `FolderPicker`, `EmojiPicker`, `DeleteFolder` content and the overlay helpers on the copied primitives, keeping every component's props
- [x] 14.3 Write "Scenario: Toast is a polite status for about four seconds", "Scenario: Toast survives a redirect" (`e2e/toasts.test.ts`); then restyle `Toast.svelte` on the toast primitive
- [x] 14.4 Keep the listed behaviour e2e green (role/name changes only where the hi-fi demands them); screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at wave merge, orchestrator)

## 15. Home desk and pinned reorder

> unit: depends=12,13,14 · scope=S10,S11,S26,S27 · files=src/routes/(app)/+page.svelte, src/lib/home/*, src/lib/notes/NoteCard.svelte, src/lib/notes/NoteGrid.svelte, src/lib/notes/CardMenu.svelte, e2e/home-hero.test.ts, e2e/home-bento.test.ts, e2e/home-welcome.test.ts, e2e/home-pinned.test.ts, e2e/home-desk.test.ts, e2e/pinned-reorder.test.ts, e2e/cards.test.ts, e2e/card-menu.test.ts, e2e/morph.test.ts, e2e/transitions.test.ts, docs/functional-contract.md

- [x] 15.1 Load `impeccable` (from `hifi/home`), `emil-design-eng` and `animate` for the pinned reorder motion only (menus and popovers stay instant, press stays on the DESIGN.md hook)
- [x] 15.2 Write "Scenario: Home shows search, New note, Pinned and Recently edited", "Scenario: Home search entry opens the palette", "Scenario: Home has no folders", "Scenario: No notes shows the welcome state even with folders", "Scenario: Pinned is absent without pins", "Scenario: One pinned note has no reorder controls", "Scenario: Long titles and snippets stay in their entries", "Scenario: One note reads singular" (`e2e/home-desk.test.ts`); keep "Recently edited shows the eight latest notes"; then build the desk and the note entries (`NoteCard`, `NoteGrid`); delete `Hero`, `Bento`, `Welcome` and their e2e (`home-hero`, `home-bento`, `home-welcome`) once the new tests cover them; update `cards.test.ts`, "Pin from a card menu" and "Unpinning the last note hides the Pinned list" to the MODIFIED "Note cards" / "Pinning" text; delete `e2e/morph.test.ts` and `e2e/transitions.test.ts` (motion requirements removed)
- [x] 15.3 Write "Scenario: Drag a pinned note to a new place", "Scenario: Move up and Move down reorder from the menu", "Scenario: Move up and Move down are disabled at the ends", "Scenario: A stale reorder reloads the list with a toast", "Scenario: Failed reorder reverts with a toast", "Scenario: New pins appear first", "Scenario: Reduced motion moves without animation" (`e2e/pinned-reorder.test.ts`); then drag with a handle (pointer) and Move up / Move down in `CardMenu` (`PUT /api/pinned`, 409 → reload + toast, other error → revert + toast)
- [x] 15.4 Contract for this wave (R4): §4.1 Home (no folders, welcome whenever no notes, pin reorder, 409 toast), §4.2 folder page, `/folders` as a new route section, drawer removal in §7, §10 route table, §4.6/4.7 entries; screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at the W9 merge: exit 0, 477 e2e + 411 unit passed, 2026-11-16)

## 16. Folder page, Folders page and phone drill-down

> unit: depends=12,13,14 · scope=S8,S9,S12,S26 · files=src/routes/(app)/+layout.svelte, src/routes/(app)/folders/+page.svelte, src/routes/(app)/folders/[id]/+page.svelte, src/lib/shell/PhoneBar.svelte, src/lib/shell/Drawer.svelte, src/lib/folders/*, e2e/helpers.ts, e2e/drawer.test.ts, e2e/folders-page.test.ts, e2e/drill-down.test.ts, e2e/folder-page.test.ts, e2e/folder-actions.test.ts, e2e/folder-body.test.ts, e2e/folder-cover.test.ts, e2e/folder-create.test.ts, e2e/folder-delete.test.ts, e2e/folder-header.test.ts, e2e/folder-rename-move.test.ts, e2e/journey.test.ts, e2e/move-note.test.ts, e2e/tag-input.test.ts, e2e/tag-page.test.ts, e2e/tags-section.test.ts, e2e/tree-edges.test.ts, e2e/layout.test.ts, src/lib/server/folders.test.ts

- [x] 16.1 Load `impeccable` (from `hifi/folders`, `hifi/folder`) and `mobile-native` (back gesture, drill-down on touch)
- [x] 16.2 Write "Scenario: Folders page lists top-level folders with counts, then tags", "Scenario: Folders pill opens the Folders page", "Scenario: No folders shows No folders yet", "Scenario: New folder from the Folders page", "Scenario: Desktop Folders page shows the tree at the top level", "Scenario: Tags follow the folders on the phone", "Scenario: Sort picker on the phone lives on the Folders page" (`e2e/folders-page.test.ts`); then add `src/routes/(app)/folders/+page.svelte` (layout data only, `TagList`, `SortMenu placement="page"`), turn the Folders pill into a link, remove the drawer from `(app)/+layout.svelte`, delete `Drawer.svelte` and `e2e/drawer.test.ts`
- [x] 16.3 Write "Scenario: Each level is its own page", "Scenario: Back goes up a level", "Scenario: Deep levels stay readable", "Scenario: Empty level offers New note and New folder" (`e2e/drill-down.test.ts`); then the drill-down level with the back affordance on the folder page
- [x] 16.4 Write "Scenario: Folder page shows path, cover, sub-folders and notes", "Scenario: Only sub-folders or only notes omits the other section", "Scenario: Cover menu adds, changes and removes the cover", "Scenario: Cover upload failure shows a toast", "Scenario: Folder counts read singular", "Scenario: New folder appears without reload", "Scenario: Folder menu offers Rename, Move to and Delete", "Scenario: Long folder names wrap on the folder page" (`e2e/folder-page.test.ts`); then rebuild the folder page components in `src/lib/folders/`; update `folder-body`, `folder-cover` and the `folders.test.ts` "Header and parent row count the same" title to the MODIFIED "Folder page" / "Folder cover" text (the typographic-tile scenario is retired); rewrite `layout.test.ts` "Grids add columns…" and "Mid-width…" as "Home lists sit side by side on wide screens" and "Mid-width shows the sidebar with stacked lists"; delete `FolderTree.svelte` / `TreeRow.svelte` when nothing imports them; note rows on the folder page keep their ⋯ card menu (Pin/Unpin, Move to…, Delete)
- [x] 16.5 Move every phone path in the listed e2e files from the drawer to `/folders` and the folder pages (update the posture helper in `e2e/helpers.ts`); screenshots at 320/375/768/1280 looked at; `proof:full` green (proof:full at the W9 merge: exit 0, 477 e2e + 411 unit passed, 2026-11-16)

## 17. Note page

> unit: depends=15,16 · scope=S13,S14,S15,S17,S26,S27 · files=src/routes/(app)/notes/[id]/NotePage.svelte, src/routes/(app)/notes/[id]/+page.svelte, src/lib/notes/NoteHeader.svelte, src/lib/notes/NoteIcon.svelte, src/lib/notes/NoteMenu.svelte, src/lib/notes/NoteProperties.svelte, src/lib/notes/NoteTitle.svelte, src/lib/notes/SaveStatus.svelte, src/lib/notes/TagInput.svelte, src/lib/notes/FolderField.svelte, src/lib/notes/titleKeys.ts, src/lib/notes/titleKeys.test.ts, e2e/note-page.test.ts, e2e/note-title.test.ts, e2e/save-status.test.ts, e2e/note-icon.test.ts, e2e/properties-pin.test.ts, e2e/tag-input.test.ts, e2e/autosave.test.ts, e2e/autosave-errors.test.ts, e2e/discard.test.ts, e2e/note-switch.test.ts, e2e/shortcuts.test.ts, docs/functional-contract.md

- [x] 17.1 Load `impeccable` (from `hifi/note`); the carried-over "Creating a note" and "Note page" scenarios (title focus, discard, icon picker, tab title, long title) stay green under their existing test names
- [x] 17.2 Write "Scenario: Enter in the title adds a line break", "Scenario: Cmd or Ctrl+Enter moves to the body", "Scenario: ArrowDown on the last title line moves to the body", "Scenario: Title is the page heading", "Scenario: Pasted CRLF text keeps its line breaks", "Scenario: Many short title lines stay in the column" (`e2e/note-title.test.ts`, `titleKeys.test.ts`); then the multi-line `NoteTitle` (stops stripping line breaks; uses the server's LF rule from `gate-1-decisions`)
- [x] 17.3 Write "Scenario: Properties show under the title", "Scenario: Properties collapse into a summary on the phone", "Scenario: Property changes save at once", "Scenario: Many tags wrap without horizontal scroll", "Scenario: Long folder path stays readable in the properties", "Scenario: Note without tags shows no tag count" (in `e2e/note-page.test.ts`); then the properties in the glass bar under the title with the phone summary line; keep "Scenario: Note column is capped and centred on wide screens" (`e2e/shortcuts.test.ts`) with its name: the 720 px cap becomes `--measure` plus the card padding and the centring check stays (shell "Wide layouts")
- [x] 17.4 Write "Scenario: Save status shows Saving and Saved", "Scenario: Failed saves show one toast and a retry status", "Scenario: Saving stops after the note was deleted elsewhere", "Scenario: Save status is not a live region" (`e2e/save-status.test.ts`); then the actionable `SaveStatus`; keep `[data-save-state]`
- [x] 17.5 Contract for this wave (R4): §4.3 (title keys, property rows, save status), §5.2 editor chrome; screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at the W10 merge: exit 0, 509 e2e + 415 unit passed, 2026-11-16)

## 18. Editor on the fingerprint

> unit: depends=15,16 · scope=S16,S26 · files=src/lib/editor/*.svelte, src/lib/editor/floating.ts, src/lib/styles/prose.css, e2e/editor-surfaces.test.ts, e2e/blocks-slash.test.ts, e2e/block-menu.test.ts, e2e/bubble.test.ts, e2e/bubble-link.test.ts, e2e/callout.test.ts, e2e/code-block.test.ts, e2e/file-card.test.ts, e2e/handle.test.ts, e2e/image-block.test.ts, e2e/image-insert.test.ts, e2e/link-preview.test.ts, e2e/link-preview-fallback.test.ts, e2e/slash.test.ts, e2e/slash-all.test.ts, e2e/slash-phone.test.ts, e2e/table.test.ts, e2e/task-list.test.ts, e2e/toggle.test.ts

- [x] 18.1 Load `impeccable` (from `hifi/editor`) and `mobile-native` (slash menu above the keyboard, bubble toolbar vs. native selection menu); keep every menu's entry point and props (R2); extensions and stored attributes unchanged (R3)
- [x] 18.2 Write "Scenario: Handle on touch targets the cursor's block", "Scenario: Long unbroken words wrap", "Scenario: Very long note stays usable", "Scenario: Text colours keep their stored names" (`e2e/editor-surfaces.test.ts`)
- [x] 18.3 Restyle every G4 surface and `prose.css` with fingerprint roles (text colours `--text-<name>`, syntax roles, mono font token); editor menus open without animation (rewrite "Editor menus open with a short animation" in `slash-phone.test.ts` as "Scenario: Editor menus open without animation"); the existing editor suite stays green unchanged except role/name changes the hi-fi demands
- [x] 18.4 Screenshots of every surface at 375/768/1280 looked at; `proof:full` green (proof:full at the W10 merge: exit 0, 509 e2e + 415 unit passed, 2026-11-16)

## 19. Command palette and search page

> unit: depends=17,18 · scope=S18,S19,S26,S27 · files=src/lib/search/*, src/routes/(app)/search/+page.svelte, e2e/palette.test.ts, e2e/palette-actions.test.ts, e2e/palette-editor.test.ts, e2e/palette-results.test.ts, e2e/palette-states.test.ts, e2e/search-page.test.ts, e2e/search-states.test.ts, e2e/note-menu-search.test.ts, e2e/shortcuts.test.ts, docs/functional-contract.md

- [x] 19.1 Load `impeccable` (from `hifi/palette`, `hifi/search`) and `emil-design-eng` (palette open/close)
- [x] 19.2 Write "Scenario: Empty palette shows Recent and Actions", "Scenario: Typing shows at most eight highlighted hits", "Scenario: Back closes the palette on touch" (`e2e/palette-states.test.ts`); then restyle `CommandPalette` keeping `palette.svelte.ts` behaviour (selection restore, Cmd/Ctrl+K on a selection)
- [x] 19.3 Write "Scenario: Typing replaces the URL after 200 ms", "Scenario: Changing a filter pushes a history entry", "Scenario: Idle search page shows the hint", "Scenario: Query without hits says No notes match", "Scenario: Filters without hits say No results", "Scenario: One result reads singular", "Scenario: Results stop at fifty", "Scenario: Long query wraps and survives a reload" (`e2e/search-states.test.ts`); then rebuild `/search` and `SearchFilters`
- [x] 19.4 Contract for this wave (R4): §4.4, §4.5, §6; screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at the W11 merge: exit 0, 535 e2e + 415 unit passed, 2026-11-16)

## 20. Tag page

> unit: depends=17,18 · scope=S20,S26 · files=src/routes/(app)/tags/[id]/+page.svelte, e2e/tag-page.test.ts

- [x] 20.1 Load `impeccable` (from `hifi/tag`)
- [x] 20.2 Write "Scenario: Tag page shows the tag heading and its notes", "Scenario: Long tag name heading wraps", "Scenario: One tagged note reads singular" (in `e2e/tag-page.test.ts`); then rebuild the tag page on the note entries; keep "Deleting the last tagged note goes Home" green
- [x] 20.3 Screenshots at 375/768/1280 looked at; `proof:full` green (proof:full at the W11 merge: exit 0, 535 e2e + 415 unit passed, 2026-11-16)

## 21. Remove the old styling, accessibility floor, graph

> unit: depends=19,20 · scope=S23,S25,S26 · files=src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/tokens.test.ts, src/lib/styles/global.css, src/lib/styles/global.test.ts, src/lib/styles/guard.test.ts, src/lib/styles/look.ts, src/lib/motion.ts, src/routes/(app)/+layout.svelte, src/routes/__mockups/+layout.svelte, src/routes/__mockups/{home,folder,note,search,drawer,components,primitives}/**, src/routes/__mockups/mockups-guard.test.ts, src/lib/mockups/*, src/lib/ui/*, static/fonts/*, package.json, scripts/slop-baseline.mjs, scripts/slop-baseline.txt, scripts/slop-baseline.test.ts, scripts/no-old-styles.test.ts, e2e/a11y-floor.test.ts, src/lib/motion.test.ts, src/lib/shell/morph.ts, src/lib/shell/morph.test.ts, graphify-out/*

- [x] 21.1 Write "Scenario: Old style files are gone" and "Scenario: Proof runs check-slop without a baseline" (`scripts/no-old-styles.test.ts`)
- [x] 21.2 ⚠ irreversible: delete `tokens.css`, `tokens.ts`, `global.css`, `look.ts`, `tokens.test.ts`, `guard.test.ts`, `global.test.ts`, the old `/__mockups` routes (keep `+layout.server.ts`, the `photo` route and `/__mockups/redesign/*`), `src/lib/mockups/*`, unused old atoms in `src/lib/ui/` and the old `static/fonts/*` (Newsreader, Figtree); move what `motion.ts` still needs onto fingerprint tokens and delete `src/lib/shell/morph.ts`, its `onNavigate` hook and test, and the stagger/reveal cases of `motion.test.ts` (motion requirements removed); remove the `global.css` import (design.md → P2, P9)
- [x] 21.3 Delete `scripts/slop-baseline.txt` (the `.mjs` and its test went with the 2.0.0 sync) and restore `proof` to the exact line `sync.sh` writes; plain `check-slop` must pass with no baseline
- [x] 21.4 Write "Scenario: No horizontal page scroll from 320 to 1920", "Scenario: Targets are at least 24 px", "Scenario: Focus is visible and not obscured", "Scenario: Reduced motion removes movement" (`e2e/a11y-floor.test.ts`, worst-case seed across Home, `/folders`, a deep folder page, a long note, `/search`, a tag page); fix what fails in the owning components
- [x] 21.5 `proof:full` green (serialized); then, as the very last step of the build and in this unit only, `graphify update .`
