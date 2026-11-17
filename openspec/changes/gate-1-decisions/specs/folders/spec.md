## MODIFIED Requirements

### Requirement: Folder page
A folder page SHALL show a breadcrumb, a cover photo header (when set) with the folder name and counts, the sub-folders as cover tiles, then the folder's notes as cards sorted by last edited, with "New note" (creates the note in this folder) and "New folder" (creates a sub-folder) actions; an empty folder SHALL show "Nothing here yet" with both actions. A folder's note count SHALL mean every note in the folder and all its sub-folders, in the header, in folder tiles and in the delete dialog alike; the header's folder count SHALL mean all descendant folders.

#### Scenario: Folder page shows sub-folders and notes by last edited
- **WHEN** folder "Reisen" holds sub-folders "Japan" and "Island" and three notes edited at different times
- **THEN** its page shows two folder tiles and three note cards, newest edit first
- **proof:** e2e

#### Scenario: Folder without a cover shows a typographic tile
- **WHEN** a sub-folder has no cover
- **THEN** its tile shows the folder name in the display font on a warm tint and no image
- **proof:** e2e

#### Scenario: Folder page shows breadcrumb, cover header and counts
- **WHEN** folder "Kyoto" inside "Reisen/Japan" with a cover, one sub-folder holding two notes and four notes of its own opens
- **THEN** the breadcrumb reads Reisen › Japan › Kyoto with links, the header shows the cover image, the name "Kyoto" and "1 folder · 6 notes"
- **proof:** e2e

#### Scenario: Header and parent tile count the same
- **WHEN** a folder with notes in itself and in a nested sub-folder is opened and its parent's page lists it as a tile
- **THEN** the header's note count equals the tile's note count
- **proof:** unit

#### Scenario: Empty folder offers New note and New folder
- **WHEN** an empty folder opens
- **THEN** it shows "Nothing here yet" with "New note" and "New folder"
- **proof:** e2e

#### Scenario: New note from a folder page lands in that folder
- **WHEN** "New note" is clicked on folder "Japan"'s page
- **THEN** the new note opens and its stored folder is "Japan"
- **proof:** e2e

#### Scenario: New folder from a folder page creates a sub-folder
- **WHEN** "New folder" is clicked on folder "Japan"'s page
- **THEN** an "Untitled folder" tile appears on the page and its stored parent is "Japan"
- **proof:** e2e
