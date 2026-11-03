## Context

`~/Repos/Notes-Archive` holds only `openspec/` (config copied from Creative Archive), `CLAUDE.md` and this change;
`main` has the `chore: bootstrap` commit and the build runs on `flow/build-notes-archive`. There is no remote. The
shape — Kit 3 without `svelte.config.js`, `#lib` imports, node:sqlite with numbered migrations, sharp → WebP BLOBs,
tokens.css, the harness, `/__mockups`, safe fetch — is copied from `~/Repos/Creative-Archive` (read it, never modify
it). The app later runs on the homelab behind nginx on plain HTTP, single user, no login; deploy is a split-off
change. Sources: scope.md (Gate 0, the S-items), research.md (inspo analysis, Mobbin references, Tiptap research — its
decisions are binding), UI inspiration in `/home/Rue/Pictures/UI-inspo/` (five images).

## Goals / Non-Goals

**Goals:** everything in scope.md S1–S33 — a private notes archive with Notion's editing mechanics, nested folders,
tags and full-text search, in a light, warm, editorial look approved at a mockup checkpoint.

**Non-Goals:** as in proposal.md → Non-Goals.

## Decisions

From scope.md (Gate 0), unchanged:
- Archive = the library of all notes; no archived/active state.
- Folders contain notes (nested, unlimited depth); notes have no children; tags cut across.
- Notion editing mechanics with Tiptap 3: slash + shortcuts, bubble toolbar, drag handle, extra blocks.
- Images and files inline as blocks; links in the text; a URL alone on a line becomes a preview card.
- Delete is immediate after a confirm dialog; folder delete takes all contents.
- Autosave, no save button; Creative Archive's error toast copy reused.
- Light, warm world, clear frosted glass, Newsreader + Figtree, rich motion; accent colour, glass strength and
  card style decided at the mockup checkpoint.
- Photos only as folder covers; Home hero is typographic.
- Desktop sidebar with tree; phone bottom bar + drawer.
- UI language English. Homelab, single user, no login, desktop and phone; deploy is a separate change.
- One change for everything, with a mockup checkpoint before building screens.

Technical decisions (planner):
- **Stack.** Same pins as Creative Archive: `@sveltejs/kit ^3`, `svelte ^5.57`, `vite ^8.3`, `vitest ^5`,
  `typescript ^6`, `@sveltejs/adapter-node ^6`, `@playwright/test ^1.64`, `svelte-check ^4.7`, `@types/node`. Runtime:
  `sharp ^0.35`, `@tiptap/{core,pm,starter-kit,extensions,extension-list,extension-details,extension-table,
  extension-code-block-lowlight,extension-drag-handle,extension-bubble-menu,extension-file-handler,
  extension-text-style,suggestion}` all `3.32.2` (exact), `lowlight ^3.3`. All are installed by U3 (contract) so no
  parallel unit touches `package.json` later (U4 only adds the `shots:mockups` script). `@tiptap/extension-drag-handle`
  declares `@tiptap/y-tiptap`, `@tiptap/extension-collaboration` and `@tiptap/extension-node-range` as peers; npm
  installs them — accepted, nothing of collaboration is configured. No other runtime dependency: no emoji, markdown,
  HTML-parser, animation or state library.
- **Editor mount.** No `@tiptap/svelte`: `src/lib/editor/Editor.svelte` creates a vanilla `Editor` in `onMount`, holds it
  in `$state.raw` with a version counter for toolbar state, and destroys it on unmount (research.md). Floating UI
  (slash menu, bubble toolbar, block handle and menu, table menu) is created by each feature's extension factory,
  which builds its element and `mount()`s a Svelte component into it before the extension is configured.
- **Feature modules.** `src/lib/editor/extensions.ts` (U3, real) composes fixed factories, one per module:
  `core` (U12), `codeBlock` (U12 uses it, U17 owns it), `blocks` (U17), `slash` (U15), `bubble` (U15), `handle` (U15),
  `media` (U21), `preview` (U21). U3 creates every module as a typed stub returning `[]` (the code block stub returns
  a plain `CodeBlockLowlight`), so units fill their own file and never edit the composition. Slash items are
  registered the same way: `slash.ts` lists core items and appends `blockSlashItems` (blocks.ts) and
  `mediaSlashItems` (media.ts), both `[]` in the stubs.
- **Content storage.** ProseMirror JSON is the source of truth (`notes.content`, `json_valid`). On every write the
  server derives `body_text` with a hand-written walker (`plaintext.ts`, no DOM, no Tiptap): the text of every text
  node, blocks separated by `\n`, `hardBreak` → `\n`, node attributes ignored, unknown node types walked like any
  other, invalid input → `''`. In the browser `sanitize.ts` maps node types the current schema doesn't know to
  paragraphs holding their text before `setContent`, so older content still renders (S23).
- **Search.** FTS5 table `notes_fts(title, body, tags)` with `tokenize = 'unicode61 remove_diacritics 2'` (probed on
  the local Node 26 build: `"uber"*` finds "über", `"ÜBER"*` too, `"cafe"` finds "Café"; `ß` is not folded by the tokenizer, so
  `foldSearch()` in `text.ts` maps `ß`/`ẞ` to `ss` in everything `indexNote` writes and in every query token: "strasse" and
  "Straße" find each other). Snippets are cut from the folded body, then mapped back onto the original `body_text` (the
  only length change is `ß` → `ss`, so offsets map exactly) so the result still shows "Straße".
  The row is rewritten by `indexNote(id)` (U3, real) in the same transaction as every note, tag or move write; a
  trigger deletes it when the note row goes (FK cascades fire it too — probed). Queries: the user's text is split into
  `\p{L}\p{N}` tokens, each becomes `"token"*`, joined with spaces (AND); no token → no results, so `"`, `*`, `-`, `(`
  can never reach FTS syntax. Ranking `bm25(notes_fts, 10, 1, 5)` (title, body, tags). Snippets use
  `snippet(notes_fts, -1, char(2), char(3), '…', 12)`; the server splits on the sentinels into
  `{ text, hit }[]`, the UI renders hits as `<mark>` — no HTML from note text is ever rendered.
- **Tag keys.** `tags.name_key = fold(name)` (NFC, trim, collapse whitespace, JS `toLowerCase()`), unique; SQLite
  `NOCASE` folds ASCII only, so "Übung" and "übung" would differ under it. First spelling wins.
