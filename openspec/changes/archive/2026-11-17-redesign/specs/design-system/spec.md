## ADDED Requirements

### Requirement: Vendored fingerprint
The app SHALL consume Design-System fingerprint 2.0.0 only through `Design-System/scripts/sync.sh <app-path>`: the runtime files in `src/lib/styles/fingerprint/`, `DESIGN.md`, `DESIGN.json` and `DESIGN-reference.md` at the repo root, the guard scripts and `banned.md` in `scripts/fingerprint/`, the fonts in `static/fonts/fingerprint/`, and `fingerprint.lock` with the version and file hashes. Vendored files SHALL NOT be edited here; fingerprint changes go to Design-System `requests.md`. `proof` SHALL run `check-slop` and `check-drift` before its other steps. Every app page SHALL render with `<html lang="en" data-accent="slate">` and SHALL load no resource from another origin.
`check-slop` SHALL run directly, with no baseline: the baseline filter that tolerated the violations recorded at sync time was removed with the old styles in 21.3, so its scenario is gone too.

#### Scenario: Proof runs the fingerprint guards
- **WHEN** the `proof` script in `package.json` is read
- **THEN** it runs `check-slop` and `node scripts/fingerprint/check-drift.mjs` before `npm run check`, and `fingerprint.lock` names version 2.0.0
- **proof:** unit

#### Scenario: Vendored files match the lock
- **WHEN** `proof` runs on a tree where every vendored file is unchanged
- **THEN** `check-drift` reports that every file matches lock v2.0.0, and a changed vendored file makes it fail naming that file
- **proof:** unit (`scripts/proof-guards.test.ts` runs `check-drift` on the tree and on a copy with one changed file; `proof` also runs it as its second step)

#### Scenario: App renders with the slate accent
- **WHEN** any app page opens
- **THEN** `<html>` carries `lang="en"` and `data-accent="slate"`, and the computed `--accent` equals the fingerprint's slate value
- **proof:** e2e

#### Scenario: Fingerprint fonts load from the app
- **WHEN** an app page loads and `document.fonts.load` is called for the fingerprint's display and text families
- **THEN** both resolve with faces served from `/fonts/fingerprint/` on the app's origin, and `body` computes to the fingerprint text family
- **proof:** e2e

#### Scenario: App pages load nothing from other origins
- **WHEN** Home, `/folders`, a folder page, a note, `/search`, a tag page and every `/__mockups/redesign/*` page are opened
- **THEN** no request leaves the app's origin
- **proof:** e2e

