# Look research — revision 1

Scope: only the look layer (tokens, global/prose CSS, atom and mockup styling). Structure, screens, markup and photo
placement stay as reviewed. Inputs: the five images in `/home/Rue/Pictures/UI-inspo/`, the mockup shots in
`test-results/shots/mockups/`, `src/lib/styles/*`, `src/lib/ui/*`, `src/lib/mockups/*`, and 11 Mobbin searches.

## (a) The five images as one recipe

1. **Architect** (Mr L Production): greige photo frame (~`#BDB6AC`) around a big glass sheet. Inside, a peach-to-stone sky (`#F3E3D3` → `#D9D2C8`). Light high-contrast serif display (~80 px at 1440, weight ~300, tracking ≈ −0.02em) with one word in bronze (`#8A5A3C`). Geometric sans UI at 13–14 px/500. Tracked eyebrow ("ARCHITECTURE — INTERIORS — LANDSCAPES", ~10 px, 0.3em, `#5C5650`). White glass cards (fill ~65–75 %, heavy blur, 1 px white rim, long soft shadow, radius ~32), one **smoked dark glass** card (`rgb(40 36 32 / .8)`) as the counterweight, a charcoal CTA pill (`#2B2926`) with a white arrow circle, a vertical-rule tag list.
2. **Joseph UGC**: a mid-grey glass slab (`#9A9A9A` at ~70 %) over black, with a strong blur showing a 3D object through it. Bright 1 px rim (~40 % white). Heavy uppercase grotesk display with round bullets, outlined pills, thin black rules. Glass as material, monochrome.
3. **Mindframe**: cool-neutral light ground (`#EEEEEE` / panel `#FAFAFA`), black ink, no accent. Mixed headline: *italic serif* plus plain grotesk ("*Create* your space *with US*"). Photo cards (radius ~24) with white text and tiny white chip tags, 1 px ink-outlined pills, "01/20" counters.
4. **Travel**: same template as the architect site. Sunset photo (gold `#F6D9B0`, sea `#5E8FA8`) behind a whiter glass, a serif display with a bronze word (`#7A4E2A`), a slate-navy CTA (`#1F2A33`), a glass search bar split by hairlines, a dark photo tile with a play circle.
5. **NOAL drink bar**: a bento over a blurred car photo. Tiles in deep moss (`#3F5B3C`) and tomato (`#C8362E`), cream type (`#EFE6DA`). Date tile: big "12", small stacked "Sep / 2024", outlined arrow circle, list with 1 px light rules and right-aligned values. A smoked dark bar (`rgb(30 30 28 / .8)`).

**Shared recipe:**
- An atmosphere with real tonal range (photo, or light sky into stone) behind everything.
- Panels are *neutral white* glass (fill 60–80 %, blur 24–40 px), with a bright 1 px rim, a top sheen and wide, faint shadows.
- Radii are large (28–36), with smaller radii nested inside.
- One near-black ink carries the CTAs (a pill with a white arrow circle), plus one smoked-dark tile as the counterweight.
- Type: a light display serif (or an italic-serif mix) for headlines, a calm geometric sans at 500 for the UI, and tiny uppercase eyebrows tracked ~0.28em with em-dash separators.
- Neutrals are low-saturation greige and stone, not sand or cream.
- The accent is one earthy colour (bronze, moss, tomato) used for a word, a tile or a dot. It is never used to fill the UI chrome.

## (b) Gap analysis: current mockups vs the recipe

