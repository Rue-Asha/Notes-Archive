## ADDED Requirements

### Requirement: Desktop sidebar
At 1024 px and wider the app SHALL show a persistent glass sidebar with Home, Search (opens the palette), New note, the folder tree and a Tags section; the sidebar SHALL collapse to an icon rail and remember the collapsed state per browser.

#### Scenario: Desktop shows the glass sidebar
- **WHEN** any app page opens at 1280×800
- **THEN** a `navigation` landmark named "Sidebar" with the glass material shows Home, Search, New note, a Folders section and (when tags exist) a Tags section, and no bottom bar is visible
- **proof:** e2e

#### Scenario: New note from the sidebar or bottom bar opens a root note
- **WHEN** "New note" is chosen in the sidebar on desktop or the "+" in the bottom bar on phone
- **THEN** the URL becomes `/notes/<id>` and the stored note has no folder
- **proof:** e2e

#### Scenario: Collapsed sidebar stays collapsed after reload
- **WHEN** the sidebar is collapsed and the page is reloaded
- **THEN** the sidebar is still the icon rail, and expanding it shows the full sidebar again after the next reload
- **proof:** e2e

### Requirement: Folder tree
The sidebar and the phone drawer SHALL show the same tree of folders and their notes, expandable per folder, with the current note or folder highlighted, "Untitled" for untitled notes, long names truncated with the full name as tooltip, and indentation that grows per level up to a cap and then stays.

#### Scenario: Tree shows folders with their sub-folders and notes
- **WHEN** a folder with a sub-folder and two notes exists and its chevron is expanded
- **THEN** the sub-folder and both notes appear indented under it, and collapsing hides them
- **proof:** e2e

#### Scenario: Current item is highlighted in the tree
- **WHEN** a note inside a nested folder is open
- **THEN** its ancestors are expanded and its tree row carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Empty tree offers New folder
- **WHEN** no folders exist
- **THEN** the Folders section shows "No folders yet" with a "New folder" action
- **proof:** e2e

#### Scenario: Long names truncate with a tooltip
- **WHEN** a folder name is longer than the sidebar is wide
- **THEN** the row stays one line with an ellipsis and its `title` holds the full name
- **proof:** e2e

#### Scenario: Deep nesting caps the indent
- **WHEN** folders are nested ten levels deep and fully expanded
- **THEN** each level indents further than its parent up to the sixth level, and levels seven to ten share the sixth level's indent
- **proof:** e2e

#### Scenario: Untitled note in the tree reads Untitled
- **WHEN** a note without a title is in an expanded folder
- **THEN** its tree row reads "Untitled"
- **proof:** e2e

### Requirement: Phone bottom bar and drawer
Below 1024 px the app SHALL show a bottom glass bar with Home, Search, New note (+) and Folders; Folders SHALL open the tree in a drawer that closes on Escape, on the back gesture and when an item is chosen; the bar SHALL hide while the soft keyboard is open in the editor.

#### Scenario: Phone shows the bottom bar
- **WHEN** any app page opens at 390×844
- **THEN** a `navigation` landmark named "Bottom bar" shows Home, Search, New note and Folders, and no sidebar is visible
- **proof:** e2e

#### Scenario: Folders opens the tree in a drawer
- **WHEN** "Folders" is tapped in the bottom bar
- **THEN** a dialog named "Folders" slides in holding the folder tree
- **proof:** e2e

#### Scenario: Escape or back closes the drawer
- **WHEN** the drawer is open and Escape is pressed, or the browser goes back
- **THEN** the drawer closes and the page URL is the one it was opened on
- **proof:** e2e

#### Scenario: Choosing a tree item closes the drawer
- **WHEN** a note is tapped in the drawer's tree
- **THEN** the note opens and the drawer is closed
- **proof:** e2e

#### Scenario: Bottom bar hides while typing in the editor
- **WHEN** the note body is focused on a touch device
- **THEN** the bottom bar is hidden (`aria-hidden` and moved out of view), and it returns when the editor loses focus
- **proof:** e2e

#### Scenario: Bottom bar on a real phone keyboard
- **WHEN** Rue types a note on her phone
- **THEN** the bottom bar is out of the way while the keyboard is open and back when it closes
- **proof:** manual (real hardware: Playwright only emulates phones and has no soft keyboard)

### Requirement: Wide layouts
At 1280 px and wider the note column SHALL be capped for reading (720 px) and centred in the area right of the sidebar, and Home and folder grids SHALL add columns instead of stretching cards; between 1024 and 1279 px the sidebar stays and grids show fewer columns.

#### Scenario: Note column is capped and centred on wide screens
- **WHEN** a note opens at 1600×900
- **THEN** the note body is at most 720 px wide and its centre is within 2 px of the centre of the area right of the sidebar
- **proof:** e2e

#### Scenario: Grids add columns instead of stretching cards
- **WHEN** Home and a folder page with 12 notes open at 1280 and at 1600 px wide
- **THEN** no note card is wider than 320 px at either width and the grid has more columns at 1600 than at 1280
- **proof:** e2e

#### Scenario: Mid-width shows the sidebar with fewer columns
- **WHEN** Home opens at 1100×800
- **THEN** the sidebar is visible, the grid has fewer columns than at 1280, and nothing scrolls horizontally
- **proof:** e2e

### Requirement: Tags section
The sidebar's Tags section SHALL list every tag in use with its note count, each linking to its tag page, and SHALL be hidden when no tags exist.

#### Scenario: Sidebar lists tags with counts
- **WHEN** tags "Übung" (2 notes) and "Reise" (1 note) exist
- **THEN** the Tags section lists both with counts 2 and 1, linking to `/tags/<id>`
- **proof:** e2e

#### Scenario: Tags section is hidden without tags
- **WHEN** no note has a tag
- **THEN** the sidebar shows no Tags section
- **proof:** e2e
