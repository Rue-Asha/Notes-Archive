# Graph Report - Notes-Archive  (2026-11-19)

## Corpus Check
- 484 files · ~293,272 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .css 7, .woff2 6, (none) 1)

## Summary
- 3409 nodes · 7051 edges · 185 communities (181 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 272 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c9f490c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- FolderHeader.svelte
- REMOVED Requirements
- shell/SideTree.svelte
- Design Tokens and Look
- NotePatch
- Breadcrumb.svelte
- App Shell Layout
- E2E Helpers and Tests
- types.ts
- vitest
- Requirement: Command palette
- Notes Archive: functional contract
- open
- Media Upload Blocks
- copy.ts
- Frame.svelte
- wire/tree/SideTree.svelte
- net.ts
- getDb
- Folders Data Layer
- Tiptap Editor Extensions
- Full-Text Search Index
- Block Menu Operations
- Command Palette
- hifi/search/+page.svelte
- notes.ts
- block-menu.test.ts
- SQL Migrations
- Core Design Decisions
- FocusTree.svelte
- Requirement: Folder tree
- Requirement: Folder page layout
- CI Workflow
- Plain Text Extraction
- shell/SortMenu.svelte
- TagInput.svelte
- uploads.test.ts
- a11y-seed.ts
- motion.ts
- Verification and Scope
- wire/note/+page.svelte
- reset
- @tiptap/core
- Emoji Picker and Note Icon
- Look Research
- svelte
- Editor Spec (Change)
- uploads.test.ts
- Harness Spec
- Inline images
- Scope and Research Risks
- Notes Spec (Change)
- Design System Spec
- design-system spec (build-notes-archive)
- Tags Data Layer
- hifi/editor/SlashMenu.svelte
- NoteProperties.svelte
- hifi/tree/SideTree.svelte
- calm
- Project Overview and Media
- #lib
- hifi/overlays/+page.svelte
- Shell and Search Specs (Change)
- vitest
- Link Preview Extension
- sidebar.ts
- EmojiPicker.svelte
- redesign/fixtures.ts
- hifi/home/Desk.svelte
- hifi/note/Icon.svelte
- Link Preview Spec (Change)
- Requirement: Home desk
- wire/search/+page.svelte
- Release Permissions
- hifi/folder/FolderBody.svelte
- OpenSpec Config
- TagInput.svelte
- Notes Archive: functional contract
- Banned patterns
- toast.ts
- folders spec (build-notes-archive)
- ui/Menu.svelte
- block-menu.test.ts
- Table E2E
- Folder cover
- updateNote
- Requirement: Folder page
- Emoji Search
- Release Deploy Inputs
- Release Tag Check
- Sidebar Collapse E2E
- Midcentury House Photo
- Editor.svelte
- folder-page.test.ts
- Solitude House Photo
- Greek Lake Photo
- button/Button.svelte
- App Type Declarations
- hifi/editor/+page.svelte
- 2026-11-17-redesign/tasks.md
- Pinned.svelte
- icon/+page.svelte
- JSONContent
- release.yml
- Design fingerprint: reference
- pinned-reorder.test.ts
- with
- check-tag
- Design System: Design fingerprint
- Requirement: Things the user makes move
- house-midcentury.jpg (mockup photo fixture)
- Interior Rio (mockup photo: ocean-view living room at dusk)
- publish
- settings-api.test.ts
- house-solitude.jpg (mockup fixture photo)
- Greek mountain lake (possibly Lake Doxa, Peloponnese)
- app.d.ts
- SvelteKit 3 #lib imports (no svelte.config.js)
- 3. Entities
- wire/folder/FolderBody.svelte
- check-slop.mjs
- NoteTitle.svelte
- hifi/note/+page.svelte
- IsoDateTime
- 2026-11-14-gate-1-decisions/proposal.md
- hifi/note/Properties.svelte
- (app)/+layout.svelte
- toast.svelte.ts
- Route /notes/[id] Note page
- hifi/note/NoteCard.svelte
- 4. Routes
- Requirement: Note page
- TableMenu.svelte
- time.ts
- Requirement: Editor on the fingerprint
- editor/preview.ts
- search-states.test.ts
- listPinned
- 2026-11-17-redesign/design.md
- 2026-11-17-redesign/proposal.md
- Requirement: Multi-line titles
- Requirement: Creating a note
- Requirement: Note cards
- Requirement: Focus tree
- Requirement: Tag page layout
- open
- 2026-11-17-redesign/flow.yaml
- MODIFIED Requirements
- Requirement: Title editing
- Requirement: Wide layouts
- core.ts
- Notes Archive
- MockData
- verification.md
- 2026-11-17-redesign/verification.md
- Requirement: Tag pages
- sidebar-collapse.test.ts
- Requirement: Deleting a note
- REMOVED Requirements
- Requirement: Folders page
- shell/tree/RenameField.svelte
- Requirement: Phone bar
- Requirement: Tags list
- Requirement: Tree expansion and keyboard
- palette-results.test.ts
- Requirement: Tree sort picker
- Note cards
- updateNote
- createToaster
- Managing folders in the tree
- PRODUCT.md
- Requirement: Dialogs and menus
- Requirement: Tree follows the open note
- Requirement: Tree rail
- ADDED Requirements
- Autosave
- wire/overlays/+page.svelte
- redesign-shots.test.ts
- Pinned.svelte
- Requirement: Extra blocks
- MODIFIED Requirements
- tag-input.test.ts
- wire/editor/SlashMenu.svelte
- Requirement: Note cards
- MODIFIED Requirements

## God Nodes (most connected - your core abstractions)
1. `reset()` - 101 edges
2. `seed()` - 99 edges
3. `open()` - 97 edges
4. `getDb()` - 91 edges
5. `calm()` - 88 edges
6. `@playwright/test` - 85 edges
7. `svelte` - 62 edges
8. `vitest` - 58 edges
9. `editor()` - 56 edges
10. `watchSaves()` - 45 edges

## Surprising Connections (you probably didn't know these)
- `What Changes` --references--> `getTree()`  [INFERRED]
  openspec/changes/archive/2026-11-14-gate-1-decisions/proposal.md → src/lib/server/folders.ts
- `Scenario: Default sort keeps folders by name and notes by last edited` --references--> `getTree()`  [INFERRED]
  openspec/changes/archive/2026-11-14-gate-1-decisions/specs/shell/spec.md → src/lib/server/folders.ts
- `Scenario: The preference survives a restart` --references--> `getTree()`  [INFERRED]
  openspec/changes/archive/2026-11-14-gate-1-decisions/specs/shell/spec.md → src/lib/server/folders.ts
- `Scenario: Tag counts include only notes using them` --references--> `listTags()`  [INFERRED]
  openspec/changes/archive/2026-11-14-gate-1-decisions/specs/tags/spec.md → src/lib/server/tags.ts
- `1. Vendor fingerprint 1.0.0 and the redesign mockup scaffold` --references--> `requireTestFlag()`  [INFERRED]
  openspec/changes/archive/2026-11-17-redesign/tasks.md → src/lib/server/test-flag.ts

## Import Cycles
- 2-file cycle: `src/lib/server/notes.ts -> src/lib/server/search.ts -> src/lib/server/notes.ts`
- 3-file cycle: `src/lib/server/notes.ts -> src/lib/server/tags.ts -> src/lib/server/search.ts -> src/lib/server/notes.ts`

## Hyperedges (group relationships)
- **Command palette entry points** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_command_palette, openspec_changes_archive_2026_11_03_build_notes_archive_specs_editor_spec_markdown_shortcuts_and_keys, openspec_changes_archive_2026_11_03_build_notes_archive_specs_home_spec_typographic_hero, openspec_changes_archive_2026_11_03_build_notes_archive_specs_shell_spec_desktop_sidebar [EXTRACTED 1.00]
- **User-facing routes of the contract** — docs_functional_contract_route_home, docs_functional_contract_route_folder, docs_functional_contract_route_note, docs_functional_contract_route_search, docs_functional_contract_route_tag [EXTRACTED 1.00]
- **Living room furnishing ensemble** — fixtures_mockups_interior_living_blue_sofa, fixtures_mockups_interior_living_shell_chair, fixtures_mockups_interior_living_floating_sideboard, fixtures_mockups_interior_living_herringbone_parquet, fixtures_mockups_interior_living_window_curtains [EXTRACTED 1.00]
- **Palette-on-phone gap resolved by S34 / U23** — openspec_changes_archive_2026_11_03_build_notes_archive_manual_checks_palette_on_phone_decision, openspec_changes_archive_2026_11_03_build_notes_archive_scope_s34_search_in_note_menu, openspec_changes_archive_2026_11_03_build_notes_archive_tasks_u23_search_in_note_menu, openspec_changes_archive_2026_11_03_build_notes_archive_verification_spec_coverage [EXTRACTED 1.00]
- **Derived search pipeline (content → plainText → foldSearch → notes_fts)** — openspec_changes_archive_2026_11_03_build_notes_archive_design_content_storage, openspec_changes_archive_2026_11_03_build_notes_archive_design_plaintext_walker, openspec_changes_archive_2026_11_03_build_notes_archive_design_foldsearch, openspec_changes_archive_2026_11_03_build_notes_archive_design_fts5_search, openspec_changes_archive_2026_11_03_build_notes_archive_design_schema_0002_core [EXTRACTED 1.00]
- **Derived plain text feeding search and snippets** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_editor_spec_plaintext, openspec_changes_archive_2026_11_03_build_notes_archive_specs_notes_spec_updatenote, openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_notes_fts, openspec_changes_archive_2026_11_03_build_notes_archive_specs_search_spec_full_text_search [INFERRED 0.85]
- **Look revision 1 inputs feeding the look pick** — openspec_changes_archive_2026_11_03_build_notes_archive_look_research_accent_options, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_glass_strengths, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_typeface_pairing, openspec_changes_archive_2026_11_03_build_notes_archive_look_research_smoked_tile, openspec_changes_archive_2026_11_03_build_notes_archive_design_look_revision_1, openspec_changes_archive_2026_11_03_build_notes_archive_design_look_pick [INFERRED 0.85]
- **Look system (tokens, look switches, glass material, fonts, app.html hooks)** — openspec_specs_design_system_spec_light_warm_tokens, openspec_specs_design_system_spec_look_switches, openspec_specs_design_system_spec_frosted_glass_material, openspec_specs_design_system_spec_fonts, src_app_look_placeholder, src_app_font_preloads [INFERRED 0.85]
- **Manual real-device verification (Playwright cannot emulate soft keyboard / native menus)** — openspec_specs_editor_spec_real_devices, openspec_specs_motion_spec_real_devices, openspec_specs_shell_spec_phone_bottom_bar_drawer, openspec_specs_design_system_spec_mockup_checkpoint [INFERRED 0.85]
- **Upload lifecycle (WebP storage, ownership, grace-period purge)** — openspec_changes_archive_2026_11_03_build_notes_archive_specs_media_spec_inline_images, openspec_changes_archive_2026_11_03_build_notes_archive_specs_media_spec_inline_files, openspec_changes_archive_2026_11_03_build_notes_archive_specs_notes_spec_removed_uploads_are_kept_for_a_grace_period, openspec_changes_archive_2026_11_03_build_notes_archive_specs_folders_spec_folder_cover, openspec_changes_archive_2026_11_03_build_notes_archive_specs_link_preview_spec_readpreview [INFERRED 0.85]
- **Upload lifecycle (WebP/file storage, ownership, grace-period purge, cascade delete)** — openspec_specs_media_spec_inline_images, openspec_specs_media_spec_inline_files, openspec_specs_notes_spec_upload_grace_period, openspec_specs_folders_spec_folder_cover, openspec_specs_link_preview_spec_preview_fetch, openspec_specs_notes_spec_deleting_note, openspec_specs_folders_spec_deleting_folder [INFERRED 0.85]

## Communities (185 total, 4 thin omitted)

### Community 0 - "FolderHeader.svelte"
Cohesion: 0.07
Nodes (35): createFolder(), renameFolder(), addFolder(), anchor, cut, deleting, { folder, crumbs, counts, empty, onadded }, hasCover (+27 more)

### Community 1 - "REMOVED Requirements"
Cohesion: 0.04
Nodes (45): ADDED Requirements, REMOVED Requirements, Requirement: Accessibility floor, Requirement: App icon, Requirement: Chrome cursor, Requirement: English copy, Requirement: Fonts, Requirement: Frosted glass material (+37 more)

### Community 2 - "shell/SideTree.svelte"
Cohesion: 0.17
Nodes (11): RAIL_SCRIPT, readCollapsed(), STORAGE_KEY, Store, writeCollapsed(), folded, home, search (+3 more)

### Community 3 - "Design Tokens and Look"
Cohesion: 0.05
Nodes (54): dependencies, lowlight@^3.3.0, sharp@^0.35.5, @tiptap/core@3.32.2, @tiptap/extension-bubble-menu@3.32.2, @tiptap/extension-code@3.32.2, @tiptap/extension-code-block-lowlight@3.32.2, @tiptap/extension-details@3.32.2 (+46 more)

### Community 4 - "NotePatch"
Cohesion: 0.16
Nodes (10): AutosaveOptions, createAutosave(), change(), flush(), request(), stop(), DEBOUNCE_MS, DISCRETE (+2 more)

### Community 5 - "Breadcrumb.svelte"
Cohesion: 0.18
Nodes (9): { crumbs }, current, head, list, more, narrow, path, shortened (+1 more)

### Community 6 - "App Shell Layout"
Cohesion: 0.07
Nodes (34): dropPdf(), openEmptyNote(), PDF, openThree(), paragraph(), editor(), notes(), chooseVia() (+26 more)

### Community 7 - "E2E Helpers and Tests"
Cohesion: 0.12
Nodes (28): BADGES, FileCard, fileKind(), KIND_NAMES, mediaExtensions(), pick(), begin(), Candidate (+20 more)

### Community 8 - "types.ts"
Cohesion: 0.09
Nodes (25): ancestorsOf(), indentLevel(), MAX_INDENT, noteTotal(), Target, tree, folders, folderText (+17 more)

### Community 9 - "vitest"
Cohesion: 0.07
Nodes (25): sharp, lock, lockPath, problems, root, OLD_FILES, sources(), hash (+17 more)

### Community 10 - "Requirement: Command palette"
Cohesion: 0.06
Nodes (35): ADDED Requirements, MODIFIED Requirements, Requirement: Command palette, Requirement: Palette on the fingerprint, Requirement: Search page states, Scenario: A failed search clears the hits and says so, Scenario: A title-only hit highlights its title, Scenario: Arrow keys and Enter open a result (+27 more)

### Community 11 - "Notes Archive: functional contract"
Cohesion: 0.14
Nodes (15): 10. Route coverage check, 11. Graph notes, 12. Open questions for Rue, 1. Purpose and context, 2. Jobs-to-be-done, 5.1 Core editing behaviour (kept), 5.2 Editor chrome (redesignable; every action must remain), 5. Editor behaviour (TipTap / ProseMirror) (+7 more)

### Community 12 - "open"
Cohesion: 0.14
Nodes (7): open(), FILES, untitled(), input(), palette(), openFirstTag(), openTag()

### Community 13 - "Media Upload Blocks"
Cohesion: 0.15
Nodes (18): @sveltejs/kit, requireTestFlag(), SeedInput, SeedResult, load(), photo(), run(), GET() (+10 more)

### Community 14 - "copy.ts"
Cohesion: 0.07
Nodes (37): COPY, items, { open, anchor, name, onnewnote, onnewfolder, onrename, onmove, ondelete, onclose }, Props, { notes, label = 'Notes' }, { pinned, recent }, deleteNoteRequest(), patchNote() (+29 more)

### Community 15 - "Frame.svelte"
Cohesion: 0.07
Nodes (40): data, folded, hifi, { nav, children, posture, view, current, rail = false, tags, look, tag = false }, Props, screen, Section, section (+32 more)

### Community 16 - "wire/tree/SideTree.svelte"
Cohesion: 0.06
Nodes (43): MockFolder, MockNoteRef, MockTag, { folders, tags, sort, worst, menuOpen = false }, data, tree, base, countFolders() (+35 more)

### Community 17 - "net.ts"
Cohesion: 0.06
Nodes (46): FetchError, FAKE_PAGES, fakeImage(), fakeRemote, parse(), DEFAULT_TIMEOUT_MS, ipv4Blocked(), isBlockedAddress() (+38 more)

### Community 18 - "getDb"
Cohesion: 0.10
Nodes (25): init(), getDb(), listNotes(), purgeOrphans(), count(), exists(), ids(), marked() (+17 more)

### Community 19 - "Folders Data Layer"
Cohesion: 0.09
Nodes (25): @tiptap/pm@3.32.2, @tiptap/pm, blockItems, button, close(), count, editor, index (+17 more)

### Community 20 - "Tiptap Editor Extensions"
Cohesion: 0.08
Nodes (25): name, runs-on, steps, runner, jobs, ci, name, on (+17 more)

### Community 21 - "Full-Text Search Index"
Cohesion: 0.16
Nodes (26): Context, Scenario: Server folder delete removes descendants, notes and uploads, NotFoundError, breadcrumb(), byName(), cleanName(), collator, createFolder() (+18 more)

### Community 22 - "Block Menu Operations"
Cohesion: 0.10
Nodes (24): ATOMS, beaconDiscard(), discardNote(), isBlankDoc(), isEmptyNote(), url(), Note, allCrumbs (+16 more)

### Community 23 - "Command Palette"
Cohesion: 0.07
Nodes (33): actions, active, answered, choose(), editorOf(), failed, hits, input (+25 more)

### Community 24 - "hifi/search/+page.svelte"
Cohesion: 0.05
Nodes (43): MockCard, data, hits, miss, query, states, actionCount, actions (+35 more)

### Community 25 - "notes.ts"
Cohesion: 0.08
Nodes (39): 2. Pinned order, 3. Folder counts, 5. Multi-line titles, 6. Tag page redirect, 7. Wrap-up, assertFolder(), createNote(), deleteNote() (+31 more)

### Community 26 - "block-menu.test.ts"
Cohesion: 0.53
Nodes (5): handle(), menu(), openMenu(), openThree(), paragraph()

### Community 27 - "SQL Migrations"
Cohesion: 0.12
Nodes (21): images, files, files_note, folders, folders_parent, images_folder_cover, images_note, note_tags (+13 more)

### Community 28 - "Core Design Decisions"
Cohesion: 0.13
Nodes (8): Design: build-notes-archive, COPY strings (src/lib/copy.ts), E2E conventions, E2E helpers (e2e/helpers.ts: reset, seed, watchSaves, clientNav), plainText hand-written JSON walker (plaintext.ts), Schema migration 0002_core.sql (folders, notes, tags, files, notes_fts), softKeyboard state (keyboard.svelte.ts), Tiptap v3 editor spike (MIT, no official slash menu)

### Community 29 - "FocusTree.svelte"
Cohesion: 0.06
Nodes (36): below(), chainTo(), FocusTarget, FocusView, focusView(), SHORTEN_FROM, shortenPath(), japan (+28 more)

### Community 30 - "Requirement: Folder tree"
Cohesion: 0.11
Nodes (17): ADDED Requirements, MODIFIED Requirements, Requirement: Folder tree, Requirement: Tree sort preference, Scenario: An edited note lifts its folder, Scenario: An unknown mode is refused, Scenario: Current item is highlighted in the tree, Scenario: Deep nesting caps the indent (+9 more)

### Community 31 - "Requirement: Folder page layout"
Cohesion: 0.06
Nodes (34): ADDED Requirements, MODIFIED Requirements, Requirement: Deleting a folder, Requirement: Folder cover, Requirement: Folder page, Requirement: Folder page layout, Requirement: Phone drill-down, Scenario: Back goes up a level (+26 more)

### Community 32 - "CI Workflow"
Cohesion: 0.13
Nodes (13): Box, fit(), placeFloating(), anchor, command, items, key(), list (+5 more)

### Community 33 - "Plain Text Extraction"
Cohesion: 0.28
Nodes (9): clean(), emptyDoc(), isRaw(), kids(), marks(), Raw, sanitize(), schema (+1 more)

### Community 34 - "shell/SortMenu.svelte"
Cohesion: 0.12
Nodes (15): count(), escape(), inSource(), choose(), close(), items, mode, open (+7 more)

### Community 35 - "TagInput.svelte"
Cohesion: 0.13
Nodes (22): { query, clamp = false }, escape(), hitDisplay(), markWords(), parseQuery(), searchHref(), parse(), key() (+14 more)

### Community 36 - "uploads.test.ts"
Cohesion: 0.12
Nodes (17): Mockup photo credits (CC0 Wikimedia Commons), Synthetic photo generation (scripts/synthetic-photo.mjs, gradient + grain), lake-moraine.jpg (mockup photo fixture), Landscape-orientation high-detail photo sample for media mockups, Snow-streaked rocky peaks above Moraine Lake (Valley of the Ten Peaks), stone-clay.jpg (synthetic mockup image), Warm clay gradient with grain (dark brown to warm clay with a peach bloom lower left), stone-sand.jpg (synthetic mockup image) (+9 more)

### Community 37 - "a11y-seed.ts"
Cohesion: 0.16
Nodes (13): Box, MOVEMENT, cell(), ICONS, longNote, Pages, paragraph(), screens() (+5 more)

### Community 38 - "motion.ts"
Cohesion: 0.14
Nodes (22): { folders, label = COPY.folders, renaming = null, onrename, oncancel }, Props, Row, { notes, home = false, tagged = false }, { folders, notes = [], depth = 0, current, expanded, toggle, onmenu, renaming, onrename, oncancel, trail = [], tabbable }, motion, Props, live() (+14 more)

### Community 39 - "Verification and Scope"
Cohesion: 0.11
Nodes (18): uses, with, concurrency, cancel-in-progress, group, jobs, ci, security-baseline (+10 more)

### Community 40 - "wire/note/+page.svelte"
Cohesion: 0.09
Nodes (23): LONG_TITLE, NoteView, Status, TWELVE_LINES, createdOn(), day, editedAt(), stamp (+15 more)

### Community 41 - "reset"
Cohesion: 0.07
Nodes (23): reisen(), Window, chrome, seedDesk(), back(), main(), reisen(), ago() (+15 more)

### Community 42 - "@tiptap/core"
Cohesion: 0.13
Nodes (22): @tiptap/core, blockExtensions(), blockSlashItems, ScrollView, bubbleExtensions(), Callout, Commands, @tiptap/core (+14 more)

### Community 43 - "Emoji Picker and Note Icon"
Cohesion: 0.14
Nodes (16): harness spec (build-notes-archive), calm, Database and migrations, E2E projects and isolation, Harness declaration, Health route, GET /healthz, NOTES_ARCHIVE_TEST flag (+8 more)

### Community 44 - "Look Research"
Cohesion: 0.08
Nodes (15): apply(), editor, linking, marks, palette, shown, version, withScheme() (+7 more)

### Community 45 - "svelte"
Cohesion: 0.07
Nodes (24): svelte, Props, { title, body, heading = 'h2', action }, describedby, {
		label,
		value = $bindable(''),
		hint,
		error,
		variant = 'pill',
		type = 'text',
		prefix,
		suffix,
		hideLabel = false,
		id = uid,
		...rest
	}, Props, uid, ariaCurrent (+16 more)

### Community 46 - "Editor Spec (Change)"
Cohesion: 0.16
Nodes (16): Gate 2 manual checks, Open decision: palette on phone while editor focused, Real-device checks (motion, editor menus, bottom bar, live link preview), Proposal: build-notes-archive, New capabilities (harness, design-system, shell, motion, home, notes, editor, media, link-preview, folders, tags, search), Done criteria, Proposal non-goals, Non-goals (no dark mode, trash, sync, auth, import) (+8 more)

### Community 47 - "uploads.test.ts"
Cohesion: 0.13
Nodes (22): Scenario: Server replaces covers and stores them as WebP, UploadError, getFile(), storeFile(), count(), convert(), FORMATS, getImage() (+14 more)

### Community 48 - "Harness Spec"
Cohesion: 0.23
Nodes (12): Command palette (Cmd/Ctrl+K, glass, full-screen on phone), Search page (/search?q, folder and tag filters, searchNotes), search Specification, Desktop sidebar (glass, collapsible icon rail), Folder tree (sidebar and drawer, capped indent), Phone bottom bar and drawer, shell Specification, Sidebar Tags section (+4 more)

### Community 49 - "Inline images"
Cohesion: 0.15
Nodes (18): link-preview spec (build-notes-archive), POST /api/preview, FetchError, linkPreview node, parsePreview, Preview cards in the editor, Preview fetch on the server, readPreview (+10 more)

### Community 50 - "Scope and Research Risks"
Cohesion: 0.18
Nodes (15): Shared components (eyebrow, dark CTA pill with round arrow, two-line display headline), Deleting a folder (cascade to descendants, notes, uploads), Folder cover (WebP in SQLite, ≤16 MB), Folder page (breadcrumb, cover header, sub-folder tiles, note cards), Managing folders in the tree (create, rename, Move to…, moveFolder), Moving a note (properties row Folder picker, card Move to…), folders Specification, Home bento (Pinned, Recently edited, Folders; welcome state) (+7 more)

### Community 51 - "Notes Spec (Change)"
Cohesion: 0.15
Nodes (20): Command palette (Cmd/Ctrl+K), Copy list of e2e-asserted strings, Folder entity (unlimited nesting, cover, descendant counts), Folder entry (shared list object), Folder tree with stored sort, Gate-1 decisions (8 answers by Rue), Multi-line note titles (Enter inserts line break; Cmd/Ctrl+Enter to body), Note entity (title, icon, content, tags, pin order, timestamps) (+12 more)

### Community 52 - "Design System Spec"
Cohesion: 0.24
Nodes (13): Look pick: bronze accent, clear glass, glass cards, Look revision 1 (Rue, 2026-11-02), Look research — revision 1, Accent options bronze / moss / slate, Atmosphere gradient (greige ground, peach light, taupe floor), Card styles glass / paper / outline, Gap analysis: mockups vs recipe, Glass strengths soft / clear / frosted (+5 more)

### Community 53 - "design-system spec (build-notes-archive)"
Cohesion: 0.19
Nodes (14): design-system spec (build-notes-archive), Dark CTA pill with round arrow, Tracked uppercase eyebrow, Figtree UI font, Fonts, Look switches, LOOK (src/lib/styles/look.ts), Mockup checkpoint (+6 more)

### Community 54 - "Tags Data Layer"
Cohesion: 0.15
Nodes (16): Light warm tokens, Text-colour palette (stone, clay, ochre, moss, sea, plum), tokens.css, editor spec (build-notes-archive), Block handle and block menu, Bubble toolbar, Callout block, Code block with syntax highlighting (+8 more)

### Community 55 - "hifi/editor/SlashMenu.svelte"
Cohesion: 0.17
Nodes (10): current, currentGroup, flat, Group, groups, numbered, Props, { query = '', active = 0, emptyResult = false } (+2 more)

### Community 56 - "NoteProperties.svelte"
Cohesion: 0.10
Nodes (18): { folderId, path, tree, onchange }, full, open, shortPath(), chosen, count, day, { note, path, tree, tags, icon, onchange } (+10 more)

### Community 57 - "hifi/tree/SideTree.svelte"
Cohesion: 0.06
Nodes (33): TreeSort, { folders, tags, sort, worst, menuOpen = false }, total, uid, countNotes(), link(), plural(), TreeView (+25 more)

### Community 58 - "calm"
Cohesion: 0.09
Nodes (13): Harness, openNote(), field(), nodes(), setup(), toolbar(), openDoc(), calm() (+5 more)

### Community 59 - "Project Overview and Media"
Cohesion: 0.17
Nodes (14): Content storage as ProseMirror JSON with derived plain text (plainText), Database and migrations (SQLite WAL, schema_migrations), E2E projects and isolation (phone/desktop, .e2e/$PORT.db), Health route (/healthz 200 ok / 503), Package tarball (dist/notes-archive-<version>.tgz + .sha256), Proof commands (npm run proof / proof:full), harness Specification, Test-only routes and helpers (/__test/reset, seed, counts, note; e2e/helpers.ts) (+6 more)

### Community 60 - "#lib"
Cohesion: 0.12
Nodes (11): { open = $bindable(false), title, kicker, label, mode = 'sheet', alert = false, closeLabel = 'Close', onclose, children, actions }, Props, uid, asking, { open, title, message, confirmLabel, danger = false, onconfirm, oncancel }, Props, cut, { data } (+3 more)

### Community 61 - "hifi/overlays/+page.svelte"
Cohesion: 0.07
Nodes (24): menu, MenuItem, {
		name,
		items,
		radio = false,
		icon,
		onselect
	}, { id, title, kicker, body, alert = false, wide = false, children, actions }, Props, all, checking, currentId (+16 more)

### Community 62 - "Shell and Search Specs (Change)"
Cohesion: 0.18
Nodes (11): Creative Archive (sibling app), Fake remote with canned pages (garden.example, plain.example, pdf.example, blocked.example), Risks / trade-offs (R1–R8, uploads, ß tags), safeFetch SSRF guard, Research: build-notes-archive (explore), Creative Archive inventory, Dialogue decisions (archive = library, folders + tags, Notion mechanics), Scope: build-notes-archive (+3 more)

### Community 63 - "vitest"
Cohesion: 0.12
Nodes (25): vitest, docFromText(), closeDb(), cards(), listRecent(), filters(), archive(), indexNote() (+17 more)

### Community 64 - "Link Preview Extension"
Cohesion: 0.31
Nodes (9): Self-hosted fonts requirement (Newsreader display, Figtree UI), .glass frosted material with --glass-fallback, Light warm tokens (tokens.css / tokens.ts), Look switches (data-accent, data-glass, data-card; LOOK in look.ts), Mockup pages (/__mockups, env-gated), design-system Specification, app.html document shell, Font preloads (Newsreader opsz normal/italic, Figtree wght woff2) (+1 more)

### Community 65 - "sidebar.ts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, package, prepare, preview, proof (+3 more)

### Community 66 - "EmojiPicker.svelte"
Cohesion: 0.14
Nodes (12): anchor, { icon, onchange }, open, Emoji, EMOJI, rows, searchEmoji(), body (+4 more)

### Community 67 - "redesign/fixtures.ts"
Cohesion: 0.30
Nodes (10): blocks(), cards(), day(), mockData(), nest(), normalSet(), pad(), worstSet() (+2 more)

### Community 68 - "hifi/home/Desk.svelte"
Cohesion: 0.07
Nodes (33): initial(), MONTHS, noteCount(), NOW, PINNED_CONFLICT, relTime(), SAVE_FAILED, withWorstTags() (+25 more)

### Community 69 - "hifi/note/Icon.svelte"
Cohesion: 0.20
Nodes (7): at, { first = false, last = false, turnInto = false, total = 12 }, Props, turn, Name, { name, size = 18 }, PATHS

### Community 70 - "Link Preview Spec (Change)"
Cohesion: 0.18
Nodes (11): Accessibility & Inclusion, Brand Commitments, Capabilities and Constraints, Evidence on Hand, Operating Context, Platform, Positioning, Product (+3 more)

### Community 71 - "Requirement: Home desk"
Cohesion: 0.08
Nodes (23): ADDED Requirements, REMOVED Requirements, Requirement: Home bento, Requirement: Home desk, Requirement: Pinned reorder, Requirement: Typographic hero, Scenario: A stale reorder reloads the list with a toast, Scenario: Drag a pinned note to a new place (+15 more)

### Community 72 - "wire/search/+page.svelte"
Cohesion: 0.08
Nodes (30): data, hits, miss, query, states, actions, Props, shown (+22 more)

### Community 73 - "Release Permissions"
Cohesion: 0.29
Nodes (8): Harness declaration (proof, proof-full, run, package, ship: ask), Notes Archive (project overview), Harness declaration requirement for CLAUDE.md, Link preview cards in the editor (linkPreview node), link-preview Specification, Inline files (file cards, /files/<id>, nosniff + CSP sandbox), Inline images (WebP via sharp, stored in SQLite, /images/<id>), media Specification

### Community 74 - "hifi/folder/FolderBody.svelte"
Cohesion: 0.06
Nodes (29): compact, counts, cut, empty, { folder, worst, posture, opened = false }, FolderView, lead, more (+21 more)

### Community 75 - "OpenSpec Config"
Cohesion: 0.20
Nodes (9): base, gate0, gate1, gate2, learnings, look_pick, ship_note, ship_override (+1 more)

### Community 76 - "TagInput.svelte"
Cohesion: 0.18
Nodes (14): input(), active, addTag(), clean(), confirm(), input, oninput(), onkeydown() (+6 more)

### Community 77 - "Notes Archive: functional contract"
Cohesion: 0.36
Nodes (7): Card to note morph (View Transition, note-<id>), Glass hover glow (opacity only), Lists stagger in (data-revealed), Page transitions (fade/slide; reduced motion ≤120 ms fade), Motion on real devices (manual), motion Specification, Note cards (snippet, tag chips, relativeTime, card menu)

### Community 78 - "Banned patterns"
Cohesion: 0.07
Nodes (26): accent-word-overuse, animated-blur, avatar-stack, Banned patterns, chunky-display, cream-paper, emoji-icons, explore-showreel-pair (+18 more)

### Community 79 - "toast.ts"
Cohesion: 0.17
Nodes (11): attach, dismiss, flush, park, Queued, STORAGE_KEY, Store, TOAST_MS (+3 more)

### Community 80 - "folders spec (build-notes-archive)"
Cohesion: 0.25
Nodes (9): folders spec (build-notes-archive), createFolder, deleteFolder, Deleting a folder, Folder page, folderCounts, Managing folders in the tree, moveFolder (+1 more)

### Community 81 - "ui/Menu.svelte"
Cohesion: 0.23
Nodes (10): byLabel, close(), entries, keys(), { open, anchor, label, items, onclose }, opener(), outside(), pop (+2 more)

### Community 82 - "block-menu.test.ts"
Cohesion: 0.31
Nodes (9): steps, GH_TOKEN, steps, env, id, name, run, uses (+1 more)

### Community 83 - "Table E2E"
Cohesion: 0.25
Nodes (8): Types contract (src/lib/types.ts), Tasks: build-notes-archive (23 units, 9 waves), Fail-first rule (Scenario tests red before code), Look walk per UI unit, Taste stop at task 4.6 (mockup approval), Unit 3: contract (types, schema, plain text, stubs, test routes), Unit 4: mockups, photos and look checkpoint, Parallel unit waves W1–W9 in worktrees

### Community 84 - "Folder cover"
Cohesion: 0.15
Nodes (13): Folder cover, removeFolderCover, setFolderCover, home spec (build-notes-archive), Home bento, notes spec (build-notes-archive), createNote, Creating a note (+5 more)

### Community 85 - "updateNote"
Cohesion: 0.25
Nodes (9): Moving a note, Note page, Properties row (Folder, Tags, Pinned), Tags section, tags spec (build-notes-archive), listTags, setNoteTags, Tag input (+1 more)

### Community 86 - "Requirement: Folder page"
Cohesion: 0.20
Nodes (9): MODIFIED Requirements, Requirement: Folder page, Scenario: Empty folder offers New note and New folder, Scenario: Folder page shows breadcrumb, cover header and counts, Scenario: Folder page shows sub-folders and notes by last edited, Scenario: Folder without a cover shows a typographic tile, Scenario: Header and parent tile count the same, Scenario: New folder from a folder page creates a sub-folder (+1 more)

### Community 87 - "Emoji Search"
Cohesion: 0.39
Nodes (7): Block handle and block menu (drag, Move up/down, Turn into, Delete; moveBlock), Bubble toolbar (marks, link, text colour), Extra blocks (Toggle, Callout, Code w/ highlighting, Table, Divider, Task list), Markdown shortcuts and keys (Cmd/Ctrl+B/I/E/K, undo/redo), Slash menu (block type picker), editor Specification, Quiet editor (no animation while typing)

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

### Community 92 - "Editor.svelte"
Cohesion: 0.20
Nodes (7): noteId(), editor, { noteId, content, onchange, onblur }, Props, root, version, softKeyboard

### Community 93 - "folder-page.test.ts"
Cohesion: 0.15
Nodes (11): bare(), cover(), crumbs(), folderRows(), main(), noteRows(), counts(), photo() (+3 more)

### Community 94 - "Solitude House Photo"
Cohesion: 0.29
Nodes (7): name, needs, secrets, uses, bump, app_id, app_private_key

### Community 95 - "Greek Lake Photo"
Cohesion: 0.29
Nodes (7): with, github-token, name, path, persist-credentials, run-id, subject-path

### Community 96 - "button/Button.svelte"
Cohesion: 0.18
Nodes (8): dark, inert, Props, {
		variant = 'secondary',
		size = 'm',
		icon = false,
		arrow = false,
		href,
		type = 'button',
		disabled = false,
		loading = false,
		loadingLabel = 'Working',
		label,
		children,
		onclick,
		...rest
	}, list, { open, tree, current, exclude, onpick, oncancel }, Props, rows

### Community 97 - "App Type Declarations"
Cohesion: 0.29
Nodes (6): $app/tsconfig, compilerOptions, strict, exclude, extends, include

### Community 98 - "hifi/editor/+page.svelte"
Cohesion: 0.11
Nodes (22): MockBlock, actions, { blocks, tableActions = false, openToggle = false, handleAt = null }, Props, toggles, marks, { mode = 'format' }, Props (+14 more)

### Community 99 - "2026-11-17-redesign/tasks.md"
Cohesion: 0.09
Nodes (21): 10. ⛔ Build preconditions (human stop, orchestrator), 11. Shell foundation: fingerprint switch, icon links, capture, sort menu, tag list, copy, 12. Desktop focus tree, rail and tags, 13. Phone bar, 14. Dialogs, menus, choosers and toasts, 15. Home desk and pinned reorder, 16. Folder page, Folders page and phone drill-down, 17. Note page (+13 more)

### Community 100 - "Pinned.svelte"
Cohesion: 0.08
Nodes (28): anchor, choose(), { folderId, hasCover }, input, items, open, remove(), counts (+20 more)

### Community 101 - "icon/+page.svelte"
Cohesion: 0.09
Nodes (7): family, grounds, previous, small, Variant, variants, worst

### Community 102 - "JSONContent"
Cohesion: 0.13
Nodes (7): openNote(), nodes(), ofType(), item(), text(), StoredNote, JSONContent

### Community 103 - "release.yml"
Cohesion: 0.33
Nodes (5): jobs, name, on, push, tags

### Community 104 - "Design fingerprint: reference"
Cohesion: 0.06
Nodes (36): Accent sets, Accessibility, App icons, Buttons, Cards, rows, toasts, Colour tokens, Components, Composition tokens (`tokens.css`, "Composition (layout.css)") (+28 more)

### Community 105 - "pinned-reorder.test.ts"
Cohesion: 0.31
Nodes (8): recent(), animationsDuringMove(), entry(), menuOf(), pinned(), pinnedABC(), titles(), Contracts

### Community 106 - "with"
Cohesion: 0.40
Nodes (5): with, app, host_vars_path, tag, variable

### Community 107 - "check-tag"
Cohesion: 0.40
Nodes (5): name, outputs, runs-on, check-tag, ci-run-id

### Community 108 - "Design System: Design fingerprint"
Cohesion: 0.10
Nodes (20): Accent: one per app, Accessibility, Colors, Components, Design System: Design fingerprint, Do:, Do's and Don'ts, Don't: (+12 more)

### Community 109 - "Requirement: Things the user makes move"
Cohesion: 0.10
Nodes (19): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Card to note morph, Requirement: Glass hover glow, Requirement: Lists stagger in, Requirement: Motion on real devices, Requirement: Page transitions (+11 more)

### Community 110 - "house-midcentury.jpg (mockup photo fixture)"
Cohesion: 0.50
Nodes (3): house-midcentury.jpg (mockup photo fixture), Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls), Striped Lawn and Pine/Deciduous Tree Landscape at Dusk

