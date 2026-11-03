## ADDED Requirements

### Requirement: Light warm tokens
All colours, radii, blur, shadows, spacing, type sizes, durations and easings SHALL be CSS custom properties in `src/lib/styles/tokens.css`, mirrored for tests in `tokens.ts`, describing one light, warm world: a greige stone ground with peach light, dark ink, one earthy accent (bronze, moss or slate), a danger set and a text-colour palette.
The text-colour palette is `stone`, `clay`, `ochre`, `moss`, `sea`, `plum` (`--text-<name>`); the danger set is `--danger`, `--danger-soft`, `--on-danger`; syntax tokens are `--syntax-comment`, `--syntax-keyword`, `--syntax-string`, `--syntax-number`, `--syntax-title`, `--syntax-attr`. There is no dark scheme.

#### Scenario: Token set is complete
- **WHEN** `tokens.ts` is read
- **THEN** it defines ground, surface, line, ink, ink-2, the danger set, all six text colours, the syntax tokens, radii, spacing, type, duration and easing tokens, and every accent candidate defines `accent`, `accent-ink`, `accent-soft` and `accent-wash`
- **proof:** unit

#### Scenario: Text contrast meets AA
- **WHEN** every text/background pair the components use (ink and ink-2 on ground and surface, accent text, the six text colours and the danger text on ground, on-danger on danger) is checked with every accent candidate
- **THEN** body-text pairs reach at least 4.5:1 and display text at least 3:1
- **proof:** unit

### Requirement: Look switches
The look SHALL be selected by three attributes on `<html>` — `data-accent` (bronze | moss | slate), `data-glass` (soft | clear | frosted) and `data-card` (glass | paper | outline) — each choosing a token block, with `LOOK` in `src/lib/styles/look.ts` holding the app-wide choice, so changing the look is a change to that object only.
After the checkpoint `LOOK` is accent `bronze`, glass `clear`, card `glass`.

#### Scenario: Switching the look is a data change
- **WHEN** a mockup page is opened with `?accent=slate&glass=frosted&card=paper`
- **THEN** `<html>` carries those three attributes and the computed `--accent`, `--glass-filter` and the note card's background equal the values `tokens.ts` lists for slate, frosted and paper
- **proof:** e2e

#### Scenario: The app uses the picked look
- **WHEN** any app page is opened
- **THEN** `<html>` carries `data-accent="bronze"`, `data-glass="clear"` and `data-card="glass"`
- **proof:** e2e

### Requirement: Frosted glass material
Navigation, panels, menus and glass cards SHALL use the shared `.glass` material — a neutral white translucent fill with a top sheen, `backdrop-filter` blur and a thin light rim from the glass tokens — and browsers without `backdrop-filter` SHALL get a solid `--glass-fallback` surface with the same text contrast.

#### Scenario: Glass falls back to a solid surface
- **WHEN** `global.css` is read
- **THEN** an `@supports not (backdrop-filter: blur(1px))` block gives `.glass` the `--glass-fallback` background and no transparency
- **proof:** unit

#### Scenario: Text on glass meets AA
- **WHEN** ink and ink-2 on every glass strength's fill are composited over a pure white, a pure black, the ground and the darkest atmosphere stop (`--ground-deep`), and over the fallback surface
- **THEN** each reaches at least 4.5:1
- **proof:** unit

### Requirement: Fonts
The app SHALL use Newsreader (variable opsz, normal and italic) for display text and Figtree for UI and note text, self-hosted as woff2 in `static/fonts/` with their OFL licence texts, declared with `@font-face` in `global.css`, preloaded in `app.html`, and SHALL load no resource from another origin.

#### Scenario: Display and text fonts load from the app
- **WHEN** a page loads and `document.fonts.load` is called for both families
- **THEN** both resolve with faces whose source is `/fonts/…` on the app's origin, `body` computes to Figtree and the OFL files for both families exist in `static/fonts/`
- **proof:** e2e

#### Scenario: Pages load no external resources
- **WHEN** every mockup page is opened
- **THEN** no request leaves the app's origin
- **proof:** e2e

### Requirement: Shared components and type
The design system SHALL provide small tracked uppercase eyebrows, a dark call-to-action pill ending in a round arrow button, a two-line display headline style with one accent word, and radius, spacing, type and motion tokens used by every component.

