## MODIFIED Requirements

### Requirement: Command palette
After a failed search the palette SHALL forget the term it had answered before, so typing back to that term shows neither the old hits nor "No notes match" until the new answer arrives.

#### Scenario: Typing back to an answered term after a failure does not claim there are no matches
- **WHEN** "beta" answered, "betax" fails, and "beta" is typed again with its answer pending
- **THEN** no hit and no "No notes match" shows until the answer arrives
- **proof:** e2e
