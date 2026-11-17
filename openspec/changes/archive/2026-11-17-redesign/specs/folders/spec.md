## ADDED Requirements

### Requirement: Phone drill-down
In the touch posture each folder level SHALL be its own page at `/folders/[id]`, showing its sub-folders with counts and its notes, one level per screen; the back gesture and browser Back SHALL go up a level; a back affordance SHALL name the parent ("Folders" at the top level) and link to it. An empty level SHALL show "Nothing here yet" with "New note" and "New folder".

#### Scenario: Each level is its own page
- **WHEN** on the phone "Reisen" is tapped on `/folders`, then "Japan" on Reisen's page
- **THEN** the URL is `/folders/<reisen>` and then `/folders/<japan>`, and each page lists its sub-folders with counts and its notes
- **proof:** e2e

#### Scenario: Back goes up a level
- **WHEN** the browser goes back from Japan's page, and on Japan's page the back affordance is tapped
- **THEN** both land on Reisen's page; the affordance is named "Reisen", and on a top-level folder it is named "Folders" and leads to `/folders`
- **proof:** e2e

#### Scenario: Deep levels stay readable
- **WHEN** a folder twelve levels deep with a 120-character name opens at 320 px
- **THEN** its name wraps, the back affordance names the parent without overflowing, and nothing scrolls horizontally
- **proof:** e2e

#### Scenario: Empty level offers New note and New folder
- **WHEN** an empty folder opens on the phone
- **THEN** it shows "Nothing here yet" with "New note" and "New folder"
- **proof:** e2e

### Requirement: Folder page layout
The folder page SHALL show the path, the cover (with "Add cover" when there is none, and a "Change cover" button opening the cover menu with "Change cover" / "Remove cover" when there is one, source: Rue, gate 7, signed hi-fi), the folder's notes as rows with their absolute edit date ("14 Nov", the year once it is another year's; source: Rue, gate 7, signed hi-fi), the sub-folders with server-provided counts that include sub-folders, the folder's notes newest edited first, "New note", "New folder" and a folder menu with Rename, Move to… and Delete. A section with nothing in it SHALL be omitted; an empty folder SHALL show "Nothing here yet"; counts SHALL use the singular for one; a new "Untitled folder" SHALL appear in the tree and the list without a reload; upload errors SHALL show toasts.

#### Scenario: Folder page shows path, cover, sub-folders and notes
- **WHEN** folder "Kyoto" inside "Reisen/Japan" with a cover, one sub-folder holding two notes and four notes of its own opens
- **THEN** the path links Reisen and Japan, the cover shows, the sub-folder lists "2 notes", and the four notes follow newest edited first
- **proof:** e2e

#### Scenario: Only sub-folders or only notes omits the other section
- **WHEN** a folder with only sub-folders opens, and then a folder with only notes
- **THEN** the first has no Notes section and the second has no Folders section
- **proof:** e2e

#### Scenario: Cover menu adds, changes and removes the cover
- **WHEN** "Add cover" is used on a folder without a cover, then "Change cover" and "Remove cover" from the cover menu
- **THEN** the cover appears and the cover button reads "Change cover", the cover is replaced, and it is gone with "Add cover" back
- **proof:** e2e

#### Scenario: Folder note rows show the absolute date
- **WHEN** a folder holds a note edited on 3 March 2025 and one edited today
- **THEN** their rows read "3 Mar 2025" and today's day and short month without a year
- **proof:** e2e

#### Scenario: Cover upload failure shows a toast
- **WHEN** a cover upload is answered with a server error
- **THEN** a toast says "Couldn't upload — try again" and the previous cover state stays
- **proof:** e2e

#### Scenario: Folder counts read singular
- **WHEN** a folder holds one sub-folder with one note
- **THEN** its counts read "1 folder" and "1 note"
- **proof:** e2e

#### Scenario: New folder appears without reload
- **WHEN** "New folder" is chosen on a folder page
- **THEN** "Untitled folder" appears in the page's Folders section and in the tree without a reload
- **proof:** e2e

#### Scenario: Folder menu offers Rename, Move to and Delete
- **WHEN** the folder menu is opened on a folder page
- **THEN** it offers Rename, Move to… and Delete, and Rename changes the name in the page heading, the path and the tree without a reload
- **proof:** e2e

#### Scenario: Long folder names wrap on the folder page
- **WHEN** a folder with a 120-character name and an unbroken 60-character name opens at 375 px
- **THEN** its heading and its path wrap and nothing scrolls horizontally
- **proof:** e2e

## MODIFIED Requirements