- **Uploads.** Images (editor, folder covers, link-preview images) are WebP BLOBs in `images` (sharp, long side ≤ 2400
  px for uploads, ≤ 1600 px for preview images); files are stored as-is in `files`. Owners are columns:
  `images.note_id`, `images.folder_id` (unique: one cover per folder), `files.note_id`, all `ON DELETE CASCADE`, so
  deleting a note or folder removes its uploads without bookkeeping. Limit 16 MiB each, enforced in the browser
  (toast before upload) and on the server (413). `BODY_SIZE_LIMIT=17M`. `updateNote` with new content marks the note's images and files that the previous
  stored body referenced and the new one doesn't (`image.id`, `fileCard.id`, `linkPreview.imageId`, found by
  `referencedUploads(doc)` in `plaintext.ts`) with `orphaned_at` in the same transaction (migration 0004); a marked
  upload is still served, a save whose body references it clears the mark and takes it over, and `purgeOrphans`
  deletes marks older than an hour at server start and on every save. Uploads never saved into a body are never
  marked and stay until the note is deleted; a deleted note takes its marked uploads with it. `/files/[id]` serves PDF, images, audio, video and `text/plain` inline, everything
  else as attachment, always with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: sandbox`, so an
  uploaded HTML or SVG file can't run script on the app's origin; `?download=1` forces attachment; the name goes out
  as `filename*=UTF-8''…`.
- **Link preview.** Pasting a URL alone into an empty paragraph first inserts it as a linked paragraph (one history
  step), then replaces that paragraph with a `linkPreview` node (a second step) whose attributes fill in when
  `POST /api/preview` answers (`addToHistory: false`). Undo right after the paste removes the second step and leaves
  the plain link. The server never throws for fetch failures: it answers the domain and URL only. Fetching is Creative
  Archive's `safeFetch` (http/https only, private/loopback/link-local/CGNAT refused before connecting and after DNS,
  3 re-checked redirects, 5 s timeout, 1 MB page cap, `text/html` only); the preview image is stored as WebP owned by
  the note, never hotlinked. `readPreview` refuses IP-literal private hosts itself before calling the remote, so the
  guard holds with the fake remote too. Tests use the fake remote behind the test flag; its canned pages (U10):
  `https://garden.example/` (og:title "Garden Notes", og:description, og:site_name "Garden", og:image
  `/__test/image/garden.png`), `https://plain.example/` (only `<title>Plain Page</title>`),
  `https://pdf.example/doc.pdf` (`application/pdf`), `https://blocked.example/*` (`FetchError('status')`), anything else
  `FetchError('network')`.
- **Autosave.** `src/lib/notes/autosave.ts` merges patches per note; title and body are debounced 600 ms, icon /
  folder / tags / pin go out at once; one request in flight at a time. States `idle | pending | saving | saved |
  error | deleted` drive `[data-save-state]` and the quiet status ("Saving…" / "Saved"). A failed request keeps the
  merged patch, sets `error`, toasts `COPY.saveFailed` once, and the next change or a click on the status retries.
  `beforeNavigate` with pending work cancels the navigation, flushes, then `goto`s the target. A 404 sets `deleted`
  and shows `COPY.noteDeleted` in an inline `role="alert"` notice; nothing is sent after that. Pin changes don't bump
  `updated_at`; every other field does. After a save that changed title, icon, folder, tags or pin the client calls
  `invalidate('app:tree')` so the tree, tags section and counts follow without reload.
- **Empty new notes.** "New note" creates the row at once (`POST /api/notes`) and opens it. Leaving a note whose title
  is blank, body empty, icon unset, with no tags and not pinned posts `/api/notes/[id]/discard` (in-app navigation via
  `beforeNavigate`, tab close via `navigator.sendBeacon` on `pagehide`); the server deletes only if it is still empty.
- **Cmd/Ctrl+K.** Scope gives the key to both the editor link shortcut (S15) and the palette (S32). Inside the editor
  with a non-empty text selection it opens the bubble toolbar's link field and calls `preventDefault`; everywhere else
  it opens the palette. The palette's window listener ignores events whose `defaultPrevented` is set.
- **Text colours.** A small fixed palette stored by token name, never by value: the `textStyle` mark carries
  `color: TextColor` and renders `data-color="<name>"`; CSS maps it to `--text-<name>`. "Default" removes it.
- **Folder counts.** `noteCount` on a folder tile = notes in the folder and all its descendants. The folder page header
  shows direct sub-folders and `noteCount`. The delete dialog counts every descendant folder (not the folder itself)
  and every note inside. `deleteFolder` collects descendants with a recursive CTE and deletes notes, then folders, in
  one transaction (no reliance on the cascade depth limit).
- **Snippet.** Not stored: `snippet(body_text)` collapses whitespace and cuts at 240 characters on read; cards clamp to
  3 lines. A body that starts with an image starts its text after it because the walker ignores atoms' attributes.
- **Data refresh.** The `(app)` layout load returns the tree and tags and `depends('app:tree')`. Writes from cards,
  menus and properties call `invalidate('app:tree')` (and `invalidateAll()` where the page's own list changes).
- **Look.** A look is three attributes on `<html>`: `data-accent`, `data-glass`, `data-card`, each selecting a token
  block. `src/lib/styles/look.ts` holds `LOOK` (provisional until the checkpoint; U9 writes the pick). Mockups switch
  them with `?accent=&glass=&card=`.
- **Morph.** U11's `pageTransition` (`onNavigate` + `document.startViewTransition`) names the element carrying
  `data-morph="note-<id>"` on the old page and the one on the new page `note-<id>` for the duration of the transition
  when exactly one side is `/notes/<id>`. Note cards (U14) and the note page header (U12) carry the attribute; the
  morph needs no further wiring.
- **Phone keyboard.** `src/lib/shell/keyboard.svelte.ts` (U3, real) exports `softKeyboard = $state({ open: false })`.
  The editor sets it on focus/blur under `(pointer: coarse)` (U12); the bottom bar hides while it is open (U16). The
  slash menu and bubble toolbar position against `visualViewport` (U15).
- **Emoji picker.** Hand-built (`EmojiPicker.svelte`, U9) over a curated list of ~240 emoji with English keywords in
  `src/lib/ui/emoji.ts`, grouped and searchable, with "Remove". The bigger design — the full Unicode set from
  `emojibase-data` (MIT) with skin tones — would cost ~400 KB of data for little gain in a notes app.
- **Placeholders and stubs.** U3's page placeholders are one empty element (no heading, no behaviour a later scenario
  asserts). Server stubs return a typed empty default (`null`, `[]`, `0`, an empty tree) instead of throwing, so a
  scenario written against them goes red on an assertion, not on a crash.
- **Git.** Bootstrap exists on `main`; nothing is pushed in this change (`ship: ask`, `release: none`).

## Reference files to copy from Creative Archive

Builders copy these and adapt names; they don't reinvent them. Paths are relative to `~/Repos/Creative-Archive`.

