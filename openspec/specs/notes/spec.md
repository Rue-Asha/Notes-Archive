# notes Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Creating a note
"New note" SHALL create an untitled note — in the current folder when started from a folder page or a folder's menu, otherwise at the root — and open it with the cursor in the title; a new note left completely empty (no title, no content, no icon, no tags, not pinned) SHALL be discarded when the user navigates away, while a note with only a title is kept.

#### Scenario: Opening a new empty note focuses the title
- **WHEN** a note just created through `POST /api/notes` is opened
- **THEN** the title field has focus and shows the "Untitled" placeholder
- **proof:** e2e

#### Scenario: Empty new note is discarded on leaving
- **WHEN** a new note is opened and the user navigates to Home without typing
- **THEN** `counts` reports no notes
- **proof:** e2e

#### Scenario: Note with only a title is kept
- **WHEN** a new note gets the title "Einkauf" and the user navigates to Home
- **THEN** the note still exists with that title and an empty body
- **proof:** e2e

#### Scenario: Server creates notes at the root or in a folder
- **WHEN** `createNote({})` and `createNote({ folderId })` are called
- **THEN** the first note has no folder, the second has that folder, both have an empty title and an empty document
- **proof:** unit

#### Scenario: Server discards only empty notes
- **WHEN** `discardIfEmpty` is called for an empty note, a note with only a title, a note with only an icon and a pinned empty note
- **THEN** only the first is deleted
- **proof:** unit

### Requirement: Note page
The note page SHALL show an optional icon (emoji picker; click to change or remove), a large title, a properties row (Folder, Tags, Pinned) and then the body; untitled notes SHALL read "Untitled" in cards, the tree and the tab title.

#### Scenario: Note page shows icon, title and body
- **WHEN** a note with icon 🌿, title "Garten" and a body paragraph opens
- **THEN** the page shows the icon, the title in the display font as the page's `h1` field, and the paragraph in the editor below
- **proof:** e2e

#### Scenario: Pick, change and remove the note icon
- **WHEN** "Add icon" is clicked and 📚 is picked, then the icon is clicked and 🌿 picked, then the icon is clicked and "Remove" chosen
- **THEN** after each step and a reload the stored icon is 📚, then 🌿, then none
- **proof:** e2e

#### Scenario: Emoji picker is usable on phone
- **WHEN** the emoji picker opens on phone
- **THEN** it fits inside the viewport, its search filters emoji by keyword ("book" shows 📚), and tapping one sets the icon
- **proof:** e2e

#### Scenario: Untitled note's tab title reads Untitled
- **WHEN** a note without a title is open
- **THEN** the document title starts with "Untitled"
- **proof:** e2e

#### Scenario: Very long title wraps
- **WHEN** a 200-character title is typed on phone
- **THEN** the title wraps onto several lines inside the column and nothing scrolls horizontally
- **proof:** e2e

### Requirement: Autosave
Title, body, icon, folder, tags and pin SHALL save automatically — debounced while typing, flushed on blur and before navigating away — with a quiet status showing "Saving…" and "Saved"; a failed save SHALL show the toast "Couldn't save — try again" and keep the local content so the next edit or a retry saves it; when the server reports the note deleted, the page SHALL show "This note was deleted" and stop saving.
Two devices editing the same note: the last write wins.

#### Scenario: Typing saves automatically
- **WHEN** a title and two body paragraphs are typed
- **THEN** the status shows "Saving…" and then "Saved", and after a reload the title and both paragraphs are there
- **proof:** e2e

#### Scenario: Leaving flushes a pending save
- **WHEN** a word is typed and Home is clicked within the debounce time
- **THEN** the navigation waits for the save, and the stored note holds the word
- **proof:** e2e

#### Scenario: Failed save shows a toast and keeps the content
- **WHEN** the next save answers 500 while a word is typed
- **THEN** the toast "Couldn't save — try again" appears, the word stays in the editor, and the next keystroke (with the server answering again) saves both
- **proof:** e2e

#### Scenario: Unreachable server retries on the next change
- **WHEN** the save request is aborted (network down) and then the network returns and another word is typed
- **THEN** the stored note holds both words
- **proof:** e2e

#### Scenario: Deleted note shows a notice on its next save
- **WHEN** a note is open in one tab, deleted from another, and a word is typed in the first tab
- **THEN** the first tab shows "This note was deleted" and sends no further saves
- **proof:** e2e

#### Scenario: Last write wins between two tabs
- **WHEN** two tabs edit the same note's title one after the other
- **THEN** after both settle the stored title is the one saved last
- **proof:** e2e

#### Scenario: Server update derives the body text and bumps the edit time
- **WHEN** `updateNote` stores a new title and content
- **THEN** `body_text` equals `plainText(content)`, `updated_at` is newer, and a pin-only patch leaves `updated_at` unchanged
- **proof:** unit

### Requirement: Note cards
Note cards on Home, folder, tag and search pages SHALL show the icon, the title ("Untitled" when empty), a 2–3 line plain-text snippet ("Empty note" when the body has no text), up to three tag chips plus "+n", the relative edited time and a pin marker, and SHALL offer a card menu with Pin/Unpin, Move to… and Delete.

#### Scenario: Note card shows its parts
- **WHEN** a pinned note with icon, title, a long body and two tags, edited two hours ago, is on its folder page
- **THEN** its card shows the icon, title, a snippet clamped to at most 3 lines, both tag chips, "2h ago" and the pin marker
- **proof:** e2e

