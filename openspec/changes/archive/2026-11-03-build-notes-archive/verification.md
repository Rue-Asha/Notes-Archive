verified-at: 2b56055

# Verification: build-notes-archive

## Layer 1: `PORT=4173 npm run proof:full`

Green (exit 0). Unit: 50 files, 363 tests passed. e2e (506 listed, 1 worker): 471 passed, 35 skipped, 0 failed (4.8m). `openspec validate build-notes-archive --strict`: valid.

```
  ✓  504 [desktop] › e2e/tree.test.ts:11:1 › Scenario: Tree shows folders with their sub-folders and notes (210ms)
  ✓  505 [desktop] › e2e/tree.test.ts:43:1 › Scenario: Current item is highlighted in the tree (186ms)
  ✓  506 [desktop] › e2e/tree.test.ts:59:1 › Scenario: Untitled note in the tree reads Untitled (124ms)

  35 skipped
  471 passed (4.8m)
```

(Skips are project-specific by design.)

## Layer 2: spec coverage

Scenarios total 254: 244 covered by a passed test (75 unit, 169 e2e), 10 manual, 0 gaps. Changed since round 3: the rows marked (new) or (renamed) below.

Test name = `Scenario: <title>` in every covered row. "<project> only" means the test passed on one project and skips
itself on the other by design. Paths with `~/` are under `src/lib/`.

