## ADDED Requirements

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