#### Scenario: Card shows at most three tags and +n
- **WHEN** a note has five tags
- **THEN** its card shows three chips and "+2"
- **proof:** e2e

#### Scenario: Note without text shows Empty note
- **WHEN** a note has a title but no body text
- **THEN** its card's snippet area reads "Empty note"
- **proof:** e2e

#### Scenario: Untitled note card reads Untitled
- **WHEN** a note without a title but with body text is on its folder page
- **THEN** its card title reads "Untitled"
- **proof:** e2e

#### Scenario: Snippet skips a leading image
- **WHEN** a note's content starts with an image block followed by the paragraph "Nach dem Bild"
- **THEN** its card snippet from `listNotes` starts with "Nach dem Bild"
- **proof:** unit

#### Scenario: Edited time reads relative
- **WHEN** `relativeTime` formats times 30 s, 5 min, 2 h, 3 days and 40 days before now
- **THEN** it returns "just now", "5m ago", "2h ago", "3d ago" and the short date
- **proof:** unit

### Requirement: Deleting a note
Deleting a note SHALL ask "Delete “<title>”? This can't be undone." and on confirm remove the note, its tag links and its uploaded images and files; deleting the open note SHALL land on its parent folder page, or Home for a root note; cancelling keeps everything.

#### Scenario: Deleting the open note asks first and lands on its folder
- **WHEN** "Delete" is chosen in the note header menu of note "Rezept" inside folder "Küche" and confirmed
- **THEN** the dialog read "Delete “Rezept”? This can't be undone.", the page is `/folders/<Küche id>`, and the note no longer exists
- **proof:** e2e

#### Scenario: Cancelled note delete keeps everything
- **WHEN** the delete dialog is cancelled
- **THEN** the note, its tags and uploads still exist and the note page is still open
- **proof:** e2e

#### Scenario: Delete a note from its card
- **WHEN** "Delete" is chosen in a card menu and confirmed
- **THEN** the card disappears from the page without a reload and the note no longer exists
- **proof:** e2e

#### Scenario: Server delete removes tag links, uploads and the index row
- **WHEN** `deleteNote` runs for a note with two tags (one used only by it), two images and a file
- **THEN** its note_tags, images, files and notes_fts rows are gone, the tag only it used is gone and the shared tag stays
- **proof:** unit

### Requirement: Removed uploads are kept for a grace period
When a save changes a note's content, the images and files that the previously saved body referenced and the new body no longer does SHALL be marked as removed instead of deleted, keep being served, and be deleted by a purge once they have been marked for an hour; the purge SHALL run at server start and on every note save; a save whose body references a marked upload SHALL clear the mark and make that note its owner, so a block cut from one note and pasted into another, or brought back with undo, keeps its upload; uploads the body still references, and uploads never saved into a body, SHALL be left alone.

#### Scenario: Removed uploads are marked on save, not deleted
- **WHEN** a note whose saved body holds two images, a file card and a link-preview image is updated with a body that keeps one image only
- **THEN** the other image, the file and the preview image rows still exist and are marked removed, and the kept image is not marked
- **proof:** unit

#### Scenario: A removed upload can still be pasted into another note
- **WHEN** note A saves a body without its image and file card, and note B then saves a body holding both
- **THEN** both are owned by B, no longer marked, and a purge after the grace period keeps them
- **proof:** unit

#### Scenario: Undo brings a removed upload back
- **WHEN** a note saves a body without its image and then saves the image block again
- **THEN** the image is still owned by the note and no longer marked
- **proof:** unit

#### Scenario: An orphaned upload is purged after the grace period
- **WHEN** a note saves a body without its image and file card, and the purge runs just before and then just after the hour; and a marked upload older than the hour meets a server start, another one a save of any note
- **THEN** the purge before the hour keeps both, the one after deletes both, and the server start and the save each delete their old upload
- **proof:** unit

#### Scenario: Uploads still in the body survive a save
- **WHEN** only the title changes, or the body changes without touching its image blocks
- **THEN** every image and file of the note still exists
- **proof:** unit

#### Scenario: Uploads never saved are left alone
- **WHEN** an image was uploaded to a note but no saved body references it, a save arrives that doesn't mention it, and a purge runs after the grace period
- **THEN** that image still exists and is not marked removed
- **proof:** unit

### Requirement: Pinning
Notes SHALL be pinned and unpinned from the properties row or the card menu; pinned notes SHALL appear in Home's Pinned tile, most recently pinned first; unpinning the last pinned note SHALL hide the tile.

#### Scenario: Pin from the properties row
- **WHEN** "Pinned" is switched on in a note's properties row and the page reloads
- **THEN** the switch is on and the stored note has a pin time
- **proof:** e2e

#### Scenario: Pin from a card menu
- **WHEN** "Pin" is chosen in a card menu
- **THEN** the card shows the pin marker and its menu now offers "Unpin"
- **proof:** e2e

#### Scenario: Pinned notes appear on Home most recently pinned first
- **WHEN** notes A and then B are pinned
- **THEN** Home's "Pinned" region lists B before A
- **proof:** e2e

#### Scenario: Unpinning the last note hides the Pinned tile
- **WHEN** the only pinned note is unpinned from its card menu on Home
- **THEN** the "Pinned" region disappears without a reload
- **proof:** e2e

#### Scenario: Server orders pinned notes by pin time
- **WHEN** three notes are pinned at different times and one is unpinned
- **THEN** `listPinned` returns the other two, latest pin first
- **proof:** unit

