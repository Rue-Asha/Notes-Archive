## Why

Rue's desktop review (2026-11-19) found a tag that ran out of its card, a heavy border on the tag field, table cells that cannot be told apart, red browser spellcheck squiggles on German words, a note column that leaves the wide screen empty, and no quick way to open the whole folder tree. Two palette leftovers from the redesign's round 3 are closed in the same change.

## What Changes

- Home/folder/tag cards: one long unbreakable tag is clipped inside the card's meta line (the tag list had a `min-content` floor equal to the whole word).
- Note column: cap 1.25 → 1.5 × `--measure` from 1100 px, card padding 36 → 32 px; with the sidebar folded to its rail the column grows toward the cap. The frame's own 1360 px cap is vendored and untouched.
- Tag field: `--ring-hairline` instead of `--ring-control`.
- Tables: hairline cell borders and a shaded semibold header row (editor; the only place tables render).
- The table toolbar, bubble toolbar and slash menu get a solid fill (their 0.82 glass let the paragraph beside them show through, garbling it).
- Native spellcheck and autocorrect off in the title, body, tag, rename, link and caption fields.
- Sidebar tree: one "Expand all folders" / "Collapse all folders" button in the header.
- Palette: a failed search also forgets the term it had answered before, so typing back to it never shows "No notes match" before the new answer. The rest of round 3 (Enter on note rows waits, stale hits cleared with an error line) was already built in the redesign's last polish and is pinned by e2e.
- Housekeeping: the stale `openspec/changes/gate-1-decisions/` duplicate is removed; version 0.4.0.

## Capabilities

### Modified Capabilities

- `shell`: wide layout cap; expand/collapse-all control.
- `editor`: table borders; spellcheck off.
- `notes`: card tag overflow; tag field border.
- `search`: palette failure state.

## Impact

`NoteCard.svelte`, `NotePage.svelte`, `TagInput.svelte`, `prose.css`, `FocusTree.svelte`, `CommandPalette.svelte`, editor/title/link/rename/caption fields; e2e `cards`, `table`, `tag-input`, `tree-keyboard`, `shortcuts`, `palette-results`, `spellcheck`; no data or API change.
