## ADDED Requirements

### Requirement: Palette on the fingerprint
The command palette SHALL keep its contract behaviour on the fingerprint look: Cmd/Ctrl+K opens it anywhere outside an editor selection; empty, it SHALL show Recent and Actions; while typing it SHALL show at most 8 hits with highlighted snippets and "See all results"; on touch opening it SHALL add a history entry so Back closes it, and the page underneath SHALL neither scroll nor move while it opens, is open or closes; closing it SHALL restore the editor selection; Cmd/Ctrl+K on an editor selection SHALL edit the link instead.

#### Scenario: Empty palette shows Recent and Actions
- **WHEN** the palette opens with an empty input and five notes exist
- **THEN** it shows a Recent group with the most recently edited notes and an Actions group with "New note" and "New folder"
- **proof:** e2e

#### Scenario: Typing shows at most eight highlighted hits
- **WHEN** a query matching twelve notes is typed
- **THEN** the palette shows eight hits with the match highlighted and a "See all results" entry
- **proof:** e2e

#### Scenario: Back closes the palette on touch
- **WHEN** the palette is opened from the phone bar's Search and the browser goes back
- **THEN** the palette closes and the page underneath keeps its URL
- **proof:** e2e

#### Scenario: Opening the palette leaves the page where it was
- **WHEN** Home is scrolled 300 px at 390 and at 768 px wide, the dock's Search is tapped, the wheel turns over the palette, and Escape closes it
- **THEN** the search field has the focus and the page stays at 300 px throughout
- **proof:** e2e

#### Scenario: Closing the palette restores the editor selection
- **WHEN** text is selected in the body, the palette is opened with the Search entry and closed with Escape
- **THEN** the same text is selected in the body
- **proof:** e2e ("Scenario: Palette keeps the editor's selection and content")

#### Scenario: Cmd or Ctrl+K on a selection edits the link
- **WHEN** text is selected in the body and Cmd/Ctrl+K is pressed
- **THEN** the link field opens for the selection and the palette does not open
- **proof:** e2e ("Scenario: Cmd or Ctrl+K on a selection edits the link")

### Requirement: Search page states
`/search` SHALL hold the query, the folder filter (including sub-folders) and the tag filter in a shareable URL — replacing the history entry 200 ms after typing stops and pushing one on a filter change — and list at most 50 results; it SHALL show an idle hint without query and filters, "No notes match “<q>”" for a query without hits, "No results" for filters without hits, and "1 result" in the singular; long queries SHALL wrap and typed text SHALL survive a reload. The Folder and Tag filters SHALL be compact pills (an icon, the label over the chosen value in small type, a chevron; charcoal when set) with the native picker lying invisible over each at 16 px so a tap on a phone opens it without zooming the page (source: Rue, gate 7, signed hi-fi).

#### Scenario: Typing replaces the URL after 200 ms
- **WHEN** "kyoto" is typed into the search field
- **THEN** about 200 ms after the last key the URL holds `q=kyoto` and the history length did not grow
- **proof:** e2e

#### Scenario: Changing a filter pushes a history entry
- **WHEN** a folder filter is chosen and then the browser goes back
- **THEN** the first step added a history entry with `folder=<id>` and Back restores the unfiltered results
- **proof:** e2e

#### Scenario: Idle search page shows the hint
- **WHEN** `/search` opens with no query and no filters
- **THEN** it shows the idle hint and no results list
- **proof:** e2e

#### Scenario: Query without hits says No notes match
- **WHEN** `/search?q=zzzz` opens
- **THEN** it says "No notes match “zzzz”"
- **proof:** e2e

#### Scenario: Filters without hits say No results
- **WHEN** `/search` opens with a tag filter whose notes are all outside the chosen folder
- **THEN** it says "No results"
- **proof:** e2e

#### Scenario: One result reads singular
- **WHEN** a query matches exactly one note
- **THEN** the count reads "1 result"
- **proof:** e2e

#### Scenario: Results stop at fifty
- **WHEN** a query matches 60 notes
- **THEN** the page lists 50 results
- **proof:** e2e

#### Scenario: Filters are compact pills over a 16 px picker
- **WHEN** `/search` opens on phone and desktop and the folder "Reisen" is chosen
- **THEN** each filter's select is at least 16 px and invisible, the pill's value text is smaller than 16 px and the pill at most 64 px tall, and the Folder pill then reads "Reisen" on the charcoal pill while Tag reads "Any tag"
- **proof:** e2e

#### Scenario: Long query wraps and survives a reload
- **WHEN** a 200-character query is typed at 375 px and the page is reloaded
- **THEN** the field keeps the text, nothing scrolls horizontally, and the same results show
- **proof:** e2e

## MODIFIED Requirements

### Requirement: Command palette
Cmd/Ctrl+K (outside a text selection in the editor) and every search button SHALL open the command palette from anywhere (a centred panel on pointer devices); empty, it SHALL show recent notes; while typing it SHALL show results with highlighted snippets, where a hit that matches only in its title highlights the matched word in the title instead and keeps the note's own text as its snippet (the title never shows twice), and no hit shows without a highlight; it SHALL offer the actions "New note" and "New folder", support arrow keys and Enter (Enter on a note row SHALL do nothing until the results answer what is typed; a failed search SHALL clear the hits and say "Couldn't load — try again" in the list, while New note, New folder and "See all results" still run), close on Escape, open the search page through "See all results", show "No notes match “<q>”" without hits, keep the editor's selection and content when opened from a note, be full-screen on phone, and be openable from the note header's ⋯ menu through a "Search" item (the only way on a touch-only phone while the editor has focus).

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

#### Scenario: A title-only hit highlights its title
- **WHEN** "gartenplan" is typed and a note titled "Gartenplan" with the body "Beete umgraben" matches only in its title
- **THEN** its row shows "Gartenplan" inside a `mark` in the title and "Beete umgraben" as the snippet without a `mark`
- **proof:** e2e

#### Scenario: Enter on a note waits for the answer
- **WHEN** "beta" is typed while the recent note "Alpha" is the first row and Enter is pressed before the search answers, then again after it answers
- **THEN** the first Enter opens nothing and the palette stays; the second opens "Beta"
- **proof:** e2e

#### Scenario: A failed search clears the hits and says so
- **WHEN** "beta" has answered with one hit and the search for "betax" fails
- **THEN** the hit is gone, the list says "Couldn't load — try again", the highlighted first row is "New note" rather than a stale hit, and "See all results" still opens `/search?q=betax`
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