| Area | Current (tokens / shots) | Inspo | Fix direction |
|---|---|---|---|
| Ground | Flat sand `#EEE8DF` plus three `accent-wash` (terracotta 18 %) blobs: reads as a muddy pink-beige, no light source | Light sky into stone, real value range, a warm light top-left | Greige base with a sun-lit peach top, a cool stone haze and a taupe floor (recipe in c1) |
| Glass | `rgb(255 253 249 / .74)` over a flat ground gives `#FAF8F5`: **cream panels** with no visible blur. The rim (white on cream) is invisible | White glass whose tint shifts across the backdrop; the rim and sheen define the edge | Neutral white fills, a sheen gradient, an outer hairline, longer shadows. The atmosphere gives the blur something to work on |
| Display type | Bricolage Grotesque 500, −0.045em, chunky and quirky ("startup") | Light display serif, a lighter accent word (italic or bronze) | Serif display ~360–400, −0.02em; accent word in italic + accent |
| Accent | Terracotta `#A4502F` as a **solid date tile**, the loudest block on Home; pink `accent-soft` on the tree's active rows and in search highlights | Accent on one word or one tile; chrome stays neutral; the counterweight tile is smoked dark glass | Bronze/moss/slate; the date tile becomes smoked glass (or accent fill if Rue prefers); active rows become a lifted white pill |
| Sidebar / tree | Cream glass, salmon active rows (`accent-wash` / `accent-soft`) | White glass; active = white lifted pill or ink pill | `--row-active` / `--row-hover` tokens |
| Cards | Glass card on flat sand looks the same as the paper card | Glass card visibly lighter than the backdrop, rim plus sheen | Sheen layer, rim, card radius 28 |
| Folder photo labels | Glass label over the photo with `saturate(1.5)`: greenish, murky (Houses tile) | Clear glass or white text on a photo; colour kept natural | saturate ≤ 1.3, whiter fill |
| Palette | Page heavily blurred and paled; palette cream | Slight warm dim behind it; white glass on top | `--veil` scrim (dim + 6 px blur) |
| Eyebrows | 11 px/600, 0.2em, fine but heavy | ~10–11 px/500, 0.28–0.3em, softer ink | Weight 500, tracking 0.28em |
| Radii / shadows | 24/32 radius, short shadows (`-18px 32px`) | 28–36 radius, long faint shadows | Scales in c7/c8 |
| Phone bar | Glass bar, accent-coloured active label | TIDE-style lighter pill marks the active tab | Active tab gets the `--row-active` pill and ink text |

## (c) The new look spec

All colours are tokens in `tokens.css` (the guard test bans literals elsewhere). The ratios were computed with the
same luminance and alpha-over math as `tokens.test.ts`. The **darkest backdrop** is pure black (a cover photo can be
black, e.g. the timber facade); the darkest atmosphere stop is `--ground-deep #DED6CB`.

### c1 Ground and atmosphere

```css
--ground: #ECE8E2;        /* greige stone-white, the base */
--ground-deep: #DED6CB;   /* the darkest atmosphere stop; text pairs are tested against it */
--surface: #FAF8F5;       /* paper */
--stone: #DDD6CC;
--line: rgb(31 28 25 / 0.12);
--atmosphere:
	radial-gradient(70% 60% at 8% -10%, rgb(250 232 210 / 0.95), rgb(250 232 210 / 0) 70%),
	radial-gradient(55% 55% at 105% 30%, rgb(211 217 218 / 0.85), rgb(211 217 218 / 0) 70%),
	radial-gradient(60% 50% at 25% 110%, rgb(222 214 203 / 1), rgb(222 214 203 / 0) 70%),
	radial-gradient(40% 35% at 80% 95%, var(--accent-wash), transparent 70%),
	linear-gradient(180deg, #F4F1EC 0%, #E6E1DA 100%);
--veil: rgb(31 28 25 / 0.16);          /* palette/drawer scrim */
--veil-filter: blur(6px) saturate(1.1);
```
- `body::before` uses `background: var(--atmosphere)`. It stays fixed as today.
- The stops are sunlight peach `#FAE8D2` top-left, cool stone haze `#D3D9DA` on the right edge (the architect site's mountains and the travel site's sea), a taupe floor `#DED6CB` bottom-left, and a small accent glow bottom-right.
- The haze (L 0.685) is lighter than ground-deep (L 0.679), so ground-deep is the darkest point.

### c2 Ink

| Token | Value | On ground | On ground-deep | On surface |
|---|---|---|---|---|
| `--ink` | `#1F1C19` | 13.9 | 10.7 | 16.0 |
| `--ink-2` | `#433D36` | 8.8 | 7.4 | 9.8 |
| `--muted` (decoration only) | `#8C857C` | 3.0 | — | 3.4 |

