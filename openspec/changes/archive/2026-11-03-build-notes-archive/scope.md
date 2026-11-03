# Scope: build-notes-archive

Triage: feature — new app from scratch: Notion-style block editor, nested folders, tags, full-text search, editorial light UI. Appetite: several long sessions (comparable to build-creative-archive), one change for everything.

## Problem
Rue has no single place of her own to write digital notes and keep them. She wants a private archive on her homelab where every note stays, organised in folders and tags, findable by full-text search, and written with Notion's editing mechanics — in a calm, editorial look of her own rather than a generic notes app.

## Flows
- Capture: Home (or any page) → "New note" → empty note opens with the cursor in the title → type title, body with slash menu / markdown shortcuts → autosaved → back to Home, note shows under "Recently edited".
- Capture into a folder: folder page → "New note" → note is created inside that folder.
- Write and format: select text → bubble toolbar (bold, italic, strike, code, link, colour) · type "/" → slash menu → pick a block · type "# ", "- ", "1. ", "[] ", "> ", "```" → block converts.
- Rearrange blocks: desktop drag via ⋮⋮ handle · phone (and desktop) tap ⋮⋮ → block menu → Move up / Move down / Turn into / Delete.
- Add media: paste or drop an image or file into the editor, or "/image", "/file" → upload → inline block. Paste a URL alone on an empty line → link preview card.
- Organise: note properties row → Folder picker, Tags chips with autocomplete · sidebar → create / rename / move / delete folder, set folder cover photo.
- Browse: sidebar tree (desktop) or bottom-bar "Folders" → drawer (phone) → folder page with sub-folders and notes → note. Tag in sidebar → tag page → note.
- Find: Cmd/Ctrl+K anywhere (or search button) → type → results with highlighted snippet → Enter opens note · "See all results" → search page with folder and tag filters.
- Pin: note header or card menu → Pin → note appears under "Pinned" on Home; Unpin removes it.
- Delete: note header menu or card menu → Delete → confirm dialog → gone; folder menu → Delete → confirm with counts → folder, sub-folders and their notes gone.
- Design checkpoint: `/__mockups` (Home, folder page, note, search, phone drawer) with CC0 photos → Rue approves the look → build continues.

## In scope

### Foundation
- **S1** The repo has the Creative Archive harness: SvelteKit 3 + Svelte 5 + Vite + TS, adapter-node, node:sqlite with numbered SQL migrations, `proof` (svelte-check --fail-on-warnings, build, vitest) and `proof:full` (+ Playwright phone 390×844 and desktop 1280×800 against `node build`), `/healthz`, env-gated `/__test/*` reset and seed routes, `npm run package` tarball. CLAUDE.md declares `## Harness`.
  - edges: first run with no DB file → migrations create it; e2e uses a per-port DB removed before each run.
- **S2** Design system in a light, warm world: greige stone ground with peach light, dark ink, one earthy accent (bronze, moss or slate); neutral white frosted-glass material (sheen, thin bright rim, long soft shadows) for nav, panels and cards; font pairing Newsreader (display, italic accent word) + Figtree (UI and note text; changed from Bricolage Grotesque in look revision 1), self-hosted woff2 with OFL licences; radii, spacing, type and motion tokens; small tracked uppercase eyebrows; dark CTA pill with a round arrow button. A design-token test bans raw colours in components and a motion test bans animating anything but transform and opacity (as in Creative Archive).
  - edges: browser without `backdrop-filter` → solid fallback surface with the same contrast; text on glass meets WCAG AA.
- **S3** Mockup checkpoint: env-gated `/__mockups` pages render Home, a folder page, a note in the editor, the search palette and the phone drawer with static data and CC0 folder-cover photos stored in the repo with a credits file; Rue approves them before screens are built. Her picks (accent colour, glass strength, card style) are recorded in design.md and the specs.
  - edges: photo source down → second CC0 source; a missing photo shape is covered synthetically.

### Shell and navigation
- **S4** Desktop (≥ 1024px): a persistent glass sidebar with Home, Search (opens palette), New note, the folder tree (folders and their notes, expandable, current item highlighted), and a Tags section; the sidebar can be collapsed and the collapsed state is remembered per browser.
  - edges: empty tree → "No folders yet" with a "New folder" action; long names truncate with a tooltip; deep nesting indents up to a cap, then keeps the indent.