### Community 111 - "Interior Rio (mockup photo: ocean-view living room at dusk)"
Cohesion: 0.67
Nodes (4): Interior Rio (mockup photo: ocean-view living room at dusk), Ocean-view apartment living room (Rio de Janeiro, full moon over the sea), Warm neutral palette (white slipcovers, worn leather, weathered wood, stone floor), Wide landscape-format photo (approx. 2:1, high resolution)

### Community 112 - "publish"
Cohesion: 0.50
Nodes (4): publish, name, needs, runs-on

### Community 113 - "settings-api.test.ts"
Cohesion: 0.13
Nodes (21): Contracts, Decisions, Gate-1 sign-off, Goals / Non-Goals, Migration, Risks / Trade-offs, 1. Migration and shared types, 4. Tree sort preference (+13 more)

### Community 114 - "house-solitude.jpg (mockup fixture photo)"
Cohesion: 0.67
Nodes (3): house-solitude.jpg (mockup fixture photo), Black timber-clad modern house in a wooded garden, Portrait-orientation real-world photo sample (inline image / media fixture)

### Community 115 - "Greek mountain lake (possibly Lake Doxa, Peloponnese)"
Cohesion: 1.00
Nodes (3): Greek mountain lake (possibly Lake Doxa, Peloponnese), Mountain lake valley viewed through conifers, lake-greek.jpg mockup photo