Text palette (prose colours), darkened so they hold on ground-deep:
- stone `#61584E` (4.84 on ground-deep)
- clay `#91411F` (4.90)
- ochre `#6E520B` (5.07)
- moss `#425725` (5.56)
- sea `#1B5B6C` (5.29)
- plum `#70375F` (6.08)

The syntax tokens follow the same mapping. Danger is `#A8231B` (4.99 on ground-deep, 5.41 on danger-soft `#F4DAD3`, white on danger 7.19).

### c3 Accent: three options (all ≥ 4.5 on ground, ground-deep and surface; white on the fill ≥ 6.7)

| Name | `--accent` | `--accent-soft` | `--accent-wash` | On ground / deep / surface | White on fill | Source |
|---|---|---|---|---|---|---|
| **bronze** (primary) | `#7F5130` | `#EFE3D6` | `rgb(127 81 48 / 0.14)` | 5.51 / 4.67 / 6.35 | 6.73 | the "Inspire" / "Beyond" word |
| moss | `#4A5D3E` | `#E2E7DA` | `rgb(74 93 62 / 0.14)` | 5.88 / 4.98 / 6.77 | 7.18 | the NOAL green tile, komoot |
| slate | `#3B5364` | `#DEE5EA` | `rgb(59 83 100 / 0.14)` | 6.60 / 5.59 / 7.60 | 8.05 | the travel site's CTA / sea |

`--accent-ink` is `#FFFFFF` for all three. Tomato was left out on purpose: it collides with danger.

Accent appears only on:
- the headline word
- prose links
- the blockquote rule
- the task checkbox
- the callout fill (soft)
- search highlights (soft)
- selection (soft)
- the date-tile option B

Never on sidebar rows, tab labels or chrome.

### c4 Glass: three strengths (names unchanged)

Shared by all three:
```css
--glass-rim: inset 0 0 0 1px rgb(255 255 255 / 0.62), inset 0 1px 0 rgb(255 255 255 / 0.95), 0 0 0 1px rgb(31 28 25 / 0.05);
--glass-sheen: linear-gradient(155deg, rgb(255 255 255 / 0.5) 0%, rgb(255 255 255 / 0.12) 34%, rgb(255 255 255 / 0) 62%);
--glass-fallback: #F7F5F1;
```

| | `--glass-fill` | `--glass-filter` | `--glass-shadow` |
|---|---|---|---|
| soft | `rgb(255 255 255 / 0.68)` | `blur(16px) saturate(1.25)` | `0 1px 1px rgb(31 28 25 / 0.03), 0 10px 24px -16px rgb(31 28 25 / 0.14)` |
| clear | `rgb(255 255 255 / 0.76)` | `blur(28px) saturate(1.3)` | `0 1px 1px rgb(31 28 25 / 0.04), 0 16px 36px -20px rgb(31 28 25 / 0.18), 0 44px 88px -48px rgb(31 28 25 / 0.22)` |
| frosted | `rgb(255 255 255 / 0.86)` | `blur(40px) saturate(1.35)` | `0 1px 2px rgb(31 28 25 / 0.05), 0 22px 48px -24px rgb(31 28 25 / 0.22), 0 60px 120px -60px rgb(31 28 25 / 0.26)` |

**AA on glass, body text, worst case (fill over pure black):**
- soft: ink **7.59**, ink-2 **4.80**
- clear: ink 9.50, ink-2 6.00
- frosted: ink 12.28, ink-2 7.76

Over ground-deep the lowest value is 9.59 (soft, ink-2). On the fallback: ink 15.57, ink-2 9.84. The sheen only lightens, so these are floors.

Why the fills are not lower: ink-2 over black needs alpha ≥ ~0.66. The glassiness comes from the atmosphere range, the white (not cream) fill, the sheen and the rim, not from transparency. Going lower would need ink-only text on soft glass, which is a bigger change.

### c5 Smoked tile (the date tile, counterweight)

