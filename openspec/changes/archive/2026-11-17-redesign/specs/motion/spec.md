## MODIFIED Requirements

### Requirement: Quiet editor
While typing in the editor nothing SHALL animate, and the editor menus that typing or a selection opens (slash menu, bubble toolbar) SHALL open without animation; the block menu, opened from the drag handle, opens softly like every other menu (Requirement: Things the user makes move).

#### Scenario: Typing in the editor runs no animations
- **WHEN** a sentence is typed into a note body
- **THEN** `document.getAnimations()` holds no animation whose target is inside the editor or the note page
- **proof:** e2e

#### Scenario: Editor menus open without animation
- **WHEN** the slash menu opens with motion allowed
- **THEN** the menu has no running animation
- **proof:** e2e

### Requirement: Motion on real devices
The fingerprint motion set (press feedback, the gliding current pill, the pinned reorder) and the app's own motion (rows arriving, leaving and making room, menus and dialogs opening and closing) SHALL feel smooth and calm on Rue's phone and desktop; navigation and the command palette SHALL stay instant.

#### Scenario: Motion feels smooth on real devices
- **WHEN** Rue navigates Home → folder → note and back, switches phone-bar sections, creates, renames, moves, pins and deletes notes and folders, reorders a pinned note, opens the palette, menus and dialogs on her phone and desktop
- **THEN** presses, the pill, the reorder, arriving and leaving rows and opening menus and dialogs look smooth and short, navigation and the palette are instant, and nothing animates while she types
- **proof:** manual (visual judgement on real hardware at Gate 7)

## ADDED Requirements

### Requirement: Things the user makes move
What the user makes happen SHALL move briefly, with only `transform` and `opacity`, timed by the fingerprint motion tokens (Rue, 2026-11-16): a row she creates in the tree, a folder list, a folder's notes, the Home lists or a tag page SHALL settle in (opacity and a 6 px drop with a scale from 0.98, `--motion-glide`, `--ease-out`), including the first row that replaces an empty state; a removed row SHALL fade and shrink a touch in `--motion-quick`; the rows that stay SHALL glide to their new place when one is added, removed, renamed into another position, moved or pinned (`--motion-glide`, `--ease-in-out`). Menus and popovers (note, card, folder, block and sort menus) SHALL open with a fade and a scale from 0.97 out of their trigger's side in `--motion-quick` (160 ms) and close in three quarters of that; dialogs and sheets SHALL fade and rise (a bottom sheet from its edge, a centred dialog by a few pixels and from 0.97) in 160–260 ms. Pressed rows SHALL darken and pressed pills scale (`data-press`). Navigation, a folder opened by its chevron, the command palette, the slash menu and the bubble toolbar SHALL stay instant, and under `prefers-reduced-motion` all of this SHALL be instant.

#### Scenario: A new folder arrives in the tree and its neighbours make room
- **WHEN** "New folder" is pressed in the sidebar next to folders "Beta" and "Gamma", and the new folder is named "Alpha"
- **THEN** the new tree row animates in with opacity and transform only, in at most 300 ms, and once "Alpha" sorts first, "Beta" and "Gamma" glide to their new place
- **proof:** e2e

#### Scenario: The first folder arrives on an empty Folders page
- **WHEN** the first folder is created from the empty Folders page on the phone
- **THEN** its row animates in with opacity and transform only
- **proof:** e2e

#### Scenario: Unpinning a note on Home lets it go and the rest make room
- **WHEN** one of three pinned notes is unpinned from its card menu on Home
- **THEN** the Pinned list rows animate with opacity and transform only while it leaves and the rest close the gap
- **proof:** e2e

#### Scenario: Menus and dialogs open and close softly
- **WHEN** the note menu opens and closes, then the delete dialog opens
- **THEN** the menu opens with one opacity-and-transform animation of 150–200 ms and closes with one no longer than that, and the dialog transitions opacity and transform in 150–300 ms and, as a confirmation, closes in at most 160 ms
- **proof:** e2e

#### Scenario: Navigation stays instant
- **WHEN** one folder page links to another in-app
- **THEN** no list row animates
- **proof:** e2e

#### Scenario: Reduced motion makes all of it instant
- **WHEN** the browser reports `prefers-reduced-motion: reduce`, a folder is created and renamed and the delete dialog is opened
- **THEN** no element animation runs and the dialog has no transition
- **proof:** e2e

## REMOVED Requirements

### Requirement: Card to note morph
**Reason**: The signed-off hi-fi has no card-to-note morph; the fingerprint keeps Notes navigation instant and moves only through its `motion.css` hooks (DESIGN.md → Motion).
**Migration**: None; navigation is plain. Retires `e2e/morph.test.ts` "Scenario: Note card morphs into the note page", "the clicked card is the one that morphs when a note shows twice on Home", "Scenario: Back from a note reverses the morph", "Scenario: Reduced motion skips the morph" (unit 15, with the new note cards), and `src/lib/shell/morph.test.ts` `morphTarget` with `morph.ts` (unit 21).

### Requirement: Page transitions
**Reason**: The fingerprint keeps Notes navigation instant; no View Transition is part of the hi-fi.
**Migration**: None; navigation is plain. Retires `e2e/transitions.test.ts` "Scenario: Other navigations fade", "Scenario: Reduced motion uses a short fade", "Scenario: Browser without View Transitions navigates plainly" (unit 15), and `src/lib/shell/morph.test.ts` `pageTransition` with the `onNavigate` hook in `(app)/+layout.svelte` (unit 21).

### Requirement: Lists stagger in
**Reason**: Lists in the hi-fi appear at once; the fingerprint's only entrance is `data-settle` on a full page load, and Notes is instant.
**Migration**: None. Retires `e2e/morph.test.ts` "Scenario: Cards stagger in" and "Scenario: Reduced motion shows lists at once" (unit 15), and the stagger/reveal cases in `src/lib/motion.test.ts` with `motion.ts` (unit 21).

### Requirement: Glass hover glow
**Reason**: Note cards are solid entries, not glass; fingerprint hover changes colour only (DESIGN.md → Motion).
**Migration**: Hover colour on the note cards from the fingerprint roles. Retires `e2e/morph.test.ts` "Scenario: Glass cards glow on hover" (unit 15).
