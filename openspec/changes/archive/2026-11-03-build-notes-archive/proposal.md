## Why

Rue has no single place of her own to write digital notes and keep them. She wants a private archive on her homelab
where every note stays, organised in folders and tags, findable by full-text search, and written with Notion's editing
mechanics — in a calm, editorial look of her own rather than a generic notes app.

## What Changes

A new SvelteKit 3 app in `/home/Rue/Repos/Notes-Archive`, built in one change (scope.md S1–S33):

- **Foundation (S1–S3):** Creative Archive's harness (node:sqlite with numbered migrations, vitest + Playwright on
  phone 390×844 and desktop 1280×800 against `node build`, `proof`, `proof:full`, `/healthz`, env-gated `/__test/*`,
  `npm run package`); a light, warm design system (sand/stone ground, dark ink, one warm accent, clear frosted glass,
  Newsreader + Figtree self-hosted); a `/__mockups` checkpoint with CC0 folder-cover photos where the build
  pauses until Rue approves the look and picks accent, glass strength and card style.
- **Shell and motion (S4–S7):** a collapsible glass sidebar with the folder tree and tags on desktop, a bottom glass bar
  and a tree drawer on phone, wide layouts that add columns, View Transitions card → note morph, staggered lists and
  hover glows, a quiet editor, and a reduced-motion path.
- **Home and notes (S8–S14):** a typographic Home with Pinned, Recently edited and Folders; notes with icon, title,
  properties row (folder, tags, pin) and body; autosave with a quiet status and an error toast; note cards with a
  card menu; delete with confirmation; pinning.
- **Editor (S15–S23):** Tiptap 3 mounted as a vanilla editor: markdown shortcuts, our own slash menu on
  `@tiptap/suggestion`, a bubble toolbar with links and tokenised text colours, a block handle with drag on desktop and
  a block menu everywhere, toggles, callouts, highlighted code, tables, task lists, inline images (WebP in SQLite) and
  files, link preview cards fetched server-side behind an SSRF guard; content stored as ProseMirror JSON with plain
  text derived on the server.
- **Folders and tags (S24–S30):** unlimited nesting with create / rename / move / delete (with counts), folder pages
  with cover photos, moving notes, tags with umlaut-safe dedupe and autocomplete, tag pages.
- **Search (S31–S33):** SQLite FTS5 over title, body and tags (prefix, diacritic-insensitive, ranked, highlighted
  snippets), a Cmd/Ctrl+K command palette, and a search page with folder and tag filters in the URL.

## Capabilities

### New Capabilities
- `harness`: proof commands, e2e isolation per port, test-only routes and helpers, migrations, health route, package tarball, harness declaration (S1).
- `design-system`: tokens of the light warm world, look switches (accent, glass, card), glass material and fallback, fonts, style guards, mockup photos, mockups and the approval checkpoint (S2, S3).
- `shell`: desktop sidebar and folder tree, phone bottom bar and drawer, wide layouts, sidebar tags section (S4, S5, S6, S30 sidebar part).
- `motion`: card → note morph, page transitions, staggered lists, glass hover glow, the quiet editor, reduced motion (S7).
- `home`: typographic hero and the Pinned / Recently edited / Folders bento (S8).
- `notes`: creating, the note page, autosave, note cards, deleting and pinning notes (S9–S14).
- `editor`: markdown shortcuts, slash menu, bubble toolbar, block handle and block menu, extra blocks, content storage and derived text (S15–S19, S23).
- `media`: inline images and files — upload, storage, serving and their blocks (S20, S21).
- `link-preview`: preview cards for pasted URLs and the guarded server fetch (S22).
- `folders`: folder create / rename / move, folder pages, covers, moving notes, deleting folders (S24–S28).
- `tags`: tag input with autocomplete and dedupe, tag pages (S29, S30).
- `search`: FTS5 full-text search, the command palette and the search page (S31–S33).

### Modified Capabilities
None (the repo has no specs yet).

## Impact

- New repo content: SvelteKit app, `migrations/`, `e2e/`, `scripts/`, `fixtures/mockups/`, `static/fonts/`,
  `CLAUDE.md`, `README.md`.
- Dependencies: runtime `sharp`, `@tiptap/*` 3.32.2 (MIT: core, pm, starter-kit, extensions, extension-list,
  extension-details, extension-table, extension-code-block-lowlight, extension-drag-handle, extension-bubble-menu,
  extension-file-handler, extension-text-style, suggestion), `lowlight`; dev: Kit 3, Svelte 5, Vite 8, TypeScript 6,
  vitest, Playwright — same pins as Creative Archive.
- External calls at runtime: only the link-preview fetch of URLs Rue pastes (guarded, 5 s, 1 MB). Tests and CI never
  call the network (fake remote in test mode).
- No GitHub repo, CI or deploy in this change (split off, as for Creative Archive); `ship: ask`, `release: none`.

## Non-Goals

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

## Done criteria

- [ ] `npm run proof:full` is green on the branch, phone and desktop projects.
- [ ] Rue approved the mockups at the checkpoint, and the built screens match them.
- [ ] On her phone and desktop (dev server) Rue can create a note and format it with the slash menu, markdown shortcuts and the bubble toolbar.
- [ ] She can add a toggle, a callout, a code block, a table, an image, a PDF and a link preview to that note.
- [ ] She can reorder blocks: by drag on desktop, by the block menu on phone.
- [ ] She can file the note in a nested folder, tag it and pin it.
- [ ] She finds it with Cmd/Ctrl+K by a word from its body.
- [ ] She can delete the note and a folder, each after a confirmation.
- [ ] Reloading shows everything exactly as left.

## Appetite

Several long sessions (comparable to build-creative-archive), one change for everything: 22 units in 9 waves, with one
build pause after the mockup unit for Rue's approval and look pick.
