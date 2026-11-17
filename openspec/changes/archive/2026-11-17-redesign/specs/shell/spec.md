## ADDED Requirements

### Requirement: Focus tree
In the pointer posture (1024 px and up) the app SHALL show a `navigation` landmark named "Sidebar" with Home, Search (opens the palette), New note, the folder tree, the tags list and the sort picker. Opening a folder (its name in the tree, or any link to it) SHALL show its page in the frame and focus the tree on it: a path row at the top with each ancestor as a link up, and that folder's subtree below, indented from the focused level. At the top level there SHALL be no path row. Untitled notes SHALL read "Untitled"; with no folders the tree SHALL show "No folders yet" with a "New folder" action.

#### Scenario: Opening a folder focuses the tree on it
- **WHEN** folder "Kyoto" inside "Reisen/Japan" is opened by its name in the tree at 1280×800
- **THEN** the URL is `/folders/<kyoto>`, the path row holds links "Reisen" and "Japan", and Kyoto's sub-folders and notes sit at the first indent level below it
- **proof:** e2e

#### Scenario: Path row links go up
- **WHEN** "Japan" is clicked in the path row while the tree is focused on "Kyoto"
- **THEN** Japan's folder page opens and the tree is focused on Japan
- **proof:** e2e

#### Scenario: Top level has no path row
- **WHEN** Home or `/folders` opens on desktop
- **THEN** the tree shows the top-level folders and there is no path row
- **proof:** e2e

#### Scenario: Deep path shortens the middle
- **WHEN** a folder twelve levels deep is focused
- **THEN** the path row shows the first and the nearest ancestors with the middle collapsed into one control, that control reveals every ancestor's full name, and the sidebar does not scroll horizontally
- **proof:** e2e

#### Scenario: Long names stay readable in the tree
- **WHEN** a folder with a 120-character name and an unbroken 60-character name is in the focused subtree and the path row
- **THEN** each wraps or shortens inside the sidebar width and its full name is available as its accessible name or tooltip
- **proof:** e2e

#### Scenario: Deleting the focused folder moves the focus up
- **WHEN** the folder the tree is focused on is deleted
- **THEN** the tree is focused on its parent, or on the top level for a top-level folder
- **proof:** e2e

#### Scenario: Empty tree offers New folder
- **WHEN** no folders exist
- **THEN** the tree shows "No folders yet" with a "New folder" action
- **proof:** e2e

#### Scenario: Untitled note in the tree reads Untitled
- **WHEN** a note without a title is in the focused subtree
- **THEN** its tree row reads "Untitled"
- **proof:** e2e

### Requirement: Tree follows the open note
Opening a note from anywhere (tree, folder page, Home, search, palette) SHALL focus the tree on the note's folder and mark the note's row `aria-current="page"`.

#### Scenario: Opening a note from search focuses its folder
- **WHEN** a note in "Reisen/Japan" is opened from the palette, from `/search` and from Home
- **THEN** each time the tree is focused on "Japan" and the note's row carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Top-level note shows the top level
- **WHEN** a note without a folder is opened
- **THEN** the tree shows the top level with no path row and the note's row is current
- **proof:** e2e

#### Scenario: Moving the open note moves the focus
- **WHEN** the open note is moved to "Island" with Move to…
- **THEN** the tree is focused on "Island" without a reload and the note's row is current there
- **proof:** e2e

#### Scenario: Deleting the open note keeps its folder focused
- **WHEN** the open note in "Japan" is deleted
- **THEN** Japan's folder page opens and the tree stays focused on "Japan"
- **proof:** e2e

### Requirement: Tree expansion and keyboard
The chevron SHALL expand or collapse a folder in place without navigating; the manual open state SHALL last until reload; a folder with nothing inside SHALL have no chevron; the current item's ancestors SHALL expand on their own. The tree SHALL use `tree`/`treeitem` semantics with `aria-expanded`: Up/Down move between visible items, Right expands or moves to the first child, Left collapses or moves to the parent, Enter opens.

#### Scenario: Chevron expands without navigating
- **WHEN** the chevron of a folder with a sub-folder and two notes is clicked, then clicked again
- **THEN** the children appear and then hide, and the URL never changes
- **proof:** e2e

#### Scenario: Manual open state lasts until reload
- **WHEN** a folder is expanded by its chevron, another page is opened and the page is then reloaded
- **THEN** the folder is still expanded after the navigation and back to its default after the reload
- **proof:** e2e