- **S5** Phone (< 1024px): a bottom glass bar with Home, Search, New note (+) and Folders; Folders opens the same tree as a drawer; choosing an item navigates and closes the drawer.
  - edges: drawer closes on back gesture/Escape; bottom bar hides while the soft keyboard is open in the editor.
- **S6** Wide layouts (≥ 1280px) use the width: content column for notes is capped for reading (~720px) and centred in the area right of the sidebar; Home and folder grids add columns instead of stretching cards.
  - edges: 1024–1279 → sidebar + fewer grid columns.
- **S7** Motion as rich as Creative Archive: note card morphs into the note page via View Transitions (and back), lists stagger in, page transitions fade/slide, glass hover glows; inside the editor while typing nothing animates except menus opening. Reduced motion → no morph, short fades only.
  - edges: browser without View Transitions → plain navigation.

### Home
- **S8** Home shows a typographic hero (eyebrow, two-line display headline with one word in the accent colour, a glass search bar that opens the palette, a "New note" CTA pill) and below it a bento of: Pinned notes, Recently edited (the 8 most recently updated notes), and Folders (top-level folders as cover tiles with name and note count).
  - edges: first run (no notes) → welcome state with "Write your first note"; no pinned notes → Pinned tile hidden; folder without cover → typographic tile in a warm tint.