#### Scenario: Call to action is a dark pill with a round arrow
- **WHEN** the components mockup shows the CTA button
- **THEN** its background is the ink token, its radius is the pill token, and it ends in a circular element holding an arrow icon
- **proof:** e2e

#### Scenario: Eyebrow is small tracked uppercase
- **WHEN** the components mockup shows an eyebrow
- **THEN** its computed `text-transform` is uppercase, its font size is at most 12 px and its letter-spacing at least 0.15em
- **proof:** e2e

### Requirement: Style guards
Components and styles SHALL use colour tokens only and SHALL animate nothing but `transform` and `opacity`, enforced by unit tests over `src/**/*.svelte` and `src/**/*.css` outside `tokens.css`.

#### Scenario: Components use no raw colours
- **WHEN** the guard test scans every `.svelte` and `.css` file except `tokens.css`
- **THEN** it finds no hex, `rgb(`, `hsl(` or named colour literal
- **proof:** unit

#### Scenario: Only transform and opacity animate
- **WHEN** the guard test scans transitions, keyframes and Svelte transition functions
- **THEN** none animates a property other than `transform` and `opacity`, none uses `transition: all`, and none uses `clip-path`
- **proof:** unit

### Requirement: Mockup photos
The repo SHALL keep CC0 or public-domain folder-cover photos (architecture, interiors, landscapes, warm stone) in `fixtures/mockups/`, each listed in `fixtures/mockups/CREDITS.txt` as `file | source URL | author: … | licence: …`; a needed photo that couldn't be found SHALL be generated by `scripts/synthetic-photo.mjs` and credited as generated.
The photos are used only by `/__mockups/*` and e2e fixtures and never ship in the build or the tarball.

#### Scenario: Every mockup photo is credited
- **WHEN** the image files in `fixtures/mockups/` are compared with `CREDITS.txt`
- **THEN** there are at least 6 images, each has a line with a source URL or `generated`, an author and a licence matching `CC0`, `Public Domain` or `generated (scripts/synthetic-photo.mjs)`, and every credited file exists
- **proof:** unit

#### Scenario: Missing photo is generated
- **WHEN** `node scripts/synthetic-photo.mjs <name> <width> <height>` runs
- **THEN** it writes `fixtures/mockups/<name>.jpg` with exactly that size and sharp reads it as JPEG
- **proof:** unit

#### Scenario: Mockup photos stay out of the product
- **WHEN** `static/` and `build/client` are listed after `npm run build`
- **THEN** neither contains a `.jpg`, `.jpeg`, `.png`, `.webp` or `.avif` file other than icons under 10 KB, and the tarball holds no `fixtures/`
- **proof:** unit

### Requirement: Mockup pages
Env-gated pages under `/__mockups` SHALL render Home, a folder page, a note in the editor, the search palette and the phone drawer with static data and the mockup photos, plus a components page, each switchable with `?accent=&glass=&card=`, and SHALL answer 404 without `NOTES_ARCHIVE_TEST=1`.

#### Scenario: Mockup routes are hidden without the test flag
- **WHEN** a `/__mockups` page is requested on a server without the test flag
- **THEN** it answers 404
- **proof:** unit

#### Scenario: Mockups render the five screens
- **WHEN** `/__mockups/home`, `/folder`, `/note`, `/search` and `/drawer` are opened
- **THEN** each renders its screen's landmark (Home headline, folder cover header, note title and every block type, palette with results, open drawer with the tree) with the mockup photos loaded
- **proof:** e2e

#### Scenario: Mockup screenshots are produced for both viewports
- **WHEN** `npm run shots:mockups` runs
- **THEN** it writes `test-results/shots/mockups/<project>-<screen>.png` for every screen at phone and desktop after fonts and animations settle
- **proof:** e2e

### Requirement: Mockup checkpoint
The build SHALL pause after the mockups until Rue approves them; her picks (accent, glass strength, card style) SHALL be recorded in design.md → Look pick and in every requirement that names them before any screen unit starts.

#### Scenario: Rue approves the mockups
- **WHEN** the mockup unit reports its screenshots
- **THEN** Rue approves the look or asks for a revision, and on approval names accent, glass strength and card style
- **proof:** manual (taste decision; only Rue can give it)

#### Scenario: Built screens match the approved mockups
- **WHEN** Home, a folder page, a note, the palette and the phone drawer are compared with the approved mockups on phone and desktop
- **THEN** layout, type, glass, accent and card style match
- **proof:** manual (visual judgement at Gate 2)