#### Scenario: Empty folder has no chevron
- **WHEN** a folder with no sub-folders and no notes is in the tree
- **THEN** its row has no expand control
- **proof:** e2e

#### Scenario: Tree focuses the open note folder and marks its row
- **WHEN** a note three levels below the root is open
- **THEN** the tree focuses the note's folder and marks the note's row as the current page; expanding the ancestors stays covered by the focus unit test
- **proof:** e2e

#### Scenario: Arrow keys move through the tree
- **WHEN** the tree has focus and Down, Right, Down, Left, Left and Enter are pressed
- **THEN** focus moves, expands, enters the child, returns to the parent and collapses it as described, `aria-expanded` follows, and Enter opens the focused item
- **proof:** e2e

### Requirement: Tree rail
One control SHALL fold the sidebar (17.5rem, 280 px at the default root size) into a 60 px rail and back (the signed hi-fi's sizes); the state SHALL be remembered per browser and applied on first render without a flash; the toggle SHALL expose its expanded state; the rail's Home, Search, New note and expand controls SHALL keep accessible names. When browser storage is unavailable the sidebar SHALL be expanded.

#### Scenario: One control folds the tree into a rail
- **WHEN** the sidebar's fold control is clicked
- **THEN** the 280 px sidebar becomes the 60 px rail, the control's `aria-expanded` is false, and clicking it again restores the 280 px tree with `aria-expanded` true
- **proof:** e2e

#### Scenario: Rail state survives a reload without a flash
- **WHEN** the rail is folded and the page is reloaded
- **THEN** the server-rendered document already shows the rail before hydration, and no layout shift happens after it
- **proof:** e2e

#### Scenario: Storage unavailable falls back to expanded
- **WHEN** `localStorage` throws on access and a page opens
- **THEN** the sidebar is expanded and no error surfaces
- **proof:** e2e

#### Scenario: Rail controls keep accessible names
- **WHEN** the rail is folded
- **THEN** Home, Search, New note and the expand control are reachable by role and name
- **proof:** e2e

### Requirement: Tags list
Tags SHALL sit below the tree on desktop and after the folders on `/folders`, each with its note count and linking to its tag page; on a tag page that tag's row SHALL be the current one (`aria-current="page"`, the charcoal pill) and keep its count (source: Rue, gate 7, signed hi-fi); the section SHALL be absent when no tags exist; counts SHALL update without a reload.

#### Scenario: Tags sit below the tree with counts
- **WHEN** tags "Übung" (2 notes) and "Reise" (1 note) exist on desktop
- **THEN** a Tags section below the tree lists both with counts 2 and 1, linking to `/tags/<id>`
- **proof:** e2e

#### Scenario: Tags follow the folders on the phone
- **WHEN** `/folders` opens on the phone with folders and tags
- **THEN** the Tags section comes after the folders and lists every tag with its count
- **proof:** e2e

#### Scenario: The open tag is the current row
- **WHEN** the page of tag "Übung" (2 notes) opens on desktop
- **THEN** its row in the sidebar's Tags list has `aria-current="page"` and still shows 2, and no other tag row is current
- **proof:** e2e

#### Scenario: Tags section is absent without tags
- **WHEN** no note has a tag
- **THEN** neither the sidebar nor `/folders` shows a Tags section
- **proof:** e2e

#### Scenario: Tag counts update without reload
- **WHEN** tag "Reise" is added to a second note on its note page
- **THEN** the Tags section shows 2 for "Reise" without a page reload
- **proof:** e2e

### Requirement: Tree sort picker
A quiet icon button with a menu SHALL sit in the tree header on desktop and on `/folders` on the phone, offering the four modes `mixed`, `name`, `edited` and `created` with the English labels fixed at gate 5, marking the current mode; choosing one SHALL re-sort the tree without reload and save it with `PATCH /api/settings`. A failed save SHALL show a toast and restore the previous mode. The sort SHALL affect only the tree and `/folders`.

#### Scenario: Sort picker marks the current mode
- **WHEN** the sort button is opened
- **THEN** a menu lists four modes and exactly the stored one is checked
- **proof:** e2e

#### Scenario: Choosing a mode re-sorts and persists
- **WHEN** the mode for last edited is chosen
- **THEN** the tree re-orders without a reload, and after a reload the same mode is checked and the order holds
- **proof:** e2e

#### Scenario: Failed sort save reverts with a toast
- **WHEN** `PATCH /api/settings` fails while a new mode is chosen
- **THEN** a toast reports the failure and the previous mode and order return
- **proof:** e2e

#### Scenario: Sort leaves the other lists alone
- **WHEN** the sort is set to name
- **THEN** a folder page, Home, a tag page and `/search` keep their own orders
- **proof:** e2e

#### Scenario: Sort picker on the phone lives on the Folders page
- **WHEN** `/folders` opens on the phone
- **THEN** the sort button is there and changing the mode re-sorts the folder list
- **proof:** e2e

### Requirement: Phone bar
In the touch posture (below 1024 px) the app SHALL show a `navigation` landmark named "Bottom bar" with Home, Folders and Search as glass pills and a separate round "New note" button; the current section SHALL be marked; the bar SHALL be hidden, inert and `aria-hidden` while the editor has focus and return on blur; it SHALL fit 320 px and respect the safe-area insets.

#### Scenario: Phone bar shows three pills and New note
- **WHEN** any app page opens at 390×844
- **THEN** the "Bottom bar" landmark holds Home, Folders and Search and a separate "New note" button, and no sidebar is visible
- **proof:** e2e

#### Scenario: Current section is marked
- **WHEN** Home, `/folders`, a folder page and `/search` are opened in turn
- **THEN** Home, Folders, Folders and Search carry `aria-current` in turn
- **proof:** e2e

#### Scenario: Bar hides while the editor has focus
- **WHEN** the note body is focused on a touch device and then blurred
- **THEN** the bar is hidden, inert and `aria-hidden` while focused and back, focusable, after the blur
- **proof:** e2e

#### Scenario: Bar fits 320 px with safe areas
- **WHEN** any app page opens at 320×640 with a bottom safe-area inset
- **THEN** all four controls are fully visible, at least 24 px, not overlapping, above the inset, and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Bar stays out of the soft keyboard
- **WHEN** Rue types a note on her phone
- **THEN** the bar is out of the way while the keyboard is open and back when it closes
- **proof:** manual (real hardware: Playwright only emulates phones and has no soft keyboard)

### Requirement: Folders page
`/folders` SHALL be a UI-only page using layout data only, showing "New folder" and the sort button under the counts in the head, then the top-level folders with their counts, then the tags as chips with their note counts (as in the signed hi-fi); it SHALL replace the Folders drawer. On desktop it SHALL render with the tree at the top level.

#### Scenario: Folders page lists top-level folders with counts, then tags
- **WHEN** `/folders` opens on the phone with two top-level folders (one holding 3 notes, 1 of them in a sub-folder) and two tags
- **THEN** the head holds "New folder" and the sort button, and below it the page lists the two folders with "3 notes" and "0 notes", then the Tags section
- **proof:** e2e

#### Scenario: Folders pill opens the Folders page
- **WHEN** "Folders" is tapped in the phone bar
- **THEN** the URL becomes `/folders` and no dialog opens
- **proof:** e2e

#### Scenario: No folders shows No folders yet
- **WHEN** `/folders` opens with no folders
- **THEN** it shows "No folders yet" with "New folder"
- **proof:** e2e

#### Scenario: New folder from the Folders page
- **WHEN** "New folder" is chosen on `/folders`
- **THEN** an "Untitled folder" appears at the top level of the list and in the tree without a reload
- **proof:** e2e

#### Scenario: Desktop Folders page shows the tree at the top level
- **WHEN** `/folders` opens at 1280×800
- **THEN** the page renders the folder list and the sidebar tree is at the top level with no path row
- **proof:** e2e

### Requirement: Dialogs and menus
Dialogs, menus and choosers (delete confirm, Move to chooser, icon picker, cover menu, note and folder menus, sort menu) SHALL use the fingerprint primitives with contract behaviour: the delete confirm shows its counts once they are known; the Move to chooser lists Root and then the tree in tree order without the moved folder and its descendants; modal dialogs trap focus; Escape and an outside click cancel; focus returns to the opener.

#### Scenario: Delete confirm shows counts once known
- **WHEN** Delete is chosen for a folder holding 2 folders and 5 notes
- **THEN** the alert dialog is titled "Delete “<name>”?" and says "This deletes 2 folders and 5 notes inside it. This can't be undone." once the counts have loaded, and the confirm button is not active before that
- **proof:** e2e

#### Scenario: Move to chooser starts with Root in tree order
- **WHEN** Move to… is opened for folder "Japan" inside "Reisen"
- **THEN** the chooser lists Root first, then the folders in tree order, without "Japan" and its descendants
- **proof:** e2e

#### Scenario: Modal dialog traps focus and returns it
- **WHEN** a delete confirm is open and Tab is pressed repeatedly, then Escape
- **THEN** focus cycles inside the dialog, Escape cancels, and focus returns to the control that opened it
- **proof:** e2e

#### Scenario: Outside click cancels a menu or dialog
- **WHEN** a note menu and then a delete confirm are open and the page outside them is clicked
- **THEN** each closes without acting and focus returns to its opener
- **proof:** e2e

### Requirement: Toasts
Notes' toast host SHALL use the fingerprint toast primitive's markup and styles (an inverse card with the message, an error mark and a dismiss button) with Notes' own timing and queue instead of the primitive's: every toast, errors included, SHALL be announced as a polite status and stay about 4 s, and a toast raised right before a redirect SHALL survive onto the next page (decided 2026-11-16).

#### Scenario: Toast is a polite status for about four seconds
- **WHEN** a cover upload is refused
- **THEN** a toast appears inside a polite status region and is gone after about 4 s
- **proof:** e2e

#### Scenario: Toast survives a redirect
- **WHEN** an action raises a toast and then navigates to another page
- **THEN** the toast is visible on the new page
- **proof:** e2e

## REMOVED Requirements

### Requirement: Desktop sidebar
**Reason**: Replaced by the focus tree, the tree rail and capture into the current folder (S1, S4, S17).
**Migration**: "Focus tree", "Tree rail"; notes → "Creating a note".

### Requirement: Folder tree
**Reason**: Replaced by the focus tree with a path row instead of capped indentation (S1–S3); the tree sort itself stays in "Tree sort preference".
**Migration**: "Focus tree", "Tree follows the open note", "Tree expansion and keyboard".

### Requirement: Phone bottom bar and drawer
**Reason**: The phone bar gets pills plus a round "+", and the Folders drawer is replaced by `/folders` and drill-down (S7–S9).
**Migration**: "Phone bar", "Folders page"; folders → "Phone drill-down".

### Requirement: Tags section
**Reason**: Tags move below the tree and onto `/folders` (S5).
**Migration**: "Tags list".

## MODIFIED Requirements

### Requirement: Wide layouts
At 1100 px and wider the note column SHALL widen to 1.25 × the fingerprint `--measure` (85ch) plus the card's padding — the long end of a comfortable line, so the writing area fills the frame's content column at 1280 px — and stay capped there and centred in the content area right of the sidebar; below 1100 px it stays at `--measure` plus padding. Below 1100 px a pointer can be a finger, so every button and every folder note row SHALL keep a target of at least 44 px (source: Rue, gate 7, signed hi-fi). Home SHALL show Pinned and Recently edited side by side at 1100 px and wider; between 1024 and 1099 px the sidebar stays and Home's lists stack.

#### Scenario: Controls keep a 44 px target below the wide layout
- **WHEN** a folder page opens at 1024 px, at 1280 px and on the phone
- **THEN** below 1100 px the sidebar's Fold, New folder and Sort buttons and each folder note row's link are at least 44 px tall, and at 1280 px the sidebar buttons are the compact 30 px controls again (the tree's own rows keep their compact height, a known limit in DESIGN.md)
- **proof:** e2e

#### Scenario: Note column is capped and centred on wide screens
- **WHEN** a note opens at 1600×900
- **THEN** the note body is no wider than 1.25 × `--measure` plus the card's inline padding, wider than 0.9 of that measure, and its centre is within 2 px of the centre of the content area (the page column right of the sidebar, inside the frame)
- **proof:** e2e

#### Scenario: Note column widens at 1100 px and fills the content area at 1280
- **WHEN** a note opens at 1099 px wide and the window then grows to 1280 px
- **THEN** the note column is more than 10 % wider at 1280 than at 1099 and takes at least 95 % of the content area's width
- **proof:** e2e

#### Scenario: Home lists sit side by side on wide screens
- **WHEN** Home with pinned and recently edited notes opens at 1280 and at 1600 px wide
- **THEN** Pinned and Recently edited sit side by side at both widths
- **proof:** e2e

#### Scenario: Mid-width shows the sidebar with stacked lists
- **WHEN** Home with pinned and recently edited notes opens at 1050×800
- **THEN** the sidebar is visible, Pinned sits above Recently edited, and nothing scrolls horizontally
- **proof:** e2e
