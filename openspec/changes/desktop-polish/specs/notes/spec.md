## MODIFIED Requirements

### Requirement: Note cards
A single long unbreakable tag SHALL be clipped inside the card's meta line, never past the card or into the time. The tag field SHALL use the hairline ring.

#### Scenario: One long unbreakable tag stays inside the card and keeps the time
- **WHEN** a pinned note on Home has one 48-character tag without spaces
- **THEN** the tag and the time end inside the card, the tag before the time
- **proof:** e2e

#### Scenario: The tag field has the hairline border of the chips beside it
- **WHEN** a note with a tag opens
- **THEN** the "Add a tag" field's box-shadow is `--ring-hairline`
- **proof:** e2e