```css
--tile-bg: rgb(31 28 25 / 0.84);
--tile-filter: blur(24px) saturate(1.2);
--tile-ink: #FAF8F5;
--tile-ink-2: #CFC8BE;
--tile-rule: rgb(250 248 245 / 0.16);
--tile-ring: rgb(250 248 245 / 0.4);
```
- Contrast: tile-ink on the tile over white is 10.26, over ground-deep 11.32; tile-ink-2 is 6.18 / 6.83.
- Option B (NOAL style): `--tile-bg: var(--accent)`, `--tile-filter: none`, rules `rgb(255 255 255 / 0.24)`, ring `rgb(255 255 255 / 0.5)`; tile-ink is white (≥ 6.7 on all three accents).

### c6 Cards

| `data-card` | `--card-bg` | `--card-sheen` | `--card-filter` | `--card-border` | `--card-shadow` |
|---|---|---|---|---|---|
| glass | `var(--glass-fill)` | `var(--glass-sheen)` | `var(--glass-filter)` | `rgb(255 255 255 / 0.7)` | `var(--glass-shadow)` |
| paper | `var(--surface)` | `none` | `none` | `rgb(31 28 25 / 0.07)` | `var(--shadow-card)` |
| outline | `transparent` | `none` | `none` | `rgb(31 28 25 / 0.2)` | `none` |

`.card` uses `background-color: var(--card-bg); background-image: var(--card-sheen)`. `.glass` uses `background-color: var(--glass-fill); background-image: var(--glass-sheen)`.

### c7 Radii (inner radius = outer minus padding)

`--r-sm: 10px; --r-md: 14px; --r-lg: 20px; --r-xl: 28px; --r-2xl: 36px; --r-pill: 999px`. Panels and cards use xl, tiles and the date tile 2xl, photos inside cards lg, kbd sm.

### c8 Shadows

```css
--shadow-card: 0 1px 1px rgb(31 28 25 / 0.04), 0 8px 20px -12px rgb(31 28 25 / 0.14), 0 28px 56px -36px rgb(31 28 25 / 0.22);
--shadow-float: 0 2px 4px rgb(31 28 25 / 0.05), 0 20px 44px -20px rgb(31 28 25 / 0.28), 0 56px 110px -56px rgb(31 28 25 / 0.3);
--shadow-cta: 0 1px 1px rgb(31 28 25 / 0.2), 0 10px 22px -12px rgb(31 28 25 / 0.5);
--row-hover: rgb(255 255 255 / 0.4);
--row-active: rgb(255 255 255 / 0.8);
--row-active-shadow: 0 1px 2px rgb(31 28 25 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.9);
--chip-bg: rgb(255 255 255 / 0.55);
--chip-border: rgb(255 255 255 / 0.85);
```

### c9 Typefaces (free, OFL, self-hosted latin woff2 from `@fontsource-variable/*`)

| Pairing | Display | Text / UI | Fit |
|---|---|---|---|
| **A, recommended** | **Newsreader** (opsz 6–72, wght 200–800, plus italic): `newsreader-latin-opsz-normal.woff2` + `-opsz-italic.woff2` | **Figtree** (keep, already shipped) | Closest to the architect and travel serif while staying readable at 19–24 px (folder names, card titles), because the opsz axis thins hairlines only at large sizes. Italic gives the Mindframe accent word. Swaps one font. |
| B | **Noto Serif Display** (wght 100–900, wdth, plus italic): `noto-serif-display-latin-wght-normal.woff2` + italic | Figtree | The most "luxury hotel hero" contrast at 300. Spindly below 24 px, so card titles and folder names under 24 px switch to `--font-text` 500. |
| C | **Bodoni Moda** (opsz 6–96, wght 400–900, plus italic) | **DM Sans** (opsz, wght 100–1000) | Fashion-editorial (Mindframe, NOAL), highest contrast, the most change (both fonts swap). |

Check the exact file names in the package before copying (fontsource names variable files by axis set). Cormorant, Fraunces and Instrument were excluded as asked.

Pairing A values:

