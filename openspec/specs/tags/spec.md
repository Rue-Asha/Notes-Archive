# tags Specification

## Purpose
TBD - created by archiving change build-notes-archive. Update Purpose after archive.
## Requirements
### Requirement: Tag input
The properties row SHALL show a note's tags as chips with an input that autocompletes existing tags; Enter or comma SHALL add the typed tag, Backspace on an empty input SHALL remove the last chip, and a new name SHALL create the tag; tag names SHALL be unique ignoring case with Unicode folding ("Übung" = "übung"), whitespace-only names SHALL be ignored, a duplicate on the same note SHALL be ignored, and a tag no note uses anymore SHALL disappear.

#### Scenario: Add tags with Enter and comma
- **WHEN** "Reise" and Enter, then "Japan," are typed into a note's tag input
- **THEN** chips "Reise" and "Japan" show, and after a reload the stored tags are Reise, Japan in that order
- **proof:** e2e

#### Scenario: Autocomplete suggests existing tags ignoring case
- **WHEN** a tag "Übung" exists and "ÜB" is typed into another note's tag input, then the suggestion is chosen
- **THEN** "Übung" is suggested and the chip reads "Übung" with no new tag created
- **proof:** e2e

#### Scenario: Backspace on an empty input removes the last chip
- **WHEN** a note has chips "Reise" and "Japan" and Backspace is pressed in the empty input
- **THEN** only "Reise" remains, also after a reload
- **proof:** e2e

#### Scenario: Typing a new name creates a tag
- **WHEN** "Gartenbau" (not existing yet) is typed and Enter pressed
- **THEN** the chip shows and the sidebar's Tags section lists "Gartenbau" with count 1 without a reload
- **proof:** e2e

#### Scenario: Tag names are unique ignoring case and umlauts
- **WHEN** `setNoteTags` gives one note "Übung" and another "übung" and a third "ÜBUNG "
- **THEN** one tag named "Übung" exists, linked to all three notes
- **proof:** unit

#### Scenario: Whitespace-only and duplicate tags are ignored
- **WHEN** `setNoteTags` runs with `["Reise", "  ", "reise", "Japan"]`
- **THEN** the note has exactly Reise and Japan, in that order
- **proof:** unit

#### Scenario: Unused tags disappear
- **WHEN** the only note with tag "Einmalig" drops it
- **THEN** the tag no longer exists and `listTags` doesn't return it
- **proof:** unit

### Requirement: Tag pages
Every tag SHALL have a page listing its notes as note cards sorted by last edited, and `listTags` SHALL return every tag in use with its note count. When the last note of the open tag page is deleted from its card menu, the app SHALL navigate Home instead of showing an empty page or a 404. An id that never existed or no longer exists, when opened directly, SHALL keep answering the plain 404.

#### Scenario: Tag page lists its notes by last edited
- **WHEN** tag "Reise" is on three notes edited at different times and its sidebar link is clicked
- **THEN** `/tags/<id>` shows "Reise" as title and the three note cards, newest edit first
- **proof:** e2e

#### Scenario: Tag counts include only notes using them
- **WHEN** tags are on 3, 1 and 0 notes
- **THEN** `listTags` returns the first two with counts 3 and 1, sorted by name
- **proof:** unit

#### Scenario: Deleting the last tagged note goes Home
- **WHEN** a tag page shows one note and that note is deleted from its card menu and confirmed
- **THEN** the app lands on Home, the tag is gone from the tag list, and no error page appears
- **proof:** e2e

#### Scenario: Deleting one of several tagged notes stays
- **WHEN** a tag page shows two notes and one is deleted
- **THEN** the page stays and shows one note
- **proof:** e2e

#### Scenario: Unknown tag id is a plain 404
- **WHEN** `/tags/999999` is opened directly
- **THEN** the response is 404 "Tag not found" and there is no redirect
- **proof:** e2e

### Requirement: Tag page layout
The tag page SHALL show the tag name as its heading, a lede "<n> notes, newest edited first." and its notes as note entries, newest edited first, each with its folder after a folder icon on a line of its own, then the absolute date ("Sat 14 Nov") and up to three tags plus "+n" (source: Rue, gate 7, signed hi-fi); a long tag name SHALL wrap, in the heading and in an entry's tag pill, here and on the search page; the count SHALL read "1 note" in the singular; deleting the last note on the page SHALL go Home.

#### Scenario: Tag page shows the tag heading and its notes
- **WHEN** the page of tag "Übung" with three notes opens
- **THEN** its level-1 heading names "Übung" and the three notes follow, newest edited first
- **proof:** e2e

#### Scenario: Tag page entries show folder, date and tags
- **WHEN** the page of tag "Übung" opens with a note in folder "Reisen" edited on 3 March 2025 that also carries "Saat"
- **THEN** the lede reads "1 note, newest edited first.", and the entry shows a folder icon with "Reisen" on its own line above "Mon 3 Mar 2025", "Übung" and "Saat"
- **proof:** e2e

#### Scenario: Long tag name heading wraps
- **WHEN** a tag with a 120-character name and an unbroken 60-character name opens at 320 px
- **THEN** the heading wraps and nothing scrolls horizontally
- **proof:** e2e

#### Scenario: Long tag pill wraps inside its entry
- **WHEN** a note tagged "a-very-long-tag-name-for-gardening", an unbroken 40-character tag and "Saat" is listed on a tag page and as a search result at 375 px
- **THEN** every tag pill's right edge stays inside its entry and nothing scrolls horizontally
- **proof:** e2e

#### Scenario: One tagged note reads singular
- **WHEN** the page of a tag with one note opens
- **THEN** its count reads "1 note"
- **proof:** e2e

#### Scenario: Deleting the last note on the restyled tag page goes Home
- **WHEN** the only note on a tag page is deleted from its entry menu
- **THEN** Home opens
- **proof:** e2e ("Scenario: Deleting the last tagged note goes Home")