### Notes
- **S9** Creating a note: "New note" creates an untitled note (in the current folder when started from a folder page or a folder's menu, otherwise at the root) and opens it with the cursor in the title.
  - edges: a new note left completely empty (no title, no content) is discarded when the user navigates away; a note with only a title is kept.
- **S10** Note page layout: optional icon (emoji picker; click to change or remove), large title, a properties row (Folder, Tags, Pinned), then the body. Untitled notes show "Untitled" in cards, tree and tab title.
  - edges: very long title wraps; emoji picker is usable on phone.
- **S11** Autosave: title, body, icon, folder, tags and pin save automatically (debounced while typing, flushed on blur and before navigating away); a quiet status shows "Saving…" / "Saved". A failed save shows the toast "Couldn't save — try again" and keeps the local content so the next edit or retry saves it.
  - edges: server unreachable → content stays in the editor, retry on next change; navigating away with a pending save waits for it; two devices editing the same note → last write wins (see Non-goals).
- **S12** Note cards (Home, folder page, tag page, search page) show icon, title, a 2–3 line plain-text snippet, tag chips (max 3, "+n"), relative edited time ("2h ago") and a pin marker; a card menu offers Pin/Unpin, Move to…, Delete.
  - edges: note with no text body → snippet area shows "Empty note"; a note whose body starts with an image shows the first text after it.
- **S13** Deleting a note asks "Delete “<title>”? This can't be undone." and on confirm removes the note, its tag links and its uploaded images/files; the user lands on the parent folder page (or Home).
  - edges: cancel keeps everything; deleting the note that is open in another tab → that tab shows "This note was deleted" on its next save.
- **S14** Pinning: Pin/Unpin from the properties row or card menu; pinned notes appear in Home's Pinned tile, most recently pinned first.
  - edges: unpinning the last note hides the tile.

### Editor (Tiptap)
- **S15** Markdown input shortcuts: `# `/`## `/`### ` headings, `- `/`* ` bullet list, `1. ` numbered list, `[] ` task list, `> ` quote, ```` ``` ```` code block, `---` divider; plus Cmd/Ctrl+B/I/E/K and undo/redo.
  - edges: shortcuts don't fire inside code blocks.
- **S16** Slash menu: typing `/` at the start of a block or after a space opens a menu of all block types (Text, Heading 1–3, Bullet list, Numbered list, Task list, Quote, Code, Divider, Toggle, Callout, Table, Image, File); typing filters it, arrow keys + Enter choose, Escape or a space with no match closes it and leaves the typed text.
  - edges: no match → "No results"; on phone the menu stays visible above the soft keyboard.
- **S17** Bubble toolbar on text selection: Bold, Italic, Strikethrough, Inline code, Link (add/edit/remove URL), Text colour (a small fixed palette of tokenised colours + Default).
  - edges: hidden inside code blocks; on touch devices it is placed below the selection so it doesn't cover the native selection menu.
- **S18** Block handle: hovering a block on desktop shows ⋮⋮; dragging it moves the block (drop indicator line); clicking or tapping it opens the block menu: Move up, Move down, Turn into (text/heading/list/quote/callout…), Delete. The block menu is the way to reorder on phone.
  - edges: Move up on the first block / Move down on the last is disabled; dragging a toggle moves its content with it.
- **S19** Extra blocks: Toggle (collapsible, title + nested content; open state not saved), Callout (emoji + tinted panel with text), Quote, Code block with syntax highlighting and a language picker, Table (add/remove rows and columns, header row), Divider, Task list (checkbox toggles persist).
  - edges: nested lists and toggles inside toggles work; a table on phone scrolls horizontally inside its block.
- **S20** Images inline: paste, drop or "/image" uploads an image; the server converts it to WebP (sharp) and stores it in SQLite; the block shows it at column width with an optional caption.
  - edges: HEIC is refused like any non-image ("That file isn't an image"); an image or file whose block is removed is deleted from the database as soon as the note saves; > 16 MB or not an image → toast "That image is too large" / "That file isn't an image"; upload in progress shows a placeholder; failed upload removes the placeholder with a toast.
- **S21** Files inline: dropping a non-image file or "/file" uploads it as-is (≤ 16 MB) and inserts a file card (type icon, name, size); clicking opens it in a new tab (PDFs display in the browser) with a download fallback.
  - edges: > 16 MB → toast "Files can be up to 16 MB"; empty file allowed; filename with umlauts/spaces preserved.
- **S22** Link previews: pasting a URL alone into an empty paragraph turns it into a link preview card (title, description, site name, image when present); the server fetches the page's metadata with a timeout, stores the preview image as WebP and never hotlinks. A URL inside a sentence stays an inline link. Undo right after the paste turns the card back into a plain link.
  - edges: fetch fails / times out / non-HTML → card with domain and URL only; private-network URLs are not fetched (SSRF guard); invalid URL → stays plain text.
- **S23** Note content is stored as ProseMirror JSON; on every save the server derives plain text (title + body text + tag names) for search and the snippet.
  - edges: unknown node types from an older schema still render as text and still index.

### Folders
- **S24** Folders nest without a depth limit: create (at root or inside a folder), rename (inline in the tree), move to another folder or the root via a "Move to…" picker that excludes the folder itself and its descendants.
  - edges: empty name → "Untitled folder"; duplicate sibling names allowed; moving into own descendant is impossible.
- **S25** Folder page: breadcrumb, cover photo header (if set) with name and counts, sub-folders as cover tiles, then the folder's notes as cards sorted by last edited; "New note" and "New folder" actions.
  - edges: empty folder → "Nothing here yet" with both actions.
- **S26** Folder cover: upload or replace a cover photo (WebP in SQLite, ≤ 16 MB) or remove it from the folder page header.
  - edges: wrong file type / too large → toast; removing shows the typographic tile again.
- **S27** Moving a note: Folder picker in the properties row (and "Move to…" on cards) moves it to any folder or the root.
  - edges: the tree and Home update without reload.
- **S28** Deleting a folder asks "Delete “<name>”? This deletes N folders and M notes inside it. This can't be undone." (counts include all descendants) and on confirm removes the folder, all descendant folders and all their notes with their uploads.
  - edges: empty folder → message without counts; deleting the folder containing the open note → navigate to the parent.

### Tags
- **S29** Tags in the properties row: chips with an input that autocompletes existing tags; Enter or comma adds, Backspace on empty input removes the last chip; a new name creates the tag. Tag names are unique ignoring case, umlaut-safe (e.g. "Übung" = "übung").
  - edges: whitespace-only → ignored; duplicate on the same note → ignored; a tag no note uses anymore disappears.
- **S30** Tags in the sidebar (Tags section) list all tags with counts; a tag page lists its notes as cards, sorted by last edited.
  - edges: no tags → section hidden.

### Search
- **S31** Full-text search with SQLite FTS5 over title, body text and tag names: prefix matching while typing, diacritic-insensitive ("uber" finds "über") and ß-folding ("strasse" finds "Straße" and the reverse; snippets keep the original text), ranked, with a highlighted snippet per result.
  - edges: empty query → no results list (palette shows recent notes instead); special characters (`"`, `*`, `-`, `(`) never cause an error; no hits → "No notes match “<q>”".
- **S32** Command palette: Cmd/Ctrl+K (and the search buttons) opens a glass palette from anywhere; it shows recent notes when empty, results while typing, actions "New note" and "New folder", arrow keys + Enter, Escape closes; "See all results" opens the search page.
  - edges: opening it inside the editor doesn't lose the selection or content; on phone it's full-screen.
- **S33** Search page `/search?q=…` with folder (includes sub-folders) and tag filters, combinable, reflected in the URL.
  - edges: filter with no query → lists all notes matching the filters.
- **S34** A "Search" item in the note header's ⋯ menu opens the command palette (added 2026-11-03 after build, Rue-approved): on phone the bottom bar is inert while the editor has focus (S29), so a touch-only device had no way to open the palette from a note.
  - edges: works with the editor focused; the palette keeps the editor's selection (S32).

## Non-goals
- Dark mode or a theme toggle — Rue chose light and warm only.
- Note cover photos and "first image as card thumbnail" — photos live on folder covers only.
- Trash / restore — deletion is immediate after confirmation, by choice.
- Real-time sync, collaboration, conflict detection between two open devices — single user; last write wins.
- Auth, multi-user, public sharing of notes — single user on the homelab (as Creative Archive).
- Offline / PWA / share target.
- Import (Markdown, Apple Notes) and export — fresh start; backups come from the homelab's SQLite backups.
- Sub-pages inside notes, wiki links / backlinks, mentions — folders contain notes, nothing else.
- Templates, databases/board views, comments, AI.
- Version history of a note (beyond editor undo during the session).
- Tag rename, merge, colours; sorting options other than last edited.
- Dragging notes or folders in the sidebar tree — moving is via "Move to…".
- Touch drag for blocks on phone — the block menu covers reordering there.
- Deploy to the homelab and the GitHub repo/CI/release workflows — a separate change after this one (as Creative Archive).

## Codebase touchpoints
- New repo `/home/Rue/Repos/Notes-Archive` (empty, openspec initialised).
- Copy from `/home/Rue/Repos/Creative-Archive` (explorer: what can be reused): package.json scripts and dev deps, `vite.config.ts`, `playwright.config.ts`, `scripts/package.mjs`, `src/lib/server/db.ts` + migrations pattern, `src/lib/server/images.ts` (sharp → WebP BLOB, 16 MB), `/healthz`, `/__test/*`, `/__mockups` routes, the CLAUDE.md Harness block, `src/lib/styles/{tokens.css,global.css,tokens.ts}` structure, `.glass` / `GlassPanel.svelte` (re-tuned to clear frosted glass), `src/lib/motion.ts` + `motion.test.ts`, `src/lib/shell/morph.ts` (View Transitions morph), Bricolage Grotesque + Figtree woff2 from `static/fonts/`.
- Link preview (explorer: link-preview reuse): `src/lib/server/{preview.ts,remote.ts,net.ts}` — og:title/description/image with `<title>`/icon fallbacks, `safeFetch` (http/https only, private/loopback/CGNAT refused, 3 re-checked redirects, 5 s, 1 MB page cap, text/html only), preview image via sharp ≤1600px ~200 KB WebP; test fake `fake/remote.ts` + `fake/pages.ts` behind the test flag. Creative Archive's endpoint returns nulls on failure → S22's "domain + URL only" card.
- UI primitives to adapt: `src/lib/shell/{Toast.svelte,toast.ts}`, confirm dialog `src/lib/entries/DeleteEntry.svelte` (focus trap), menu `src/lib/collections/AddToCollection.svelte` (role=menu, arrow keys), `src/lib/entries/TagInput.svelte` + `src/lib/ui/Chip.svelte` (client-side filter of `listTags()`), `src/lib/ui/{Icon.svelte,IconButton.svelte}` (inline SVG map). New here: drawer/sheet, command palette, sidebar tree, emoji picker — none exist in Creative Archive.
- Tags: `fold()` in `src/lib/text.ts` (NFC, trim, collapse spaces, JS lowercase) → `name_key` UNIQUE; `pruneTags` removes orphans (`src/lib/server/tags.ts`).
- Mockups: `src/routes/__mockups/` gated by `requireTestFlag()` (404 otherwise, guard test), fixture data in `src/lib/mockups/fixtures.ts`, photos in `fixtures/mockups/*.jpg` served by `photo/[name]/+server.ts`, `CREDITS.txt` checked by `credits.test.ts`, `scripts/synthetic-photo.mjs` for synthetic fallbacks; CC0 photos came from StockSnap via the Openverse API.

## Risks
- R1 Tiptap 3 licensing and Svelte 5 integration → resolved: all needed extensions are MIT on npm (3.32.2), no account; mount the vanilla Editor in onMount, editor outside deep `$state` (research.md).
- R2 No official slash menu extension → accepted: built on `@tiptap/suggestion` from the docs experiment; we own it (S16).
- R3 Touch behaviour of drag handle, bubble menu and slash menu on real iOS Safari / Android Chrome is unverified → accepted: drag is desktop-only with the block menu on phone (S18), bubble toolbar placed below the selection on touch (S17); real-device check is a manual Gate 2 item since Playwright only emulates phones.
- R4 Callout, file card and link preview need custom nodes/node views → accepted: vanilla DOM node views, scenarios per block.
- R5 Plain-text derivation for FTS on the server → resolved by design: a hand-written JSON walker, no DOM needed (S23).
- R6 ProseMirror JSON schema changes later → accepted: S23 edge (unknown nodes still render and index).
- R7 Link-preview fetches from the server (SSRF, slow sites) → accepted: timeout, size cap, private-network guard, test fake (S22).
- R8 Mockup photos: Openverse has been down for long stretches before → accepted: second CC0 source named in the brief, capped fetches, synthetic fallback (S3).

## Decisions
- Archive = the library of all notes; no archived/active state — Rue's model.
- Folders contain notes (nested, unlimited depth); notes have no children; tags cut across — Rue picked this model over Notion's pages-in-pages.
- Notion editing mechanics with Tiptap 3 — Rue asked for "the same mechanism as Notion"; all four mechanics (slash + shortcuts, bubble toolbar, drag handle, extra blocks).
- Images and files inline as blocks; links in the text, a URL alone on a line becomes a preview card — Rue's picks; the "alone on a line" rule is how Notion decides bookmark vs inline link.
- Delete is immediate after a confirm dialog, folder delete takes all contents — Rue's picks.
- Autosave, no save button — Notion mechanics; Creative Archive's error toast copy reused.
- Light, warm world, clear frosted glass, Newsreader + Figtree (was Bricolage Grotesque, look revision 1), rich motion like Creative Archive — Rue's picks; accent colour and glass strength decided at the mockup checkpoint.
- Photos only as folder covers; Home hero is typographic — Rue's picks.
- Desktop sidebar with tree; phone bottom bar + drawer — Rue's picks.
- UI language English — as Creative Archive.
- Homelab, single user, no login, desktop and phone — Rue's pick; deploy is a separate change.
- One change for everything, with a mockup checkpoint before building screens — Rue's picks.
- Repo bootstraps with a `chore: bootstrap` commit on main (openspec scaffold) so flow has a base — as Creative Archive.

## Done when
- `npm run proof:full` is green on the branch, phone and desktop projects.
- Rue approved the mockups at the checkpoint, and the built screens match them.
- On her phone and desktop (dev server) she can: create a note, format it with slash menu, shortcuts and the bubble toolbar, add a toggle, callout, code block, table, image, PDF and a link preview, reorder blocks (drag on desktop, block menu on phone), file it in a nested folder, tag it, pin it, find it with Cmd+K by a word from the body, and delete it and a folder with confirmation.
- Reloading shows everything exactly as left.

## Split off
- Deploy: homelab role, GitHub repo, CI and release workflows (`ship`/`release` policy) — next change, as for Creative Archive.
