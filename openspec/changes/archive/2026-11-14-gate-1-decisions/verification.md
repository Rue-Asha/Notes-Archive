verified-at: 24470be

## Layer 1: proof:full (exit 0)
```
vitest: Test Files 54 passed (54), Tests 392 passed (392)
playwright: 34 skipped, 416 passed (4.4m)
```

## Layer 2: coverage (40 scenarios, 0 gaps)

| Scenario | proof | Evidence |
|---|---|---|
| Folder page shows sub-folders and notes by last edited | e2e | Playwright phone+desktop, "Scenario: Folder page shows sub-folders and notes by last edited" ✓ (e2e/) |
| Folder without a cover shows a typographic tile | e2e | Playwright phone+desktop, "Scenario: Folder without a cover shows a typographic tile" ✓ (e2e/) |
| Folder page shows breadcrumb, cover header and counts | e2e | Playwright phone+desktop, "Scenario: Folder page shows breadcrumb, cover header and counts" ✓ (e2e/) |
| Header and parent tile count the same | unit | vitest, "Scenario: Header and parent tile count the same" ✓ (proof:full output) |
| Empty folder offers New note and New folder | e2e | Playwright phone+desktop, "Scenario: Empty folder offers New note and New folder" ✓ (e2e/) |
| New note from a folder page lands in that folder | e2e | Playwright phone+desktop, "Scenario: New note from a folder page lands in that folder" ✓ (e2e/) |
| New folder from a folder page creates a sub-folder | e2e | Playwright phone+desktop, "Scenario: New folder from a folder page creates a sub-folder" ✓ (e2e/) |
| Pin from the properties row | e2e | Playwright phone+desktop, "Scenario: Pin from the properties row" ✓ (e2e/) |
| Pin from a card menu | e2e | Playwright phone+desktop, "Scenario: Pin from a card menu" ✓ (e2e/) |
| Pinned notes appear on Home most recently pinned first | e2e | Playwright phone+desktop, "Scenario: Pinned notes appear on Home most recently pinned first" ✓ (e2e/) |
| Unpinning the last note hides the Pinned tile | e2e | Playwright phone+desktop, "Scenario: Unpinning the last note hides the Pinned tile" ✓ (e2e/) |
| Server orders pinned notes by pin order | unit | vitest, "Scenario: Server orders pinned notes by pin order" ✓ (proof:full output) |
| Reorder sets the pinned order | unit | vitest, "Scenario: Reorder sets the pinned order" ✓ (proof:full output) |
| A new pin goes to the top of a custom order | unit | vitest, "Scenario: A new pin goes to the top of a custom order" ✓ (proof:full output) |
| Re-pinning does not keep the old position | unit | vitest, "Scenario: Re-pinning does not keep the old position" ✓ (proof:full output) |
| A stale reorder is refused | unit | vitest, "Scenario: A stale reorder is refused" ✓ (proof:full output) |
| Migration keeps the existing order | unit | vitest, "Scenario: Migration keeps the existing order" ✓ (proof:full output) |
| Reordering does not change updatedAt | unit | vitest, "Scenario: Reordering does not change updatedAt" ✓ (proof:full output) |
| A multi-line title round-trips | unit | vitest, "Scenario: A multi-line title round-trips" ✓ (proof:full output) |
| Words on every title line are found | unit | vitest, "Scenario: Words on every title line are found" ✓ (proof:full output) |
| A line-break-only title is still untitled | unit | vitest, "Scenario: A line-break-only title is still untitled" ✓ (proof:full output) |
| Single-line contexts collapse line breaks | unit | vitest, "Scenario: Single-line contexts collapse line breaks" ✓ (proof:full output) |
| Tree shows folders with their sub-folders and notes | e2e | Playwright phone+desktop, "Scenario: Tree shows folders with their sub-folders and notes" ✓ (e2e/) |
| Current item is highlighted in the tree | e2e | Playwright phone+desktop, "Scenario: Current item is highlighted in the tree" ✓ (e2e/) |
| Empty tree offers New folder | e2e | Playwright phone+desktop, "Scenario: Empty tree offers New folder" ✓ (e2e/) |
| Long names truncate with a tooltip | e2e | Playwright phone+desktop, "Scenario: Long names truncate with a tooltip" ✓ (e2e/) |
| Deep nesting caps the indent | e2e | Playwright phone+desktop, "Scenario: Deep nesting caps the indent" ✓ (e2e/) |
| Untitled note in the tree reads Untitled | e2e | Playwright phone+desktop, "Scenario: Untitled note in the tree reads Untitled" ✓ (e2e/) |
| Default sort keeps folders by name and notes by last edited | unit | vitest, "Scenario: Default sort keeps folders by name and notes by last edited" ✓ (proof:full output) |
| Reading the preference defaults to mixed | unit | vitest, "Scenario: Reading the preference defaults to mixed" ✓ (proof:full output) |
| The preference survives a restart | unit | vitest, "Scenario: The preference survives a restart" ✓ (proof:full output) |
| Each mode orders folders and notes | unit | vitest, "Scenario: Each mode orders folders and notes" ✓ (proof:full output) |
| An edited note lifts its folder | unit | vitest, "Scenario: An edited note lifts its folder" ✓ (proof:full output) |
| An unknown mode is refused | unit | vitest, "Scenario: An unknown mode is refused" ✓ (proof:full output) |
| First render uses the stored sort | unit | vitest, "Scenario: First render uses the stored sort" ✓ (proof:full output) |
| Tag page lists its notes by last edited | e2e | Playwright phone+desktop, "Scenario: Tag page lists its notes by last edited" ✓ (e2e/) |
| Tag counts include only notes using them | unit | vitest, "Scenario: Tag counts include only notes using them" ✓ (proof:full output) |
| Deleting the last tagged note goes Home | e2e | Playwright phone+desktop, "Scenario: Deleting the last tagged note goes Home" ✓ (e2e/) |
| Deleting one of several tagged notes stays | e2e | Playwright phone+desktop, "Scenario: Deleting one of several tagged notes stays" ✓ (e2e/) |
| Unknown tag id is a plain 404 | e2e | Playwright phone+desktop, "Scenario: Unknown tag id is a plain 404" ✓ (e2e/) |

