# motion Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Card to note morph
Opening a note from a note card SHALL morph the card into the note page header with a View Transition, and going back SHALL reverse it; under reduced motion there SHALL be no morph.

#### Scenario: Note card morphs into the note page
- **WHEN** a note card on a folder page is clicked
- **THEN** `document.startViewTransition` is called and, during the transition, the old card and the new note header both carry `view-transition-name: note-<id>`
- **proof:** e2e

#### Scenario: Back from a note reverses the morph
- **WHEN** the browser goes back from that note to the folder page
- **THEN** a view transition runs with the note header and the card named `note-<id>`
- **proof:** e2e

#### Scenario: Reduced motion skips the morph
- **WHEN** reduced motion is preferred and a note card is clicked
- **THEN** no element carries a `note-<id>` view-transition name and the note opens
- **proof:** e2e

### Requirement: Page transitions
Navigations that don't morph SHALL fade and slide through a View Transition; reduced motion SHALL shorten them to a fade of at most 120 ms; a browser without View Transitions SHALL navigate plainly.

#### Scenario: Other navigations fade
- **WHEN** Home → a tag page is navigated through the sidebar
- **THEN** `document.startViewTransition` is called and no `note-<id>` name is set
- **proof:** e2e

#### Scenario: Reduced motion uses a short fade
- **WHEN** reduced motion is preferred and Home → a tag page is navigated
- **THEN** the root transition's animations last at most 120 ms and move nothing (opacity only)
- **proof:** e2e

#### Scenario: Browser without View Transitions navigates plainly
- **WHEN** `document.startViewTransition` is removed before navigating
- **THEN** the navigation completes with the new URL and content and no page error
- **proof:** e2e

### Requirement: Lists stagger in
Card lists SHALL fade and rise in with a short stagger per card (capped), and under reduced motion SHALL appear at once.

#### Scenario: Cards stagger in
- **WHEN** a folder page with six notes opens
- **THEN** every card ends with `data-revealed`, and the first card's stagger delay is smaller than the sixth card's
- **proof:** e2e

#### Scenario: Reduced motion shows lists at once
- **WHEN** reduced motion is preferred and the same page opens
- **THEN** every card is fully opaque with `data-revealed` on first paint and has no stagger delay
- **proof:** e2e

### Requirement: Glass hover glow
Glass cards SHALL show a soft glow when hovered with a fine pointer, animating opacity only.

#### Scenario: Glass cards glow on hover
- **WHEN** a note card is hovered on desktop
- **THEN** its glow layer's opacity rises above 0 while hovered and returns to 0 after the pointer leaves
- **proof:** e2e

### Requirement: Quiet editor
While typing in the editor nothing SHALL animate except menus opening (slash menu, bubble toolbar, block menu).

#### Scenario: Typing in the editor runs no animations
- **WHEN** a sentence is typed into a note body
- **THEN** `document.getAnimations()` holds no animation whose target is inside the editor or the note page
- **proof:** e2e

#### Scenario: Editor menus open with a short animation
- **WHEN** the slash menu opens with motion allowed
- **THEN** the menu has a running opacity/transform animation of at most 160 ms, and under reduced motion it has none
- **proof:** e2e

### Requirement: Motion on real devices
The motion set SHALL feel smooth and calm on Rue's phone and desktop.

#### Scenario: Motion feels smooth on real devices
- **WHEN** Rue navigates Home → folder → note and back, opens the palette and menus on her phone and desktop
- **THEN** the morph, fades, staggers and glows look smooth and nothing animates while she types
- **proof:** manual (visual judgement on real hardware at Gate 2)