### Community 118 - "3. Entities"
Cohesion: 0.20
Nodes (10): 3. Entities, 9. Behavioural `data-*` allow-list, Folder, Note, Save state (client), Search hit, Tag, Uploads (images, files, link-preview images, folder covers) (+2 more)

### Community 119 - "wire/folder/FolderBody.svelte"
Cohesion: 0.13
Nodes (14): counts, empty, { folder, worst, posture }, FolderView, more, parent, shortened, shown (+6 more)

### Community 120 - "check-slop.mjs"
Cohesion: 0.11
Nodes (14): args, banned, bannedPath, baselineFlag, checkDecl(), explicitBanned, files, NAMED (+6 more)

### Community 121 - "NoteTitle.svelte"
Cohesion: 0.16
Nodes (15): cut, field, focused, keydown(), lead, long, onLastRow(), Props (+7 more)

### Community 122 - "hifi/note/+page.svelte"
Cohesion: 0.14
Nodes (15): LONG_TAG, LONG_TITLE, NoteView, Status, TWELVE_LINES, blocks, data, fresh (+7 more)

### Community 123 - "IsoDateTime"
Cohesion: 0.40
Nodes (5): Saved, SeedFolder, SeedNote, IsoDateTime, TagRef

### Community 124 - "2026-11-14-gate-1-decisions/proposal.md"
Cohesion: 0.20
Nodes (9): Appetite, Capabilities, Done criteria, Impact, Modified Capabilities, New Capabilities, Non-Goals, What Changes (+1 more)

