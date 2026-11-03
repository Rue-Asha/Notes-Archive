## ADDED Requirements

### Requirement: Typographic hero
Home SHALL open with a typographic hero: an eyebrow, a two-line display headline with exactly one word in the accent colour, a glass search bar that opens the command palette, and a "New note" call-to-action pill.

#### Scenario: Home shows the typographic hero
- **WHEN** Home opens with notes in the archive
- **THEN** it shows an uppercase eyebrow, an `h1` on two lines in the display font with one `em` set in `--accent` (`bronze`), a search bar and a "New note" pill ending in a round arrow
- **proof:** e2e

#### Scenario: Home search bar opens the palette
- **WHEN** the Home search bar is clicked
- **THEN** the command palette opens with its input focused
- **proof:** e2e

#### Scenario: Home New note opens a root note
- **WHEN** "New note" in the hero is clicked
- **THEN** the URL becomes `/notes/<id>`, the title has focus and the stored note has no folder
- **proof:** e2e

### Requirement: Home bento
Below the hero Home SHALL show a bento of Pinned notes (only when any note is pinned), Recently edited (the 8 most recently updated notes as note cards) and Folders (top-level folders as cover tiles with name and note count); an empty archive SHALL show a welcome state with "Write your first note".

#### Scenario: Recently edited shows the eight latest notes
- **WHEN** ten notes with distinct update times exist
- **THEN** the "Recently edited" region shows exactly the eight most recently updated, newest first
- **proof:** e2e

#### Scenario: Folders tile lists top-level folders with covers and counts
- **WHEN** two top-level folders exist, one with a cover and 3 notes (1 of them in a sub-folder), the other without cover
- **THEN** the "Folders" region shows both tiles (the sub-folder isn't one), the first with its cover image and "3 notes", the second as a typographic tile
- **proof:** e2e

#### Scenario: Empty archive shows the welcome state
- **WHEN** Home opens with no notes and no folders
- **THEN** it shows "Write your first note" with a New note action, and no Pinned, Recently edited or Folders region
- **proof:** e2e

#### Scenario: Pinned tile is hidden without pinned notes
- **WHEN** notes exist but none is pinned
- **THEN** Home has no "Pinned" region
- **proof:** e2e

#### Scenario: Home reflects a move without reload
- **WHEN** a note is moved into a folder from its card menu on Home
- **THEN** that folder tile's note count goes up by one without a page reload
- **proof:** e2e
