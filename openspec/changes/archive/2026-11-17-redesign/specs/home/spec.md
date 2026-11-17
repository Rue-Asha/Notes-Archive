## ADDED Requirements

### Requirement: Home desk
Home SHALL be the desk: a search entry that opens the command palette, "New note", Pinned in Rue's order (only when a note is pinned) and Recently edited (the 8 most recently updated notes). Top-level folders SHALL NOT be on Home. With no notes, whether or not folders exist, Home SHALL show the welcome state "Write your first note" with "New note". Counts SHALL use the singular for one. The kicker above the title SHALL read "Home — <weekday> <day> <month>" ("Tuesday 17 November") in the reader's own time zone, and SHALL turn over at local midnight (source: Rue, gate 7, signed hi-fi).

#### Scenario: Home shows search, New note, Pinned and Recently edited
- **WHEN** Home opens with two pinned notes among ten notes
- **THEN** it shows a search entry, "New note", a region named "Pinned" and a region named "Recently edited"
- **proof:** e2e

#### Scenario: The Home kicker names the reader's day
- **WHEN** Home is open in a browser whose local time is 23:59 on Monday 2 March, and a minute passes
- **THEN** the kicker reads "Monday 2 March", whatever the server's clock and time zone say, and then "Tuesday 3 March" without a reload
- **proof:** e2e

#### Scenario: Home search entry opens the palette
- **WHEN** the search entry on Home is activated by click and by keyboard
- **THEN** the command palette opens with its input focused
- **proof:** e2e

#### Scenario: Home has no folders
- **WHEN** Home opens with two top-level folders and notes in them
- **THEN** Home's main content has no Folders region and no folder links
- **proof:** e2e

#### Scenario: Recently edited shows the eight latest notes
- **WHEN** ten notes with distinct update times exist
- **THEN** the "Recently edited" region shows exactly the eight most recently updated, newest first
- **proof:** e2e

#### Scenario: No notes shows the welcome state even with folders
- **WHEN** Home opens with two folders and no notes
- **THEN** it shows "Write your first note" with "New note", and no Pinned or Recently edited region
- **proof:** e2e

#### Scenario: Pinned is absent without pins
- **WHEN** notes exist but none is pinned
- **THEN** Home has no "Pinned" region
- **proof:** e2e

#### Scenario: One pinned note has no reorder controls
- **WHEN** exactly one note is pinned
- **THEN** its entry has no drag handle and its menu offers no Move up or Move down
- **proof:** e2e

#### Scenario: Long titles and snippets stay in their entries
- **WHEN** Home shows notes with a 200-character title and a long unbroken snippet at 375 and 1280 px
- **THEN** titles wrap, snippets are clamped, and nothing scrolls horizontally
- **proof:** e2e

#### Scenario: One note reads singular
- **WHEN** the archive holds exactly one note
- **THEN** every count on Home reads "1 note", never "1 notes"
- **proof:** e2e

### Requirement: Pinned reorder
Pinned notes SHALL be reorderable by dragging a handle with a pointer, and by "Move up" / "Move down" in each pinned entry's menu (disabled at the ends) for keyboard and touch; each move SHALL save at once with `PUT /api/pinned`. A 409 SHALL reload the list in the current server order with the polite toast "Pinned order changed elsewhere — reloaded"; any other failure SHALL show a toast and revert the order. New pins SHALL appear first. Under reduced motion a move SHALL not animate.

#### Scenario: Drag a pinned note to a new place
- **WHEN** the third pinned note is dragged by its handle above the first on desktop
- **THEN** it is first, `PUT /api/pinned` was sent with the new order, and the order holds after a reload
- **proof:** e2e

#### Scenario: Move up and Move down reorder from the menu
- **WHEN** "Move down" is chosen in the first pinned entry's menu and "Move up" in the last one's, on phone and on desktop by keyboard
- **THEN** each entry moves one place, the order is saved, and focus stays on the moved entry's menu button
- **proof:** e2e

#### Scenario: Move up and Move down are disabled at the ends
- **WHEN** the menus of the first and the last pinned entries are opened
- **THEN** "Move up" is disabled for the first and "Move down" for the last
- **proof:** e2e

#### Scenario: A stale reorder reloads the list with a toast
- **WHEN** a reorder is answered with 409
- **THEN** the Pinned list shows the server's current order and a polite toast says "Pinned order changed elsewhere — reloaded"
- **proof:** e2e

#### Scenario: Failed reorder reverts with a toast
- **WHEN** a reorder fails with a server error
- **THEN** a toast reports it and the list returns to the order before the move
- **proof:** e2e

#### Scenario: New pins appear first
- **WHEN** a note is pinned while three notes are pinned in a custom order
- **THEN** it appears first and the other three keep their order
- **proof:** e2e

#### Scenario: Reduced motion moves without animation
- **WHEN** reduced motion is on and a pinned note is moved down
- **THEN** the entries change places with no transform transition
- **proof:** e2e

## REMOVED Requirements

### Requirement: Typographic hero
**Reason**: Home becomes the desk on the fingerprint composition (S10); the hero's accent title follows the fingerprint's rules.
**Migration**: "Home desk".

### Requirement: Home bento
**Reason**: Top-level folders leave Home, the welcome state shows whenever there are no notes, and pinned notes get a manual order (S10, S11).
**Migration**: "Home desk", "Pinned reorder"; folders are reached through the tree and `/folders`.
