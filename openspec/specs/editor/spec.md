# editor Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Markdown shortcuts and keys
The editor SHALL turn `# `, `## `, `### ` into headings, `- ` and `* ` into a bullet list, `1. ` into a numbered list, `[] ` into a task list, `> ` into a quote, ```` ``` ```` into a code block and `---` into a divider, and SHALL support Cmd/Ctrl+B, I, E and K plus undo and redo; shortcuts SHALL NOT fire inside code blocks.
Cmd/Ctrl+K with a text selection edits the link; without a selection it opens the command palette (search spec).

#### Scenario: Markdown shortcuts turn into blocks
- **WHEN** each shortcut is typed at the start of an empty line followed by text
- **THEN** the stored content holds heading levels 1–3, two bullet lists, an ordered list, a task list, a blockquote, a code block and a horizontal rule
- **proof:** e2e

#### Scenario: Keyboard marks and undo
- **WHEN** a word is selected and Cmd/Ctrl+B, I and E are pressed, then undo three times and redo once
- **THEN** the word is bold, italic and code after the keys, plain after the undos, and bold after the redo
- **proof:** e2e

#### Scenario: Cmd or Ctrl+K on a selection edits the link
- **WHEN** a word is selected and Cmd/Ctrl+K is pressed, `https://example.org` typed and Enter pressed
- **THEN** the word is a link to that URL and the command palette did not open
- **proof:** e2e

#### Scenario: Shortcuts do not fire inside code blocks
- **WHEN** `# ` and `- ` are typed at the start of a line inside a code block
- **THEN** the code block holds the literal text and no heading or list is created
- **proof:** e2e

### Requirement: Slash menu
Typing `/` at the start of a block or after a space SHALL open a menu of all block types — Text, Heading 1–3, Bullet list, Numbered list, Task list, Quote, Code, Divider, Toggle, Callout, Table, Image, File — that typing filters, arrow keys and Enter choose from, and Escape or a space with no match closes, leaving the typed text; no match shows "No results"; on phone the menu stays inside the visible viewport.

#### Scenario: Slash opens the block menu at a block start or after a space
- **WHEN** `/` is typed at the start of an empty paragraph, then after "Hallo ", then inside the word "a/b"
- **THEN** the menu opens in the first two cases and not in the third
- **proof:** e2e

#### Scenario: Typing filters the slash menu
- **WHEN** `/hea` is typed
- **THEN** the menu shows only Heading 1, Heading 2 and Heading 3
- **proof:** e2e

#### Scenario: Arrow keys and Enter choose a block
- **WHEN** `/head` is typed, ArrowDown pressed once and Enter pressed
- **THEN** the paragraph becomes a level-2 heading and the `/head` text is gone
- **proof:** e2e

#### Scenario: Escape closes the slash menu and keeps the text
- **WHEN** `/quo` is typed and Escape pressed
- **THEN** the menu closes and the paragraph reads "/quo"
- **proof:** e2e

#### Scenario: Space with no match closes the slash menu
- **WHEN** `/zzz` is typed, "No results" shows, and a space is typed
- **THEN** the menu closes and the paragraph reads "/zzz "
- **proof:** e2e

#### Scenario: Slash menu stays within the visible viewport on phone
- **WHEN** the slash menu opens on the last line of a long note on phone
- **THEN** the whole menu lies inside `visualViewport`
- **proof:** e2e

#### Scenario: Slash menu lists every block type
- **WHEN** `/` is typed in an empty paragraph with every block module present
- **THEN** the menu lists Text, Heading 1, Heading 2, Heading 3, Bullet list, Numbered list, Task list, Quote, Code, Divider, Toggle, Callout, Table, Image and File in that order, and choosing each inserts its block
- **proof:** e2e

### Requirement: Bubble toolbar
Selecting text SHALL show a bubble toolbar with Bold, Italic, Strikethrough, Inline code, Link (add, edit, remove a URL) and Text colour (stone, clay, ochre, moss, sea, plum and Default); it SHALL stay hidden inside code blocks and on touch devices sit below the selection.

#### Scenario: Selecting text shows the bubble toolbar
- **WHEN** a word is selected with the mouse
- **THEN** a toolbar named "Format" shows Bold, Italic, Strikethrough, Inline code, Link and Text colour
- **proof:** e2e

