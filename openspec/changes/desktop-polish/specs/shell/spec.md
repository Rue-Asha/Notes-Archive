## MODIFIED Requirements

### Requirement: Wide layouts
At 1100 px and wider the note column SHALL widen to 1.5 × `--measure` (102ch) plus the card's padding (32 px a side), fill the frame's content column at 1280 px, grow toward that cap when the sidebar is folded, and stay centred in the content area; below 1100 px it stays at `--measure` plus padding.

#### Scenario: Note column is capped and centred on wide screens
- **WHEN** a note opens at 1600×900, the sidebar is folded and unfolded
- **THEN** the column fills the content area, never exceeds the cap, is wider than 1.25 × `--measure` plus padding while folded, and stays centred
- **proof:** e2e

### Requirement: Tree expansion and keyboard
The tree header SHALL hold one button, "Expand all folders" / "Collapse all folders", that opens or closes every folder of the shown level through the chevrons' open state; it is absent when no folder has content.

#### Scenario: One control expands and collapses every folder of the tree
- **WHEN** it is activated from the keyboard and again by click
- **THEN** every folder opens and closes, the button keeps the focus, and the arrow keys still walk the tree
- **proof:** e2e
