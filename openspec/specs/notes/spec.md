# notes Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Creating a note
"New note" (sidebar, phone bar "+", Home, folder page, folder menu, palette) SHALL create an untitled note in the current folder — the folder of the open folder page, or the folder of the open note — and otherwise at the top level, and open it with the cursor in the title and the title and body placeholders shown; a new note left completely empty (no title, no content, no icon, no tags, not pinned) SHALL be discarded silently when the user navigates away, while a note with only a title is kept.

#### Scenario: Opening a new empty note focuses the title
- **WHEN** a note just created through `POST /api/notes` is opened
- **THEN** the title field has focus and shows the "Untitled" placeholder
- **proof:** e2e

#### Scenario: New note shows its placeholders
- **WHEN** "New note" is chosen on Home
- **THEN** the title shows "Untitled" and the body shows "Write, or type / for blocks" as placeholders
- **proof:** e2e

#### Scenario: New note from the shell lands in the current folder
- **WHEN** "New note" is chosen in the sidebar while folder "Japan"'s page is open, and the phone bar "+" is tapped while a note in "Japan" is open
- **THEN** both new notes are stored in "Japan"
- **proof:** e2e

#### Scenario: New note without a current folder lands at the top level
- **WHEN** "New note" is chosen on Home, on `/search` and from the palette on a tag page
- **THEN** each new note has no folder
- **proof:** e2e

#### Scenario: Empty new note is discarded on leaving
- **WHEN** a new note is opened and the user navigates to Home without typing
- **THEN** `counts` reports no notes and no message is shown
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
The note page SHALL show an optional icon (emoji picker; click to change or remove), a large multi-line title, the properties (icon, Folder chooser, Tags, Pinned) in a glass bar under the title, collapsible, and then the body on the white card; on the phone the properties SHALL start collapsed into one summary line (folder path · tag count) that expands on tap; each property change SHALL save immediately; untitled notes SHALL read "Untitled" in entries, the tree and the tab title.

#### Scenario: Note page shows icon, title and body
- **WHEN** a note with icon 🌿, title "Garten" and a body paragraph opens
- **THEN** the page shows the icon, the title as the page's level-1 heading field, and the paragraph in the editor below
- **proof:** e2e

#### Scenario: Pick, change and remove the note icon
- **WHEN** "Add icon" is clicked and 📚 is picked, then the icon is clicked and 🌿 picked, then the icon is clicked and "Remove icon" chosen
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

#### Scenario: Properties show under the title
- **WHEN** a note opens at 1280×800
- **THEN** the properties Folder, Tags and Pinned are expanded between the title and the body, and one control collapses and expands them with `aria-expanded`
- **proof:** e2e

#### Scenario: Properties collapse into a summary on the phone
- **WHEN** a note in "Reisen/Japan" with three tags opens at 390×844
- **THEN** the properties show one summary line with the folder path and "3 tags", and tapping it expands them
- **proof:** e2e

#### Scenario: Property changes save at once
- **WHEN** the folder, a tag and the pin are changed on the note page
- **THEN** each change is stored before the next one is made, without typing in the body
- **proof:** e2e

#### Scenario: Many tags wrap without horizontal scroll
- **WHEN** a note with 40 tags, some 40 characters long, opens at 320 px with the properties expanded
- **THEN** the tags wrap onto several lines and nothing scrolls horizontally
- **proof:** e2e

#### Scenario: Long folder path stays readable in the properties
- **WHEN** a note twelve folders deep opens on the phone
- **THEN** the summary line and the Folder row shorten or wrap the path inside the card, and the full path is available as the chooser's accessible name
- **proof:** e2e

