## ADDED Requirements

### Requirement: Managing folders in the tree
Folders SHALL nest without a depth limit and SHALL be created at the root or inside a folder, renamed inline in the tree and moved to another folder or the root through a "Move to…" picker that excludes the folder itself and its descendants; an empty name SHALL become "Untitled folder"; duplicate sibling names are allowed.

#### Scenario: Create a folder at the root
- **WHEN** "New folder" is chosen in the sidebar's Folders section, "Reisen" typed and Enter pressed
- **THEN** a root folder "Reisen" appears in the tree and exists after a reload
- **proof:** e2e

#### Scenario: Create a folder inside a folder
- **WHEN** "New folder" is chosen in folder "Reisen"'s tree menu and "Japan" typed
- **THEN** "Japan" appears indented under "Reisen" and its stored parent is "Reisen"
- **proof:** e2e

#### Scenario: New note from a folder's menu lands in that folder
- **WHEN** "New note" is chosen in folder "Reisen"'s tree menu
- **THEN** the new note opens and its stored folder is "Reisen"
- **proof:** e2e

#### Scenario: Rename a folder inline in the tree
- **WHEN** "Rename" is chosen in a folder's tree menu, the name replaced with "Archiv 2026" and Enter pressed
- **THEN** the tree row reads "Archiv 2026" without a reload, and so does the stored folder
- **proof:** e2e

#### Scenario: Move a folder with Move to
- **WHEN** "Move to…" is chosen for folder "Japan" and "Root" picked
- **THEN** "Japan" shows at the top level of the tree and its stored parent is empty
- **proof:** e2e

#### Scenario: Move to excludes the folder and its descendants
- **WHEN** "Move to…" opens for folder "Reisen" that holds "Japan" and "Japan/Kyoto"
- **THEN** the picker lists other folders and "Root" but not "Reisen", "Japan" or "Kyoto"
- **proof:** e2e

#### Scenario: Blank names become Untitled folder
- **WHEN** `createFolder({ name: '   ' })` runs and a folder is renamed to `''`
- **THEN** both folders are named "Untitled folder"
- **proof:** unit

#### Scenario: Duplicate sibling names are allowed
- **WHEN** two folders named "Ideen" are created in the same parent
- **THEN** both exist with distinct ids
- **proof:** unit

#### Scenario: Server refuses moving a folder into its own descendant
- **WHEN** `moveFolder` moves a folder into itself and into its grandchild
- **THEN** both throw `ValidationError` and the tree is unchanged; `PATCH /api/folders/<id>` answers 400 for the same moves
- **proof:** unit

### Requirement: Folder page
A folder page SHALL show a breadcrumb, a cover photo header (when set) with the folder name and counts, the sub-folders as cover tiles, then the folder's notes as cards sorted by last edited, with "New note" (creates the note in this folder) and "New folder" actions; an empty folder SHALL show "Nothing here yet" with both actions.

#### Scenario: Folder page shows sub-folders and notes by last edited
- **WHEN** folder "Reisen" holds sub-folders "Japan" and "Island" and three notes edited at different times
- **THEN** its page shows two folder tiles and three note cards, newest edit first
- **proof:** e2e

#### Scenario: Folder without a cover shows a typographic tile
- **WHEN** a sub-folder has no cover
- **THEN** its tile shows the folder name in the display font on a warm tint and no image
- **proof:** e2e

#### Scenario: Folder page shows breadcrumb, cover header and counts
- **WHEN** folder "Kyoto" inside "Reisen/Japan" with a cover, one sub-folder and four notes opens
- **THEN** the breadcrumb reads Reisen › Japan › Kyoto with links, the header shows the cover image, the name "Kyoto" and "1 folder · 4 notes"
- **proof:** e2e

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

### Requirement: Folder cover
The folder page header SHALL let the user upload or replace a cover photo (stored as WebP in SQLite, at most 16 MB) or remove it; a wrong file type or a too large file SHALL be refused with a toast; removing the cover SHALL bring back the typographic tile.

#### Scenario: Upload and replace a folder cover
- **WHEN** a JPEG is chosen with "Add cover" on a folder page, then another with "Change cover"
- **THEN** the header shows the first image, then the second, and only one cover image row exists for the folder
- **proof:** e2e

#### Scenario: Removing the cover brings back the typographic tile
- **WHEN** "Remove cover" is chosen and the parent folder page is opened
- **THEN** the header has no image and the folder's tile on the parent page is typographic
- **proof:** e2e

#### Scenario: Wrong cover file is refused with a toast
- **WHEN** a PDF and then a 17 MB image are chosen as cover
- **THEN** the toasts "That file isn't an image" and "That image is too large" appear and the cover is unchanged
- **proof:** e2e

#### Scenario: Server replaces covers and stores them as WebP
- **WHEN** `setFolderCover` runs twice for a folder and then `removeFolderCover`
- **THEN** after each set exactly one `image/webp` row has that `folder_id`, and after removal none
- **proof:** unit

### Requirement: Moving a note
A note SHALL move to any folder or the root through the Folder picker in its properties row and through "Move to…" in its card menu; the tree and Home SHALL update without a reload.

#### Scenario: Move a note from its properties row
- **WHEN** the Folder field in a note's properties row picks "Japan"
- **THEN** the field reads "Japan", the stored folder is "Japan", and the note's tree row moves under "Japan" without a reload
- **proof:** e2e

#### Scenario: Move a note from its card
- **WHEN** "Move to…" in a card menu on folder "Reisen"'s page picks "Root"
- **THEN** the card leaves the page without a reload and the stored note has no folder
- **proof:** e2e

#### Scenario: Server moves a note and bumps its edit time
- **WHEN** `updateNote(id, { folderId })` moves a note to another folder and then to the root
- **THEN** `listNotes` shows it under the new folder, then at the root, and `updated_at` grew each time
- **proof:** unit

### Requirement: Deleting a folder
Deleting a folder SHALL ask "Delete “<name>”? This deletes N folders and M notes inside it. This can't be undone." (counts include all descendants; an empty folder gets the message without counts) and on confirm remove the folder, all descendant folders and all their notes with their uploads; when the open note is inside, the app SHALL navigate to the deleted folder's parent.

#### Scenario: Deleting a folder asks with counts
- **WHEN** "Delete" is chosen in the tree menu of "Reisen" holding "Japan" and "Japan/Kyoto" with five notes across them
- **THEN** the dialog reads "Delete “Reisen”? This deletes 2 folders and 5 notes inside it. This can't be undone.", and after confirming the three folders and five notes are gone
- **proof:** e2e

#### Scenario: Empty folder asks without counts
- **WHEN** "Delete" is chosen for an empty folder "Leer"
- **THEN** the dialog reads "Delete “Leer”? This can't be undone."
- **proof:** e2e

#### Scenario: Cancelled folder delete keeps everything
- **WHEN** the folder delete dialog is cancelled
- **THEN** the folder, its sub-folders and notes still exist
- **proof:** e2e

#### Scenario: Deleting the folder of the open note navigates to its parent
- **WHEN** a note inside "Reisen/Japan" is open and "Japan" is deleted from the tree
- **THEN** the page becomes `/folders/<Reisen id>`
- **proof:** e2e

#### Scenario: Server folder delete removes descendants, notes and uploads
- **WHEN** `deleteFolder` runs on a folder with two levels of sub-folders, notes with tags, images and files, and a cover
- **THEN** no row of those folders, notes, note_tags, images, files or notes_fts remains, unused tags are pruned, and `folderCounts` beforehand reported the descendant folders and all notes
- **proof:** unit