### Community 125 - "hifi/note/Properties.svelte"
Cohesion: 0.15
Nodes (15): createdOn(), day, editedAt(), shortPath(), stamp, tagCount(), chosen, folder (+7 more)

### Community 127 - "toast.svelte.ts"
Cohesion: 0.20
Nodes (14): dismiss(), DURATION, pause(), resume(), start(), timers, Toast, toast() (+6 more)

### Community 128 - "Route /notes/[id] Note page"
Cohesion: 0.25
Nodes (9): Block actions / Block menu (move, turn into, delete; touch reordering), Editor behaviour (TipTap/ProseMirror core and chrome), Link preview, Paste, drop and upload behaviour, Route /notes/[id] Note page, Save state (idle, pending, saving, saved, error, deleted), Slash menu (block insertion), Toasts (failure messages) (+1 more)

### Community 129 - "hifi/note/NoteCard.svelte"
Cohesion: 0.11
Nodes (17): all, anchor, cut, gone, held, Item, items, keep (+9 more)

### Community 130 - "4. Routes"
Cohesion: 0.25
Nodes (8): 4.1 `/` Home, 4.2 `/folders/[id]` Folder page, 4.3 `/notes/[id]` Note page, 4.4 `/search` Search page, 4.5 `/tags/[id]` Tag page, 4.6 Shared object: Note entry (Home, folder, tag, search), 4.7 Shared object: Folder entry (Home, folder page), 4. Routes

