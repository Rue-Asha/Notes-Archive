## MODIFIED Requirements

### Requirement: Folder tree
The sidebar and the phone drawer SHALL show the same tree of folders and their notes, expandable per folder, with the current note or folder highlighted, "Untitled" for untitled notes, long names truncated with the full name as tooltip, and indentation that grows per level up to a cap and then stays. The order of folders and notes SHALL follow the stored tree sort (see "Tree sort preference"); with the default sort, folders are ordered by name and notes by last edited.

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

#### Scenario: Default sort keeps folders by name and notes by last edited
- **WHEN** no sort has been chosen
- **THEN** `getTree` returns folders in natural name order and notes newest edit first
- **proof:** unit

## ADDED Requirements

### Requirement: Tree sort preference
The user SHALL be able to choose how the folder tree is ordered, and the choice SHALL be stored on the server so it applies on every device and in the first server render. The modes are `mixed` (default: folders by natural name order, notes by last edited), `name` (folders and notes by natural name order, untitled notes by "Untitled"), `edited` (folders and notes by last edited, newest first; a folder's time is the latest edit of any note inside it, else its own update time) and `created` (folders and notes by creation time, newest first). The mode applies at every level of the tree and to nothing else. An unknown mode SHALL be refused with 400 and change nothing.

#### Scenario: Reading the preference defaults to mixed
- **WHEN** nothing was ever stored
- **THEN** the preference reads `mixed`
- **proof:** unit

#### Scenario: The preference survives a restart
- **WHEN** `name` is stored, the database is closed and opened again
- **THEN** the preference reads `name` and `getTree` follows it
- **proof:** unit

#### Scenario: Each mode orders folders and notes
- **WHEN** a tree with folders and notes of different names, edit times and creation times is read in each mode
- **THEN** folders and notes are ordered as the mode defines, at every nesting level
- **proof:** unit

#### Scenario: An edited note lifts its folder
- **WHEN** the mode is `edited` and a note deep inside the older of two folders is edited
- **THEN** that folder and its ancestors sort before the other folder
- **proof:** unit

#### Scenario: An unknown mode is refused
- **WHEN** the settings endpoint receives `{ "treeSort": "random" }`
- **THEN** it answers 400 and the stored preference is unchanged
- **proof:** unit

#### Scenario: First render uses the stored sort
- **WHEN** `edited` is stored and the app is loaded
- **THEN** the layout data's tree is already in that order, without a client-side change after load
- **proof:** unit