| Source | Target | Unit | Adapt |
|---|---|---|---|
| `package.json` (scripts, `imports`, `engines`, devDependencies) | same | U1 | name `notes-archive`, version `0.1.0`; deps added by U3, `shots:mockups` by U4 |
| `vite.config.ts`, `tsconfig.json`, `.gitignore`, `src/app.d.ts`, `src/app.html`, `src/routes/+layout.svelte`, `src/hooks.server.ts` | same | U1 | title "Notes Archive" |
| `playwright.config.ts` | same | U1 | env `NOTES_ARCHIVE_TEST=1`, `BODY_SIZE_LIMIT=17M`, `MOCKUP_PHOTOS_DIR` |
| `src/lib/server/db.ts` + `db.test.ts`, `migrations/0001_images.sql` | same | U1 (U3 adds `resetDb`) | default `./data/notes-archive.db` |
| `src/lib/server/test-flag.ts` | same | U1 | `NOTES_ARCHIVE_TEST` |
| `src/routes/healthz/+server.ts` + `healthz.test.ts` | same | U1 | — |
| `scripts/package.mjs`, `scripts/package.test.ts`, `scripts/server.test.ts` | same | U1 | name `notes-archive` |
| `src/lib/text.ts` + `text.test.ts` | same | U3 | — |
| `src/lib/server/testing.ts`, `src/routes/__test/{reset,seed,counts}/+server.ts`, `test-routes.test.ts`, `e2e/helpers.ts` | same | U3 | new shapes (Contracts) |
| `src/lib/server/tags.ts` (`setEntryTags`, `pruneTags`) | `src/lib/server/tags.ts` | U3 (`pruneTags`), U6 | notes instead of entries, chip order kept |
| `src/lib/styles/{tokens.css,tokens.ts,tokens.test.ts,global.css}` | same | U2 | one light scheme, look blocks |
| `src/lib/motion.ts` + `motion.test.ts` | same | U2 | `noteName` instead of `coverName` |
| `static/fonts/{newsreader-latin-opsz-normal.woff2,newsreader-latin-opsz-italic.woff2,Newsreader-OFL.txt,figtree-latin-wght-normal.woff2,Figtree-OFL.txt}` | `static/fonts/` | U2 | only these five files |
| `src/lib/ui/{GlassPanel,Button,ArrowButton,IconButton,Icon,Chip,Eyebrow}.svelte` | `src/lib/ui/` | U2 | re-tuned to clear frosted glass on light |
| `src/routes/__mockups/{+layout.server.ts,+layout.svelte,mockups-guard.test.ts,photo/[name]/+server.ts}`, `src/lib/mockups/{fixtures.ts,credits.test.ts}`, `scripts/synthetic-photo.mjs` + test, `e2e/mockups.test.ts` | same | U4 | screens below |
| `src/lib/shell/{Toast.svelte,toast.ts,toast.test.ts}`, `src/lib/entries/DeleteEntry.svelte` (focus trap), `src/lib/collections/AddToCollection.svelte` (role=menu, arrow keys) | `src/lib/shell/`, `src/lib/ui/Dialog.svelte`, `src/lib/ui/Menu.svelte` | U9 | error tone uses `--danger` |
| `src/lib/server/images.ts` + `src/routes/images/[id]/+server.ts` + tests | same | U7 | owner argument, 2400 px |
| `src/lib/server/{net.ts,remote.ts,preview.ts}`, `fake/{remote.ts,pages.ts}`, `src/routes/__test/image/[name]/+server.ts` + tests | same | U10 | `readPreview(url, noteId)`, domain-only on failure |
| `src/lib/shell/morph.ts` + test | same | U11 | `data-morph`, `note-<id>` |
| `src/lib/entries/TagInput.svelte`, `src/lib/ui/Chip.svelte` | `src/lib/notes/TagInput.svelte` | U16 | fold-matched suggestions from `page.data.tags` |

## Visual brief

Builders and the mockup unit work from this section, not from the conversation.

