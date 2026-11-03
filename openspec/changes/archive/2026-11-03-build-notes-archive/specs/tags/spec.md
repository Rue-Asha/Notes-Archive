## ADDED Requirements

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
Every tag SHALL have a page listing its notes as note cards sorted by last edited, and `listTags` SHALL return every tag in use with its note count.

#### Scenario: Tag page lists its notes by last edited
- **WHEN** tag "Reise" is on three notes edited at different times and its sidebar link is clicked
- **THEN** `/tags/<id>` shows "Reise" as title and the three note cards, newest edit first
- **proof:** e2e

#### Scenario: Tag counts include only notes using them
- **WHEN** tags are on 3, 1 and 0 notes
- **THEN** `listTags` returns the first two with counts 3 and 1, sorted by name
- **proof:** unit
