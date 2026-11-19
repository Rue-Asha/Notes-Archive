## MODIFIED Requirements

### Requirement: Extra blocks
Tables SHALL show a hairline border on every cell and a shaded, semibold header row. The table toolbar, the bubble toolbar and the slash menu SHALL have an opaque background. Native spellcheck and autocorrect SHALL be off in the title, body, tag, rename, link and caption fields.

#### Scenario: Table cells are told apart by hairlines and a shaded header row
- **WHEN** a 3×3 table with a header row is shown
- **THEN** every cell has a border of at most 1 px on all sides and header cells differ in background and weight
- **proof:** e2e

#### Scenario: Native spellcheck and autocorrect stay off where text is typed
- **WHEN** a note opens
- **THEN** title, body and tag field have `spellcheck` false and `autocorrect="off"`
- **proof:** e2e

#### Scenario: Floating editor menus are solid
- **WHEN** the table toolbar, the bubble toolbar and the slash menu are open over text
- **THEN** each has a fully opaque background
- **proof:** e2e