### Community 131 - "Requirement: Note page"
Cohesion: 0.17
Nodes (12): Requirement: Note page, Scenario: Emoji picker is usable on phone, Scenario: Long folder path stays readable in the properties, Scenario: Many tags wrap without horizontal scroll, Scenario: Note page shows icon, title and body, Scenario: Note without tags shows no tag count, Scenario: Pick, change and remove the note icon, Scenario: Properties collapse into a summary on the phone (+4 more)

### Community 132 - "TableMenu.svelte"
Cohesion: 0.09
Nodes (19): Codebase touchpoints, Decisions, Done when, Flows, In scope, Non-goals, Problem, Scope: redesign (+11 more)

### Community 133 - "time.ts"
Cohesion: 0.17
Nodes (11): dayDate(), LONG_MONTHS, longDay(), MONTHS, relativeTime(), SHORT_WEEKDAYS, shortDate(), now (+3 more)

### Community 134 - "Requirement: Editor on the fingerprint"
Cohesion: 0.06
Nodes (32): cell(), table(), details(), ADDED Requirements, MODIFIED Requirements, Requirement: Editor on the fingerprint, Requirement: Extra blocks, Scenario: A level-3 heading reads as a ruled overline (+24 more)

### Community 135 - "editor/preview.ts"
Cohesion: 0.47
Nodes (4): LinkPreview, cardFor(), domainOf(), standaloneUrl()

