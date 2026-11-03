# search Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Full-text search
Search SHALL use SQLite FTS5 over title, body text and tag names with prefix matching, diacritic- and case-insensitive matching (Unicode, not only ASCII) that also treats "ß" as "ss", ranking with title matches first, and a highlighted snippet per result; an empty query SHALL return no results, and no input SHALL cause an error.

#### Scenario: Search finds notes by title, body and tag
- **WHEN** notes have "Kirschblüte" in the title, in the body and as a tag respectively, and "kirschblüte" is searched
- **THEN** all three are returned
- **proof:** unit

#### Scenario: Prefix matches while typing
- **WHEN** "kirsch" is searched
- **THEN** the notes with "Kirschblüte" are returned
- **proof:** unit

#### Scenario: Search ignores diacritics
- **WHEN** "uber" and "cafe" are searched
- **THEN** a note containing "über" and one containing "Café" are returned
- **proof:** unit

#### Scenario: Search treats ß as ss
- **WHEN** "strasse" and "straße" are searched while one note has "Straße" in its body and another has "Strasse" in its title
- **THEN** both searches return both notes
- **proof:** unit

#### Scenario: Snippet keeps the original ß
- **WHEN** "strasse" is searched and the note body reads "Die Straße war leer"
- **THEN** the snippet parts join to text containing "Straße", not "Strasse", with that word marked `hit: true`
- **proof:** unit

#### Scenario: Search ignores case including umlauts
- **WHEN** "ÜBUNG" is searched
- **THEN** a note containing "übung" is returned
- **proof:** unit

#### Scenario: Title matches rank first
- **WHEN** "Kyoto" is in one note's title and only in another note's body
- **THEN** the title match is ranked first
- **proof:** unit

#### Scenario: Snippet highlights the match
- **WHEN** "garten" is searched and a note's body holds "Im Garten blühen Tulpen"
- **THEN** that hit's parts join to a snippet containing "Garten", with exactly the part "Garten" marked `hit: true`
- **proof:** unit

#### Scenario: Special characters never cause an error
- **WHEN** `"`, `*`, `-`, `(`, `a AND`, `NEAR(` and `"kirsch*` are searched
- **THEN** each returns a result list (possibly empty) without throwing
- **proof:** unit

#### Scenario: Empty query returns no results
- **WHEN** "" and "   " are searched without filters
- **THEN** no hits are returned
- **proof:** unit

#### Scenario: Search reflects edits on save
- **WHEN** a note's body is changed with `updateNote` from "Apfel" to "Birne" and its tags set to "Obst"
- **THEN** "birne" and "obst" find it and "apfel" doesn't
- **proof:** unit

### Requirement: Command palette
Cmd/Ctrl+K (outside a text selection in the editor) and every search button SHALL open a glass command palette from anywhere; empty, it SHALL show recent notes; while typing it SHALL show results with highlighted snippets; it SHALL offer the actions "New note" and "New folder", support arrow keys and Enter, close on Escape, open the search page through "See all results", show "No notes match “<q>”" without hits, keep the editor's selection and content when opened from a note, be full-screen on phone, and be openable from the note header's ⋯ menu through a "Search" item (the only way on a touch-only phone while the editor has focus).

#### Scenario: Cmd or Ctrl+K opens the palette anywhere
- **WHEN** Cmd/Ctrl+K is pressed on Home, on a folder page and in a note's editor with a collapsed cursor
- **THEN** the palette opens each time with its input focused
- **proof:** e2e

#### Scenario: Search buttons open the palette
- **WHEN** Search is clicked in the sidebar on desktop, and in the bottom bar on phone
- **THEN** the palette opens
- **proof:** e2e

#### Scenario: Empty palette shows recent notes
- **WHEN** the palette opens with an empty input and ten notes exist
- **THEN** it lists the eight most recently edited notes under "Recent"
- **proof:** e2e

#### Scenario: Typing shows results with highlighted snippets
- **WHEN** "garten" is typed
- **THEN** the matching notes are listed with their titles and a snippet whose matched word is inside a `mark`
- **proof:** e2e

#### Scenario: Arrow keys and Enter open a result
- **WHEN** a query with three results is typed, ArrowDown pressed twice and Enter pressed
- **THEN** the third result's note opens and the palette closes
- **proof:** e2e

#### Scenario: Palette offers New note and New folder
- **WHEN** "New note" is chosen in the palette, and in a second run "New folder"
- **THEN** a root note opens with the title focused; then a root folder "Untitled folder" exists and its folder page opens
- **proof:** e2e

#### Scenario: Escape closes the palette
- **WHEN** Escape is pressed in the open palette
- **THEN** the palette closes and focus returns to where it was
- **proof:** e2e

#### Scenario: See all results opens the search page
- **WHEN** "kyoto" is typed and "See all results" chosen
- **THEN** the page is `/search?q=kyoto`
- **proof:** e2e

#### Scenario: No hits shows No notes match
- **WHEN** "zzzz" is typed
- **THEN** the palette reads "No notes match “zzzz”"
- **proof:** e2e

#### Scenario: Palette keeps the editor's selection and content
- **WHEN** a word in the editor is selected, the palette opened with the sidebar's Search button, and closed with Escape
- **THEN** the same word is still selected and the note's content is unchanged
- **proof:** e2e

#### Scenario: Palette is full-screen on phone
- **WHEN** the palette opens on phone
- **THEN** it covers the whole viewport
- **proof:** e2e

#### Scenario: Search in the note menu opens the palette
- **WHEN** the note's ⋯ menu is open (on phone with the editor focused, and on desktop)
- **THEN** a "Search" item is listed, and activating it closes the menu and opens the command palette
- **proof:** e2e

### Requirement: Search page
`/search?q=…` SHALL list the results of the query as note cards with snippets, with folder (including sub-folders) and tag filters that combine and are reflected in the URL; filters without a query SHALL list all notes matching the filters.

#### Scenario: Search page lists results for the query in the URL
- **WHEN** `/search?q=garten` opens
- **THEN** the input holds "garten" and the matching notes are listed as cards with highlighted snippets
- **proof:** e2e

#### Scenario: Folder filter includes sub-folders
- **WHEN** the folder filter "Reisen" is chosen while notes match in "Reisen", "Reisen/Japan" and "Küche"
- **THEN** the notes from "Reisen" and "Reisen/Japan" are listed and the one from "Küche" isn't
- **proof:** e2e

#### Scenario: Folder and tag filters combine and stay in the URL
- **WHEN** a folder filter and a tag filter are chosen, the page reloads, and the browser goes back once
- **THEN** the URL holds `q`, `folder` and `tag`, the reloaded page shows only notes matching all three, and back removes the tag filter
- **proof:** e2e

#### Scenario: Search page with only filters lists matching notes
- **WHEN** `/search?tag=<Reise id>` opens without a query
- **THEN** every note tagged Reise is listed, newest edit first
- **proof:** e2e

#### Scenario: Server filters without a query by folder subtree and tag
- **WHEN** `searchNotes({ q: '', folderId, tagId })` runs
- **THEN** it returns every note in that folder or its descendants with that tag, by last edited, with empty snippet parts
- **proof:** unit