## Manual checklist

- Post-merge, before first start of the new release: copy `data/notes-archive.db` on the host (migration 0005 runs against real data, irreversible).
- After the migration: pinned order on Home matches the order before it (most recently pinned first).

## Diffstat
```
 src/routes/api/settings/+server.ts                 |   17 +
 src/routes/api/settings/settings-api.test.ts       |   56 +
 122 files changed, 5107 insertions(+), 30 deletions(-)
```

## Screenshots

none

## Review

Fresh-context review (2026-11-14): no blocking findings; five small ones, all resolved by fixer round 1 (aaa6224, 47d6e1a, 24470be). proof:full at 24470be: vitest 393 passed, e2e 418 passed, 34 skipped, 0 failed.
- [spec] multi-line titles in single-line contexts → titleLine wired into TreeRow (label + tooltip), NoteMenu and CardMenu delete dialogs, CommandPalette; new e2e "Scenario: A multi-line title shows on one line in the tree". FolderPicker lists folder names only; NoteCard's h3 is not a single-line context.
- [weak] "Server orders pinned notes by pin order" → pins through updateNote, then contradicts pinned_at in SQL, so only pin_order can produce the expected order.
- [weak] "First render uses the stored sort" → stores `edited` as the scenario says and asserts folder lifting through the layout load.
- [correctness] PATCH /api/settings with null or non-JSON body → 400 (guard as in /api/pinned), tests for both.
- Checked OK by the reviewer: migration 0005 backfill order, 409 path on concurrent reorder vs pin/unpin, tree sort on first render, multi-line search highlighting, tag-page redirect via setContext.