### Community 136 - "search-states.test.ts"
Cohesion: 0.60
Nodes (5): cards(), field(), folder(), main(), tag()

### Community 137 - "listPinned"
Cohesion: 0.11
Nodes (25): Requirement: Pinning, Scenario: A new pin goes to the top of a custom order, Scenario: A stale reorder is refused, Scenario: Migration keeps the existing order, Scenario: Pin from a card menu, Scenario: Pin from the properties row, Scenario: Pinned notes appear on Home most recently pinned first, Scenario: Re-pinning does not keep the old position (+17 more)

### Community 138 - "2026-11-17-redesign/design.md"
Cohesion: 0.20
Nodes (9): Context, Decisions, From scope (gate 3, Rue), Gate log, Goals / Non-Goals, Migration Plan, Open Questions, Planning decisions (planner, 2026-11-14; P1 and P5 confirmed by Rue at Gate 1, 2026-11-14) (+1 more)

### Community 139 - "2026-11-17-redesign/proposal.md"
Cohesion: 0.22
Nodes (8): Appetite, Capabilities, Done criteria, Impact, New Capabilities, Non-Goals, What Changes, Why

### Community 140 - "Requirement: Multi-line titles"
Cohesion: 0.25
Nodes (7): ADDED Requirements, MODIFIED Requirements, Requirement: Multi-line titles, Scenario: A line-break-only title is still untitled, Scenario: A multi-line title round-trips, Scenario: Single-line contexts collapse line breaks, Scenario: Words on every title line are found