### Requirement: Folder page
A folder page SHALL show its path, a cover photo header (when set) with the folder name and counts, the sub-folders as rows with their note count, then the folder's notes as note cards sorted by last edited, with "New note" (creates the note in this folder) and "New folder" (creates a sub-folder) actions; an empty folder SHALL show "Nothing here yet" with both actions. A folder's note count SHALL mean every note in the folder and all its sub-folders, in the header, in sub-folder rows and in the delete dialog alike; the header's folder count SHALL mean all descendant folders.

#### Scenario: Folder page shows sub-folders and notes by last edited
- **WHEN** folder "Reisen" holds sub-folders "Japan" and "Island" and three notes edited at different times
- **THEN** its page shows two sub-folder rows and three note cards, newest edit first
- **proof:** e2e

#### Scenario: Folder page shows breadcrumb, cover header and counts
- **WHEN** folder "Kyoto" inside "Reisen/Japan" with a cover, one sub-folder holding two notes and four notes of its own opens at 1280×800, and at 390×844
- **THEN** at 1280×800 the path links Reisen then Japan and ends at Kyoto; at 390×844 one "…" control stands for Reisen and Japan and pressing it shows them in that order before Kyoto; the header shows the cover image, the name "Kyoto" and "1 folder · 6 notes"
- **proof:** e2e

#### Scenario: Header and parent row count the same
- **WHEN** a folder with notes in itself and in a nested sub-folder is opened and its parent's page lists it as a sub-folder row
- **THEN** the header's note count equals the row's note count
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
- **THEN** an "Untitled folder" row appears in the page's Folders section and its stored parent is "Japan"
- **proof:** e2e

### Requirement: Folder cover
The folder page header SHALL let the user upload or replace a cover photo (stored as WebP in SQLite, at most 16 MB) or remove it; a wrong file type or a too large file SHALL be refused with a toast; removing the cover SHALL leave the header without an image and offer "Add cover" again.

#### Scenario: Upload and replace a folder cover
- **WHEN** a JPEG is chosen with "Add cover" on a folder page, then another with "Change cover"
- **THEN** the header shows the first image, then the second, and only one cover image row exists for the folder
- **proof:** e2e

#### Scenario: Removing the cover brings back Add cover
- **WHEN** "Remove cover" is chosen on a folder page with a cover
- **THEN** the header has no image and offers "Add cover"
- **proof:** e2e

#### Scenario: Wrong cover file is refused with a toast
- **WHEN** a PDF and then a 17 MB image are chosen as cover
- **THEN** the toasts "That file isn't an image" and "That image is too large" appear and the cover is unchanged
- **proof:** e2e

#### Scenario: Server replaces covers and stores them as WebP
- **WHEN** `setFolderCover` runs twice for a folder and then `removeFolderCover`
- **THEN** after each set exactly one `image/webp` row has that `folder_id`, and after removal none
- **proof:** unit

### Requirement: Deleting a folder
Deleting a folder SHALL ask in an alert dialog (`alertdialog`, as the hi-fi `Dialog alert`) titled "Delete “<name>”?" with the message "This deletes N folders and M notes inside it. This can't be undone." (counts include all descendants; a count of zero is left out, so "This deletes 1 note inside it. This can't be undone."; an empty folder's message is "This can't be undone."), Cancel (focused) and a danger button "Delete folder" with a trash icon (source: Rue, gate 7, signed hi-fi overlays/Dialog), and on confirm remove the folder, all descendant folders and all their notes with their uploads; when the open note is inside, the app SHALL navigate to the deleted folder's parent.

#### Scenario: Deleting a folder asks with counts
- **WHEN** "Delete" is chosen in the tree menu of "Reisen" holding "Japan" and "Japan/Kyoto" with five notes across them
- **THEN** the alert dialog is titled "Delete “Reisen”?" with the message "This deletes 2 folders and 5 notes inside it. This can't be undone." and the confirm button "Delete folder", and after confirming the three folders and five notes are gone
- **proof:** e2e

#### Scenario: Empty folder asks without counts
- **WHEN** "Delete" is chosen for an empty folder "Leer"
- **THEN** the alert dialog is titled "Delete “Leer”?" with the message "This can't be undone."
- **proof:** e2e

#### Scenario: Folder delete leaves out a zero count
- **WHEN** "Delete" is chosen for a folder holding one note and no sub-folders, and for one holding two sub-folders and no notes
- **THEN** the messages read "This deletes 1 note inside it. This can't be undone." and "This deletes 2 folders inside it. This can't be undone."
- **proof:** unit

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