#### Scenario: Bubble toolbar applies marks
- **WHEN** Bold, Italic, Strikethrough and Inline code are clicked in turn on a selected word
- **THEN** the stored content gives the word the marks bold, italic, strike and code, and each button shows its pressed state
- **proof:** e2e

#### Scenario: Add, edit and remove a link
- **WHEN** Link is clicked, a URL entered, then the link edited to a second URL, then removed
- **THEN** the stored word links to the first URL, then the second, then no link
- **proof:** e2e

#### Scenario: Text colour from the palette
- **WHEN** "clay" is chosen under Text colour, then "Default"
- **THEN** the word first carries `data-color="clay"` (stored as `textStyle.color = 'clay'`, coloured by `--text-clay`), then no colour
- **proof:** e2e

#### Scenario: Bubble toolbar is hidden in code blocks
- **WHEN** text inside a code block is selected
- **THEN** no format toolbar is visible
- **proof:** e2e

#### Scenario: On touch the toolbar sits below the selection
- **WHEN** a word is selected on phone
- **THEN** the toolbar's top edge is below the selection's bottom edge
- **proof:** e2e

### Requirement: Block handle and block menu
Hovering a block on desktop SHALL show a ⋮⋮ handle; dragging it SHALL move the block with a drop indicator line; clicking or tapping it SHALL open the block menu with Move up, Move down, Turn into (text, heading, list, quote, callout…) and Delete; Move up on the first block and Move down on the last SHALL be disabled; on phone the block menu is the way to reorder.

#### Scenario: Hovering a block shows the handle
- **WHEN** the pointer hovers the second paragraph on desktop
- **THEN** a button named "Block actions" appears beside that paragraph
- **proof:** e2e

#### Scenario: Dragging the handle moves the block
- **WHEN** the handle of the third paragraph is dragged above the first on desktop
- **THEN** a drop indicator shows during the drag, and the stored paragraphs are in the order 3, 1, 2
- **proof:** e2e

#### Scenario: Block menu moves a block up and down
- **WHEN** the block menu of the second paragraph chooses Move up, then the same block's menu chooses Move down twice
- **THEN** the stored order is 2, 1, 3 after the first step and 1, 3, 2 at the end
- **proof:** e2e

#### Scenario: First and last blocks can't move past the edge
- **WHEN** the block menu opens on the first block and then on the last block
- **THEN** Move up is disabled on the first and Move down on the last
- **proof:** e2e

#### Scenario: Turn a block into another type
- **WHEN** Turn into → Heading 1 is chosen for a paragraph, then Turn into → Quote
- **THEN** the block is a level-1 heading, then a blockquote, with its text unchanged
- **proof:** e2e

#### Scenario: Delete a block from the block menu
- **WHEN** Delete is chosen in the block menu of the second paragraph
- **THEN** the stored content holds paragraphs 1 and 3 only
- **proof:** e2e

#### Scenario: Tapping the handle on phone opens the block menu
- **WHEN** the cursor is in a paragraph on phone and its handle is tapped
- **THEN** the block menu opens with Move up, Move down, Turn into and Delete
- **proof:** e2e

#### Scenario: Moving blocks is a pure document transform
- **WHEN** `moveBlock` moves a top-level node up or down in a three-node document
- **THEN** it returns the swapped document, and `null` at the edges
- **proof:** unit

