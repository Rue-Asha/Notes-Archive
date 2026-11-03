# Research: build-notes-archive (explore, 2026-11-02)

## Inspo images (~/Pictures/UI-inspo/)
Shared thread across all five:
- Frosted glass panels floating over a full-bleed photo backdrop; the photo is the atmosphere, the UI sits on top.
- Floating pill nav (centred), round icon button for search, dark CTA pill with a white arrow-circle.
- Bento tiles with large radii (~24–32px) under the hero: featured card with photo + text, a stat strip, a dark "story" tile.
- Display headline, light weight, two lines, one word set in an accent colour ("Spaces That *Inspire*", "Discover Journeys *Beyond* Ordinary").
- Small tracked uppercase eyebrows ("ARCHITECTURE — INTERIORS — LANDSCAPES"), thin vertical-rule tag lists on the right.
- Counters "01 / 06", "01/20"; coverflow of tilted photo cards (Mindframe).
- Vertical icon rail on the left (architect site).
- Drink-bar concept: bento with saturated colour blocks (moss green, signal red) and a **date tile "12 Sep 2024"** with a list — a natural fit for dated notes.
- Palettes: warm sand/stone neutrals + one dark ink; one grey/black variant (AI platform).

## Creative Archive (sibling app) — what exists
- Stack: SvelteKit 3, Svelte 5, Vite 8, TS 6, adapter-node, node:sqlite (WAL, numbered SQL migrations), sharp → WebP BLOBs in SQLite (16 MB), vitest + Playwright (phone 390×844, desktop 1280×800, workers 1). `proof` = svelte-check --fail-on-warnings + build + vitest; `proof:full` + Playwright against `node build`.
- Ship: homelab, single user, no auth; Node tarball via `scripts/package.mjs`; GitHub workflows ci.yml → gate.yml (self-hosted homelab-check runner), release.yml on `v*` tag bumping the pin in Homelab-Managment. `ship: merge`, `release: tag`. Creative Archive itself was copied from Rues-Cooking-Hub.
- Design system: `src/lib/styles/{tokens.css,global.css,tokens.ts,worlds.ts}`; self-hosted fonts (pairing a: Bricolage Grotesque + Figtree; b: Syne + Manrope; c: Bodoni Moda + Hanken Grotesk); dark base, named accents; `.glass` matte liquid glass (grain + backdrop-filter + rim + sheen), `GlassPanel.svelte`; radii 8…40 + pill, spacing 4…96, type scale display 40/32/26 → 64/44/32 at ≥1024; motion tokens + `motion.ts` helpers; `motion.test.ts` bans non-transform/opacity animation, `transition: all`, raw colours.
- Shell: floating pill nav on desktop, bottom tab bar on phone (switch at 1023px); View Transitions card→detail morph (`shell/morph.ts`).
- Home: PhotoHero + Coverflow ("01 / N") + Shelf rows + CollectionsBento.
- Data: wide `entries` table, `tags` (name_key UNIQUE, case-insensitive) + `entry_tags`, `collections` + `collection_entries`, `images`, `heroes`. No FTS; global/full-text search was a non-goal there.
- Notes/markdown precedent: Creative Archive has only a plain `note` textarea. Rues-Cooking-Hub renders markdown with markdown-it (`html: false`). Life-Manager has `marked`. No WYSIWYG editor (tiptap/prosemirror/codemirror) anywhere.
- Rue's process preferences there: mockups checkpoint (`/__mockups` with CC0 photos) before building, one change for everything, unsaved-changes guard, optimistic writes with error toast + revert, UI language English, GitHub repo created at ship.

## Mobbin (web unless noted)
Library / home
- Mymind dark feed — masonry of mixed cards under a big "Search my mind…" header, composer as first card: https://mobbin.com/screens/6358c67c-395f-43b8-9b91-cb5c7c41c9b8 (light: https://mobbin.com/screens/98a11946-f85e-4c88-ba05-46955efb9871)
- Craft All Docs — cards with snippet or cover, star = pinned, "Updated x ago", tag sidebar, grid/list/compact toggle: https://mobbin.com/screens/58c71118-15cc-4e28-945c-e446472a9e44
- Fabric timeline — masonry under date headers, kind/tag/sort filters: https://mobbin.com/screens/afa33770-c61c-49aa-9772-ca7b8111ef2f
- Bear iOS list — title, 2-line preview, thumbs, relative time, pin: https://mobbin.com/screens/595f016f-bcb8-469f-81e7-6a043d3c9f53

Editor
- Slite — big title, inline Tag/Description rows, then body: https://mobbin.com/screens/326544de-ba4a-4bda-8e08-cd2cbe984f8a
- Mymind reader — text left, right rail with tags/notes/age: https://mobbin.com/screens/5a972aa7-0113-4f37-bdf5-2008b2d1a187
- Skiff — minimal chrome, slash menu + floating bottom toolbar: https://mobbin.com/screens/3724fbfd-7b1f-473b-a032-df0e526b3b27
- Microsoft Loop — add icon / add cover above title: https://mobbin.com/screens/a707306c-64b2-4da3-ae61-0d558f6f6e04

