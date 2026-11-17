## MODIFIED Requirements

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