### Community 141 - "Requirement: Creating a note"
Cohesion: 0.22
Nodes (9): Requirement: Creating a note, Scenario: Empty new note is discarded on leaving, Scenario: New note from the shell lands in the current folder, Scenario: New note shows its placeholders, Scenario: New note without a current folder lands at the top level, Scenario: Note with only a title is kept, Scenario: Opening a new empty note focuses the title, Scenario: Server creates notes at the root or in a folder (+1 more)

### Community 142 - "Requirement: Note cards"
Cohesion: 0.22
Nodes (9): Requirement: Note cards, Scenario: Card shows its first tag and +n, Scenario: Edited time reads relative, Scenario: Long tags never run into the time, Scenario: Note card shows its parts, Scenario: Note without text shows Empty note, Scenario: Search results are numbered rows with folder and date, Scenario: Snippet skips a leading image (+1 more)

### Community 143 - "Requirement: Focus tree"
Cohesion: 0.22
Nodes (9): Requirement: Focus tree, Scenario: Deep path shortens the middle, Scenario: Deleting the focused folder moves the focus up, Scenario: Empty tree offers New folder, Scenario: Long names stay readable in the tree, Scenario: Opening a folder focuses the tree on it, Scenario: Path row links go up, Scenario: Top level has no path row (+1 more)

### Community 144 - "Requirement: Tag page layout"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Requirement: Tag page layout, Scenario: Deleting the last note on the restyled tag page goes Home, Scenario: Long tag name heading wraps, Scenario: Long tag pill wraps inside its entry, Scenario: One tagged note reads singular, Scenario: Tag page entries show folder, date and tags, Scenario: Tag page shows the tag heading and its notes

### Community 145 - "open"
Cohesion: 0.12
Nodes (16): deleteFrom(), named(), bottomBar(), folderLink(), folderOrder(), isDesktop(), openFolderMenu(), setSort() (+8 more)

### Community 146 - "2026-11-17-redesign/flow.yaml"
Cohesion: 0.25
Nodes (7): base, gate0, gate1, gate2, learnings, track, triage

### Community 147 - "MODIFIED Requirements"
Cohesion: 0.25
Nodes (7): ADDED Requirements, MODIFIED Requirements, Requirement: Save status, Scenario: Failed saves show one toast and a retry status, Scenario: Save status is not a live region, Scenario: Save status shows Saving and Saved, Scenario: Saving stops after the note was deleted elsewhere

### Community 148 - "Requirement: Title editing"
Cohesion: 0.29
Nodes (7): Requirement: Title editing, Scenario: ArrowDown on the last title line moves to the body, Scenario: Cmd or Ctrl+Enter moves to the body, Scenario: Enter in the title adds a line break, Scenario: Many short title lines stay in the column, Scenario: Pasted CRLF text keeps its line breaks, Scenario: Title is the page heading

### Community 149 - "Requirement: Wide layouts"
Cohesion: 0.29
Nodes (7): MODIFIED Requirements, Requirement: Wide layouts, Scenario: Controls keep a 44 px target below the wide layout, Scenario: Home lists sit side by side on wide screens, Scenario: Mid-width shows the sidebar with stacked lists, Scenario: Note column is capped and centred on wide screens, Scenario: Note column widens at 1100 px and fills the content area at 1280

### Community 150 - "core.ts"
Cohesion: 0.17
Nodes (12): Risks, codeBlock(), lowlight, ColorSpan, Commands, isTextColor(), SelectionSync, TEXT_COLORS (+4 more)

### Community 151 - "Notes Archive"
Cohesion: 0.40
Nodes (4): Design fingerprint, Learnings, Notes Archive, Specs

### Community 152 - "MockData"
Cohesion: 0.05
Nodes (43): MockData, { first = false, last = false, turnInto = false }, Props, turn, actions, { blocks, tableActions = false, openToggle = false }, Props, toggles (+35 more)

### Community 153 - "verification.md"
Cohesion: 0.29
Nodes (6): Diffstat, Layer 1: proof:full (exit 0), Layer 2: coverage (40 scenarios, 0 gaps), Manual checklist, Review, Screenshots

### Community 154 - "2026-11-17-redesign/verification.md"
Cohesion: 0.29
Nodes (6): Coverage, Diffstat, Layer 1: proof:full, Manual checklist, Review, Screenshots (not committed)

### Community 155 - "Requirement: Tag pages"
Cohesion: 0.25
Nodes (7): MODIFIED Requirements, Requirement: Tag pages, Scenario: Deleting one of several tagged notes stays, Scenario: Deleting the last tagged note goes Home, Scenario: Tag counts include only notes using them, Scenario: Tag page lists its notes by last edited, Scenario: Unknown tag id is a plain 404

### Community 156 - "sidebar-collapse.test.ts"
Cohesion: 0.47
Nodes (3): sidebar(), width(), widthIs()

### Community 157 - "Requirement: Deleting a note"
Cohesion: 0.33
Nodes (6): Requirement: Deleting a note, Scenario: Cancelled note delete keeps everything, Scenario: Delete a note from its card, Scenario: Delete buttons stack on a phone, Scenario: Deleting the open note asks first and lands on its folder, Scenario: Server delete removes tag links, uploads and the index row

### Community 158 - "REMOVED Requirements"
Cohesion: 0.33
Nodes (5): REMOVED Requirements, Requirement: Desktop sidebar, Requirement: Folder tree, Requirement: Phone bottom bar and drawer, Requirement: Tags section

### Community 159 - "Requirement: Folders page"
Cohesion: 0.33
Nodes (6): Requirement: Folders page, Scenario: Desktop Folders page shows the tree at the top level, Scenario: Folders page lists top-level folders with counts, then tags, Scenario: Folders pill opens the Folders page, Scenario: New folder from the Folders page, Scenario: No folders shows No folders yet

### Community 160 - "shell/tree/RenameField.svelte"
Cohesion: 0.32
Nodes (6): commit(), draft, handBack(), key(), Props, { value, onsubmit, oncancel, focused = false }

### Community 161 - "Requirement: Phone bar"
Cohesion: 0.33
Nodes (6): Requirement: Phone bar, Scenario: Bar fits 320 px with safe areas, Scenario: Bar hides while the editor has focus, Scenario: Bar stays out of the soft keyboard, Scenario: Current section is marked, Scenario: Phone bar shows three pills and New note

### Community 162 - "Requirement: Tags list"
Cohesion: 0.33
Nodes (6): Requirement: Tags list, Scenario: Tag counts update without reload, Scenario: Tags follow the folders on the phone, Scenario: Tags section is absent without tags, Scenario: Tags sit below the tree with counts, Scenario: The open tag is the current row

### Community 163 - "Requirement: Tree expansion and keyboard"
Cohesion: 0.33
Nodes (6): Requirement: Tree expansion and keyboard, Scenario: Arrow keys move through the tree, Scenario: Chevron expands without navigating, Scenario: Empty folder has no chevron, Scenario: Manual open state lasts until reload, Scenario: Tree focuses the open note folder and marks its row