### Requirement: App icon
The app SHALL serve the Notes Archive icon from the fingerprint's icon family: a master `icons/Notes-Archive/icon.svg` designed at gate 5 in Design-System (glyph from the app's main jobs, slate field) and rendered by `build-icons.mjs`, vendored by `sync.sh` into `static/` (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`), with the link tags, a `theme-color` meta tag and `static/manifest.webmanifest` in place.

#### Scenario: Icon files are served
- **WHEN** the built app is asked for each icon file and `manifest.webmanifest`
- **THEN** every request answers 200 with an image or manifest content type
- **proof:** e2e

#### Scenario: Manifest references existing icons
- **WHEN** `manifest.webmanifest` is fetched and parsed
- **THEN** it has `name`, `short_name`, `theme_color` and `background_color`, lists a 192 px, a 512 px and a maskable 512 px icon, and each listed file answers 200
- **proof:** e2e

#### Scenario: Head carries the icon links
- **WHEN** any app page's `<head>` is read
- **THEN** it links `/favicon.svg`, `/favicon.ico` (32x32), `/apple-touch-icon.png` and `/manifest.webmanifest` and has a `theme-color` meta tag
- **proof:** e2e

#### Scenario: Icon belongs to the family and reads as Notes Archive
- **WHEN** the icon sheet of all apps is shown at 16, 32, 180 and 512 px
- **THEN** Notes Archive's icon reads as part of the family and can be told apart at 16 px
- **proof:** manual (visual judgement: fresh-context review and Rue's gate-5 sign-off)

#### Scenario: Home-screen shortcut shows the icon
- **WHEN** Rue adds the app to her phone's home screen
- **THEN** the shortcut shows the Notes Archive icon, not a blank or screenshot tile
- **proof:** manual (real hardware: Playwright has no home screen)

### Requirement: Redesign mockups
The gate-4 wireframes and gate-5 hi-fi mockups SHALL live under `/__mockups/redesign/*`, answer 404 without `NOTES_ARCHIVE_TEST=1`, load the vendored fingerprint and none of the old global styles, and render from static fixtures that include a worst-case set (selected with `?data=worst`) and mocked pin order and tree sort. Wireframes SHALL be greyscale (fingerprint type scale and spacing, neutral roles only, no accent, imagery, shadows or decoration). Hi-fi mockups SHALL render every state the contract lists with English copy. No hi-fi work starts before gate 4 is signed off, and no build unit starts before gate 5 is signed off.

#### Scenario: Redesign mockups are hidden without the test flag
- **WHEN** a `/__mockups/redesign/*` page is requested on a server without the test flag
- **THEN** it answers 404
- **proof:** unit

#### Scenario: Every mockup screen is shot at three widths
- **WHEN** the redesign screenshot test runs
- **THEN** it writes `test-results/shots/redesign/<screen>-<width>-<data>.png` for every page under `/__mockups/redesign/` at 375, 768 and 1280 px, with normal and worst-case data, after fonts settle
- **proof:** e2e

#### Scenario: Worst-case data switches the fixtures
- **WHEN** a redesign mockup is opened with `?data=worst`
- **THEN** it renders the worst-case set (200-character titles, folders 12 levels deep, long unbroken names, 40 tags, empty states, "1 note" singulars) and no page scrolls horizontally at 375 px
- **proof:** e2e

#### Scenario: Wireframes carry no colour
- **WHEN** Rue reviews the wireframe screenshots
- **THEN** every screen's primary action and main content can be identified without colour, and Rue signs off gate 4
- **proof:** manual (visual judgement; only Rue can sign off gate 4)

#### Scenario: Hi-fi mockups render every contract state
- **WHEN** the hi-fi screenshots, the master icon and the fresh-context review are presented
- **THEN** every state the contract lists is rendered, the reviewer's findings are fixed or accepted with a reason, and Rue signs off gate 5
- **proof:** manual (visual judgement; fresh-context review and Rue's sign-off)

#### Scenario: Built screens match the signed-off hi-fi
- **WHEN** the built screens are compared with the gate-5 mockups at 375, 768 and 1280 px
- **THEN** layout, type, accent and component treatment match
- **proof:** manual (visual judgement at gate 7)

### Requirement: Old styling removed
When the build is complete the app SHALL contain no old styling: `src/lib/styles/tokens.css`, `tokens.ts`, `global.css`, `look.ts`, their guard tests (`tokens.test.ts`, `guard.test.ts`, `global.test.ts`), the `%look%` placeholder, the old `/__mockups` routes (`home`, `folder`, `note`, `search`, `drawer`, `components`, `primitives`) and `src/lib/mockups/*` SHALL be gone, and `proof` SHALL run `check-slop` without a baseline.

#### Scenario: Old style files are gone
- **WHEN** the repo is listed after the cleanup
- **THEN** none of the old style files, guard tests, old mockup routes or `src/lib/mockups/*` exist and no source file imports them
- **proof:** unit

#### Scenario: Proof runs check-slop without a baseline
- **WHEN** `package.json` is read after the cleanup
- **THEN** `proof` starts with `node scripts/fingerprint/check-slop.mjs && node scripts/fingerprint/check-drift.mjs`, and no baseline filter or baseline file exists
- **proof:** unit

### Requirement: Accessibility floor
Every screen SHALL meet WCAG 2.2 AA, including target size of at least 24 by 24 CSS px and a visible focus indicator that is not obscured, SHALL respect `prefers-reduced-motion`, and SHALL not scroll horizontally at any width from 320 to 1920 px.

#### Scenario: No horizontal page scroll from 320 to 1920
- **WHEN** Home, `/folders`, a deep folder page, a long note, `/search` with results and a tag page open with worst-case data at 320, 375, 768, 1280 and 1920 px
- **THEN** no page is wider than its viewport
- **proof:** e2e

#### Scenario: Targets are at least 24 px
- **WHEN** every visible interactive element on those pages is measured on phone and desktop
- **THEN** each is at least 24 by 24 CSS px or has the spacing exception
- **proof:** e2e

#### Scenario: Focus is visible and not obscured
- **WHEN** the keyboard tabs through each of those pages
- **THEN** every focused element shows a focus indicator and is not covered by the phone bar, the sidebar or a sticky header
- **proof:** e2e

#### Scenario: Reduced motion removes movement
- **WHEN** the browser reports `prefers-reduced-motion: reduce` and the user navigates, opens menus and reorders pinned notes
- **THEN** nothing moves by transform; changes are instant or opacity-only
- **proof:** e2e

#### Scenario: WCAG 2.2 AA review passes
- **WHEN** the built screens are reviewed against WCAG 2.2 AA at gate 7
- **THEN** no AA failure remains open
- **proof:** manual (expert review; contrast in context, semantics and reading order need judgement)

### Requirement: Chrome cursor
Text that cannot be edited — headings, kickers, ledes, counts, card snippets and meta, tree rows, menu items, buttons, chips, toasts and the save status — SHALL show the default cursor (or its control's pointer inside a link or button), never the text cursor. Only inputs, textareas, the note title and the note body SHALL show the text cursor; atoms inside the body that cannot be edited (a task's checkbox, the callout emoji, the divider) SHALL show the default cursor. No element outside the note title and body SHALL be `contenteditable`. Chrome is not text to copy (source: Rue, gate 7, point 1): a double-click or a press-and-drag on anything outside the fields, the note title and the note body — controls, screen headings, kickers, ledes, section heads, counts, card snippets and meta, the sidebar (tree, tags, path), and a dialog's title and message — SHALL not start a text selection; only inputs, textareas, the note title and the note body stay selectable.

#### Scenario: Chrome text shows the default cursor
- **WHEN** Home, a folder page and a note open on desktop with seeded notes, folders and tags
- **THEN** a kicker, the page heading, a section heading, a count, a note card's snippet and meta, a tree folder row, a tag row, a property label and the save status have computed cursor `default` or `pointer`, never `text` or `auto`; a menu item in the open note menu has `pointer`
- **proof:** e2e

#### Scenario: Fields and the editor keep the text cursor
- **WHEN** the same note is open
- **THEN** the title field, the tag input and the note body have computed cursor `text`, a task's checkbox in the body does not, and the only `contenteditable="true"` element on the page is the note body
- **proof:** e2e

#### Scenario: Chrome text does not start a selection
- **WHEN** the same pages are open and the delete dialog is shown
- **THEN** buttons, tree items, menu items, the page heading, kicker, lede, section headings, card snippets, sidebar rows and the dialog's title and message have computed `user-select: none`; a double-click on the page heading, the kicker, the lede, a section heading, a count, the sidebar's "Tags" heading or the dialog title, and a drag from the main column across the sidebar, leave the selection empty; a double-click in the title field and in the note body still selects a word
- **proof:** e2e

### Requirement: English copy
All interface copy SHALL be English. The strings in the contract copy list SHALL stay unless the contract is updated in this change, and every new string (sort labels, the 409 toast, path and back labels) SHALL be added to the contract copy list and to `COPY` in `src/lib/copy.ts`.

#### Scenario: Contract strings stay
- **WHEN** the contract copy list is compared with `COPY`
- **THEN** every English target the list marks as asserted exists in `COPY` unchanged, or the list was updated in this change
- **proof:** unit

#### Scenario: New strings are in the contract
- **WHEN** `COPY` is read after the build
- **THEN** the four sort labels, "Pinned order changed elsewhere — reloaded" and the path and back labels exist there and in the contract copy list
- **proof:** unit

## REMOVED Requirements

### Requirement: Light warm tokens
**Reason**: Replaced by the vendored fingerprint tokens (S23); `tokens.css` and `tokens.ts` are deleted (S25).
**Migration**: Use the fingerprint roles from `src/lib/styles/fingerprint/tokens.css`; the text colours keep their names (`--text-stone` … `--text-plum`) there.

### Requirement: Look switches
**Reason**: The fingerprint has one look per app, chosen by `data-accent`; `look.ts` and the `%look%` placeholder go away (S25).
**Migration**: `<html lang="en" data-accent="slate">` in `src/app.html`.

### Requirement: Frosted glass material
**Reason**: Glass, its fallback and its contrast are defined by the fingerprint (`base.css`, `layout.css`) and checked in Design-System.
**Migration**: Use the fingerprint's glass classes and roles; `check-slop` enforces token-only styling.

### Requirement: Fonts
**Reason**: The fingerprint vendors its own self-hosted fonts.
**Migration**: "Vendored fingerprint" → Scenario: Fingerprint fonts load from the app and Scenario: App pages load nothing from other origins.

### Requirement: Shared components and type
**Reason**: Components come from the fingerprint's `layout.css` and copied-in primitives.
**Migration**: `sync.sh <app-path> --primitive <name>`; the app owns the copy.

### Requirement: Style guards
**Reason**: `check-slop` in `proof` replaces the local guard tests.
**Migration**: "Vendored fingerprint" and "Old styling removed".

### Requirement: Mockup pages
**Reason**: The old look-switching mockups are removed (S25).
**Migration**: "Redesign mockups" under `/__mockups/redesign/*`.

### Requirement: Mockup checkpoint
**Reason**: Replaced by the pipeline's gate 4 and gate 5 sign-offs.
**Migration**: "Redesign mockups" → Scenario: Wireframes carry no colour and Scenario: Hi-fi mockups render every contract state.
