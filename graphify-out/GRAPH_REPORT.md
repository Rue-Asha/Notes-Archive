# Graph Report - Notes-Archive  (2026-11-12)

## Corpus Check
- 10 files · ~161,237 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2003 nodes · 4697 edges · 119 communities (113 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 189 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Uploads and Preview Server
- Folder Tree Types
- UI Primitives and Motion
- Design Tokens and Look
- npm Dependencies
- Mockup Components
- App Shell Layout
- E2E Helpers and Tests
- Notes Data Layer
- Community 9
- E2E Reset and Seed
- Unit Test DB Harness
- Autosave and Preview E2E
- Media Upload Blocks
- Note Page and Autosave
- Test-Only Routes
- Community 16
- Media E2E Tests
- Slash and Table Menus
- Folders Data Layer
- Tiptap Editor Extensions
- Full-Text Search Index
- Block Menu Operations
- Command Palette
- Gate Workflow
- Community 25
- Card and Note Menus
- SQL Migrations
- Core Design Decisions
- Editor Sanitize
- Mockup Photos and Credits
- Toast Notifications
- CI Workflow
- Plain Text Extraction
- Primitives Mockup and Cover
- Community 35
- Community 36
- Harness Spec (Change)
- Bubble Toolbar
- Verification and Scope
- Shell and Tags Specs
- Media and Search Specs
- Notes and Folders Specs
- Emoji Picker and Note Icon
- Look Research
- Design System Spec (Change)
- Editor Spec (Change)
- Community 47
- Harness Spec
- Journey E2E
- Scope and Research Risks
- Notes Spec (Change)
- Design System Spec
- Code Block and Core
- Tags Data Layer
- npm Scripts
- Search Query Parsing
- Motion Spec (Change)
- Community 58
- Project Overview and Media
- Community 60
- Flow Config
- Shell and Search Specs (Change)
- Motion Spec
- Link Preview Extension
- Community 65
- Release Steps
- Tasks and Units
- Folders Spec (Change)
- Tags Spec (Change)
- Link Preview Spec (Change)
- Editor Spec
- Interior Living Photo
- Release Permissions
- Visual Brief and Motion Set
- OpenSpec Config
- Motion Test Fakes
- Community 77
- Release Bump Job
- Release Artifact Download
- TypeScript Config
- Bubble Link E2E
- Community 82
- Table E2E
- Toggle E2E
- Release Trigger
- Community 86
- Emoji Search
- Release Deploy Inputs
- Release Tag Check
- Sidebar Collapse E2E
- Midcentury House Photo
- Interior Rio Photo
- Release Publish Job
- Solitude House Photo
- Greek Lake Photo
- Community 96
- App Type Declarations
- SvelteKit 3 Imports
- Phone Slash Animation
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 85 edges
2. `open()` - 81 edges
3. `reset()` - 80 edges
4. `calm()` - 78 edges
5. `seed()` - 77 edges
6. `@playwright/test` - 73 edges
7. `vitest` - 53 edges
8. `svelte` - 40 edges
9. `storedNote()` - 39 edges
10. `watchSaves()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `Link preview` --references--> `url()`  [INFERRED]
  docs/functional-contract.md → src/lib/notes/discard.ts
- `Two postures: pointer+keyboard and touch+soft keyboard` --semantically_similar_to--> `Persistent navigation shell (Sidebar and Bottom bar landmarks)`  [INFERRED] [semantically similar]
  PRODUCT.md → docs/functional-contract.md
- `Autosave (600 ms debounce, flush on blur, last write wins)` --semantically_similar_to--> `Save state (idle, pending, saving, saved, error, deleted)`  [INFERRED] [semantically similar]
  PRODUCT.md → docs/functional-contract.md
- `6. Search behaviour` --references--> `tag()`  [INFERRED]
  docs/functional-contract.md → e2e/search-page.test.ts
- `7. Cross-cutting behaviour` --references--> `tag()`  [INFERRED]
  docs/functional-contract.md → e2e/search-page.test.ts

## Import Cycles
- 2-file cycle: `src/lib/server/notes.ts -> src/lib/server/search.ts -> src/lib/server/notes.ts`
- 3-file cycle: `src/lib/server/notes.ts -> src/lib/server/tags.ts -> src/lib/server/search.ts -> src/lib/server/notes.ts`

## Hyperedges (group relationships)
- **Command palette entry points** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_command_palette, openspec_changes_archive_2026_11_03_build_notes_archive_specs_editor_spec_markdown_shortcuts_and_keys, openspec_changes_archive_2026_11_03_build_notes_archive_specs_home_spec_typographic_hero, openspec_changes_archive_2026_11_03_build_notes_archive_specs_shell_spec_desktop_sidebar [EXTRACTED 1.00]
- **User-facing routes of the contract** — docs_functional_contract_route_home, docs_functional_contract_route_folder, docs_functional_contract_route_note, docs_functional_contract_route_search, docs_functional_contract_route_tag [EXTRACTED 1.00]
- **Living room furnishing ensemble** — fixtures_mockups_interior_living_blue_sofa, fixtures_mockups_interior_living_shell_chair, fixtures_mockups_interior_living_floating_sideboard, fixtures_mockups_interior_living_herringbone_parquet, fixtures_mockups_interior_living_window_curtains [EXTRACTED 1.00]
- **gate-1-decisions delta specs** — openspec_changes_gate_1_decisions_specs_folders_spec, openspec_changes_gate_1_decisions_specs_notes_spec, openspec_changes_gate_1_decisions_specs_shell_spec, openspec_changes_gate_1_decisions_specs_tags_spec [EXTRACTED 1.00]
- **Gate-1 server/data behaviour changes** — openspec_changes_gate_1_decisions_design_pinned_order, openspec_changes_gate_1_decisions_design_folder_counts, openspec_changes_gate_1_decisions_design_tree_sort, openspec_changes_gate_1_decisions_design_multiline_titles, openspec_changes_gate_1_decisions_design_tag_redirect [EXTRACTED 1.00]
- **Palette-on-phone gap resolved by S34 / U23** — openspec_changes_archive_2026_11_03_build_notes_archive_manual_checks_palette_on_phone_decision, openspec_changes_archive_2026_11_03_build_notes_archive_scope_s34_search_in_note_menu, openspec_changes_archive_2026_11_03_build_notes_archive_tasks_u23_search_in_note_menu, openspec_changes_archive_2026_11_03_build_notes_archive_verification_spec_coverage [EXTRACTED 1.00]
- **Derived search pipeline (content → plainText → foldSearch → notes_fts)** — openspec_changes_archive_2026_11_03_build_notes_archive_design_content_storage, openspec_changes_archive_2026_11_03_build_notes_archive_design_plaintext_walker, openspec_changes_archive_2026_11_03_build_notes_archive_design_foldsearch, openspec_changes_archive_2026_11_03_build_notes_archive_design_fts5_search, openspec_changes_archive_2026_11_03_build_notes_archive_design_schema_0002_core [EXTRACTED 1.00]
- **Derived plain text feeding search and snippets** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_editor_spec_plaintext, openspec_changes_archive_2026_11_03_build_notes_archive_specs_notes_spec_updatenote, openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_notes_fts, openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_full_text_search [INFERRED 0.85]
- **Look revision 1 inputs feeding the look pick** — openspec_changes_archive_2026_11_03_build_notes_archive_look_research_accent_options, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_glass_strengths, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_typeface_pairing, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_smoked_tile, openspec_changes_archive_2026_11_03_build_notes_archive_design_look_revision_1, openspec_changes_archive_2026_11_03_build_notes_archive_design_look_pick [INFERRED 0.85]
- **Look system (tokens, look switches, glass material, fonts, app.html hooks)** — openspec_specs_design_system_spec_light_warm_tokens, openspec_specs_design_system_spec_look_switches, openspec_specs_design_system_spec_frosted_glass_material, openspec_specs_design_system_spec_fonts, src_app_look_placeholder, src_app_font_preloads [INFERRED 0.85]
- **Manual real-device verification (Playwright cannot emulate soft keyboard / native menus)** — openspec_specs_editor_spec_real_devices, openspec_specs_motion_spec_real_devices, openspec_specs_shell_spec_phone_bottom_bar_drawer, openspec_specs_design_system_spec_mockup_checkpoint [INFERRED 0.85]
- **Upload lifecycle (WebP storage, ownership, grace-period purge)** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_media_spec_inline_images, openspec_changes_archive_2026_11_03_build_notes_archive_specs_media_spec_inline_files, openspec_changes_archive_2026_11_03_build_notes_archive_specs_notes_spec_removed_uploads_are_kept_for_a_grace_period, openspec_changes_archive_2026_11_03_build_notes_archive_specs_folders_spec_folder_cover, openspec_changes_archive_2026_11_03_build_notes_archive_specs_link_preview_spec_readpreview [INFERRED 0.85]
- **Upload lifecycle (WebP/file storage, ownership, grace-period purge, cascade delete)** — openspec_specs_media_spec_inline_images, openspec_specs_media_spec_inline_files, openspec_specs_notes_spec_upload_grace_period, openspec_specs_folders_spec_folder_cover, openspec_specs_link_preview_spec_preview_fetch, openspec_specs_notes_spec_deleting_note, openspec_specs_folders_spec_deleting_folder [INFERRED 0.85]

## Communities (119 total, 6 thin omitted)

### Community 0 - "Uploads and Preview Server"
Cohesion: 0.05
Nodes (48): { href, onapply, onremove, oncancel }, Props, value, folders, MockFolder, MockNote, MockTreeFolder, notes (+40 more)

### Community 1 - "Folder Tree Types"
Cohesion: 0.10
Nodes (9): calm(), open(), reset(), storedNote(), Window, shoot(), body(), openEmptyNote() (+1 more)

### Community 2 - "UI Primitives and Motion"
Cohesion: 0.06
Nodes (44): Light warm tokens, tokens.css, handle(), css, Look, LOOK, lookAttrs(), ACCENT_TOKENS (+36 more)

### Community 3 - "Design Tokens and Look"
Cohesion: 0.06
Nodes (45): dependencies, lowlight@^3.3.0, sharp@^0.35.5, @tiptap/core@3.32.2, @tiptap/extension-bubble-menu@3.32.2, @tiptap/extension-code@3.32.2, @tiptap/extension-details@3.32.2, @tiptap/extension-drag-handle@3.32.2 (+37 more)

### Community 4 - "npm Dependencies"
Cohesion: 0.07
Nodes (28): Autosave, AutosaveOptions, createAutosave(), change(), flush(), request(), stop(), DEBOUNCE_MS (+20 more)

### Community 5 - "Mockup Components"
Cohesion: 0.09
Nodes (28): COPY, count(), choose(), { folderId, hasCover }, remove(), counts, { folder, inside, onclose }, Props (+20 more)

### Community 6 - "App Shell Layout"
Cohesion: 0.08
Nodes (22): body(), dropPdf(), openEmptyNote(), PDF, openThree(), paragraph(), body(), chooseVia() (+14 more)

### Community 7 - "E2E Helpers and Tests"
Cohesion: 0.11
Nodes (31): @tiptap/extension-file-handler@3.32.2, @tiptap/extension-file-handler, BADGES, FileCard, fileKind(), Image, src(), mediaExtensions() (+23 more)

### Community 8 - "Notes Data Layer"
Cohesion: 0.06
Nodes (24): items, { open, anchor, name, onnewnote, onnewfolder, onrename, onmove, ondelete, onclose }, Props, create(), deleting, here, inside, menu (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (12): vitest, closeDb(), loadMigrations(), migrate(), Migration, openDb(), archive(), seedArchive() (+4 more)

### Community 10 - "E2E Reset and Seed"
Cohesion: 0.15
Nodes (20): sharp, UploadError, getFile(), storeFile(), convert(), FORMATS, getImage(), removeFolderCover() (+12 more)

### Community 11 - "Unit Test DB Harness"
Cohesion: 0.06
Nodes (33): 10. Route coverage check, 11. Graph notes, 12. Open questions for Rue, 1. Purpose and context, 2. Jobs-to-be-done, 3. Entities, 4.1 `/` Home, 4.2 `/folders/[id]` Folder page (+25 more)

### Community 12 - "Autosave and Preview E2E"
Cohesion: 0.08
Nodes (17): { crumbs }, { tiles }, { folder }, tint, TINTS, { pinned, recent, tiles }, { notes }, Crumb (+9 more)

### Community 13 - "Media Upload Blocks"
Cohesion: 0.15
Nodes (20): @sveltejs/kit, dataTables(), resetDb(), requireTestFlag(), SeedInput, load(), photo(), run() (+12 more)

### Community 14 - "Note Page and Autosave"
Cohesion: 0.11
Nodes (18): docFromText(), count(), exists(), ids(), marked(), noteWith(), UPLOAD_GRACE_MS, ATOMS (+10 more)

### Community 15 - "Test-Only Routes"
Cohesion: 0.11
Nodes (19): { folderId, tree, onchange }, name, nameOf(), open, { note, tree, tags, onchange }, { parts }, folders, Props (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (12): db, port, hash, root, staging, { version }, { version }, entry (+4 more)

### Community 17 - "Media E2E Tests"
Cohesion: 0.11
Nodes (19): FAKE_PAGES, fakeRemote, parse(), MAX_UPLOAD_BYTES, SafeFetchOptions, SafeResponse, charsetOf(), decode() (+11 more)

### Community 18 - "Slash and Table Menus"
Cohesion: 0.13
Nodes (25): init(), getDb(), count(), assertFolder(), createNote(), deleteNote(), handOverUploads(), otherReference() (+17 more)

### Community 19 - "Folders Data Layer"
Cohesion: 0.11
Nodes (21): blockItems, button, close(), count, editor, index, lock(), menu (+13 more)

### Community 20 - "Tiptap Editor Extensions"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 21 - "Full-Text Search Index"
Cohesion: 0.22
Nodes (18): NotFoundError, ValidationError, cleanName(), collator, createFolder(), deleteFolder(), folderCounts(), getFolder() (+10 more)

### Community 22 - "Block Menu Operations"
Cohesion: 0.11
Nodes (20): ATOMS, beaconDiscard(), discardNote(), isBlankDoc(), isEmptyNote(), url(), labels, { state, onretry } (+12 more)

### Community 23 - "Command Palette"
Cohesion: 0.09
Nodes (24): actions, active, answered, choose(), editorOf(), hits, input, keys() (+16 more)

### Community 24 - "Gate Workflow"
Cohesion: 0.14
Nodes (17): FetchError, DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress(), parseIPv4(), parseIPv6(), quad(), readBody() (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (15): @tiptap/core, @tiptap/pm, blockExtensions(), bubbleExtensions(), EditorContext, coreExtensions(), buildExtensions(), watchViewport() (+7 more)

### Community 26 - "Card and Note Menus"
Cohesion: 0.09
Nodes (7): openNote(), nodes(), ofType(), cell(), table(), StoredNote, JSONContent

### Community 27 - "SQL Migrations"
Cohesion: 0.15
Nodes (19): images, files, files_note, folders, folders_parent, images_folder_cover, images_note, note_tags (+11 more)

### Community 28 - "Core Design Decisions"
Cohesion: 0.13
Nodes (8): Design: build-notes-archive, COPY strings (src/lib/copy.ts), E2E conventions, E2E helpers (e2e/helpers.ts: reset, seed, watchSaves, clientNav), plainText hand-written JSON walker (plaintext.ts), Schema migration 0002_core.sql (folders, notes, tags, files, notes_fts), softKeyboard state (keyboard.svelte.ts), Tiptap v3 editor spike (MIT, no official slash menu)

### Community 29 - "Editor Sanitize"
Cohesion: 0.13
Nodes (18): dialog, keys(), { open, title, message, confirmLabel, danger = false, onconfirm, oncancel }, Props, dialog, keys(), { open, tree, current, exclude, onpick, oncancel }, Props (+10 more)

### Community 30 - "Mockup Photos and Credits"
Cohesion: 0.12
Nodes (11): reisen(), Window, ago(), reisen(), bare(), photo(), seed(), twelve() (+3 more)

### Community 31 - "Toast Notifications"
Cohesion: 0.17
Nodes (13): fadeSlide(), noteName(), pop(), reducedMotion(), reveal(), rise(), Entry, node (+5 more)

### Community 32 - "CI Workflow"
Cohesion: 0.12
Nodes (14): @tiptap/suggestion@3.32.2, @tiptap/suggestion, Box, fit(), placeFloating(), anchor, command, items (+6 more)

### Community 33 - "Plain Text Extraction"
Cohesion: 0.15
Nodes (14): editor, { noteId, content, onchange, onblur }, Props, root, version, clean(), emptyDoc(), isRaw() (+6 more)

### Community 34 - "Primitives Mockup and Cover"
Cohesion: 0.12
Nodes (15): anchor, { icon, onchange }, open, Emoji, EMOJI, rows, searchEmoji(), close() (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (16): parseQuery(), searchHref(), parse(), SeedResult, Id, SearchQuery, PickRow, current() (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (17): Mockup photo credits (CC0 Wikimedia Commons), Synthetic photo generation (scripts/synthetic-photo.mjs, gradient + grain), lake-moraine.jpg (mockup photo fixture), Landscape-orientation high-detail photo sample for media mockups, Snow-streaked rocky peaks above Moraine Lake (Valley of the Ten Peaks), stone-clay.jpg (synthetic mockup image), Warm clay gradient with grain (dark brown to warm clay with a peach bloom lower left), stone-sand.jpg (synthetic mockup image) (+9 more)

### Community 37 - "Harness Spec (Change)"
Cohesion: 0.20
Nodes (13): filters(), searchNotes(), snippetParts(), terms(), ids(), toMatchQuery(), withCards(), fold() (+5 more)

### Community 38 - "Bubble Toolbar"
Cohesion: 0.13
Nodes (9): clientNav(), counts(), actions(), input(), palette(), chips(), props(), homeToTag() (+1 more)

### Community 39 - "Verification and Scope"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 40 - "Shell and Tags Specs"
Cohesion: 0.13
Nodes (16): @tiptap/extension-code-block-lowlight@3.32.2, @tiptap/extension-text-style@3.32.2, @tiptap/extensions@3.32.2, @tiptap/extension-code-block-lowlight, @tiptap/extension-text-style, @tiptap/extensions, codeBlock(), lowlight (+8 more)

### Community 41 - "Media and Search Specs"
Cohesion: 0.18
Nodes (12): body(), openNote(), field(), nodes(), setup(), toolbar(), watchSaves(), body() (+4 more)

### Community 42 - "Notes and Folders Specs"
Cohesion: 0.15
Nodes (13): svelte, blockSlashItems, ScrollView, Callout, Commands, @tiptap/core, SlashItem, mediaSlashItems (+5 more)

### Community 43 - "Emoji Picker and Note Icon"
Cohesion: 0.13
Nodes (17): harness spec (build-notes-archive), calm, Database and migrations, E2E projects and isolation, Harness declaration, Health route, GET /healthz, NOTES_ARCHIVE_TEST flag (+9 more)

### Community 44 - "Look Research"
Cohesion: 0.12
Nodes (8): apply(), editor, linking, marks, palette, shown, version, withScheme()

### Community 45 - "Design System Spec (Change)"
Cohesion: 0.24
Nodes (13): breadcrumb(), listFolderTiles(), cards(), discardIfEmpty(), listNotes(), listPinned(), listRecent(), noteTags() (+5 more)

### Community 46 - "Editor Spec (Change)"
Cohesion: 0.16
Nodes (16): Gate 2 manual checks, Open decision: palette on phone while editor focused, Real-device checks (motion, editor menus, bottom bar, live link preview), Proposal: build-notes-archive, New capabilities (harness, design-system, shell, motion, home, notes, editor, media, link-preview, folders, tags, search), Done criteria, Proposal non-goals, Non-goals (no dark mode, trash, sync, auth, import) (+8 more)

### Community 47 - "Community 47"
Cohesion: 0.17
Nodes (11): hideOnOutro(), attach, dismiss, flush, Queued, STORAGE_KEY, Store, TOAST_MS (+3 more)

### Community 48 - "Harness Spec"
Cohesion: 0.21
Nodes (13): Markdown shortcuts and keys (Cmd/Ctrl+B/I/E/K, undo/redo), Command palette (Cmd/Ctrl+K, glass, full-screen on phone), Search page (/search?q, folder and tag filters, searchNotes), search Specification, Desktop sidebar (glass, collapsible icon rail), Folder tree (sidebar and drawer, capped indent), Phone bottom bar and drawer, shell Specification (+5 more)

### Community 49 - "Journey E2E"
Cohesion: 0.15
Nodes (15): Content storage and derived text, plainText walker, ProseMirror JSON content, media spec (build-notes-archive), fileCard node, /files/<id>, image node, POST /api/notes/<id>/images (+7 more)

### Community 50 - "Scope and Research Risks"
Cohesion: 0.18
Nodes (15): Shared components (eyebrow, dark CTA pill with round arrow, two-line display headline), Deleting a folder (cascade to descendants, notes, uploads), Folder cover (WebP in SQLite, ≤16 MB), Folder page (breadcrumb, cover header, sub-folder tiles, note cards), Managing folders in the tree (create, rename, Move to…, moveFolder), Moving a note (properties row Folder picker, card Move to…), folders Specification, Home bento (Pinned, Recently edited, Folders; welcome state) (+7 more)

### Community 51 - "Notes Spec (Change)"
Cohesion: 0.21
Nodes (13): Command palette (Cmd/Ctrl+K), Copy list of e2e-asserted strings, Folder entity (unlimited nesting, cover, descendant counts), Folder entry (shared list object), Note entity (title, icon, content, tags, pin order, timestamps), Note entry (shared list object with Note actions menu), Manual pinned-note order (new pin on top), UI/UX redesign (contract is its input) (+5 more)

### Community 52 - "Design System Spec"
Cohesion: 0.24
Nodes (13): Look pick: bronze accent, clear glass, glass cards, Look revision 1 (Rue, 2026-11-02), Look research — revision 1, Accent options bronze / moss / slate, Atmosphere gradient (greige ground, peach light, taupe floor), Card styles glass / paper / outline, Gap analysis: mockups vs recipe, Glass strengths soft / clear / frosted (+5 more)

### Community 53 - "Code Block and Core"
Cohesion: 0.19
Nodes (14): design-system spec (build-notes-archive), Dark CTA pill with round arrow, Tracked uppercase eyebrow, Figtree UI font, Fonts, Look switches, LOOK (src/lib/styles/look.ts), Mockup checkpoint (+6 more)

### Community 54 - "Tags Data Layer"
Cohesion: 0.18
Nodes (14): Text-colour palette (stone, clay, ochre, moss, sea, plum), editor spec (build-notes-archive), Block handle and block menu, Bubble toolbar, Callout block, Code block with syntax highlighting, Editor on real devices, Extra blocks (+6 more)

### Community 55 - "npm Scripts"
Cohesion: 0.21
Nodes (13): deleteNoteRequest(), patchNote(), anchor, change(), deleting, items, move(), moving (+5 more)

### Community 56 - "Search Query Parsing"
Cohesion: 0.14
Nodes (11): day, edited, { noteId, title, createdAt, updatedAt, autofocus = false, ontitle, onblur, onenter, icon, children }, Props, time, field, Props, { value, autofocus = false, oninput, onblur, onenter } (+3 more)

### Community 57 - "Motion Spec (Change)"
Cohesion: 0.26
Nodes (11): attributes(), decode(), NAMED, PagePreview, parsePreview(), privateHost(), readPreview(), text() (+3 more)

### Community 58 - "Community 58"
Cohesion: 0.14
Nodes (10): dialog, emojiAnchor, emojiOpen, folderOpen, items, menuAnchor, menuOpen, result (+2 more)

### Community 59 - "Project Overview and Media"
Cohesion: 0.21
Nodes (12): Database and migrations (SQLite WAL, schema_migrations), E2E projects and isolation (phone/desktop, .e2e/$PORT.db), Health route (/healthz 200 ok / 503), Package tarball (dist/notes-archive-<version>.tgz + .sha256), Proof commands (npm run proof / proof:full), harness Specification, Test-only routes and helpers (/__test/reset, seed, counts, note; e2e/helpers.ts), Full-text search (SQLite FTS5, prefix, diacritic/case-insensitive, ß=ss) (+4 more)

### Community 60 - "Community 60"
Cohesion: 0.23
Nodes (12): Gate-1 decisions (8 answers by Rue), Design: gate-1-decisions, folderCounts (folders.ts), Migration 0005_pin_order_settings.sql, Change proposal: gate-1-decisions, gate-1-decisions done criteria, Delta spec: folders (Folder page), Requirement: Folder page (descendant counts) (+4 more)

### Community 61 - "Flow Config"
Cohesion: 0.22
Nodes (9): body(), enterBody(), hasMark(), menu(), nodes(), openMenuOf(), PDF, slash() (+1 more)

### Community 62 - "Shell and Search Specs (Change)"
Cohesion: 0.18
Nodes (11): Creative Archive (sibling app), Fake remote with canned pages (garden.example, plain.example, pdf.example, blocked.example), Risks / trade-offs (R1–R8, uploads, ß tags), safeFetch SSRF guard, Research: build-notes-archive (explore), Creative Archive inventory, Dialogue decisions (archive = library, folders + tags, Notion mechanics), Scope: build-notes-archive (+3 more)

### Community 63 - "Motion Spec"
Cohesion: 0.15
Nodes (13): Folder cover, removeFolderCover, setFolderCover, home spec (build-notes-archive), Home bento, notes spec (build-notes-archive), createNote, Creating a note (+5 more)

### Community 64 - "Link Preview Extension"
Cohesion: 0.23
Nodes (12): Self-hosted fonts requirement (Newsreader display, Figtree UI), .glass frosted material with --glass-fallback, Light warm tokens (tokens.css / tokens.ts), Look switches (data-accent, data-glass, data-card; LOOK in look.ts), Mockup pages (/__mockups, env-gated), design-system Specification, app.html document shell, Font preloads (Newsreader opsz normal/italic, Figtree wght woff2) (+4 more)

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, package, prepare, preview, proof (+4 more)

### Community 66 - "Release Steps"
Cohesion: 0.23
Nodes (8): RAIL_SCRIPT, readCollapsed(), STORAGE_KEY, Store, toggle(), writeCollapsed(), { data, children }, drawerOpen

### Community 67 - "Tasks and Units"
Cohesion: 0.23
Nodes (8): close(), enabled(), keys(), menu, MenuItem, { open, anchor, label, items, onclose }, Props, select()

### Community 68 - "Folders Spec (Change)"
Cohesion: 0.20
Nodes (11): Block actions / Block menu (move, turn into, delete; touch reordering), Editor behaviour (TipTap/ProseMirror core and chrome), Link preview, Multi-line note titles (Enter inserts line break; Cmd/Ctrl+Enter to body), Paste, drop and upload behaviour, Route /notes/[id] Note page, Save state (idle, pending, saving, saved, error, deleted), Slash menu (block insertion) (+3 more)

### Community 69 - "Tags Spec (Change)"
Cohesion: 0.22
Nodes (11): Style guards, motion spec (build-notes-archive), Card to note morph, Glass hover glow, Lists stagger in, Motion on real devices, Page transitions, View Transitions API (+3 more)

### Community 70 - "Link Preview Spec (Change)"
Cohesion: 0.18
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 71 - "Editor Spec"
Cohesion: 0.20
Nodes (8): visibleViewport(), actions, bar, editor, focused, place(), table, version

### Community 72 - "Interior Living Photo"
Cohesion: 0.22
Nodes (7): stagger(), hidden, { note, index = 0, parts }, shown, MONTHS, relativeTime(), now

### Community 73 - "Release Permissions"
Cohesion: 0.29
Nodes (8): Harness declaration (proof, proof-full, run, package, ship: ask), Notes Archive (project overview), Harness declaration requirement for CLAUDE.md, Link preview cards in the editor (linkPreview node), link-preview Specification, Inline files (file cards, /files/<id>, nosniff + CSP sandbox), Inline images (WebP via sharp, stored in SQLite, /images/<id>), media Specification

### Community 74 - "Visual Brief and Motion Set"
Cohesion: 0.27
Nodes (7): blocks, folder(), home(), loaded(), note(), Screen, screens

### Community 75 - "OpenSpec Config"
Cohesion: 0.20
Nodes (9): base, gate0, gate1, gate2, learnings, look_pick, ship_note, ship_override (+1 more)

### Community 76 - "Motion Test Fakes"
Cohesion: 0.27
Nodes (10): Frosted glass material, search spec (build-notes-archive), Command palette, Search page, searchNotes, shell spec (build-notes-archive), Desktop sidebar, Folder tree (+2 more)

### Community 77 - "Community 77"
Cohesion: 0.27
Nodes (9): Content storage as ProseMirror JSON with derived plain text (plainText), Card to note morph (View Transition, note-<id>), Glass hover glow (opacity only), Lists stagger in (data-revealed), Page transitions (fade/slide; reduced motion ≤120 ms fade), Motion on real devices (manual), motion Specification, Autosave (debounced, flushed on leave, last write wins) (+1 more)

### Community 78 - "Release Bump Job"
Cohesion: 0.31
Nodes (7): byName(), getTree(), collator, getTag(), listTags(), load(), load()

### Community 79 - "Release Artifact Download"
Cohesion: 0.24
Nodes (9): allowed, animatedProperties(), colourLiterals(), declarations(), files, namedColours, sourceFiles(), srcDir (+1 more)

### Community 80 - "TypeScript Config"
Cohesion: 0.25
Nodes (7): Behavioural data-* allow-list, Persistent navigation shell (Sidebar and Bottom bar landmarks), Tag list in the shell, Accessibility and inclusion commitments, Autosave (600 ms debounce, flush on blur, last write wins), Single-user self-hosted archive positioning, Two postures: pointer+keyboard and touch+soft keyboard

### Community 81 - "Bubble Link E2E"
Cohesion: 0.47
Nodes (8): Folder tree with stored sort, GET/PATCH /api/settings endpoint, getTree (folders.ts), settings.ts (getTreeSort, setTreeSort), Delta spec: shell (Folder tree, Tree sort preference), Requirement: Folder tree, Requirement: Tree sort preference (mixed, name, edited, created), Task unit 4: Tree sort preference

### Community 82 - "Community 82"
Cohesion: 0.31
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 83 - "Table E2E"
Cohesion: 0.25
Nodes (8): Types contract (src/lib/types.ts), Tasks: build-notes-archive (23 units, 9 waves), Fail-first rule (Scenario tests red before code), Look walk per UI unit, Taste stop at task 4.6 (mockup approval), Unit 3: contract (types, schema, plain text, stubs, test routes), Unit 4: mockups, photos and look checkpoint, Parallel unit waves W1–W9 in worktrees

### Community 84 - "Toggle E2E"
Cohesion: 0.25
Nodes (9): folders spec (build-notes-archive), createFolder, deleteFolder, Deleting a folder, Folder page, folderCounts, Managing folders in the tree, moveFolder (+1 more)

### Community 85 - "Release Trigger"
Cohesion: 0.25
Nodes (9): Moving a note, Note page, Properties row (Folder, Tags, Pinned), Tags section, tags spec (build-notes-archive), listTags, setNoteTags, Tag input (+1 more)

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (9): link-preview spec (build-notes-archive), POST /api/preview, FetchError, linkPreview node, parsePreview, Preview cards in the editor, Preview fetch on the server, readPreview (+1 more)

### Community 87 - "Emoji Search"
Cohesion: 0.46
Nodes (6): Block handle and block menu (drag, Move up/down, Turn into, Delete; moveBlock), Bubble toolbar (marks, link, text colour), Extra blocks (Toggle, Callout, Code w/ highlighting, Table, Divider, Task list), Slash menu (block type picker), editor Specification, Quiet editor (no animation while typing)

### Community 88 - "Release Deploy Inputs"
Cohesion: 0.25
Nodes (7): interior-living.jpg (mockup photo fixture), Blue upholstered sofa with gold pineapple cushion, Wall-mounted white sideboard with TV, candles and plants, Herringbone oak parquet floor, Bright Scandinavian-style living room scene, Wire-base shell chair with sheepskin throw, Daylit window with botanical-print curtains

### Community 89 - "Release Tag Check"
Cohesion: 0.29
Nodes (8): permissions, permissions, permissions, actions, attestations, contents, id-token, permissions

### Community 90 - "Sidebar Collapse E2E"
Cohesion: 0.25
Nodes (7): Layout rule (sidebar ≥1024, 720px note column, auto-fill grids), Mobbin references per screen, Motion set (transform/opacity only, reduced-motion paths), Visual brief (world, look candidates, type, components, screens), Look Mobbin references (TIDE, Tana, Unseen Studio, …), Motion tone (calmer, longer durations), Mobbin research (library, editor, organisation, search, editorial)

### Community 91 - "Midcentury House Photo"
Cohesion: 0.25
Nodes (7): context, rules, design, proposal, specs, tasks, schema

### Community 93 - "Release Publish Job"
Cohesion: 0.48
Nodes (6): body(), handle(), menu(), openMenu(), openThree(), paragraph()

### Community 94 - "Solitude House Photo"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 95 - "Greek Lake Photo"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 96 - "Community 96"
Cohesion: 0.48
Nodes (6): PUT /api/pinned endpoint, listPinned (notes.ts), reorderPinned (notes.ts), Delta spec: notes (Pinning, Multi-line titles), Requirement: Pinning (manual order, 409 stale reorder, migration keeps order), Task unit 2: Pinned order

### Community 97 - "App Type Declarations"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 98 - "SvelteKit 3 Imports"
Cohesion: 0.48
Nodes (5): getNote(), DELETE(), failure(), PATCH(), load()

### Community 99 - "Phone Slash Animation"
Cohesion: 0.47
Nodes (5): Route /tags/[id] Tag page, CardMenu.svelte ondeleted callback, Delta spec: tags (Tag pages), Requirement: Tag pages (redirect Home on last note, plain 404), Task unit 6: Tag page redirect

### Community 100 - "Community 100"
Cohesion: 0.40
Nodes (4): input(), palette(), input(), palette()

### Community 101 - "Community 101"
Cohesion: 0.40
Nodes (3): cards(), seedGarden(), titles()

### Community 103 - "Community 103"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 104 - "Community 104"
Cohesion: 0.53
Nodes (4): fakeImage(), png(), testImage(), GET()

### Community 105 - "Community 105"
Cohesion: 0.67
Nodes (6): createToaster(), attach(), dismiss(), flush(), toast(), write()

### Community 106 - "Community 106"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 109 - "Community 109"
Cohesion: 0.83
Nodes (3): sidebar(), width(), widthIs()

### Community 110 - "Community 110"
Cohesion: 0.50
Nodes (3): house-midcentury.jpg (mockup photo fixture), Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls), Striped Lawn and Pine/Deciduous Tree Landscape at Dusk

### Community 111 - "Community 111"
Cohesion: 0.67
Nodes (4): Interior Rio (mockup photo: ocean-view living room at dusk), Ocean-view apartment living room (Rio de Janeiro, full moon over the sea), Warm neutral palette (white slipcovers, worn leather, weathered wood, stone floor), Wide landscape-format photo (approx. 2:1, high resolution)

### Community 112 - "Community 112"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 113 - "Community 113"
Cohesion: 0.83
Nodes (3): titleLine helper (src/lib/title.ts), Requirement: Multi-line titles, Task unit 5: Multi-line titles

### Community 114 - "Community 114"
Cohesion: 0.67
Nodes (3): house-solitude.jpg (mockup fixture photo), Black timber-clad modern house in a wooded garden, Portrait-orientation real-world photo sample (inline image / media fixture)

### Community 115 - "Community 115"
Cohesion: 1.00
Nodes (3): Greek mountain lake (possibly Lake Doxa, Peloponnese), Mountain lake valley viewed through conifers, lake-greek.jpg mockup photo

## Ambiguous Edges - Review These
- `helpers.ts` → `Quiet editor`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-03-build-notes-archive/specs/harness/spec.md · relation: conceptually_related_to
- `Mountain lake valley viewed through conifers` → `Greek mountain lake (possibly Lake Doxa, Peloponnese)`  [AMBIGUOUS]
  fixtures/mockups/lake-greek.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **68 isolated node(s):** `$app/tsconfig`, `Landscape-orientation high-detail photo sample for media mockups`, `Snow-streaked rocky peaks above Moraine Lake (Valley of the Ten Peaks)`, `GET /healthz`, `npm run proof` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 698 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Community 9` to `UI Primitives and Motion`, `Design Tokens and Look`, `npm Dependencies`, `Mockup Components`, `E2E Helpers and Tests`, `Notes Data Layer`, `E2E Reset and Seed`, `Media Upload Blocks`, `Note Page and Autosave`, `Test-Only Routes`, `Community 16`, `Media E2E Tests`, `Slash and Table Menus`, `Folders Data Layer`, `Full-Text Search Index`, `Gate Workflow`, `Community 25`, `Toast Notifications`, `Plain Text Extraction`, `Primitives Mockup and Cover`, `Community 35`, `Harness Spec (Change)`, `Community 47`, `Motion Spec (Change)`, `Release Steps`, `Interior Living Photo`, `Release Artifact Download`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Landscape-orientation high-detail photo sample for media mockups`, `Snow-streaked rocky peaks above Moraine Lake (Valley of the Ten Peaks)` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Uploads and Preview Server` be split into smaller, more focused modules?**
  _Cohesion score 0.051228070175438595 - nodes in this community are weakly interconnected._
- **Why does `svelte` connect `Notes and Folders Specs` to `Uploads and Preview Server`, `Design Tokens and Look`, `npm Dependencies`, `Mockup Components`, `E2E Helpers and Tests`, `Notes Data Layer`, `Autosave and Preview E2E`, `Test-Only Routes`, `Command Palette`, `Community 25`, `Editor Sanitize`, `Toast Notifications`, `CI Workflow`, `Plain Text Extraction`, `Primitives Mockup and Cover`, `Look Research`, `Community 47`, `Search Query Parsing`, `Release Steps`, `Tasks and Units`, `Editor Spec`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Folder Tree Types` be split into smaller, more focused modules?**
  _Cohesion score 0.10288461538461538 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `helpers.ts` and `Quiet editor`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Mountain lake valley viewed through conifers` and `Greek mountain lake (possibly Lake Doxa, Peloponnese)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._