#### Scenario: Note without tags shows no tag count
- **WHEN** a note without tags opens on the phone
- **THEN** the summary line shows the folder path and no tag count
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
Note cards on Home, folder, tag and search pages SHALL show the icon, the title ("Untitled" when empty), a plain-text snippet clamped to at most 3 lines ("Empty note" when the body has no text) and the edited time; on Home they SHALL also show the folder, the first tag and "+n" for the rest, on one meta line where the time keeps its full width and no tag runs into it (source: Rue, gate 7, signed hi-fi). On the search page a result SHALL be a numbered row ("01", "02", …) instead of a card plate, with the folder after a folder icon, up to three tags plus "+n" on a meta line that wraps, and the absolute date ("Tue 17 Nov", the year once it is another year's) instead of the relative time (source: Rue, gate 7, signed hi-fi). Every note card SHALL offer a card menu with Pin/Unpin, Move to… and Delete.

#### Scenario: Note card shows its parts
- **WHEN** a note with icon, title, a long body and two tags in folder "Reisen", edited two hours ago, is in Home's Recently edited
- **THEN** its card shows the icon, title, a snippet clamped to at most 3 lines, "Reisen", the first tag with "+1" and "2h ago"
- **proof:** e2e

#### Scenario: Card shows its first tag and +n
- **WHEN** a note with five tags is in Home's Recently edited
- **THEN** its card shows the first tag and "+4"
- **proof:** e2e

#### Scenario: Long tags never run into the time
- **WHEN** pinned and recent notes with two and five long tags are on Home and on their tag page at 375, 768 and 1280 px
- **THEN** every card's time is shown whole with no tag pill reaching into it, and "+n" is never cut
- **proof:** e2e

#### Scenario: Search results are numbered rows with folder and date
- **WHEN** `/search?q=kyoto` finds two notes, one in "Reisen" edited on 3 March 2025 with five tags
- **THEN** the rows start "01" and "02", the first shows a folder icon with "Reisen", three tags and "+2", and its date reads "Mon 3 Mar 2025"
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
Deleting a note SHALL ask in an alert dialog (`alertdialog`, as the hi-fi `Dialog alert`) titled "Delete “<title>”?" with the message "This can't be undone.", Cancel (focused) and a danger button "Delete note" with a trash icon; on a phone the two buttons stack full width (source: Rue, gate 7, signed hi-fi overlays/Dialog). On confirm it SHALL remove the note, its tag links and its uploaded images and files; deleting the open note SHALL land on its parent folder page, or Home for a root note; cancelling keeps everything.

#### Scenario: Deleting the open note asks first and lands on its folder
- **WHEN** "Delete" is chosen in the note header menu of note "Rezept" inside folder "Küche" and "Delete note" is confirmed
- **THEN** the alert dialog was titled "Delete “Rezept”?" with the message "This can't be undone." and the confirm button "Delete note", the page is `/folders/<Küche id>`, and the note no longer exists
- **proof:** e2e

#### Scenario: Delete buttons stack on a phone
- **WHEN** the delete dialog opens at 390 px wide
- **THEN** Cancel and "Delete note" each span the dialog's width, Cancel above "Delete note"
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
Notes SHALL be pinned and unpinned from the note's properties or the card menu; pinned notes SHALL appear in Home's Pinned list in a manual order that the user can change, a newly pinned note SHALL go to the top of that order, and unpinning the last pinned note SHALL hide the list. The server SHALL store the order and SHALL reorder the whole pinned list in one request; a reorder that does not list exactly the currently pinned notes SHALL be refused with 409 and change nothing. Databases from before this requirement SHALL keep the order they showed (most recently pinned first).

#### Scenario: Pin from the properties row
- **WHEN** "Pinned" is switched on in a note's properties and the page reloads
- **THEN** the switch is on and the stored note has a pin time
- **proof:** e2e

#### Scenario: Pin from a card menu
- **WHEN** "Pin" is chosen in a card menu
- **THEN** the note is listed in Home's "Pinned" region and its card menu now offers "Unpin"
- **proof:** e2e

#### Scenario: Pinned notes appear on Home most recently pinned first
- **WHEN** notes A and then B are pinned and never reordered
- **THEN** Home's "Pinned" region lists B before A
- **proof:** e2e

#### Scenario: Unpinning the last note hides the Pinned list
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

### Requirement: Title editing
The title SHALL accept several lines: Enter inserts a line break; Cmd/Ctrl+Enter, or ArrowDown on the last line, SHALL put the caret at the start of the body; pasted CRLF text SHALL keep its line breaks as LF; the title SHALL be the page's level-1 heading.

#### Scenario: Enter in the title adds a line break
- **WHEN** "Japan" is typed in the title, then Enter, then "2026"
- **THEN** the title shows two lines and the stored title is "Japan\n2026"
- **proof:** e2e

#### Scenario: Cmd or Ctrl+Enter moves to the body
- **WHEN** Cmd/Ctrl+Enter is pressed anywhere in the title
- **THEN** the caret is at the start of the body
- **proof:** e2e

#### Scenario: ArrowDown on the last title line moves to the body
- **WHEN** ArrowDown is pressed on the first of two title lines, then again on the second
- **THEN** the first press moves to the second line and the second press puts the caret at the start of the body
- **proof:** e2e

#### Scenario: Title is the page heading
- **WHEN** a note titled "Garten" opens
- **THEN** exactly one level-1 heading exists on the page and its accessible name is "Garten"
- **proof:** e2e

#### Scenario: Pasted CRLF text keeps its line breaks
- **WHEN** "Eins\r\nZwei" is pasted into an empty title
- **THEN** the title shows two lines and the stored title is "Eins\nZwei"
- **proof:** e2e

#### Scenario: Many short title lines stay in the column
- **WHEN** a title of twelve short lines is typed at 375 px
- **THEN** every line shows inside the column and nothing scrolls horizontally
- **proof:** e2e

### Requirement: Save status
The note page SHALL show "Saving…" and "Saved"; a failed save SHALL turn the status into the actionable "Couldn't save — try again" plus one toast per run of failures; a note deleted elsewhere SHALL show "This note was deleted" and saving SHALL stop. The status SHALL NOT be a live region.

#### Scenario: Save status shows Saving and Saved
- **WHEN** text is typed in the body
- **THEN** the status reads "Saving…" while the save runs and "Saved" after it
- **proof:** e2e

#### Scenario: Failed saves show one toast and a retry status
- **WHEN** three saves in a row fail and the status is then activated
- **THEN** exactly one toast "Couldn't save — try again" appeared, the status reads "Couldn't save — try again" as a button, and activating it saves again
- **proof:** e2e

#### Scenario: Saving stops after the note was deleted elsewhere
- **WHEN** the open note is deleted in another tab and the body is edited
- **THEN** the status reads "This note was deleted" and no further save request is sent
- **proof:** e2e

#### Scenario: Save status is not a live region
- **WHEN** the save status is inspected
- **THEN** neither it nor an ancestor has `aria-live` or a `status` role
- **proof:** e2e

