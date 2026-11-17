## Why

Rue keeps uni notes, long documents and everyday lists in Notes Archive. Long writing happens on the desktop; quick capture and look-ups happen on the phone. The folder tree is the main way into a note and the biggest pain: deep nesting makes it unwieldy (long indents, truncated names, hard to keep an overview), on both devices. The UI also has to move onto the shared design fingerprint (Design-System 1.0.0). This change is gates 3–8 of the ecosystem pipeline for Notes Archive; gate 3 (this scope) was signed off on 2026-11-14.

## What Changes

- **Fingerprint.** Vendor fingerprint 2.0.0 with `sync.sh`; `check-slop` and `check-drift` run in `proof`; accent slate (S23). App icon from the fingerprint's icon family (S24).
- **Navigation model** (gate-3 structural decision). Desktop: a *focus tree* that steps into the open folder and shows a path row back up, follows the open note, expands with a chevron, folds into a rail, carries the tags below it and a quiet sort picker (S1–S6). Phone: a bar with Home · Folders · Search pills plus a round "+" (S7), a new UI-only `/folders` page (S8) and drill-down through `/folders/[id]`, one level per screen (S9). **BREAKING (UI):** the phone Folders drawer goes away.
- **Home is the desk:** search entry, New note, Pinned in Rue's order with drag and Move up / Move down, Recently edited; top-level folders leave Home; welcome state whenever there are no notes (S10, S11).
- **Folder page:** path, cover menu, sub-folders with counts, notes newest edited first, folder menu (S12).
- **Note page:** multi-line title, properties as collapsible rows on the editor card, actionable save status, capture in the current folder (S13–S15, S17); today's editor restyled with every block, mark, menu and shortcut kept (S16).
- **Search, palette, tags:** palette and `/search` per contract on the new look; tag page (S18–S20).
- **Shared surfaces:** dialogs, menus, choosers and toasts on the fingerprint primitives (S21, S22).
- **Cleanup:** old tokens, global styles, look switches, their guard tests and the old `/__mockups` are removed; the gate 4/5 mockups live under `/__mockups/redesign/*` (S25).
- **Cross-cutting:** WCAG 2.2 AA, reduced motion, no horizontal scroll from 320 to 1920 px (S26); English copy, new strings added to the contract copy list (S27).
- The work runs in the pipeline's fixed gate order: gate 4 greyscale wireframes and gate 5 hi-fi (incl. the master icon), each ending with Rue's sign-off; gate 6 builds in waves (shell → Home/folder → note page/editor → search/tags → cleanup) only after `gate-1-decisions` is merged and checkpoint A has re-synced the fingerprint; gate 7 is flow's Verify; gate 8 is Ship.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system`: the local token/look/glass/font/guard system and the old mockups are replaced by the vendored fingerprint, the app icon, the redesign mockups, the accessibility floor and the copy rule.
- `shell`: desktop sidebar, tree, phone bar/drawer and tags section are replaced by the focus tree, tree rail, tags list, sort picker, phone bar, `/folders`, dialogs/menus and toasts.
- `home`: hero and bento replaced by the desk with pinned reorder.
- `folders`: folder page layout and phone drill-down added.
- `notes`: capture lands in the current folder; note page gets title editing, property rows and the save status.
- `editor`: the editor surfaces move onto the fingerprint with their behaviour kept.
- `search`: palette and search page states on the new look.
- `tags`: tag page layout.

## Impact

- UI layer only: `src/routes/(app)/**/+page.svelte`, `(app)/+layout.svelte`, the new `(app)/folders/+page.svelte`, `src/lib/{shell,folders,home,notes,search,ui,editor}/**`, `src/lib/styles/**`, `src/app.html`, `src/hooks.server.ts` (the `%look%` placeholder only), `static/` (fingerprint fonts, icon set, manifest), `package.json` (`proof`), `src/routes/__mockups/**`.
- Vendored, never edited here: `src/lib/styles/fingerprint/`, `scripts/fingerprint/`, `DESIGN.md`, `DESIGN.json`, `DESIGN-reference.md`, `fingerprint.lock`.
- `docs/functional-contract.md`, `PRODUCT.md` and the e2e suite are updated in the same wave as the UI they cover.
- Unchanged: server modules, `load` functions, API routes, schema and migrations. Pin order (`PUT /api/pinned`), tree sort (`GET`/`PATCH /api/settings`) and migration 0005 come from the separate change `gate-1-decisions`, which must be merged to `main` before the build starts.
- Cross-repo: the master icon lives in Design-System (`icons/Notes-Archive/icon.svg`); fingerprint change requests go to Design-System `requests.md`.

## Non-Goals

- Server, load, API, schema or migration changes (gate 6 rule: UI layer only). The only URL change is the new UI-only `/folders` page. Server work for pin order, tree sort and counts is change `gate-1-decisions` (ecosystem 2.7).
- Offline mode / PWA caching.
- Sharing, export, print view.
- New editor capabilities (split off as `editor-additions`: columns, embeds, highlight, footnotes, Turn into in the bubble toolbar, `[[` note links, touch formatting bar). The redesign restyles today's editor.
- A custom 404 / error page (gate-1 decision 2) and a global New-note shortcut (decision 3).
- Dark mode: decided for all apps at ecosystem checkpoint B (12.2).
- A settings page: the sort picker is the only preference UI.

## Appetite

Several sessions, in phases: gate 4 wireframes, gate 5 hi-fi, then the build in waves (each gate ends with Rue's sign-off).

## Done criteria

- [ ] Gates 4–7 of the ecosystem pipeline are signed off by Rue (wireframes, hi-fi incl. icon, build, evidence).
- [ ] `npm run proof:full` is green, with `check-slop` and `check-drift` in `proof` (no baseline file left).
- [ ] A WCAG 2.2 AA review passes, and screenshots at 375 / 768 / 1280 have been looked at.
- [ ] No old styling is left: `src/lib/styles/{tokens.css,tokens.ts,global.css,look.ts}`, their guard tests and the old `/__mockups` are gone.
- [ ] Deployed after Rue's OK (gate 8), with the previous release tag recorded.
