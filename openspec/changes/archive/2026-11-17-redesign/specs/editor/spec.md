## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Extra blocks
The editor SHALL provide Toggle (collapsible title with nested content, open state not saved), Callout (emoji and a panel on the fingerprint's `--surface-sunken`, as in the hi-fi, with text), Quote, Code block with syntax highlighting and a language picker, Table (add and remove rows and columns, header row), Divider and Task list (checkbox toggles persist); nested lists and toggles inside toggles SHALL work, a table on phone SHALL scroll horizontally inside its block, and dragging a toggle SHALL move its content with it.

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

#### Scenario: Table adds and removes rows and columns
- **WHEN** in a 3×3 table with a header row "Add row below", "Add column right", "Delete row" and "Delete column" are used in turn
- **THEN** the table is 4×3, 4×4, 3×4 and 3×3 after each step and its first row stays a header row
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
