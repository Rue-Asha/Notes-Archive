# Graph Report - gate-1-decisions  (2026-11-14)

## Corpus Check
- 347 files · ~163,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .woff2 3, (none) 2, .css 2)

## Summary
- 2007 nodes · 4823 edges · 122 communities (111 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 195 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c7be38d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Uploads and Preview Server
- Folder Tree Types
- UI Primitives and Motion
- Design Tokens and Look
- notes/autosave.test.ts
- #lib
- App Shell Layout
- E2E Helpers and Tests
- TreeRow.svelte
- vitest
- E2E Reset and Seed
- Notes Archive: functional contract
- Autosave and Preview E2E
- Media Upload Blocks
- Note Page and Autosave
- Test-Only Routes
- db.ts
- Media E2E Tests
- getDb
- Folders Data Layer
- Tiptap Editor Extensions
- Full-Text Search Index
- Block Menu Operations
- Command Palette
- Gate Workflow
- editor/preview.ts
- table.test.ts
- SQL Migrations
- Core Design Decisions
- FolderPicker.svelte
- Mockup Photos and Credits
- TagInput.svelte
- CI Workflow
- Plain Text Extraction
- Primitives Mockup and Cover
- (app)/search/+page.svelte
- synthetic-photo.mjs
- Harness Spec (Change)
- Bubble Toolbar
- Verification and Scope
- Shell and Tags Specs
- bubble-link.test.ts
- @tiptap/core
- Emoji Picker and Note Icon
- Look Research
- @sveltejs/kit
- Editor Spec (Change)
- toast.ts
- Harness Spec
- Journey E2E
- Scope and Research Risks
- Notes Spec (Change)
- Design System Spec
- Code Block and Core
- Tags Data Layer
- npm Scripts
- svelte
- Motion Spec (Change)
- primitives/+page.svelte
- Project Overview and Media
- Change proposal: gate-1-decisions
- schema.test.ts
- Shell and Search Specs (Change)
- Motion Spec
- Link Preview Extension
- scripts
- Release Steps
- 3. Entities
- autosave.ts
- Tags Spec (Change)
- Link Preview Spec (Change)
- 4. Routes
- Interior Living Photo
- Release Permissions
- transitions.test.ts
- OpenSpec Config
- Motion Test Fakes
- Note cards (snippet, tag chips, relativeTime, card menu)
- settings-api.test.ts
- Release Artifact Download
- bubble.test.ts
- Bubble Link E2E
- steps
- Table E2E
- Toggle E2E
- Release Trigger
- Preview fetch on the server
- Emoji Search
- Release Deploy Inputs
- Release Tag Check
- Sidebar Collapse E2E
- Midcentury House Photo
- Interior Rio Photo
- Release Publish Job
- Solitude House Photo
- Greek Lake Photo
- Pinned order design (pin_order column, PUT /api/pinned, whole-list reorder)
- App Type Declarations
- uploads.test.ts
- emoji.ts
- palette-results.test.ts
- tag-page.test.ts
- toggle.test.ts
- release.yml
- Folder counts design (folderCounts as single source)
- @tiptap/pm
- with
- check-tag
- Notes Archive
- sidebar-collapse.test.ts
- house-midcentury.jpg (mockup photo fixture)
- Interior Rio (mockup photo: ocean-view living room at dusk)
- publish
- Multi-line titles design (CRLF to LF, titleLine helper, FTS unicode61)
- house-solitude.jpg (mockup fixture photo)
- Greek mountain lake (possibly Lake Doxa, Peloponnese)
- app.d.ts
- SvelteKit 3 #lib imports (no svelte.config.js)
- palette.test.ts
- playwright.config.ts
- title.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 90 edges
2. `reset()` - 80 edges
3. `seed()` - 77 edges
4. `open()` - 77 edges
5. `calm()` - 73 edges
6. `@playwright/test` - 69 edges
7. `vitest` - 57 edges
8. `editor()` - 47 edges
9. `svelte` - 42 edges
10. `storedNote()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `Harness` --references--> `watchSaves()`  [INFERRED]
  AGENTS.md → e2e/helpers.ts
- `Harness` --references--> `request()`  [INFERRED]
  AGENTS.md → src/lib/notes/autosave.ts
- `Autosave (600 ms debounce, flush on blur, last write wins)` --semantically_similar_to--> `Save state (idle, pending, saving, saved, error, deleted)`  [INFERRED] [semantically similar]
  PRODUCT.md → docs/functional-contract.md
- `Two postures: pointer+keyboard and touch+soft keyboard` --semantically_similar_to--> `Persistent navigation shell (Sidebar and Bottom bar landmarks)`  [INFERRED] [semantically similar]
  PRODUCT.md → docs/functional-contract.md
- `Harness` --references--> `clientNav()`  [INFERRED]
  AGENTS.md → e2e/helpers.ts

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

## Communities (122 total, 11 thin omitted)

### Community 0 - "Uploads and Preview Server"
Cohesion: 0.08
Nodes (36): folders, MockFolder, MockNote, MockTreeFolder, notes, photo(), pinned, recent (+28 more)

### Community 1 - "Folder Tree Types"
Cohesion: 0.12
Nodes (9): reisen(), Window, calm(), open(), reset(), storedNote(), Window, openEmptyNote() (+1 more)

### Community 2 - "UI Primitives and Motion"
Cohesion: 0.07
Nodes (43): Light warm tokens, tokens.css, Look, LOOK, ACCENT_TOKENS, AccentName, accents, AccentToken (+35 more)

### Community 3 - "Design Tokens and Look"
Cohesion: 0.05
Nodes (54): dependencies, lowlight@^3.3.0, sharp@^0.35.5, @tiptap/core@3.32.2, @tiptap/extension-bubble-menu@3.32.2, @tiptap/extension-code@3.32.2, @tiptap/extension-code-block-lowlight@3.32.2, @tiptap/extension-details@3.32.2 (+46 more)

### Community 4 - "notes/autosave.test.ts"
Cohesion: 0.18
Nodes (8): AutosaveOptions, createAutosave(), change(), flush(), request(), stop(), setup(), NotePatch

### Community 5 - "#lib"
Cohesion: 0.06
Nodes (38): COPY, count(), choose(), { folderId, hasCover }, remove(), counts, { folder, inside, onclose }, Props (+30 more)

### Community 6 - "App Shell Layout"
Cohesion: 0.08
Nodes (34): openNote(), dropPdf(), openEmptyNote(), PDF, openThree(), paragraph(), editor(), watchSaves() (+26 more)

### Community 7 - "E2E Helpers and Tests"
Cohesion: 0.14
Nodes (23): BADGES, FileCard, fileKind(), KIND_NAMES, begin(), Candidate, failureMessage(), fileProblem() (+15 more)

### Community 8 - "TreeRow.svelte"
Cohesion: 0.12
Nodes (12): ancestorsOf(), indentLevel(), MAX_INDENT, Target, tree, branch, folder, icon (+4 more)

### Community 9 - "vitest"
Cohesion: 0.15
Nodes (16): vitest, closeDb(), archive(), png(), seedArchive(), SeedInput, SeedResult, testImage() (+8 more)

### Community 10 - "E2E Reset and Seed"
Cohesion: 0.20
Nodes (14): sharp, UploadError, convert(), FORMATS, getImage(), removeFolderCover(), setFolderCover(), storeImage() (+6 more)

### Community 11 - "Notes Archive: functional contract"
Cohesion: 0.14
Nodes (15): 10. Route coverage check, 11. Graph notes, 12. Open questions for Rue, 1. Purpose and context, 2. Jobs-to-be-done, 5.1 Core editing behaviour (kept), 5.2 Editor chrome (redesignable; every action must remain), 5. Editor behaviour (TipTap / ProseMirror) (+7 more)

### Community 12 - "Autosave and Preview E2E"
Cohesion: 0.15
Nodes (10): { crumbs }, { tiles }, { folder }, tint, TINTS, { pinned, recent, tiles }, { notes }, FolderTile (+2 more)

### Community 13 - "Media Upload Blocks"
Cohesion: 0.13
Nodes (18): dataTables(), resetDb(), FAKE_PAGES, fakeImage(), requireTestFlag(), testFlag(), StoredNote, POST() (+10 more)

### Community 14 - "Note Page and Autosave"
Cohesion: 0.20
Nodes (12): docFromText(), ATOMS, children(), hasAtom(), inlineText(), isEmptyDoc(), isInline(), isNode() (+4 more)

### Community 15 - "Test-Only Routes"
Cohesion: 0.12
Nodes (19): { folderId, tree, onchange }, name, nameOf(), open, { note, tree, tags, onchange }, { parts }, folders, Props (+11 more)

### Community 16 - "db.ts"
Cohesion: 0.09
Nodes (15): hash, root, staging, { version }, { version }, entry, dir, dir (+7 more)

### Community 17 - "Media E2E Tests"
Cohesion: 0.14
Nodes (12): fakeRemote, SafeFetchOptions, charsetOf(), decode(), htmlPage(), MAX_PAGE_BYTES, Remote, safeRemote (+4 more)

### Community 18 - "getDb"
Cohesion: 0.09
Nodes (37): handle(), init(), ValidationError, getDb(), count(), assertFolder(), createNote(), deleteNote() (+29 more)

### Community 19 - "Folders Data Layer"
Cohesion: 0.11
Nodes (21): blockItems, button, close(), count, editor, index, lock(), menu (+13 more)

### Community 20 - "Tiptap Editor Extensions"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 21 - "Full-Text Search Index"
Cohesion: 0.17
Nodes (25): NotFoundError, breadcrumb(), byName(), cleanName(), collator, createFolder(), deleteFolder(), folderCounts() (+17 more)

### Community 22 - "Block Menu Operations"
Cohesion: 0.11
Nodes (20): Link preview, ATOMS, beaconDiscard(), discardNote(), isBlankDoc(), isEmptyNote(), url(), Crumb (+12 more)

### Community 23 - "Command Palette"
Cohesion: 0.10
Nodes (25): actions, active, answered, choose(), editorOf(), hits, input, keys() (+17 more)

### Community 24 - "Gate Workflow"
Cohesion: 0.12
Nodes (20): FetchError, parse(), DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress(), parseIPv4(), parseIPv6(), quad() (+12 more)

### Community 25 - "editor/preview.ts"
Cohesion: 0.42
Nodes (5): LinkPreview, cardFor(), previewExtensions(), domainOf(), standaloneUrl()

### Community 26 - "table.test.ts"
Cohesion: 0.29
Nodes (4): nodes(), ofType(), cell(), table()

### Community 27 - "SQL Migrations"
Cohesion: 0.12
Nodes (21): images, files, files_note, folders, folders_parent, images_folder_cover, images_note, note_tags (+13 more)

### Community 28 - "Core Design Decisions"
Cohesion: 0.13
Nodes (8): Design: build-notes-archive, COPY strings (src/lib/copy.ts), E2E conventions, E2E helpers (e2e/helpers.ts: reset, seed, watchSaves, clientNav), plainText hand-written JSON walker (plaintext.ts), Schema migration 0002_core.sql (folders, notes, tags, files, notes_fts), softKeyboard state (keyboard.svelte.ts), Tiptap v3 editor spike (MIT, no official slash menu)

### Community 29 - "FolderPicker.svelte"
Cohesion: 0.07
Nodes (36): fadeSlide(), hideOnOutro(), noteName(), pop(), reducedMotion(), reveal(), rise(), stagger() (+28 more)

### Community 30 - "Mockup Photos and Credits"
Cohesion: 0.10
Nodes (12): ago(), reisen(), bare(), photo(), seed(), twelve(), folderWith(), Probe (+4 more)

### Community 31 - "TagInput.svelte"
Cohesion: 0.18
Nodes (14): input(), active, addTag(), clean(), confirm(), input, oninput(), onkeydown() (+6 more)

### Community 32 - "CI Workflow"
Cohesion: 0.08
Nodes (20): Box, fit(), placeFloating(), visibleViewport(), anchor, command, items, key() (+12 more)

### Community 33 - "Plain Text Extraction"
Cohesion: 0.17
Nodes (14): editor, { noteId, content, onchange, onblur }, Props, root, version, clean(), emptyDoc(), isRaw() (+6 more)

### Community 34 - "Primitives Mockup and Cover"
Cohesion: 0.15
Nodes (11): anchor, { icon, onchange }, open, close(), keys(), { open, anchor, onpick, onclose }, pick(), picker (+3 more)

### Community 35 - "(app)/search/+page.svelte"
Cohesion: 0.19
Nodes (14): parseQuery(), searchHref(), parse(), SearchQuery, current(), { data }, field, filtered() (+6 more)

### Community 36 - "synthetic-photo.mjs"
Cohesion: 0.12
Nodes (17): Mockup photo credits (CC0 Wikimedia Commons), Synthetic photo generation (scripts/synthetic-photo.mjs, gradient + grain), lake-moraine.jpg (mockup photo fixture), Landscape-orientation high-detail photo sample for media mockups, Snow-streaked rocky peaks above Moraine Lake (Valley of the Ten Peaks), stone-clay.jpg (synthetic mockup image), Warm clay gradient with grain (dark brown to warm clay with a peach bloom lower left), stone-sand.jpg (synthetic mockup image) (+9 more)

### Community 37 - "Harness Spec (Change)"
Cohesion: 0.20
Nodes (13): filterSlash(), filters(), searchNotes(), snippetParts(), terms(), ids(), toMatchQuery(), withCards() (+5 more)

### Community 38 - "Bubble Toolbar"
Cohesion: 0.23
Nodes (7): counts(), actions(), input(), palette(), chips(), expectChips(), props()

### Community 39 - "Verification and Scope"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 40 - "Shell and Tags Specs"
Cohesion: 0.15
Nodes (12): codeBlock(), lowlight, ColorSpan, Commands, coreExtensions(), isTextColor(), TEXT_COLORS, TextColor (+4 more)

### Community 41 - "bubble-link.test.ts"
Cohesion: 0.60
Nodes (4): field(), nodes(), setup(), toolbar()

### Community 42 - "@tiptap/core"
Cohesion: 0.13
Nodes (24): @tiptap/core, blockExtensions(), blockSlashItems, ScrollView, bubbleExtensions(), Callout, Commands, @tiptap/core (+16 more)

### Community 43 - "Emoji Picker and Note Icon"
Cohesion: 0.13
Nodes (17): harness spec (build-notes-archive), calm, Database and migrations, E2E projects and isolation, Harness declaration, Health route, GET /healthz, NOTES_ARCHIVE_TEST flag (+9 more)

### Community 44 - "Look Research"
Cohesion: 0.12
Nodes (8): apply(), editor, linking, marks, palette, shown, version, withScheme()

### Community 45 - "@sveltejs/kit"
Cohesion: 0.20
Nodes (12): @sveltejs/kit, cards(), listNotes(), listPinned(), listRecent(), snippet(), getTag(), call() (+4 more)

### Community 46 - "Editor Spec (Change)"
Cohesion: 0.16
Nodes (16): Gate 2 manual checks, Open decision: palette on phone while editor focused, Real-device checks (motion, editor menus, bottom bar, live link preview), Proposal: build-notes-archive, New capabilities (harness, design-system, shell, motion, home, notes, editor, media, link-preview, folders, tags, search), Done criteria, Proposal non-goals, Non-goals (no dark mode, trash, sync, auth, import) (+8 more)

### Community 47 - "toast.ts"
Cohesion: 0.15
Nodes (16): attach, createToaster(), attach(), dismiss(), flush(), toast(), write(), dismiss (+8 more)

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
Cohesion: 0.11
Nodes (26): Block actions / Block menu (move, turn into, delete; touch reordering), Command palette (Cmd/Ctrl+K), Copy list of e2e-asserted strings, Editor behaviour (TipTap/ProseMirror core and chrome), Folder entity (unlimited nesting, cover, descendant counts), Folder entry (shared list object), Multi-line note titles (Enter inserts line break; Cmd/Ctrl+Enter to body), Note entity (title, icon, content, tags, pin order, timestamps) (+18 more)

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
Cohesion: 0.11
Nodes (21): deleteNoteRequest(), patchNote(), anchor, change(), deleting, inherited, items, move() (+13 more)

### Community 56 - "svelte"
Cohesion: 0.08
Nodes (20): svelte, { href, onapply, onremove, oncancel }, Props, value, day, edited, { noteId, title, createdAt, updatedAt, autofocus = false, ontitle, onblur, onenter, icon, children }, Props (+12 more)

### Community 57 - "Motion Spec (Change)"
Cohesion: 0.29
Nodes (11): attributes(), decode(), NAMED, PagePreview, parsePreview(), privateHost(), readPreview(), text() (+3 more)

### Community 58 - "primitives/+page.svelte"
Cohesion: 0.09
Nodes (18): close(), enabled(), keys(), menu, MenuItem, { open, anchor, label, items, onclose }, Props, select() (+10 more)

### Community 59 - "Project Overview and Media"
Cohesion: 0.21
Nodes (12): Database and migrations (SQLite WAL, schema_migrations), E2E projects and isolation (phone/desktop, .e2e/$PORT.db), Health route (/healthz 200 ok / 503), Package tarball (dist/notes-archive-<version>.tgz + .sha256), Proof commands (npm run proof / proof:full), harness Specification, Test-only routes and helpers (/__test/reset, seed, counts, note; e2e/helpers.ts), Full-text search (SQLite FTS5, prefix, diacritic/case-insensitive, ß=ss) (+4 more)

### Community 60 - "Change proposal: gate-1-decisions"
Cohesion: 0.21
Nodes (14): Gate-1 decisions (8 answers by Rue), Route /tags/[id] Tag page, Design: gate-1-decisions, CardMenu.svelte ondeleted callback, Migration 0005_pin_order_settings.sql, Change proposal: gate-1-decisions, gate-1-decisions done criteria, Delta spec: notes (Pinning, Multi-line titles) (+6 more)

### Community 61 - "schema.test.ts"
Cohesion: 0.22
Nodes (10): ConflictError, reorderPinned(), count(), folder(), image(), insert(), names(), note() (+2 more)

### Community 62 - "Shell and Search Specs (Change)"
Cohesion: 0.18
Nodes (11): Creative Archive (sibling app), Fake remote with canned pages (garden.example, plain.example, pdf.example, blocked.example), Risks / trade-offs (R1–R8, uploads, ß tags), safeFetch SSRF guard, Research: build-notes-archive (explore), Creative Archive inventory, Dialogue decisions (archive = library, folders + tags, Notion mechanics), Scope: build-notes-archive (+3 more)

### Community 63 - "Motion Spec"
Cohesion: 0.15
Nodes (13): Folder cover, removeFolderCover, setFolderCover, home spec (build-notes-archive), Home bento, notes spec (build-notes-archive), createNote, Creating a note (+5 more)

### Community 64 - "Link Preview Extension"
Cohesion: 0.23
Nodes (12): Self-hosted fonts requirement (Newsreader display, Figtree UI), .glass frosted material with --glass-fallback, Light warm tokens (tokens.css / tokens.ts), Look switches (data-accent, data-glass, data-card; LOOK in look.ts), Mockup pages (/__mockups, env-gated), design-system Specification, app.html document shell, Font preloads (Newsreader opsz normal/italic, Figtree wght woff2) (+4 more)

### Community 65 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, package, prepare, preview, proof (+3 more)

### Community 66 - "Release Steps"
Cohesion: 0.16
Nodes (11): collapsed, RAIL_SCRIPT, readCollapsed(), STORAGE_KEY, Store, toggle(), { tree, tags }, writeCollapsed() (+3 more)

### Community 67 - "3. Entities"
Cohesion: 0.20
Nodes (10): 3. Entities, 9. Behavioural `data-*` allow-list, Folder, Note, Save state (client), Search hit, Tag, Uploads (images, files, link-preview images, folder covers) (+2 more)

### Community 68 - "autosave.ts"
Cohesion: 0.25
Nodes (5): Autosave, DEBOUNCE_MS, DISCRETE, Saved, SaveState

### Community 69 - "Tags Spec (Change)"
Cohesion: 0.22
Nodes (11): Style guards, motion spec (build-notes-archive), Card to note morph, Glass hover glow, Lists stagger in, Motion on real devices, Page transitions, View Transitions API (+3 more)

### Community 70 - "Link Preview Spec (Change)"
Cohesion: 0.12
Nodes (15): Behavioural data-* allow-list, Accessibility and inclusion commitments, Accessibility & Inclusion, Autosave (600 ms debounce, flush on blur, last write wins), Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context (+7 more)

### Community 71 - "4. Routes"
Cohesion: 0.25
Nodes (8): 4.1 `/` Home, 4.2 `/folders/[id]` Folder page, 4.3 `/notes/[id]` Note page, 4.4 `/search` Search page, 4.5 `/tags/[id]` Tag page, 4.6 Shared object: Note entry (Home, folder, tag, search), 4.7 Shared object: Folder entry (Home, folder page), 4. Routes

### Community 72 - "Interior Living Photo"
Cohesion: 0.25
Nodes (6): MONTHS, relativeTime(), now, SeedFolder, SeedNote, IsoDateTime

### Community 73 - "Release Permissions"
Cohesion: 0.29
Nodes (8): Harness declaration (proof, proof-full, run, package, ship: ask), Notes Archive (project overview), Harness declaration requirement for CLAUDE.md, Link preview cards in the editor (linkPreview node), link-preview Specification, Inline files (file cards, /files/<id>, nosniff + CSP sandbox), Inline images (WebP via sharp, stored in SQLite, /images/<id>), media Specification

### Community 74 - "transitions.test.ts"
Cohesion: 0.33
Nodes (4): Harness, clientNav(), homeToTag(), Spy

### Community 75 - "OpenSpec Config"
Cohesion: 0.20
Nodes (9): base, gate0, gate1, gate2, learnings, look_pick, ship_note, ship_override (+1 more)

### Community 76 - "Motion Test Fakes"
Cohesion: 0.27
Nodes (10): Frosted glass material, search spec (build-notes-archive), Command palette, Search page, searchNotes, shell spec (build-notes-archive), Desktop sidebar, Folder tree (+2 more)

### Community 77 - "Note cards (snippet, tag chips, relativeTime, card menu)"
Cohesion: 0.27
Nodes (9): Content storage as ProseMirror JSON with derived plain text (plainText), Card to note morph (View Transition, note-<id>), Glass hover glow (opacity only), Lists stagger in (data-revealed), Page transitions (fade/slide; reduced motion ≤120 ms fade), Motion on real devices (manual), motion Specification, Autosave (debounced, flushed on leave, last write wins) (+1 more)

### Community 78 - "settings-api.test.ts"
Cohesion: 0.33
Nodes (8): getTreeSort(), setTreeSort(), listTags(), isTreeSort(), TreeSort, GET(), PATCH(), load()

### Community 79 - "Release Artifact Download"
Cohesion: 0.24
Nodes (9): allowed, animatedProperties(), colourLiterals(), declarations(), files, namedColours, sourceFiles(), srcDir (+1 more)

### Community 81 - "Bubble Link E2E"
Cohesion: 0.47
Nodes (8): Folder tree with stored sort, GET/PATCH /api/settings endpoint, getTree (folders.ts), settings.ts (getTreeSort, setTreeSort), Delta spec: shell (Folder tree, Tree sort preference), Requirement: Folder tree, Requirement: Tree sort preference (mixed, name, edited, created), Task unit 4: Tree sort preference

### Community 82 - "steps"
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

### Community 86 - "Preview fetch on the server"
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
Cohesion: 0.53
Nodes (5): handle(), menu(), openMenu(), openThree(), paragraph()

### Community 94 - "Solitude House Photo"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 95 - "Greek Lake Photo"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 96 - "Pinned order design (pin_order column, PUT /api/pinned, whole-list reorder)"
Cohesion: 0.60
Nodes (5): PUT /api/pinned endpoint, listPinned (notes.ts), reorderPinned (notes.ts), Requirement: Pinning (manual order, 409 stale reorder, migration keeps order), Task unit 2: Pinned order

### Community 97 - "App Type Declarations"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 98 - "uploads.test.ts"
Cohesion: 0.23
Nodes (9): getFile(), storeFile(), MAX_UPLOAD_BYTES, getNote(), POST(), load(), GET(), INLINE (+1 more)

### Community 99 - "emoji.ts"
Cohesion: 0.53
Nodes (4): Emoji, EMOJI, rows, searchEmoji()

### Community 103 - "release.yml"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 104 - "Folder counts design (folderCounts as single source)"
Cohesion: 0.50
Nodes (4): folderCounts (folders.ts), Delta spec: folders (Folder page), Requirement: Folder page (descendant counts), Task unit 3: Folder counts

### Community 105 - "@tiptap/pm"
Cohesion: 0.50
Nodes (4): @tiptap/pm@3.32.2, @tiptap/pm, Image, src()

### Community 106 - "with"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 107 - "check-tag"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 108 - "Notes Archive"
Cohesion: 0.50
Nodes (3): Learnings, Notes Archive, Specs

### Community 109 - "sidebar-collapse.test.ts"
Cohesion: 0.83
Nodes (3): sidebar(), width(), widthIs()

### Community 110 - "house-midcentury.jpg (mockup photo fixture)"
Cohesion: 0.50
Nodes (3): house-midcentury.jpg (mockup photo fixture), Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls), Striped Lawn and Pine/Deciduous Tree Landscape at Dusk

### Community 111 - "Interior Rio (mockup photo: ocean-view living room at dusk)"
Cohesion: 0.67
Nodes (4): Interior Rio (mockup photo: ocean-view living room at dusk), Ocean-view apartment living room (Rio de Janeiro, full moon over the sea), Warm neutral palette (white slipcovers, worn leather, weathered wood, stone floor), Wide landscape-format photo (approx. 2:1, high resolution)

### Community 112 - "publish"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 113 - "Multi-line titles design (CRLF to LF, titleLine helper, FTS unicode61)"
Cohesion: 0.83
Nodes (3): titleLine helper (src/lib/title.ts), Requirement: Multi-line titles, Task unit 5: Multi-line titles

### Community 114 - "house-solitude.jpg (mockup fixture photo)"
Cohesion: 0.67
Nodes (3): house-solitude.jpg (mockup fixture photo), Black timber-clad modern house in a wooded garden, Portrait-orientation real-world photo sample (inline image / media fixture)

### Community 115 - "Greek mountain lake (possibly Lake Doxa, Peloponnese)"
Cohesion: 1.00
Nodes (3): Greek mountain lake (possibly Lake Doxa, Peloponnese), Mountain lake valley viewed through conifers, lake-greek.jpg mockup photo

## Ambiguous Edges - Review These
- `helpers.ts` → `Quiet editor`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-03-build-notes-archive/specs/harness/spec.md · relation: conceptually_related_to
- `Mountain lake valley viewed through conifers` → `Greek mountain lake (possibly Lake Doxa, Peloponnese)`  [AMBIGUOUS]
  fixtures/mockups/lake-greek.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **68 isolated node(s):** `$app/tsconfig`, `Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls)`, `Striped Lawn and Pine/Deciduous Tree Landscape at Dusk`, `Wide landscape-format photo (approx. 2:1, high resolution)`, `Black timber-clad modern house in a wooded garden` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 690 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `UI Primitives and Motion`, `Design Tokens and Look`, `notes/autosave.test.ts`, `#lib`, `E2E Helpers and Tests`, `TreeRow.svelte`, `E2E Reset and Seed`, `Media Upload Blocks`, `Note Page and Autosave`, `Test-Only Routes`, `db.ts`, `Media E2E Tests`, `getDb`, `Folders Data Layer`, `Full-Text Search Index`, `Gate Workflow`, `editor/preview.ts`, `FolderPicker.svelte`, `TagInput.svelte`, `(app)/search/+page.svelte`, `Harness Spec (Change)`, `Shell and Tags Specs`, `@sveltejs/kit`, `toast.ts`, `schema.test.ts`, `Release Steps`, `Interior Living Photo`, `settings-api.test.ts`, `Release Artifact Download`, `uploads.test.ts`, `emoji.ts`, `title.ts`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls)`, `Striped Lawn and Pine/Deciduous Tree Landscape at Dusk` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Uploads and Preview Server` be split into smaller, more focused modules?**
  _Cohesion score 0.07686932215234102 - nodes in this community are weakly interconnected._
- **Why does `svelte` connect `svelte` to `CI Workflow`, `Plain Text Extraction`, `Uploads and Preview Server`, `Design Tokens and Look`, `autosave.ts`, `#lib`, `notes/autosave.test.ts`, `E2E Helpers and Tests`, `Release Steps`, `Primitives Mockup and Cover`, `@tiptap/core`, `UI Primitives and Motion`, `Look Research`, `toast.ts`, `Command Palette`, `npm Scripts`, `primitives/+page.svelte`, `FolderPicker.svelte`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Folder Tree Types` be split into smaller, more focused modules?**
  _Cohesion score 0.12033898305084746 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `helpers.ts` and `Quiet editor`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Mountain lake valley viewed through conifers` and `Greek mountain lake (possibly Lake Doxa, Peloponnese)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._