| Scenario | proof | Evidence |
|---|---|---|
| Search finds notes by title, body and tag | unit |  ✓ |
| Prefix matches while typing | unit |  ✓ |
| Search ignores diacritics | unit |  ✓ |
| Search treats ß as ss | unit |  ✓ |
| Snippet keeps the original ß | unit |  ✓ |
| Search ignores case including umlauts | unit |  ✓ |
| Title matches rank first | unit |  ✓ |
| Snippet highlights the match | unit |  ✓ |
| Special characters never cause an error | unit |  ✓ |
| Empty query returns no results | unit |  ✓ |
| Search reflects edits on save | unit |  ✓ |
| Cmd or Ctrl+K opens the palette anywhere | e2e |  ✓ |
| Search buttons open the palette | e2e |  ✓ |
| Empty palette shows recent notes | e2e |  ✓ |
| Typing shows results with highlighted snippets | e2e |  ✓ |
| Arrow keys and Enter open a result | e2e |  ✓ |
| Palette offers New note and New folder | e2e |  ✓ |
| Escape closes the palette | e2e |  ✓ |
| See all results opens the search page | e2e |  ✓ |
| No hits shows No notes match | e2e |  ✓ |
| Palette keeps the editor's selection and content | e2e |  ✓ |
| Palette is full-screen on phone | e2e |  ✓ |
| Search in the note menu opens the palette | e2e |  ✓ |
| Search page lists results for the query in the URL | e2e |  ✓ |
| Folder filter includes sub-folders | e2e |  ✓ |
| Folder and tag filters combine and stay in the URL | e2e |  ✓ |
| Search page with only filters lists matching notes | e2e |  ✓ |
| Server filters without a query by folder subtree and tag | unit |  ✓ |
| Add tags with Enter and comma | e2e |  ✓ |
| Autocomplete suggests existing tags ignoring case | e2e |  ✓ |
| Backspace on an empty input removes the last chip | e2e |  ✓ |
| Typing a new name creates a tag | e2e |  ✓ |
| Tag names are unique ignoring case and umlauts | unit |  ✓ |
| Whitespace-only and duplicate tags are ignored | unit |  ✓ |
| Unused tags disappear | unit |  ✓ |
| Tag page lists its notes by last edited | e2e |  ✓ |
| Tag counts include only notes using them | unit |  ✓ |
| Opening a new empty note focuses the title | e2e |  ✓ |
| Empty new note is discarded on leaving | e2e |  ✓ |
| Note with only a title is kept | e2e |  ✓ |
| Server creates notes at the root or in a folder | unit |  ✓ |
| Server discards only empty notes | unit |  ✓ |
| Note page shows icon, title and body | e2e |  ✓ |
| Pick, change and remove the note icon | e2e |  ✓ |
| Emoji picker is usable on phone | e2e |  ✓ |
| Untitled note's tab title reads Untitled | e2e |  ✓ |
| Very long title wraps | e2e |  ✓ |
| Typing saves automatically | e2e |  ✓ |
| Leaving flushes a pending save | e2e |  ✓ |
| Failed save shows a toast and keeps the content | e2e |  ✓ |
| Unreachable server retries on the next change | e2e |  ✓ |
| Deleted note shows a notice on its next save | e2e |  ✓ |
| Last write wins between two tabs | e2e |  ✓ |
| Server update derives the body text and bumps the edit time | unit |  ✓ |
| Note card shows its parts | e2e |  ✓ |
| Card shows at most three tags and +n | e2e |  ✓ |
| Note without text shows Empty note | e2e |  ✓ |
| Untitled note card reads Untitled | e2e |  ✓ |
| Snippet skips a leading image | unit |  ✓ |
| Edited time reads relative | unit |  ✓ |
| Deleting the open note asks first and lands on its folder | e2e |  ✓ |
| Cancelled note delete keeps everything | e2e |  ✓ |
| Delete a note from its card | e2e |  ✓ |
| Server delete removes tag links, uploads and the index row | unit |  ✓ |
| Removed uploads are marked on save, not deleted (renamed) | unit | `src/lib/server/notes.test.ts` › "Scenario: Removed uploads are marked on save, not deleted" ✓ |
| A removed upload can still be pasted into another note (new) | unit | `notes.test.ts` › "Scenario: A removed upload can still be pasted into another note" ✓ |
| Undo brings a removed upload back (new) | unit | `notes.test.ts` › "Scenario: Undo brings a removed upload back" ✓ |
| An orphaned upload is purged after the grace period (new) | unit | `notes.test.ts` › "Scenario: An orphaned upload is purged after the grace period" ✓ |
| Uploads still in the body survive a save | unit |  ✓ |
| Uploads never saved are left alone | unit | `notes.test.ts` › "Scenario: Uploads never saved are left alone" ✓ |
| Pin from the properties row | e2e |  ✓ |
| Pin from a card menu | e2e |  ✓ |
| Pinned notes appear on Home most recently pinned first | e2e |  ✓ |
| Unpinning the last note hides the Pinned tile | e2e |  ✓ |
| Server orders pinned notes by pin time | unit |  ✓ |
| Create a folder at the root | e2e |  ✓ |
| Create a folder inside a folder | e2e |  ✓ |
| New note from a folder's menu lands in that folder | e2e |  ✓ |
| Rename a folder inline in the tree | e2e |  ✓ |
| Move a folder with Move to | e2e |  ✓ |
| Move to excludes the folder and its descendants | e2e |  ✓ |
| Blank names become Untitled folder | unit |  ✓ |
| Duplicate sibling names are allowed | unit |  ✓ |
| Server refuses moving a folder into its own descendant | unit |  ✓ |
| Folder page shows sub-folders and notes by last edited | e2e |  ✓ |
| Folder without a cover shows a typographic tile | e2e |  ✓ |
| Folder page shows breadcrumb, cover header and counts | e2e |  ✓ |
| Empty folder offers New note and New folder | e2e |  ✓ |
| New note from a folder page lands in that folder | e2e |  ✓ |
| New folder from a folder page creates a sub-folder | e2e |  ✓ |
| Upload and replace a folder cover | e2e |  ✓ |
| Removing the cover brings back the typographic tile | e2e |  ✓ |
| Wrong cover file is refused with a toast | e2e |  ✓ |
| Server replaces covers and stores them as WebP | unit |  ✓ |
| Move a note from its properties row | e2e |  ✓ |
| Move a note from its card | e2e |  ✓ |
| Server moves a note and bumps its edit time | unit |  ✓ |
| Deleting a folder asks with counts | e2e |  ✓ |
| Empty folder asks without counts | e2e |  ✓ |
| Cancelled folder delete keeps everything | e2e |  ✓ |
| Deleting the folder of the open note navigates to its parent | e2e |  ✓ |
| Server folder delete removes descendants, notes and uploads | unit |  ✓ |
| Home shows the typographic hero | e2e |  ✓ |
| Home search bar opens the palette | e2e |  ✓ |
| Home New note opens a root note | e2e |  ✓ |
| Recently edited shows the eight latest notes | e2e |  ✓ |
| Folders tile lists top-level folders with covers and counts | e2e |  ✓ |
| Empty archive shows the welcome state | e2e |  ✓ |
| Pinned tile is hidden without pinned notes | e2e |  ✓ |
| Home reflects a move without reload | e2e |  ✓ |
| Pasting a URL alone makes a preview card | e2e |  ✓ |
| URL inside a sentence stays an inline link | e2e |  ✓ |
| Undo turns the card back into a link | e2e |  ✓ |
| Invalid URL stays plain text | e2e |  ✓ |
| Failed preview shows domain and URL only | e2e |  ✓ |
| Private address gives a domain-only card | e2e |  ✓ |
| Only http and https URLs are fetched | unit |  ✓ |
| Private addresses are refused | unit |  ✓ |
| Hostname resolving to a private address is refused | unit |  ✓ |
| Redirect to a private address is refused | unit |  ✓ |
| Slow page times out | unit |  ✓ |
| Non-HTML page gives no preview | unit |  ✓ |
| Oversized page is cut at 1 MB | unit |  ✓ |
| Open Graph tags fill the preview | unit |  ✓ |
| Page without Open Graph falls back to its title | unit |  ✓ |
| Preview image is stored and never hotlinked | unit |  ✓ |
| Previewing a real site | manual (live network; every automated test uses the fake remote) | see manual checklist, check 5 |
| Note card morphs into the note page | e2e |  ✓ |
| Back from a note reverses the morph | e2e |  ✓ |
| Reduced motion skips the morph | e2e |  ✓ |
| Other navigations fade | e2e |  ✓ |
| Reduced motion uses a short fade | e2e |  ✓ |
| Browser without View Transitions navigates plainly | e2e |  ✓ |
| Cards stagger in | e2e |  ✓ |
| Reduced motion shows lists at once | e2e |  ✓ |
| Glass cards glow on hover | e2e |  ✓ |
| Typing in the editor runs no animations | e2e |  ✓ |
| Editor menus open with a short animation | e2e |  ✓ |
| Motion feels smooth on real devices | manual (visual judgement on real hardware) | see manual checklist, check 2 |
| Paste an image into a note | e2e |  ✓ |
| Drop an image into a note | e2e |  ✓ |
| Insert an image with the slash command | e2e |  ✓ |
| Image block shows at column width with a caption | e2e |  ✓ |
| Oversized or non-image upload is refused in the editor | e2e |  ✓ |
| Upload shows a placeholder and a failure removes it | e2e |  ✓ |
| Deleting an image block releases the upload (renamed) | e2e | `e2e/image-block.test.ts` › "Scenario: Deleting an image block releases the upload" ✓ phone and desktop |
| A cut image can be pasted into another note (new) | e2e | `e2e/image-block.test.ts` › "Scenario: A cut image can be pasted into another note" ✓ phone and desktop |
| Uploaded image is stored as WebP | unit |  ✓ |
| A removed image's id is never reused | unit | `src/lib/server/images.test.ts` › "Scenario: A removed image's id is never reused" ✓ |
| A copied upload outlives its source note | unit | three tests, all ✓: `src/lib/server/notes.test.ts` › "Scenario: A copied upload outlives its source note when the block is removed"; `notes.test.ts` › "… when that note is deleted"; `src/lib/server/folders.test.ts` › "… when its folder is deleted" |
| Server refuses oversized and non-image uploads | unit |  ✓ |
| Image is served with caching headers | unit |  ✓ |
| Drop a file to insert a file card | e2e |  ✓ |
| Insert a file with the slash command | e2e |  ✓ |
| File card opens in a new tab | e2e |  ✓ |
| Oversized file is refused in the editor | e2e |  ✓ |
| Server stores files as-is with their names | unit |  ✓ |
| Files are served safely with a download fallback | unit |  ✓ |
| Desktop shows the glass sidebar | e2e |  ✓ |
| New note from the sidebar or bottom bar opens a root note | e2e |  ✓ |
| Collapsed sidebar stays collapsed after reload | e2e |  ✓ |
| Tree shows folders with their sub-folders and notes | e2e |  ✓ |
| Current item is highlighted in the tree | e2e |  ✓ |
| Empty tree offers New folder | e2e |  ✓ |
| Long names truncate with a tooltip | e2e |  ✓ |
| Deep nesting caps the indent | e2e |  ✓ |
| Untitled note in the tree reads Untitled | e2e |  ✓ |
| Phone shows the bottom bar | e2e |  ✓ |
| Folders opens the tree in a drawer | e2e |  ✓ |
| Escape or back closes the drawer | e2e |  ✓ |
| Choosing a tree item closes the drawer | e2e |  ✓ |
| Bottom bar hides while typing in the editor | e2e |  ✓ |
| Bottom bar on a real phone keyboard | manual (real hardware: no soft keyboard) | see manual checklist, check 4 |
| Note column is capped and centred on wide screens | e2e |  ✓ |
| Grids add columns instead of stretching cards | e2e |  ✓ |
| Mid-width shows the sidebar with fewer columns | e2e |  ✓ |
| Sidebar lists tags with counts | e2e |  ✓ |
| Tags section is hidden without tags | e2e |  ✓ |
| Markdown shortcuts turn into blocks | e2e |  ✓ |
| Keyboard marks and undo | e2e |  ✓ |
| Cmd or Ctrl+K on a selection edits the link | e2e |  ✓ |
| Shortcuts do not fire inside code blocks | e2e |  ✓ |
| Slash opens the block menu at a block start or after a space | e2e |  ✓ |
| Typing filters the slash menu | e2e |  ✓ |
| Arrow keys and Enter choose a block | e2e |  ✓ |
| Escape closes the slash menu and keeps the text | e2e |  ✓ |
| Space with no match closes the slash menu | e2e |  ✓ |
| Slash menu stays within the visible viewport on phone | e2e |  ✓ |
| Slash menu lists every block type | e2e |  ✓ |
| Selecting text shows the bubble toolbar | e2e |  ✓ |
| Bubble toolbar applies marks | e2e |  ✓ |
| Add, edit and remove a link | e2e |  ✓ |
| Text colour from the palette | e2e |  ✓ |
| Bubble toolbar is hidden in code blocks | e2e |  ✓ |
| On touch the toolbar sits below the selection | e2e |  ✓ |
| Hovering a block shows the handle | e2e |  ✓ |
| Dragging the handle moves the block | e2e |  ✓ |
| Block menu moves a block up and down | e2e |  ✓ |
| First and last blocks can't move past the edge | e2e |  ✓ |
| Turn a block into another type | e2e |  ✓ |
| Delete a block from the block menu | e2e |  ✓ |
| Tapping the handle on phone opens the block menu | e2e |  ✓ |
| Moving blocks is a pure document transform | unit |  ✓ |
| Slash menu inserts toggle, callout and table | e2e |  ✓ |
| Toggle opens and closes and doesn't save its state | e2e |  ✓ |
| Nested lists and toggles inside toggles work | e2e |  ✓ |
| Callout shows an emoji and a tinted panel | e2e |  ✓ |
| Code block highlights syntax and switches language | e2e |  ✓ |
| Table adds and removes rows and columns | e2e |  ✓ |
| Wide table scrolls inside its block on phone | e2e |  ✓ |
| Task checkbox persists after reload | e2e |  ✓ |
| Dragging a toggle moves its content | e2e |  ✓ |
| Note content round-trips as ProseMirror JSON | unit |  ✓ |
| Plain text walker extracts block text | unit |  ✓ |
| Unknown nodes still index | unit |  ✓ |
| Unknown blocks render as text | e2e |  ✓ |
| Editor menus work on real phones | manual (real hardware: no soft keyboard, no native selection menu) | see manual checklist, check 3 |
| Token set is complete | unit |  ✓ |
| Text contrast meets AA | unit |  ✓ |
| Switching the look is a data change | e2e |  ✓ |
| The app uses the picked look | e2e |  ✓ |
| Glass falls back to a solid surface | unit |  ✓ |
| Text on glass meets AA | unit |  ✓ |
| Display and text fonts load from the app | e2e |  ✓ |
| Pages load no external resources | e2e |  ✓ |
| Call to action is a dark pill with a round arrow | e2e |  ✓ |
| Eyebrow is small tracked uppercase | e2e |  ✓ |
| Components use no raw colours | unit |  ✓ |
| Only transform and opacity animate | unit |  ✓ |
| Every mockup photo is credited | unit |  ✓ |
| Missing photo is generated | unit |  ✓ |
| Mockup photos stay out of the product | unit |  ✓ |
| Mockup routes are hidden without the test flag | unit |  ✓ |
| Mockups render the five screens | e2e |  ✓ |
| Mockup screenshots are produced for both viewports | e2e |  ✓ |
| Rue approves the mockups | manual (taste decision; only Rue can give it) | see manual checklist |
| Built screens match the approved mockups | manual (visual judgement at Gate 2) | see manual checklist, check 1 |
| Proof prints test names and passes | manual (infrastructure; read in U1's report) | not rerun; this log lists every test by name |
| Proof fails on a failing check | manual (infrastructure; proven once in U1, then reverted) | not rerun |
| Proof-full runs e2e on an isolated database | manual (infrastructure; proven in U1 and by every unit) | this run used the isolated test database and passed |
| Each e2e test runs on phone and desktop | manual (suite structure; read from the proof:full list output) | log lists `[phone]` and `[desktop]` for every e2e test (253 each); 35 skips are project-specific by design |
| App is hydrated before tests interact | e2e |  ✓ |
| Fresh database gets the schema | unit |  ✓ |
| Only new migrations run on an existing database | unit |  ✓ |
| Failing migration stops the server | unit |  ✓ |
| Server starts from any working directory | unit |  ✓ |
| Healthy server answers 200 | unit |  ✓ |
| Unreadable database answers 503 | unit |  ✓ |
| Test routes answer 404 without the test flag | unit |  ✓ |
| Reset empties the archive | e2e |  ✓ |
| Seed returns the ids of what it inserted | e2e |  ✓ |
| Saves settle before a reload | e2e |  ✓ |
| Package produces a verifiable tarball | unit |  ✓ |
| Harness is declared in CLAUDE.md | unit |  ✓ |

## Manual checklist (Gate 2)

Run: `npm run dev` → http://localhost:5173

Setup: `npm run dev` on the laptop (http://localhost:5173); `npm run dev -- --host` for the phone, then open
http://<laptop-ip>:5173 on the same wifi. For the mockups run `NOTES_ARCHIVE_TEST=1 npm run dev` and open
/__mockups/home, /folder, /note, /search and /drawer.

### 1. Built screens match the approved mockups
- Open each mockup in one tab and the built screen in another: Home (/__mockups/home), a folder with a cover
  (/__mockups/folder), a note with all blocks (/__mockups/note), the palette via Cmd/Ctrl+K (/__mockups/search),
  the phone Folders drawer (/__mockups/drawer).
- Check layout, type, glass and accent (bronze, clear glass, glass cards) at 390, 1280 and 1600 wide.
- Known deliberate differences: no "Edited today" tile, no "148 notes in 6 folders" lede, no "All notes" /
  "All folders" links, no "01 / 06" folder counters.

### 2. Motion feels smooth on real devices
- On the phone, tap a note card and go back: the card morphs into the note page and back.
- Open and close the drawer, the palette, the card menu and a dialog.
- Type in a note: nothing animates while typing.
- Turn on reduced motion in the OS: only short fades remain.

### 3. Editor menus work on real phones
- Type "/" in a note: the slash menu stays visible above the keyboard and choosing an item inserts it.
- Long-press to select a word: the bubble toolbar sits below the selection and doesn't hide the native selection
  menu. Test Bold, Link and Text colour.
- Tap the drag handle beside the cursor block: Move up, Move down, Turn into and Delete work.
- Open the table menu and scroll a wide table sideways inside its block.

### 4. Bottom bar on a real phone keyboard
- On Home the bottom bar is visible.
- Open a note and tap into the body: the keyboard opens and the bar hides (inert by spec).
- Tap outside the editor or close the keyboard: the bar returns and every button works.
- Tap into the title: the bar stays; only editor focus hides it.

### 5. Previewing a real site
- Paste a real https URL alone on an empty line (e.g. https://en.wikipedia.org/wiki/Notes): a preview card with
  title, description and image appears.
- Paste a URL inside a sentence: it stays an inline link.
- Undo right after the paste: the card turns back into a plain link.
- Paste a private address such as http://192.168.1.1: no card, only a link or plain text.
- Reload: the preview image comes from your server (/images/...), not hotlinked.

### Resolved: palette on phone while the editor has focus
The open decision in `manual-checks.md` (no touch way to open the palette while the editor has focus) is resolved by
S34, Scenario "Search in the note menu opens the palette" (`note-menu-search.test.ts` ✓, phone and desktop).

Also on the Gate 2 list: "Rue approves the mockups" (taste decision, only Rue can give it); the four harness
manual scenarios are infrastructure and are evidenced in the table above.

## Diffstat (`git diff --stat main...flow/build-notes-archive`; no origin/main ref exists locally)

334 files changed, 29764 insertions(+) (before this commit)

## Screenshots (`test-results/shots/`, not committed)

64 files, all in `test-results/shots/mockups/` (desktop and phone, fold and full, per mockup screen and accent), e.g.
`test-results/shots/mockups/desktop-components.png`, `desktop-drawer.png`, `desktop-folder.png`,
`desktop-home-accent-bronze.png`. List them with `fd -t f . test-results/shots`. No shots from other e2e tests.

## Review

Stamp: `ec6a521` was verified in full by the verifier (proof:full green, 250 scenarios, 0 gaps). `a1e1a09` only adds a test
assertion; the fixer ran proof:full at that tip (469 passed, 35 skipped, 0 failed).

Round 1 (fresh-context reviewer, full diff against main):
- Autosave stopped for good after a discarded or deleted note, and the title lost focus on a reused note page → fixed, note page keyed by id (`NotePage.svelte`), tests in `e2e/note-switch.test.ts`.
- Image ids reused → fixed, migration `0003_images_autoincrement.sql`, scenario "A removed image's id is never reused".
- Copied image/file blocks lost their row with the source note → fixed, upload hand-over to the other referencing note, scenario "A copied upload outlives its source note".
- Morph took the first matching card → fixed, clicked card is the source.
- NFD search query → fixed, NFC normalisation.
- Four weak tests → tightened (two mutation-checked).
- Uploads never saved stay until the note is deleted → rejected: spec "Uploads never saved are left alone".

Round 2 (reviewer scoped to the fix commits):
- Folder-delete hand-over test did not cover file cards → fixed in `a1e1a09`, mutation-checked.
- Migration 0003 sets the sequence to max(id), so an id deleted before the upgrade could be reused once → rejected: nothing shipped before 0003, no installed DB has such deletions.
- Cut an image in A, navigate, paste in B: A's save deletes the row before B references it (404) → open, pre-existing, not covered by a scenario; a fix needs deferred upload deletion. Listed for Gate 2.
- `instr` reference check parses many notes for small ids → rejected: single-user archive scale.
- Back-morph to Home still names the first matching card → not covered by the motion spec, left.

Round 3 (cut/paste fix `2b56055`, soft-delete of removed uploads, migration 0004; verified at `2b56055`, proof:full green):
- Cut in A, navigate, paste in B, and undo → fixed: removed uploads are marked `orphaned_at`, kept one hour, adopted by the next saving note. This supersedes the round-2 "open" item and the Gate 1 acceptance of immediate upload deletion (Rue chose the fix at Gate 2).
- Reviewer scoped to `2b56055`, no correctness bugs; three open points, left (fixer loop at its 3-round limit), for Rue at Gate 2:
  - `notes.test.ts` "never touches another note or a folder cover" no longer pins the cover being unmarked.
  - e2e "A cut image can be pasted into another note" would also pass without adoption inside the grace hour (adoption itself is pinned by the unit test).
  - Deleting note A or its folder explicitly (or a fresh untitled note discarded as empty) removes its marked uploads at once via the cascade, so a later paste into B 404s. Documented in design.md Risks for the discarded-empty case only; tasks.md 5.1 and 21.2 still use the old wording.