### Requirement: Extra blocks
The editor SHALL provide Toggle (collapsible title with nested content, open state not saved), Callout (emoji and a panel on the fingerprint's `--surface-sunken`, as in the hi-fi, with text), Quote, Code block with syntax highlighting and a language picker, Table (add and remove rows and columns, header row; every cell has a hairline border and the header row a shaded, semibold cell so cells and columns read apart), Divider and Task list (checkbox toggles persist); nested lists and toggles inside toggles SHALL work, a table on phone SHALL scroll horizontally inside its block, and dragging a toggle SHALL move its content with it.

#### Scenario: Slash menu inserts toggle, callout and table
- **WHEN** Toggle, Callout and Table are chosen from the slash menu in turn
- **THEN** the stored content holds a `details` node, a `callout` node and a `table` with a header row
- **proof:** e2e

#### Scenario: Toggle opens and closes and doesn't save its state
- **WHEN** a toggle with nested text is collapsed, the page reloads, and the toggle is opened
- **THEN** the nested text hides when collapsed, the toggle is closed after the reload regardless, and opening shows the text again
- **proof:** e2e

#### Scenario: Nested lists and toggles inside toggles work
- **WHEN** a bullet list is indented with Tab inside a toggle and a second toggle is inserted inside the first
- **THEN** the stored content holds a nested list and a `details` node inside the first toggle's content
- **proof:** e2e

#### Scenario: Callout shows an emoji and a tinted panel
- **WHEN** a callout is inserted, text typed into it and its emoji changed to 📌
- **THEN** the callout shows 📌 and the text on the `--surface-sunken` panel the hi-fi uses, and the stored node has `emoji: "📌"`
- **proof:** e2e

#### Scenario: Code block highlights syntax and switches language
- **WHEN** `const a = 1` is typed into a code block and its language picker set to TypeScript
- **THEN** the code shows highlighted tokens (`.hljs-keyword` on `const`) and the stored node has `language: "typescript"`
- **proof:** e2e

#### Scenario: Floating editor menus are solid
- **WHEN** the table toolbar, the bubble toolbar and the slash menu are open over text
- **THEN** each has a fully opaque background (the 0.82 glass let the text beside it show through)
- **proof:** e2e

#### Scenario: Native spellcheck and autocorrect stay off where text is typed
- **WHEN** a note opens
- **THEN** the title, the note body and the tag field have `spellcheck` false and `autocorrect="off"`, so no browser squiggle marks German words; the folder rename, link and caption fields carry the same attributes (a real German linter is a separate, later feature)
- **proof:** e2e

#### Scenario: Table adds and removes rows and columns
- **WHEN** in a 3×3 table with a header row "Add row below", "Add column right", "Delete row" and "Delete column" are used in turn
- **THEN** the table is 4×3, 4×4, 3×4 and 3×3 after each step and its first row stays a header row
- **proof:** e2e

#### Scenario: Table cells are told apart by hairlines and a shaded header row
- **WHEN** a 3×3 table with a header row is shown
- **THEN** every header and body cell has a visible border of at most 1 px on all four sides, header cells have a background other than the body cells' and a heavier font weight
- **proof:** e2e

#### Scenario: Wide table scrolls inside its block on phone
- **WHEN** a table with six columns of long text is shown on phone
- **THEN** the table's wrapper scrolls horizontally and the page itself doesn't
- **proof:** e2e

#### Scenario: Task checkbox persists after reload
- **WHEN** a task item's checkbox is ticked and the page reloads after saves settle
- **THEN** the checkbox is still ticked and the stored item has `checked: true`
- **proof:** e2e

#### Scenario: Dragging a toggle moves its content
- **WHEN** a toggle holding two paragraphs is dragged below the last block on desktop
- **THEN** the stored toggle is last and still holds both paragraphs
- **proof:** e2e

### Requirement: Content storage and derived text
Note content SHALL be stored as ProseMirror JSON, and on every save the server SHALL derive the plain text of the body (title and tag names are indexed beside it) for search and the snippet; content with node types an older or newer schema doesn't know SHALL still render as text and still index.

#### Scenario: Note content round-trips as ProseMirror JSON
- **WHEN** a document with a heading, a nested list, a table and a callout is stored with `updateNote` and read with `getNote`
- **THEN** the returned content equals the stored JSON
- **proof:** unit

#### Scenario: Plain text walker extracts block text
- **WHEN** `plainText` runs on a document with a heading, two paragraphs (one with a hard break and marks), a nested list, a table and an image
- **THEN** it returns each block's text on its own line, the hard break as a newline, no marks and nothing for the image
- **proof:** unit

#### Scenario: Unknown nodes still index
- **WHEN** `plainText` runs on a document holding a node type `mysteryBlock` with text children, and on `null`, a string and `{}`
- **THEN** the mystery block's text is included, and the invalid inputs return an empty string
- **proof:** unit

#### Scenario: Unknown blocks render as text
- **WHEN** a note whose stored content holds a `mysteryBlock` with the text "Altes Format" opens
- **THEN** the editor shows "Altes Format" as a paragraph and no page error occurs
- **proof:** e2e

### Requirement: Editor on real devices
Drag, the bubble toolbar and the slash menu SHALL work on Rue's real phone (iOS Safari or Android Chrome) and desktop: block menu reordering on phone, bubble toolbar not covering the native selection menu, slash menu above the soft keyboard.

#### Scenario: Editor menus work on real phones
- **WHEN** Rue selects text, opens the slash menu near the bottom of a note and reorders a block with the block menu on her phone, and drags a block on her desktop
- **THEN** the toolbar sits below the selection without covering the native menu, the slash menu stays above the keyboard, the block moves on both
- **proof:** manual (real hardware: Playwright only emulates phones — no soft keyboard, no native selection menu)

### Requirement: Editor on the fingerprint
The editor SHALL keep every block, mark, menu and shortcut it has today and SHALL get the fingerprint look on all its surfaces (slash menu, bubble toolbar, drag handle, block menu, table actions, code language, callout emoji, image caption, file card, link preview, toggle, task), keeping the menus' entry points and prop APIs. Touch rules SHALL hold: the slash menu stays above the soft keyboard, the bubble toolbar never covers the native selection menu, and the drag handle targets the cursor's block without a drag. Wide tables SHALL scroll inside their block, long unbroken words SHALL wrap, very long notes SHALL stay usable, unknown blocks SHALL render as paragraphs, and text colours SHALL keep their stored names (`data-color`). A level-3 heading in the body SHALL read as the hi-fi's ruled overline (small tracked uppercase UI type with a rule at its start), not a third display size (source: Rue, gate 7, signed hi-fi).

#### Scenario: Editor surfaces keep every action after the restyle
- **WHEN** the existing editor suite runs against the restyled editor
- **THEN** every block, mark, menu action and shortcut still works on phone and desktop
- **proof:** e2e ("Scenario: Slash menu lists every block type", "Scenario: Bubble toolbar applies marks", "Scenario: Block menu moves a block up and down", "Scenario: Table adds and removes rows and columns", "Scenario: Code block highlights syntax and switches language", "Scenario: Callout shows an emoji and a tinted panel", "Scenario: Toggle opens and closes and doesn't save its state", "Scenario: Task checkbox persists after reload")

#### Scenario: A level-3 heading reads as a ruled overline
- **WHEN** a note with a level-3 heading opens at 375 and 1280 px
- **THEN** the heading is set in the UI face, small, tracked and uppercase with a rule at its start, as in the signed hi-fi's note
- **proof:** manual (visual, gate 7)

#### Scenario: Handle on touch targets the cursor's block
- **WHEN** on the phone the caret is placed in the third paragraph and the handle is tapped
- **THEN** the block menu opens for the third paragraph without any drag
- **proof:** e2e

#### Scenario: Slash menu stays above the keyboard in the emulated viewport
- **WHEN** the slash menu opens at the bottom of a long note on the phone with the visual viewport shrunk as by a keyboard
- **THEN** the whole menu lies inside the visual viewport
- **proof:** e2e ("Scenario: Slash menu stays within the visible viewport on phone")

#### Scenario: Wide tables scroll inside their block
- **WHEN** a table with eight wide columns is shown at 375 px
- **THEN** the table scrolls inside its block and the page does not scroll horizontally
- **proof:** e2e ("Scenario: Wide table scrolls inside its block on phone")

#### Scenario: Long unbroken words wrap
- **WHEN** a paragraph holds an unbroken 300-character word and a long URL at 320 px
- **THEN** both wrap inside the editor card and the page does not scroll horizontally
- **proof:** e2e

#### Scenario: Very long note stays usable
- **WHEN** a note with 600 blocks opens and text is typed at its end
- **THEN** every block renders, the typed text is saved, and the save status reaches "Saved"
- **proof:** e2e

#### Scenario: Text colours keep their stored names
- **WHEN** text coloured "sea" is saved and the note is reloaded
- **THEN** the stored mark is still named "sea", the rendered span carries `data-color="sea"` and its colour is the fingerprint's `--text-sea`
- **proof:** e2e

#### Scenario: Phone menus stay clear of the keyboard and the selection menu
- **WHEN** Rue uses the slash menu, the bubble toolbar and the handle on her phone
- **THEN** the slash menu stays above the soft keyboard and the bubble toolbar never covers the native selection menu
- **proof:** manual (real hardware: Playwright has no soft keyboard or native selection menu)