| Token / use | Phone → ≥ 1024 | Family | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| `--t-display-1` hero | 44 → **72** | display | 360 | −0.025em | 0.98 |
| `--t-display-2` prose h1 | 34 → 50 | display | 380 | −0.02em | 1.02 |
| `--t-display-3` section h2, prose h2 | 28 → 36 | display | 400 | −0.015em | 1.05 |
| `--t-note-title` | 34 → 48 | display | 380 | −0.02em | 1.04 |
| card title, folder name | 22 / 19 small | display | 420 | −0.01em | 1.15 |
| `--t-note` note body | 17 | text | 400 | 0 | 1.65 |
| `--t-body` UI | 15 | text | 400 (labels 500) | 0 | 1.5 |
| `--t-small` | 13 | text | 500 | 0.005em | 1.4 |
| `--t-eyebrow` | 11 → 11 | text | 500 | **0.28em** | 1.7 |

New scale tokens: `--w-display: 380`, `--tracking-display: -0.02em`, `--tracking-eyebrow: 0.28em`, `--font-display: 'Newsreader', Georgia, serif`. h3 stays sans (`--font-text` 600 → 500 at 16 px).
- **Headline accent word** (`.display em`): `font-style: italic; font-weight: 340; color: var(--accent)`.
- **Eyebrow**: uppercase, 11 px/500, 0.28em, `--ink-2`; em-dash separators keep a space on each side. Counters ("01 / 03", "03"): 12 px/500, tnum, 0.12em, `--ink-2`.

### c10 Pills, CTA, chips, tags

- **CTA** (`Button cta`): background `--ink`, text `--surface`, font 15 px/500, `min-block-size: 48px`, padding `0 6px 0 24px` with the arrow, `box-shadow: var(--shadow-cta)`. The trailing ArrowButton (light, sm) is 36 px with a `--surface` background. Hover lifts 1 px; the arrow nudges 2 px.
- **Secondary**: transparent, 1 px `--ink` border, same height. On photos (folder cover) it uses the `.glass` look.
- **Ghost**: text `--ink`; hover background `--row-hover`.
- **IconButton**: 44 px, `.glass` (soft or clear by look) with the rim; icon stroke 1.5.
- **Chip** (properties row, tag input): `--chip-bg`, 1 px `--chip-border`, plus the glass rim's outer hairline. 30 px tall, radius pill, 13 px/500 ink, icon ink-2. The dashed "Add tag" chip uses `1px dashed rgb(31 28 25 / 0.25)`, background none.
- **Card tags** ("ARCHITECTURE | IDEAS"): eyebrow style at 10.5 px, `--ink-2`, separated by a 1 px `--line` vertical rule (as today).
- **Search pill (home)**: soft glass, 52 px. Placeholder `--ink-2`. kbd: 1 px `--line`, background `--chip-bg`, `--r-sm`, 12 px.
- **Highlights** (search snippet `mark`): `--accent-soft` background, ink text, radius 4 px.

### c11 Date tile

- Background `--tile-bg` + `--tile-filter`; text `--tile-ink`; `--r-2xl`; `--shadow-float`.
- Day numeral in the display face, 64 px (phone 56), weight 300, −0.03em, line-height 0.9.
- Month: eyebrow in tile-ink. Year: 13 px tile-ink-2.
- Arrow circle: 40 px, 1 px `--tile-ring`.
- List rules: 1 px `--tile-rule`; times tnum tile-ink-2.
- A 6 px `--accent-soft` dot before "Edited today" is decoration only.

### c12 Motion tone (calmer and longer; only transform/opacity, as now)

- Durations: `--d-base: 320ms`, `--d-slow: 560ms`, `--d-glide: 760ms`; `--d-menu` and `--d-fast` stay.
- Easings: `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)`; `--ease-spring: cubic-bezier(0.3, 1.25, 0.5, 1)` (less overshoot).
- Movement: card hover lifts 2 px (was 3), cover-image hover scales to 1.03, list reveal rises 12 px (was 16).

## (d) Change list (values only, no markup)