**Inspiration** (`/home/Rue/Pictures/UI-inspo/`, all five; U4 opens every image): frosted glass panels floating over
atmosphere; a floating pill nav, round icon button for search, a dark CTA pill ending in a white arrow circle; bento
tiles with large radii (24–32 px); a light-weight display headline on two lines with one word in the accent colour
("Spaces That *Inspire*"); small tracked uppercase eyebrows ("ARCHITECTURE — INTERIORS — LANDSCAPES") and thin
vertical-rule tag lists; counters "01 / 06"; a left icon rail (architect site); the drink-bar date tile ("12 Sep
2024" with a list) — a fit for dated notes; warm sand/stone neutrals with one dark ink. Here the atmosphere is the
warm ground itself (soft accent-wash glows behind the page) plus folder cover photos — no full-bleed photo hero.

**Mobbin references per screen** (research.md; further research only via `mcp__mobbin__*` in a subagent, cite by URL):

| Screen / element | References |
|---|---|
| Home / library | Craft All Docs https://mobbin.com/screens/58c71118-15cc-4e28-945c-e446472a9e44 · Mymind light https://mobbin.com/screens/98a11946-f85e-4c88-ba05-46955efb9871 · Tana capture hero https://mobbin.com/screens/91e0b7f8-65be-4bcb-811a-551a735b66d6 |
| Note cards | Bear list https://mobbin.com/screens/595f016f-bcb8-469f-81e7-6a043d3c9f53 · Curater text cards https://mobbin.com/screens/4d09b54b-2d0e-4ebe-8a50-390882bc483e |
| Folder tiles / folder page | Gemini Notebook cover tiles https://mobbin.com/screens/78bb5866-1d24-46ff-be30-a35cbdce7a8d · Telescope collection https://mobbin.com/screens/34cf841d-aa96-4d71-b60e-58294019a489 |
| Note page | Slite title + properties https://mobbin.com/screens/326544de-ba4a-4bda-8e08-cd2cbe984f8a · Loop icon above title https://mobbin.com/screens/a707306c-64b2-4da3-ae61-0d558f6f6e04 · Skiff slash menu https://mobbin.com/screens/3724fbfd-7b1f-473b-a032-df0e526b3b27 |
| Sidebar / tree | Bear sidebar https://mobbin.com/screens/192baa1d-4e66-488f-9f45-8d9d61ecb072 · Aboard sidebar item https://mobbin.com/screens/b8fbc951-725a-4c6f-b924-0840606df0b1 |
| Command palette | Loop https://mobbin.com/screens/24f59200-51a6-4d71-a02d-6428f2ead199 · Pitch https://mobbin.com/screens/523024d0-46cf-401d-96ba-26a4c58f7714 · v0 https://mobbin.com/screens/5f353fc3-d9ce-4d1c-be9b-cc1b4ad07578 |
| Tag input | Fabric "Create tag" https://mobbin.com/screens/3cac0fe9-70bd-4b90-8e35-1b1491f8939b · Mymind tag popup https://mobbin.com/screens/6e05c059-8bb8-47be-aef1-f224129a1b96 |
| Pin menu | Bear pin menu https://mobbin.com/screens/017eccc9-c1d8-473a-93e0-3e7d82f98d5a |

**World.** One light scheme, no dark. Values as revised in look revision 1 (see `look-research.md`): ground `#ECE8E2`
(greige), ground-deep `#DED6CB`, surface `#FAF8F5`, stone `#DDD6CC`, line `rgb(31 28 25 / .12)`, ink `#1F1C19`, ink-2
`#433D36`, muted (decoration only). Ambient: a fixed atmosphere (peach light top-left, cool haze right, taupe floor, a
small accent glow) so glass has something to frost. Danger `--danger` / `--danger-soft` / `--on-danger` (a brick red, AA on ground and as a button fill).

**Look candidates** (switchable on every mockup; Rue picks one of each):
- accent: `bronze` (`#7F5130`), `moss` (`#4A5D3E`), `slate` (`#3B5364`) — each with `--accent`,
  `--accent-ink`, `--accent-soft`, `--accent-wash`; accent text ≥ 4.5:1 on ground and surface.
- glass: neutral white `soft` (blur 16 px, fill 68 %), `clear` (blur 28 px, fill 76 %), `frosted` (blur 40 px, fill 86 %); each
  sets `--glass-fill`, `--glass-filter`, `--glass-rim` (1 px inner light rim), `--glass-shadow`, `--glass-sheen`, and
  `--glass-fallback` (solid, same contrast) for browsers without `backdrop-filter`.
- card: `glass` (frosted card), `paper` (solid surface, hairline stone border, soft shadow), `outline` (transparent,
  1 px ink-12 % border) — applies to note cards, folder tiles without cover and the palette rows' hover.

**Type.** Newsreader (opsz + italic; display: hero, page titles, note title, folder names on tiles, with an italic accent
word) + Figtree (wght; UI and note text), latin woff2 self-hosted in `static/fonts/` with their OFL texts, preloaded in
`app.html`. Scale: display 72/50/36 at ≥ 1024, 44/34/28 on phone; note title 48 → 34; body 17 (note text) / 15 (UI);
small 13; eyebrow 11 uppercase, 0.28em tracking; tabular numerals for counters. Radii 10 / 14 / 20 / 28 / 36 / pill;
spacing 4 … 96.

**Components** (U2 atoms, U9 behaviour): GlassPanel (`.glass`, radius 28); Button (`cta` = dark ink pill with a
trailing round white arrow button, `secondary`, `ghost`, `danger`); ArrowButton (44 px circle); IconButton; Icon (inline
SVG map); Chip (tag chip, outlined; glass tone); Eyebrow. Dialog, Menu, Sheet (left drawer / bottom sheet), Toast,
FolderPicker, EmojiPicker (U9).

**Screens.**
- Home: eyebrow ("NOTES — FOLDERS — TAGS" or the date), two-line display headline with one accent word, a glass search
  bar (opens the palette, shows ⌘K), the "New note" CTA pill; below a bento: Pinned (only when any), Recently edited (8
  cards), Folders (top-level cover tiles: photo or typographic warm tint, name, "12 notes").
- Folder page: breadcrumb; cover header (photo with glass title panel, or typographic band) with name and counts
  ("3 folders · 12 notes"), cover control, "New note" and "New folder"; sub-folder tiles; note cards by last edited.
- Note page: reading column ≤ 720 px; icon (large emoji) above a large title; properties row (Folder, Tags chips, Pinned)
  in small glass chips; the body in `prose.css` styles with every block type visible in the mockup (headings, lists,
  task list, quote, callout, toggle, code with highlighting, table, divider, image with caption, file card, link
  preview card); slash menu and bubble toolbar shown open in the mockup.
- Sidebar (desktop): glass panel, 264 px; Home, Search (⌘K), New note; "Folders" section with the tree (chevrons,
  indent 12 px per level, capped at 6 levels); "Tags" with counts; collapse button → 64 px icon rail.
- Phone: bottom glass bar (Home, Search, + New note as the dark round button, Folders); drawer from the left with the
  tree; palette full-screen.
- Command palette: centred glass panel 640 px on desktop; input, "Recent" list or results with highlighted snippet,
  actions "New note" / "New folder", "See all results" row.

**Motion set** (transform/opacity only; every item has a reduced-motion path; the proxy is what e2e asserts):

| Item | Behaviour | Test-visible proxy | Reduced motion |
|---|---|---|---|
| Card → note morph | card morphs into the note header and back | `startViewTransition` called; old and new `[data-morph]` carry `note-<id>` during it | no names set; root fade ≤ 120 ms |
| Page transition | other navigations fade + 8 px slide | `startViewTransition` called | fade ≤ 120 ms |
| No View Transitions | plain navigation | no page error, URL and content change | — |
| List stagger | cards fade-rise in, 30 ms apart, capped at 10 | `data-revealed` per card; first card's `--stagger` < last's | revealed on mount, no delay |
| Glass hover glow | glow layer fades in on hover (fine pointer) | glow layer opacity rises while hovered | no glow animation |
| Menus opening | slash, bubble, block menu, palette, dialog, sheet: fade + 4 px rise, 120–160 ms | a running animation on the opened element | appears without animation |
| Quiet editor | nothing animates while typing | `document.getAnimations()` within the editor is empty after typing | same |

**Layout rule.** Sidebar ≥ 1024 px; content area = viewport minus sidebar, side gutter 16 px phone / 32 px from 768 /
40 px from 1280. Note column `max-width: 720px`, centred in the content area. Grids are
`repeat(auto-fill, minmax(240px, 1fr))` with cards capped at 320 px, so wider screens add columns; 1024–1279 shows the
sidebar and fewer columns. Phone: one or two columns, content padded clear of the bottom bar (and safe area).

## Look revision 1 (Rue, 2026-11-02, after reviewing the mockups)

Rue's words: the structure of the mockups and how the elements are embedded is "sehr sehr gut" and stays exactly as built
(layout, screens, component placement, sidebar/bottom bar, cards, note page). She does not like the **look** (colour,
glass, type, surface treatment, atmosphere) as built and wants it re-done closer to the five images in
`/home/Rue/Pictures/UI-inspo/`, researched together with the Mobbin MCP. Only the look layer may change: `tokens.*`,
`global.css`, `prose.css`, atom styling and the mockup components' styling. No markup restructuring, no new screens,
no change to the Non-Goals or the photo placement decided in scope.md. Research notes: `look-research.md` in this change dir.

Rue's picks for the revision (2026-11-02, answers in `look-research.md` → open questions): display type **Newsreader**
(opsz + italic accent word) with **Figtree** kept for UI and note text, replacing Bricolage Grotesque; date tile as
**smoked dark glass**; **no** blurred cover behind pages (gradient backdrop only, photo placement unchanged); accents
**bronze `#7F5130` (default), moss `#4A5D3E`, slate `#3B5364`** replacing terracotta / ochre / olive. Glass becomes
neutral white at three strengths over a greige ground with peach light and a taupe floor, as specified in
`look-research.md` → New look spec. Contrast AA must stay green. Specs and tests that name the old accents or the old
display font are updated in the same change (`specs/design-system/spec.md`, `scope.md` S2, `e2e/fonts.test.ts`, tokens tests).

## Look pick (⏸ written by the orchestrator at the checkpoint, task 4.6)

Approved by Rue on 2026-11-02 after look revision 1: accent `bronze` (#7F5130), glass `clear`, card `glass`. Revision 1
notes: structure of the mockups kept as built; look redone (Newsreader display, neutral white glass over a greige
ground, smoked dark date tile, moss and slate as alternative accents). Open taste notes carried into later look walks:
the ground is still pale, so white glass is subtle low on the page; property chips on the note page may look heavy.
U9 task 9.1 copies the pick into `LOOK` (already bronze / clear / glass in `look.ts`).

## Contracts

Created by U3 unless noted (types, copy, errors, schema, plain-text walker, search index, test routes, e2e helpers
and client request helpers are real; server functions are stubs with final signatures returning typed empty
defaults). Later units fill the stubs and must not change shapes without re-planning. U2 creates `look.ts`,
`motion.ts` and the UI atoms; U9 the behavioural UI primitives.

### Stored vs derived fields

| Field | Kind | Where |
|---|---|---|
| `notes.title`, `icon`, `content` (ProseMirror JSON), `folder_id`, `pinned_at`, `created_at`, `updated_at` | stored, written by the client's patches | `notes` |
| `notes.body_text` | stored, **derived** on every content write by `plainText(content)` | `notes` |
| `notes_fts` row (title, body = `body_text`, tags = tag names joined by space) | stored, **derived** by `indexNote(id)` after every note, tag or move write; deleted by trigger | `notes_fts` |
| `tags.name_key` | stored, **derived** `fold(name)` | `tags` |
| `NoteCard.snippet` | **derived on read** `snippet(body_text)`, never stored | `notes.ts` |
| `NoteCard.pinned` | **derived on read** `pinned_at IS NOT NULL` | `notes.ts` |
| `FolderTile.noteCount`, `TagCount.count`, `FolderDeleteCounts` | **derived on read** by query | `folders.ts`, `tags.ts` |
| `SearchHit.parts` | **derived on read** from FTS `snippet()` | `search.ts` |

### Types — `src/lib/types.ts`

```ts
export type Id = number;
export type IsoDateTime = string;
export interface JSONContent { type?: string; attrs?: Record<string, unknown>; content?: JSONContent[];
  marks?: { type: string; attrs?: Record<string, unknown> }[]; text?: string }
export type TextColor = 'stone' | 'clay' | 'ochre' | 'moss' | 'sea' | 'plum';
export interface TagRef { id: Id; name: string }
export interface TagCount extends TagRef { count: number }
export interface Note { id: Id; folderId: Id | null; title: string; icon: string | null; content: JSONContent;
  tags: TagRef[]; pinned: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime }
export interface NoteRef { id: Id; title: string; icon: string | null }
export interface NoteCard extends NoteRef { folderId: Id | null; snippet: string; tags: TagRef[]; pinned: boolean; updatedAt: IsoDateTime }
export interface NotePatch { title?: string; icon?: string | null; content?: JSONContent; folderId?: Id | null;
  tags?: string[]; pinned?: boolean }          // tags = the full list in chip order
export interface Folder { id: Id; parentId: Id | null; name: string; coverImageId: Id | null; createdAt: IsoDateTime; updatedAt: IsoDateTime }
export interface FolderTile { id: Id; name: string; coverImageId: Id | null; noteCount: number }
export interface TreeFolder { id: Id; name: string; parentId: Id | null; children: TreeFolder[]; notes: NoteRef[] }
export interface Tree { folders: TreeFolder[]; rootNotes: NoteRef[] }   // folders and notes sorted by name / last edited
export interface FolderDeleteCounts { folders: number; notes: number }   // descendants (not the folder itself), all notes inside
export interface Crumb { id: Id; name: string }
export interface SnippetPart { text: string; hit: boolean }
export interface SearchHit { note: NoteCard; parts: SnippetPart[] }
export interface SearchQuery { q: string; folderId?: Id | null; tagId?: Id | null; limit?: number }
export interface UploadedImage { id: Id; width: number; height: number }
export interface UploadedFile { id: Id; name: string; size: number; mime: string }
export interface LinkPreview { url: string; domain: string; title: string | null; description: string | null;
  siteName: string | null; imageId: Id | null }
export type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'deleted';
```

### Copy — `src/lib/copy.ts` (the only place UI strings that tests assert live)

```ts
export const COPY = {
  untitled: 'Untitled', untitledFolder: 'Untitled folder', emptyNote: 'Empty note',
  newNote: 'New note', newFolder: 'New folder', noFolders: 'No folders yet', emptyFolder: 'Nothing here yet',
  welcome: 'Write your first note', saving: 'Saving…', saved: 'Saved',
  saveFailed: "Couldn't save — try again", noteDeleted: 'This note was deleted',
  imageTooLarge: 'That image is too large', notAnImage: "That file isn't an image",
  fileTooLarge: 'Files can be up to 16 MB', uploadFailed: "Couldn't upload — try again",
  noResults: 'No results', seeAll: 'See all results',
  noMatch: (q: string) => `No notes match “${q}”`,
  deleteNote: (title: string) => `Delete “${title}”? This can't be undone.`,
  deleteFolder: (name: string, c: FolderDeleteCounts) => c.folders + c.notes === 0
    ? `Delete “${name}”? This can't be undone.`
    : `Delete “${name}”? This deletes ${count(c.folders, 'folder')} and ${count(c.notes, 'note')} inside it. This can't be undone.`,
  folderCounts: (folders: number, notes: number) => `${count(folders, 'folder')} · ${count(notes, 'note')}`,
  noteCount: (n: number) => count(n, 'note'),
} as const;
export function count(n: number, word: string): string;           // 1 folder, 2 folders, 0 notes
```
Toasts: `toast(message, tone?: 'info' | 'error')` (U9) — failures use `tone: 'error'`, rendered with `--danger`.
Destructive confirms use `Button variant="danger"` (`--danger` fill, `--on-danger` text). No component writes a
colour literal (U2's guard test).

### Errors — `src/lib/errors.ts`

`ValidationError(message)`, `NotFoundError(what)`, `UploadError(code: 'too-large' | 'not-image' | 'file-too-large')`,
`FetchError(code: 'invalid-url' | 'private-address' | 'status' | 'not-html' | 'too-large' | 'timeout' | 'redirects' | 'network')`.

### Schema — `migrations/` (0001 by U1, 0002 by U3)

```sql
-- 0001_images.sql (U1, as Creative Archive)
CREATE TABLE images (id INTEGER PRIMARY KEY, mime TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
  bytes BLOB NOT NULL, created_at TEXT NOT NULL);

-- 0002_core.sql (U3)
CREATE TABLE folders (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX folders_parent ON folders(parent_id);
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  icon TEXT,
  content TEXT NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}' CHECK (json_valid(content)),
  body_text TEXT NOT NULL DEFAULT '',
  pinned_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX notes_folder ON notes(folder_id, updated_at);
CREATE INDEX notes_updated ON notes(updated_at);
CREATE INDEX notes_pinned ON notes(pinned_at) WHERE pinned_at IS NOT NULL;
CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id));
ALTER TABLE images ADD COLUMN note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE;
ALTER TABLE images ADD COLUMN folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE;
CREATE INDEX images_note ON images(note_id);
CREATE UNIQUE INDEX images_folder_cover ON images(folder_id) WHERE folder_id IS NOT NULL;
CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, bytes BLOB NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX files_note ON files(note_id);
CREATE VIRTUAL TABLE notes_fts USING fts5(title, body, tags, tokenize = 'unicode61 remove_diacritics 2');
CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN DELETE FROM notes_fts WHERE rowid = old.id; END;
```
A folder's cover is the image row with its `folder_id`. Every write to a note's title, content, icon, folder or tags
sets `updated_at`; pin changes don't.

### Shared helpers (U3, real)

```ts
// src/lib/text.ts
export function fold(s: string): string;                          // NFC, trim, collapse whitespace, toLowerCase()
// src/lib/server/plaintext.ts
export function plainText(doc: unknown): string;                  // walker (Decisions → Content storage)
export function snippet(bodyText: string): string;                // collapse whitespace, ≤ 240 chars
export function isEmptyDoc(doc: unknown): boolean;                // no text and no atom nodes
// src/lib/editor/doc.ts — shared by tests, seed and the editor
export function docFromText(body: string): JSONContent;           // one paragraph per line
// src/lib/server/search.ts
export function indexNote(id: Id): void;                          // rewrite the notes_fts row (title, body_text, tag names), each through foldSearch
// src/lib/server/tags.ts
export function pruneTags(): void;                                // delete tags no note uses
// src/lib/server/testing.ts — unit tests and the seed route
export function useTestDb(): void;                                // closeDb(), DATABASE_PATH=':memory:', getDb() migrates
export function seedArchive(input: SeedInput, now?: IsoDateTime): SeedResult;   // plain SQL + plainText + indexNote
export function testImage(index?: number): Uint8Array;            // small generated PNG
// src/lib/server/test-flag.ts (U1)
export function testFlag(): boolean; export function requireTestFlag(): void;
// src/lib/notes/api.ts — browser request helpers (thin fetch wrappers; endpoints arrive with U5/U6)
export async function newNote(folderId?: Id | null): Promise<void>;        // POST /api/notes → goto /notes/<id>
export async function newFolder(parentId?: Id | null): Promise<Id>;        // POST /api/folders
export async function patchNote(id: Id, patch: NotePatch): Promise<Response>;
export async function deleteNoteRequest(id: Id): Promise<void>;
// src/lib/search/palette.svelte.ts
export const palette: { open: boolean };  export function openPalette(): void;  export function closePalette(): void;
// src/lib/shell/keyboard.svelte.ts
export const softKeyboard: { open: boolean };
```

### Server functions (stubs in U3, owner in brackets)

```ts
// src/lib/server/notes.ts [U5]
export function createNote(input: { folderId?: Id | null }): Id;
export function getNote(id: Id): Note | null;
export function updateNote(id: Id, patch: NotePatch): { updatedAt: IsoDateTime };   // NotFoundError; derives body_text, indexNote, tags via setNoteTags
export function deleteNote(id: Id): { folderId: Id | null };       // uploads and tag links cascade, pruneTags; NotFoundError
export function discardIfEmpty(id: Id): boolean;                   // true = deleted
export function listNotes(q: { folderId?: Id | null; tagId?: Id }): NoteCard[];     // direct children, updated_at desc
export function listRecent(limit?: number): NoteCard[];            // default 8, updated_at desc
export function listPinned(): NoteCard[];                          // pinned_at desc
// src/lib/server/folders.ts [U6]
export function createFolder(input: { name?: string; parentId?: Id | null }): Id;    // blank → 'Untitled folder'
export function renameFolder(id: Id, name: string): void;          // blank → 'Untitled folder'
export function moveFolder(id: Id, parentId: Id | null): void;     // ValidationError into itself or a descendant
export function deleteFolder(id: Id): { parentId: Id | null };
export function getFolder(id: Id): Folder | null;
export function breadcrumb(id: Id): Crumb[];                       // root first, the folder itself last
export function folderCounts(id: Id): FolderDeleteCounts;
export function listFolderTiles(parentId: Id | null): FolderTile[];   // name order (Intl.Collator)
export function getTree(): Tree;
// src/lib/server/tags.ts [U6]
export function setNoteTags(noteId: Id, names: string[]): TagRef[];   // fold dedupe, blanks ignored, order kept, prune, indexNote
export function listTags(): TagCount[];                            // used tags only, name order
export function getTag(id: Id): TagRef | null;
// src/lib/server/images.ts [U7]
export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
export async function storeImage(bytes: Uint8Array, owner: { noteId: Id } | { folderId: Id }, maxSide?: number): Promise<UploadedImage>;   // UploadError
export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null;
export async function setFolderCover(folderId: Id, bytes: Uint8Array): Promise<UploadedImage>;   // replaces the old row
export function removeFolderCover(folderId: Id): void;
// src/lib/server/files.ts [U7]
export function storeFile(noteId: Id, file: { name: string; mime: string; bytes: Uint8Array }): UploadedFile;   // UploadError('file-too-large')
export function getFile(id: Id): (UploadedFile & { bytes: Uint8Array }) | null;
// src/lib/server/search.ts [U8]
export function toMatchQuery(q: string): string | null;
export function searchNotes(q: SearchQuery): SearchHit[];          // empty q → all notes matching filters, updated_at desc, parts []
// src/lib/server/net.ts, remote.ts, preview.ts [U10 — created there, not stubbed]
export async function safeFetch(url: string, opts: SafeFetchOptions): Promise<SafeResponse>;   // as Creative Archive
export function parsePreview(html: string, pageUrl: string): { title; description; siteName; imageUrl };
export async function readPreview(url: string, noteId: Id): Promise<LinkPreview>;   // FetchError('invalid-url') only
```

### Editor — `src/lib/editor/`

```ts
// context.ts (U3)
export interface EditorContext { noteId: Id; toast(message: string, tone?: 'info' | 'error'): void; touch: boolean }
export interface SlashItem { id: string; label: string; keywords: string[]; icon: string;
  run(editor: Editor, range: { from: number; to: number }): void }
