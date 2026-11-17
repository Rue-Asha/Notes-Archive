## MODIFIED Requirements

### Requirement: Pinning
Notes SHALL be pinned and unpinned from the properties row or the card menu; pinned notes SHALL appear in Home's Pinned tile in a manual order that the user can change, a newly pinned note SHALL go to the top of that order, and unpinning the last pinned note SHALL hide the tile. The server SHALL store the order and SHALL reorder the whole pinned list in one request; a reorder that does not list exactly the currently pinned notes SHALL be refused with 409 and change nothing. Databases from before this requirement SHALL keep the order they showed (most recently pinned first).

#### Scenario: Pin from the properties row
- **WHEN** "Pinned" is switched on in a note's properties row and the page reloads
- **THEN** the switch is on and the stored note has a pin time
- **proof:** e2e

#### Scenario: Pin from a card menu
- **WHEN** "Pin" is chosen in a card menu
- **THEN** the card shows the pin marker and its menu now offers "Unpin"
- **proof:** e2e

#### Scenario: Pinned notes appear on Home most recently pinned first
- **WHEN** notes A and then B are pinned and never reordered
- **THEN** Home's "Pinned" region lists B before A
- **proof:** e2e

#### Scenario: Unpinning the last note hides the Pinned tile
- **WHEN** the only pinned note is unpinned from its card menu on Home
- **THEN** the "Pinned" region disappears without a reload
- **proof:** e2e

#### Scenario: Server orders pinned notes by pin order
- **WHEN** three notes are pinned at different times and one is unpinned
- **THEN** `listPinned` returns the other two, latest pin first
- **proof:** unit

#### Scenario: Reorder sets the pinned order
- **WHEN** notes A, B and C are pinned and the order [A, C, B] is submitted
- **THEN** `listPinned` returns A, C, B, also after the server restarts
- **proof:** unit

#### Scenario: A new pin goes to the top of a custom order
- **WHEN** the pinned order is [A, C, B] and note D is pinned
- **THEN** `listPinned` returns D, A, C, B
- **proof:** unit

#### Scenario: Re-pinning does not keep the old position
- **WHEN** B is unpinned from [A, C, B] and then pinned again
- **THEN** `listPinned` returns B, A, C
- **proof:** unit

#### Scenario: A stale reorder is refused
- **WHEN** an order is submitted that misses a pinned note, includes an unpinned note, or repeats an id
- **THEN** the endpoint answers 409 and `listPinned` is unchanged
- **proof:** unit

#### Scenario: Migration keeps the existing order
- **WHEN** a database with notes pinned at different times (migrations up to 0004 applied) is migrated
- **THEN** `listPinned` returns the same order as before the migration and unpinned notes have no order
- **proof:** unit

#### Scenario: Reordering does not change updatedAt
- **WHEN** the pinned order is changed
- **THEN** no note's `updatedAt` changes
- **proof:** unit

## ADDED Requirements

### Requirement: Multi-line titles
A note title SHALL be allowed to contain line breaks. The server SHALL store a title as sent with CRLF and CR normalised to LF, SHALL show it unchanged on the note page API, SHALL index it for search so that words on every line match, and SHALL leave the "untitled" rule as it is (a title that is only whitespace and line breaks is empty). Places that show a title on a single line (tab title, tree, palette, confirm dialogs, folder chooser) SHALL show each run of line breaks as one space.

#### Scenario: A multi-line title round-trips
- **WHEN** a note is saved with the title "Reise\nPlan" and read back
- **THEN** the title is "Reise\nPlan", and "Reise\r\nPlan" is stored as "Reise\nPlan"
- **proof:** unit

#### Scenario: Words on every title line are found
- **WHEN** a note has the title "Kirschblüte\nÜbersicht" and "uber" is searched
- **THEN** the note is found with the matched word highlighted in its original spelling
- **proof:** unit

#### Scenario: A line-break-only title is still untitled
- **WHEN** a new note's title is "\n \n" with no other content
- **THEN** it is discarded as empty when abandoned
- **proof:** unit

#### Scenario: Single-line contexts collapse line breaks
- **WHEN** `titleLine` receives "Reise\n\nPlan" and an empty or blank title
- **THEN** it returns "Reise Plan" and "Untitled"
- **proof:** unit