### Community 164 - "palette-results.test.ts"
Cohesion: 0.29
Nodes (4): input(), palette(), db, port

### Community 165 - "Requirement: Tree sort picker"
Cohesion: 0.33
Nodes (6): Requirement: Tree sort picker, Scenario: Choosing a mode re-sorts and persists, Scenario: Failed sort save reverts with a toast, Scenario: Sort leaves the other lists alone, Scenario: Sort picker marks the current mode, Scenario: Sort picker on the phone lives on the Folders page

### Community 166 - "Note cards"
Cohesion: 0.28
Nodes (9): motion spec (build-notes-archive), Card to note morph, Lists stagger in, Motion on real devices, Page transitions, View Transitions API, listNotes, Note cards (+1 more)

### Community 167 - "updateNote"
Cohesion: 0.20
Nodes (11): Content storage and derived text, plainText walker, ProseMirror JSON content, Autosave, updateNote, search spec (build-notes-archive), Command palette, Full-text search (+3 more)

### Community 168 - "createToaster"
Cohesion: 0.57
Nodes (7): createToaster(), attach(), dismiss(), flush(), park(), toast(), write()

### Community 169 - "Managing folders in the tree"
Cohesion: 0.36
Nodes (8): Frosted glass material, Style guards, Glass hover glow, shell spec (build-notes-archive), Desktop sidebar, Folder tree, Phone bottom bar and drawer, Wide layouts

### Community 170 - "PRODUCT.md"
Cohesion: 0.40
Nodes (4): Behavioural data-* allow-list, Accessibility and inclusion commitments, Autosave (600 ms debounce, flush on blur, last write wins), Single-user self-hosted archive positioning

### Community 171 - "Requirement: Dialogs and menus"
Cohesion: 0.40
Nodes (5): Requirement: Dialogs and menus, Scenario: Delete confirm shows counts once known, Scenario: Modal dialog traps focus and returns it, Scenario: Move to chooser starts with Root in tree order, Scenario: Outside click cancels a menu or dialog

### Community 172 - "Requirement: Tree follows the open note"
Cohesion: 0.40
Nodes (5): Requirement: Tree follows the open note, Scenario: Deleting the open note keeps its folder focused, Scenario: Moving the open note moves the focus, Scenario: Opening a note from search focuses its folder, Scenario: Top-level note shows the top level

### Community 173 - "Requirement: Tree rail"
Cohesion: 0.40
Nodes (5): Requirement: Tree rail, Scenario: One control folds the tree into a rail, Scenario: Rail controls keep accessible names, Scenario: Rail state survives a reload without a flash, Scenario: Storage unavailable falls back to expanded

### Community 174 - "ADDED Requirements"
Cohesion: 0.50
Nodes (4): ADDED Requirements, Requirement: Toasts, Scenario: Toast is a polite status for about four seconds, Scenario: Toast survives a redirect

### Community 176 - "wire/overlays/+page.svelte"
Cohesion: 0.10
Nodes (19): Item, { name, items, radio = false }, all, currentId, data, emoji, entryMenu, Flat (+11 more)

### Community 177 - "redesign-shots.test.ts"
Cohesion: 0.33
Nodes (4): path(), screens(), slugs, widths

### Community 178 - "Pinned.svelte"
Cohesion: 0.13
Nodes (12): folderName(), Reorder, folder, hidden, hit, long, { note, parts, titleParts = null, home = false, reorder = null, dragging = false, ongrip, index, tagged = false }, Props (+4 more)

### Community 179 - "Requirement: Extra blocks"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, Requirement: Extra blocks, Scenario: Floating editor menus are solid, Scenario: Native spellcheck and autocorrect stay off where text is typed, Scenario: Table cells are told apart by hairlines and a shaded header row

### Community 180 - "MODIFIED Requirements"
Cohesion: 0.33
Nodes (5): MODIFIED Requirements, Requirement: Tree expansion and keyboard, Requirement: Wide layouts, Scenario: Note column is capped and centred on wide screens, Scenario: One control expands and collapses every folder of the tree

### Community 181 - "tag-input.test.ts"
Cohesion: 0.80
Nodes (4): chips(), expand(), expectChips(), props()

### Community 182 - "wire/editor/SlashMenu.svelte"
Cohesion: 0.40
Nodes (4): items, Props, { query = '', active = 0, emptyResult = false }, shown

### Community 183 - "Requirement: Note cards"
Cohesion: 0.40
Nodes (4): MODIFIED Requirements, Requirement: Note cards, Scenario: One long unbreakable tag stays inside the card and keeps the time, Scenario: The tag field has the hairline border of the chips beside it

### Community 184 - "MODIFIED Requirements"
Cohesion: 0.50
Nodes (3): MODIFIED Requirements, Requirement: Command palette, Scenario: Typing back to an answered term after a failure does not claim there are no matches

## Ambiguous Edges - Review These
- `helpers.ts` → `Quiet editor`  [AMBIGUOUS]
  openspec/changes/archive/2026-11-03-build-notes-archive/specs/harness/spec.md · relation: conceptually_related_to
- `Mountain lake valley viewed through conifers` → `Greek mountain lake (possibly Lake Doxa, Peloponnese)`  [AMBIGUOUS]
  fixtures/mockups/lake-greek.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **69 isolated node(s):** `$app/tsconfig`, `Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls)`, `Striped Lawn and Pine/Deciduous Tree Landscape at Dusk`, `Wide landscape-format photo (approx. 2:1, high resolution)`, `Black timber-clad modern house in a wooded garden` (+64 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1662 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `svelte` connect `svelte` to `hifi/note/NoteCard.svelte`, `shell/SideTree.svelte`, `Design Tokens and Look`, `TableMenu.svelte`, `Breadcrumb.svelte`, `NotePatch`, `E2E Helpers and Tests`, `time.ts`, `copy.ts`, `Frame.svelte`, `wire/tree/SideTree.svelte`, `Block Menu Operations`, `Command Palette`, `FocusTree.svelte`, `CI Workflow`, `shell/tree/RenameField.svelte`, `TagInput.svelte`, `motion.ts`, `wire/note/+page.svelte`, `@tiptap/core`, `Look Research`, `NoteProperties.svelte`, `hifi/tree/SideTree.svelte`, `#lib`, `hifi/overlays/+page.svelte`, `hifi/home/Desk.svelte`, `hifi/folder/FolderBody.svelte`, `toast.ts`, `ui/Menu.svelte`, `Editor.svelte`, `button/Button.svelte`, `Pinned.svelte`, `NoteTitle.svelte`, `hifi/note/Properties.svelte`, `(app)/+layout.svelte`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **What connects `$app/tsconfig`, `Midcentury Modern Single-Story House (flat roof, wood cladding, fieldstone walls)`, `Striped Lawn and Pine/Deciduous Tree Landscape at Dusk` to the rest of the system?**
  _69 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `FolderHeader.svelte` be split into smaller, more focused modules?**
  _Cohesion score 0.06767676767676768 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `vitest` to `FolderHeader.svelte`, `shell/SideTree.svelte`, `Design Tokens and Look`, `NotePatch`, `time.ts`, `E2E Helpers and Tests`, `editor/preview.ts`, `vitest`, `types.ts`, `Media Upload Blocks`, `copy.ts`, `net.ts`, `getDb`, `Folders Data Layer`, `Full-Text Search Index`, `notes.ts`, `FocusTree.svelte`, `Plain Text Extraction`, `shell/SortMenu.svelte`, `TagInput.svelte`, `uploads.test.ts`, `EmojiPicker.svelte`, `redesign/fixtures.ts`, `TagInput.svelte`, `toast.ts`, `settings-api.test.ts`, `NoteTitle.svelte`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `REMOVED Requirements` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `helpers.ts` and `Quiet editor`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Mountain lake valley viewed through conifers` and `Greek mountain lake (possibly Lake Doxa, Peloponnese)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._