**src/lib/styles/**
- **tokens.css / tokens.ts**:
  - Replace the base values (c1, c2, c8).
  - Add base tokens: `ground-deep`, `atmosphere`, `veil`, `veil-filter`, `shadow-cta`, `row-hover`, `row-active`, `row-active-shadow`, `chip-bg`, `chip-border`, `tile-bg`, `tile-filter`, `tile-ink`, `tile-ink-2`, `tile-rule`, `tile-ring`.
  - Rename the accent blocks to `bronze | moss | slate` (c3) and make `:root` default to bronze.
  - Glass blocks get c4 values plus a new `glass-sheen` key (in `GLASS_TOKENS`); cards get c6 plus a `card-sheen` key.
  - Radius (c7); type families, sizes and `wide` (c9) plus `w-display` and `tracking-display`; durations and easing (c12).
- **tokens.test.ts**:
  - Accent names become `['bronze','moss','slate']`; the defaults check becomes `accents.bronze`.
  - Add text pairs vs `ground-deep` (ink, ink-2, accent, every `text-*`, every `syntax-*`, danger).
  - Add `tile-ink`/`tile-ink-2` on `tile-bg` composited over white and over ground-deep.
  - Add the glass-over-`ground-deep` loop next to white/black/sand.
- **look.ts**: `LOOK.accent = 'bronze'` (until the pick).
- **global.css**:
  - `@font-face`: Newsreader normal + italic (opsz, `font-weight: 200 800`) replaces Bricolage.
  - `body::before` uses `background: var(--atmosphere)`.
  - `.glass`/`.card`: `background-color` + `background-image` sheen.
  - h1/h2: `font-weight: var(--w-display)`, `letter-spacing: var(--tracking-display)`, line-height 1.02; h3 weight 500.
  - `.display`: weight 360, −0.025em, line-height 0.98; `.display em`: italic 340, accent.
  - `.eyebrow`: weight 500.
  - `[data-reveal]` translateY 12 px.
- **prose.css**:
  - h1/h2 inherit the serif weights; h3 switches to `--font-text` 600, 17 px, −0.01em.
  - blockquote: `border-inline-start: 2px solid var(--accent)`, `font-family: var(--font-display)`, italic, 1.15em.
  - callout radius `--r-lg`.
  - Link underline offset 4 px and thickness 1px (unchanged colour).
  - `code` background `--stone`.
  - pre/file-card/link-card radius `--r-lg` (now 20).
  - th background `--chip-bg`.
- **guard.test.ts**: no change.

**src/lib/ui/**
- **Button.svelte**: cta weight 500, `min-block-size: 48px`, `box-shadow: var(--shadow-cta)`; ghost hover `--row-hover`.
- **ArrowButton.svelte**: `.sm` 36 px.
- **Chip.svelte**: background `--chip-bg`, border `--chip-border`, `min-block-size: 30px`, weight 500.
- **GlassPanel.svelte**: no value change (radius `--r-xl` scales by token); `.strong` keeps 92 % fallback.
- **IconButton.svelte**: no change (inherits `.glass`).
- **Icon.svelte**: default stroke 1.6 → 1.5.
- **Eyebrow.svelte**: no change.

**src/lib/mockups/ and `__mockups` pages (styling only)**
- **MockHome**: `.date-tile` uses the tile tokens (c11), `.day` 64/56 px weight 300 in the display face, rules `--tile-rule`, `.go` border `--tile-ring`; `.counter` 0.12em.
- **MockTree / MockSidebar**: active rows switch from `accent-wash`/`accent-soft` to `--row-active` + `--row-active-shadow`; hover `--row-hover`.
- **MockBottomBar**: the active tab gets a `--row-active` pill, the label ink (not accent); `.round` gets `--shadow-float`.
- **MockFolderTile**: `.name` 22/19 px weight 420; the photo label filter is the clear strength; the counter is 11 px/500.
- **MockNoteCard**: title 22 px weight 420 in the display face; hover lift 2 px.
- **search page**: backdrop `--veil` + `--veil-filter`; the selected row uses `--row-active`; mark `--accent-soft`.
- **note page**: the toolbar/bubble use `.glass` frosted; text highlight `--accent-soft`.

**Outside the look layer, but needed for a font or accent rename** (the orchestrator decides):
- `src/app.html` preloads
- `static/fonts/` (Newsreader woff2 + `Newsreader-OFL.txt`)
- `e2e/fonts.test.ts`
- `e2e/mockups.test.ts` and `e2e/components.test.ts` (accent names)
- `specs/design-system/spec.md` lines 18/22/45/49
- `scope.md` S2 (Bricolage + Figtree was Rue's pick)

The cheaper path keeps the keys `terracotta|ochre|olive` with new values, but the names would then lie.

## (e) Mobbin references (app names checked on every result)

1. TIDE (iOS) https://mobbin.com/screens/dbbd72b3-8c1a-425c-8f7e-c18465a33a0f: the glass recipe. Low-fill white glass cards and a bottom bar with a bright 1 px rim over an atmospheric photo; the active tab is a lighter pill inside the bar. Use it for c4 and the phone bar.
2. Tana (web) https://mobbin.com/screens/7830189f-0b30-4d2c-b3cf-4a23f42b5425: serif greeting headline, translucent stacked cards and a pill search on a tinted ground. The closest app-shaped version of the inspo for Home cards and the search pill.
3. Unseen Studio (site) https://mobbin.com/sites/sections/1bdc4e01-2f7e-4e09-9aa1-27f02c13bcbe: italic serif plus grotesk headline, tracked uppercase eyebrow, a small white pill CTA. The model for `.display em` and the eyebrow.
4. hilos (web) https://mobbin.com/screens/22f7ad9a-4417-44c3-a5e1-5de9f956ffcb: a "SUNDAY, AUGUST 9" tracked eyebrow over a serif display on a dashboard. The same eyebrow-plus-headline pattern as our Home.
5. Origin (web) https://mobbin.com/screens/9c25b42f-5930-41c4-8f1a-a166661025fb: right-rail cards with an uppercase eyebrow over a serif card title on a calm white. The note-card title treatment (c9 card title).
6. Telescope (web) https://mobbin.com/screens/63d5664c-f626-4855-acab-504884a9a535: a collection page with a light display title, tracked eyebrow, meta row and photo grid on warm white. The folder page's typographic calm.
7. komoot (web) https://mobbin.com/screens/08c48bf0-54eb-4d97-a7a9-e708f07c69a6: a photo cover card with a white title and a small eyebrow, a warm off-white ground, a moss CTA. Supports the moss option and the cover overlay.
8. Craft (web) https://mobbin.com/screens/a7a36fac-8b21-4a22-9af0-c8c9eb7f4d29: a document sheet floating as glass over an atmospheric backdrop, with a serif title. How the note page reads over the atmosphere.
9. Lovable (web) https://mobbin.com/screens/31dce00f-7f65-43ab-b819-b298d507362d: a warm off-white palette over a dimmed, blurred page; soft row highlight, small eyebrow "RECENT PROJECTS". The palette fill and `--veil`.
10. Arcade (web) https://mobbin.com/screens/3db6503f-635e-4a6b-9eef-bce8acb87610: a truly translucent palette (content blurs through) with keycap hints in the footer. The upper bound for palette translucency.
11. pillowtalk (iOS) https://mobbin.com/screens/40c48444-3c3e-4a18-87f6-cc69cbe6604a: a big thin date numeral with a small month above. The date-tile numeral (c11).
12. Maze (site) https://mobbin.com/sites/sections/3de86c04-135e-4a67-af1a-c9c869778759: soft blurred colour blobs as atmosphere behind a light display headline, an outlined eyebrow tag. The c1 atmosphere at a page scale.

## (f) Open questions for Rue

1. **Type**: the inspo is clearly a serif display. Replacing Bricolage Grotesque (your S2 pick) is the biggest single fix. Is that OK, and which pairing: **A Newsreader + Figtree** (recommended), B Noto Serif Display + Figtree, or C Bodoni Moda + DM Sans?
2. **Date tile**: smoked dark glass like the architect and travel counter-cards (recommended, calmer), or accent-filled like the NOAL tile?
3. **Photo atmosphere**: in all five images the glass floats on a photo. Should the page atmosphere use a heavily blurred (~60 px), ~35 % copy of a folder's cover behind its own folder page (and maybe Home)? That changes the photo placement fixed in scope, so it is your call. Without it, the gradient recipe in c1 is the atmosphere.