Organisation / archive
- Bear iOS sidebar with tags + icons: https://mobbin.com/screens/192baa1d-4e66-488f-9f45-8d9d61ecb072 ; tag icon picker: https://mobbin.com/screens/1be61c5e-0de6-4db3-87ad-5ed31aeca159 ; pin menu: https://mobbin.com/screens/017eccc9-c1d8-473a-93e0-3e7d82f98d5a
- Aboard Archive sidebar item: https://mobbin.com/screens/b8fbc951-725a-4c6f-b924-0840606df0b1
- Pinterest boards, Archived filter + Recently deleted + restore toast: https://mobbin.com/screens/31adf911-c06f-4208-9660-317775f9066c
- Savee black masonry + sort menu: https://mobbin.com/screens/9a2e8ebd-13df-45cf-9c1e-fe38ee230783

Search / capture
- Mymind inline composer (Cmd+Enter): https://mobbin.com/screens/7d199296-46b6-41bc-9092-5bfb1fdd6be3 ; tag popup: https://mobbin.com/screens/6e05c059-8bb8-47be-aef1-f224129a1b96
- Fabric tag dialog with "Create tag": https://mobbin.com/screens/3cac0fe9-70bd-4b90-8e35-1b1491f8939b
- Loop command palette: https://mobbin.com/screens/24f59200-51a6-4d71-a02d-6428f2ead199 ; Pitch: https://mobbin.com/screens/523024d0-46cf-401d-96ba-26a4c58f7714 ; v0: https://mobbin.com/screens/5f353fc3-d9ce-4d1c-be9b-cc1b4ad07578
- Tana "Ask or Capture…" bar as home hero: https://mobbin.com/screens/91e0b7f8-65be-4bcb-811a-551a735b66d6

Editorial
- Telescope collection — light display title, meta line, architecture photo grid: https://mobbin.com/screens/34cf841d-aa96-4d71-b60e-58294019a489
- Cosmos — centred title, round action buttons, floating pill nav: https://mobbin.com/screens/54d2bb23-4a98-4b80-9a86-338f15367225
- Curater — text-forward cards, small-caps label, serif excerpt, icon rail: https://mobbin.com/screens/4d09b54b-2d0e-4ebe-8a50-390882bc483e
- Gemini Notebook — full-bleed cover tiles with title, date, source count: https://mobbin.com/screens/78bb5866-1d24-46ff-be30-a35cbdce7a8d

## Dialogue decisions so far
- Note content: formatted text, images/photos, links/bookmarks, files (PDF etc.).
- "Archive" = the library of all notes (everything stays; browse and search in it), not an active→archived workflow.
- Organisation: tags AND folders/notebooks.
- No import; fresh start.
- Editor: Notion mechanics — slash menu + markdown shortcuts, bubble toolbar on selection, drag handle, extra blocks (toggle, callout, quote, code with syntax, table, divider).
- Images and files inline in the text (as blocks).
- Folders nested; folders contain notes, notes have no sub-notes. Tags cut across.
- Links: links in the text, rendered with a preview card.
- Search: full text over title and body, highlighted snippet, Cmd+K palette from anywhere, filter by tag/folder.
- Runs on the homelab, single user, no login, writes on desktop and phone.
- Note header: icon/emoji and pin/favourite (no cover photo, no visible created/updated date requested).
- Delete: immediate, with a confirmation dialog (no trash).
- Tags: a properties row under the title with chips + autocomplete.
- Home: editorial home — photo hero with glass panel (search / new note), bento below: pinned, recently edited, folder tiles.

## Editor spike research (Tiptap)
- Tiptap v3 (npm 3.32.2) is MIT for everything needed: starter-kit, DragHandle, BubbleMenu, Details (toggle), Table, CodeBlockLowlight, TaskList, FileHandler, Placeholder, UniqueID, suggestion. DragHandle/Details/FileHandler/UniqueID went MIT in June 2025 (https://tiptap.dev/blog/release-notes/were-open-sourcing-more-of-tiptap); paid bundles (AI, collab, comments, conversion) not needed.
- No official slash extension: the docs "experiment" (https://tiptap.dev/docs/examples/experiments/slash-commands.md) is copied and owned, built on @tiptap/suggestion. Markdown shortcuts are built-in input rules.
- Callout and bookmark (link preview) need custom nodes/node views.
- Svelte: no @tiptap/svelte; official guide mounts vanilla Editor in onMount (https://tiptap.dev/docs/editor/getting-started/install/svelte). Keep editor out of deep $state ($state.raw + version counter); menu elements must exist before configure; pad .ProseMirror left for the handle.
- Alternatives (BlockNote, Novel, Yoopta: React; Milkdown, Editor.js: no Notion block UI) — none cheaper than Tiptap in Svelte.
- Storage: ProseMirror JSON as source of truth; plain text for FTS5 derived on save (hand-written JSON walker is safest; generateText in Node unverified).
- Mobile risks (unverified, no reports found): DragHandle uses HTML5 drag (poor on touch) → block-menu move up/down fallback; bubble menu vs native selection toolbar; slash menu vs soft keyboard (visualViewport).