// extensions.ts (U3, real)
export function buildExtensions(ctx: EditorContext): AnyExtension[];
  // [...coreExtensions(ctx), ...blockExtensions(ctx), ...slashExtensions(ctx), ...bubbleExtensions(ctx),
  //  ...handleExtensions(ctx), ...mediaExtensions(ctx), ...previewExtensions(ctx)]
// core.ts [U12]: StarterKit (codeBlock: false, link { openOnClick: false, autolink: true }), codeBlock(ctx),
//   TaskList, TaskItem { nested: true }, Placeholder, TextStyle + TextColor
// codeBlock.ts [U3 stub = CodeBlockLowlight with lowlight common; U17 adds the language picker]
// blocks.ts [U17]: blockExtensions, blockSlashItems (toggle, callout, table)
// slash.ts, bubble.ts, handle.ts [U15]: slashExtensions, bubbleExtensions (incl. Mod-k with selection), handleExtensions
// media.ts [U21]: mediaExtensions (image, fileCard, FileHandler), mediaSlashItems (image, file)
// preview.ts [U21]: previewExtensions (linkPreview node + paste rule)
// Editor.svelte [U12]: { noteId: Id; content: JSONContent; onchange(content: JSONContent): void; onblur(): void }
//   root element carries data-editor-root; the ProseMirror element is .ProseMirror.prose
```

Node JSON shapes (the stored contract; owners create the nodes):

| Node | Owner | Attrs | DOM (classes `prose.css` styles) |
|---|---|---|---|
| `details` > `detailsSummary` + `detailsContent` | U17 | Tiptap Details, `persist: false` | `div[data-type="details"]` |
| `callout` (block, content `paragraph+`) | U17 | `emoji: string` (default 💡) | `div.callout` > `button.callout-emoji` + content |
| `codeBlock` | U3 stub / U17 | `language: string \| null` | `pre > code.hljs` + `.code-language` picker |
| `table`, `tableRow`, `tableHeader`, `tableCell` | U17 | TableKit, `resizable: false` | `div.table-scroll > table` |
| `image` (block atom) | U21 | `id: Id \| null`, `width`, `height`, `caption: string`; `uploading` not rendered/saved | `figure.image-block > img + figcaption` |
| `fileCard` (block atom) | U21 | `id`, `name`, `size`, `mime` | `a.file-card` |
| `linkPreview` (block atom) | U21 | `url`, `domain`, `title`, `description`, `siteName`, `imageId` | `a.link-card` |
| `textStyle` mark | U12 | `color: TextColor \| null` → `data-color` | `span[data-color]` |

### UI components

```ts
// src/lib/ui (U2): GlassPanel { as?: string; strong?: boolean; children }, Button { variant: 'cta'|'secondary'|'ghost'|'danger';
//   href?: string; onclick?(): void; arrow?: boolean; children }, ArrowButton, IconButton { label; icon; onclick },
//   Icon { name }, Chip { label; onremove?(): void; href?: string }, Eyebrow
// src/lib/ui (U9):
Dialog:       { open: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; onconfirm(): void; oncancel(): void }
Menu:         { open: boolean; anchor: HTMLElement | null; label: string; items: MenuItem[]; onclose(): void }
MenuItem:     { label: string; icon?: string; disabled?: boolean; danger?: boolean; onselect(): void }
Sheet:        { open: boolean; side: 'left' | 'bottom' | 'full'; label: string; onclose(): void; children }   // Escape and history back close it
FolderPicker: { open: boolean; tree: Tree; current: Id | null; exclude?: Id; onpick(folderId: Id | null): void; oncancel(): void }
EmojiPicker:  { open: boolean; anchor: HTMLElement | null; onpick(emoji: string | null): void; onclose(): void }   // null = remove
// src/lib/shell/toast.ts (U9): toast(message: string, tone?: 'info' | 'error'): void   — host mounted in src/routes/+layout.svelte
// placeholders by U3, filled by their owner:
FolderTree (src/lib/folders/FolderTree.svelte, U13):      { tree: Tree; onnavigate?(): void }   // owns the Folders section's "New folder" action and empty state
NoteProperties (src/lib/notes/NoteProperties.svelte, U16): { note: Note; tree: Tree; tags: TagCount[]; onchange(patch: NotePatch): void }
NoteMenu (src/lib/notes/NoteMenu.svelte, U16):             { note: Note; onchange(patch: NotePatch): void; ondeleted(folderId: Id | null): void }
CommandPalette (src/lib/search/CommandPalette.svelte, U18): {}   // reads palette.open
// later shared components:
NoteCard (src/lib/notes/NoteCard.svelte, U14): { note: NoteCard; index?: number; parts?: SnippetPart[] }   // root carries data-morph="note-<id>"; card menu inside; parts replace the snippet (search)
FolderTile (src/lib/folders/FolderTile.svelte, U14): { folder: FolderTile }
```
Motion (`src/lib/motion.ts`, U2): `reducedMotion()`, `rise`, `stagger(index)` (30 ms × index, capped at 10), `pop`,
`fadeSlide`, `reveal` action, `hideOnOutro` action (aria-hidden on outrostart), `noteName(id) = 'note-' + id`.
`src/lib/shell/morph.ts` (U11): `morphTarget(from: string, to: string): { id: Id; direction: 'forward' | 'back' } | null`,
`pageTransition(navigation)`.

### Routes (owner)

| Route | Files | Owner |
|---|---|---|
| `/` Home | `src/routes/(app)/+page.svelte`, `+page.server.ts` | U1 placeholder, U19 |
| `(app)` layout (load `{ tree, tags }`, `depends('app:tree')`) | `src/routes/(app)/+layout.server.ts` (real in U3), `+layout.svelte` and `src/lib/shell/*` | U3 placeholder, U11 |
| `/notes/[id]` | `src/routes/(app)/notes/[id]/+page.svelte`, `+page.server.ts` | U3 placeholder, U12 |
| `/folders/[id]` | `src/routes/(app)/folders/[id]/+page.svelte`, `+page.server.ts` | U3 placeholder, U14 (body), U20 (header) |
| `/tags/[id]` | `src/routes/(app)/tags/[id]/+page.svelte`, `+page.server.ts` | U3 placeholder, U14 |
| `/search?q=&folder=&tag=` | `src/routes/(app)/search/+page.svelte`, `+page.server.ts` | U3 placeholder, U18 |
| `POST /api/notes` `{ folderId? }` → 201 `{ id }` | `src/routes/api/notes/+server.ts` | U5 |
| `PATCH /api/notes/[id]` `NotePatch` → `{ updatedAt, tags }` \| 404 `{ error: 'deleted' }`; `DELETE` → `{ folderId }` | `src/routes/api/notes/[id]/+server.ts` | U5 |
| `POST /api/notes/[id]/discard` → `{ discarded }` | `src/routes/api/notes/[id]/discard/+server.ts` | U5 |
| `POST /api/notes/[id]/images` raw body → 201 `UploadedImage` \| 413 \| 415 | `src/routes/api/notes/[id]/images/+server.ts` | U7 |
| `POST /api/notes/[id]/files` raw body, `x-filename` (URI-encoded) → 201 `UploadedFile` \| 413 | `src/routes/api/notes/[id]/files/+server.ts` | U7 |
| `POST /api/folders` `{ name?, parentId? }` → 201 `{ id }` | `src/routes/api/folders/+server.ts` | U6 |
| `GET /api/folders/[id]` → `{ folder, counts }`; `PATCH` `{ name?, parentId? }` (400 on own descendant); `DELETE` → `{ parentId }` | `src/routes/api/folders/[id]/+server.ts` | U6 |
| `PUT /api/folders/[id]/cover` raw body → `UploadedImage` \| 413 \| 415; `DELETE` | `src/routes/api/folders/[id]/cover/+server.ts` | U7 |
| `GET /api/search?q=&folder=&tag=&limit=` → `{ hits: SearchHit[]; recent: NoteCard[] }` (recent only when q and filters are empty) | `src/routes/api/search/+server.ts` | U8 |
| `POST /api/preview` `{ url, noteId }` → `LinkPreview` \| 400 `{ error: 'invalid-url' }` | `src/routes/api/preview/+server.ts` | U10 |
| `/images/[id]`, `/files/[id]` (`?download=1`) | `src/routes/images/[id]/+server.ts`, `src/routes/files/[id]/+server.ts` | U7 |
| `/healthz` | `src/routes/healthz/+server.ts` | U1 |
| `/__test/reset`, `/__test/seed`, `/__test/counts`, `/__test/note/[id]` | `src/routes/__test/**` | U3 |
| `/__test/image/[name]` (fake remote images) | `src/routes/__test/image/[name]/+server.ts` | U10 |
| `/__mockups/{home,folder,note,search,drawer,components}`, `/__mockups/photo/[name]` | `src/routes/__mockups/**` | U4 (U9 adds `primitives`) |

JSON endpoints need no CSRF header (Kit checks form content types only); raw-body uploads send their real
`content-type` (image or file MIME), which Kit's check ignores as well.

### E2E helpers — `e2e/helpers.ts` (U3; later units add helpers in their own test files, never here)

```ts
export async function reset(request: APIRequestContext): Promise<void>;
export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult>;
export async function counts(request: APIRequestContext): Promise<Record<'notes' | 'folders' | 'tags' | 'note_tags' | 'images' | 'files' | 'notes_fts', number>>;
export async function storedNote(request: APIRequestContext, id: Id): Promise<StoredNote | null>;   // GET /__test/note/[id] — real DB state
export async function open(page: Page, path: string): Promise<void>;   // goto + wait for html[data-hydrated]
export const calm: (page: Page) => Promise<void>;                      // emulateMedia({ reducedMotion: 'reduce' })
export const photo: (name: string) => string;                          // absolute path of fixtures/mockups/<name>
export function watchSaves(page: Page): { settled(): Promise<void> };  // call before opening the page; settled() waits
  // until no /api/notes request is in flight and [data-save-state] (if present) is not pending/saving — use before every reload
export async function clientNav(page: Page, path: string): Promise<void>;   // in-app navigation through Kit's router
  // (inserts an <a href> into the app root, clicks it, waits for the URL) — for leaving a page before the shell exists

export interface SeedFolder { name: string; parent?: number; cover?: boolean; createdAt?: IsoDateTime }   // parent = index of an earlier folder
export interface SeedNote { title?: string; icon?: string; body?: string; content?: JSONContent; folder?: number;
  tags?: string[]; pinnedAt?: IsoDateTime; createdAt?: IsoDateTime; updatedAt?: IsoDateTime; images?: number; files?: number }
export interface SeedInput { folders?: SeedFolder[]; notes?: SeedNote[] }
export interface SeedResult { folders: Id[]; notes: Id[] }
export interface StoredNote { title: string; icon: string | null; content: JSONContent; bodyText: string; folderId: Id | null;
  pinnedAt: IsoDateTime | null; tags: string[]; updatedAt: IsoDateTime }
```
Reset deletes every row of every table (incl. `notes_fts`). Seed inserts with plain SQL through `seedArchive`
(`body` → `docFromText`, `plainText` for `body_text`, `fold` for tag keys, `indexNote` per note, `testImage(i)` for
covers and note images, a small text file per seeded file), so it needs no later unit.

### E2E conventions
- Each unit owns its e2e files (named in its `files=`); one e2e file per task; no unit edits another unit's e2e file.
- Every data test starts with `reset()`; tests not about motion call `calm(page)` first; every test waits for
  `html[data-hydrated]` (`open`).
- Before any reload or second-page check after an edit: `await saves.settled()` (`watchSaves`).
- Assertions about stored data read real DB state (`storedNote`, `counts`, or the server-rendered page after reload),
  never a mocked response; `page.route` is only for simulating failures (500, abort, delay).
- Device-specific tests skip the other project (`test.skip(info.project.name !== 'desktop', 'hover is desktop-only')`);
  other viewports (1100, 1440, 1600) run in the desktop project only.
- Each e2e file declares its own window globals under a per-file name.
- A new e2e file runs with `--repeat-each 5` before its commit.
- Screenshots go to `test-results/shots/U<n>-<project>-<slug>.png` and are not committed.

## Risks / Trade-offs

- [R1 Tiptap licensing / Svelte 5] → resolved: MIT 3.32.2, vanilla Editor in `onMount` (research.md).
- [R2 no official slash menu] → owned on `@tiptap/suggestion` (U15).
- [R3 real-device touch behaviour of handle, bubble and slash menus unverified] → drag desktop-only, block menu on phone,
  bubble below the selection on touch, `visualViewport` placement; manual Gate 2 check on iOS Safari / Android Chrome.
- [R4 custom nodes] → vanilla DOM node views, one scenario per block.
- [R5/R6 plain text and schema drift] → hand-written walker on the server; `sanitize.ts` in the browser.
- [R7 SSRF and slow sites] → `safeFetch`, fake remote in tests; live check is manual at Gate 2.
- [R8 Openverse down] → second source (Wikimedia Commons), ≤ 10 fetches, synthetic fallback.
- [Drag-handle peers pull y-tiptap / collaboration] → accepted; bundle grows a little, nothing is configured.
- [Undo or cut-and-paste after an upload was removed] removing a block and saving only marks the upload; for an hour
  Ctrl+Z, or pasting the cut block into another note, takes it back (Rue's pick after review, replacing delete-at-once);
  after the hour it answers 404. A cut from a fresh note that is discarded as empty on leaving loses its upload with
  the note → accepted.
- [Uploaded but never saved] an upload whose block is removed before the first save stays until the note is deleted →
  accepted; only ids the previous stored body referenced are deleted, so a slow older save can't delete a fresh upload.
- [Tags don't fold `ß`] `fold()` for tag keys stays NFC + lowercase, so tags "Straße" and "Strasse" are two tags; tag
  *search* still finds both → accepted.
- [Uploaded HTML/SVG served from the app origin] → inline only for a safe list, `nosniff`, `CSP: sandbox`.
- [Two devices] last write wins (non-goal); the deleted-elsewhere case is detected by the 404.
- [Wide parallel scope, 22 units] → contract unit, fixed editor composition, per-unit files and e2e files.
- [`workers: 1` × two projects makes `proof:full` long (estimate 15–20 min at the end)] → builders run it in the
  background, once per unit.
- Mockup routes stay in the build (404 without the flag); their photos never ship.

## Migration Plan

New app, no data. Deploy is the split-off change; migrations are additive.

## Open Questions

None blocking. The look pick is the planned ⏸ checkpoint (task 4.6), not an open question.

## Build notes (handoffs between units, written by the orchestrator)
