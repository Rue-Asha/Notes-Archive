verified-at: ea07e58

## Layer 1: proof:full

Exit 0 at ea07e58. 623 passed, 107 skipped (e2e, 8.7m); unit 401 passed; check-slop clean; svelte-check 0 errors 0 warnings; build ok; check-drift: 25 file(s) match lock v2.0.0. `openspec validate redesign --strict`: valid.

```
  ✓  714 [desktop] › e2e/tree-focus.test.ts:103:1 › Scenario: Long names stay readable in the tree (248ms)
  ✓  715 [desktop] › e2e/tree-focus.test.ts:125:1 › Scenario: Deleting the focused folder moves the focus up (665ms)
  ✓  716 [desktop] › e2e/tree-focus.test.ts:149:1 › Scenario: Opening a note from search focuses its folder (808ms)
  ✓  717 [desktop] › e2e/tree-focus.test.ts:176:1 › Scenario: Top-level note shows the top level (217ms)
  ✓  718 [desktop] › e2e/tree-focus.test.ts:186:1 › Scenario: Moving the open note moves the focus (439ms)
  ✓  719 [desktop] › e2e/tree-focus.test.ts:205:1 › Scenario: Deleting the open note keeps its folder focused (366ms)
  ✓  720 [desktop] › e2e/tree-keyboard.test.ts:22:1 › Scenario: Chevron expands without navigating (235ms)
  ✓  721 [desktop] › e2e/tree-keyboard.test.ts:36:1 › Scenario: Manual open state lasts until reload (378ms)
  ✓  722 [desktop] › e2e/tree-keyboard.test.ts:55:1 › Scenario: Empty folder has no chevron (144ms)
  ✓  723 [desktop] › e2e/tree-keyboard.test.ts:66:1 › Scenario: Tree focuses the open note folder and marks its row (301ms)
  ✓  724 [desktop] › e2e/tree-keyboard.test.ts:85:1 › Scenario: Arrow keys move through the tree (233ms)
  ✓  725 [desktop] › e2e/tree-keyboard.test.ts:110:1 › Regression: a folder row is named by its folder alone (164ms)
  ✓  726 [desktop] › e2e/tree-keyboard.test.ts:118:1 › Regression: the tree keeps one tab stop after the focused row goes (334ms)
  ✓  727 [desktop] › e2e/tree-keyboard.test.ts:141:1 › Regression: Enter and Escape in a rename give the focus back to the row (242ms)
  ✓  728 [desktop] › e2e/tree.test.ts:4:1 › Scenario: Tree shows folders with their sub-folders and notes (214ms)
  ✓  729 [desktop] › e2e/tree.test.ts:37:1 › Scenario: Current item is highlighted in the tree (242ms)
  ✓  730 [desktop] › e2e/tree.test.ts:56:1 › Scenario: Untitled note in the tree reads Untitled (172ms)

  107 skipped
  623 passed (8.7m)
```

## Coverage

242 scenarios: 232 covered, 10 manual (listed once in the checklist below), 0 gaps.

Since c9d8188 every new or modified scenario is in the passed list of the ea07e58 run: "Long tag pill wraps inside its entry", "Folder delete leaves out a zero count", "Deleting a folder asks with counts" and "Empty folder asks without counts" (alert dialog wording), "Deleting the open note asks first and lands on its folder", "Enter on a note waits for the answer", "Menus and dialogs open and close softly" (confirmation close at most 160 ms). The sheet-scroll fix has no spec scenario; its regression test "Turning the window phone-sized leaves the page where it was" passed on desktop (skipped on phone by design).

| Scenario | proof | Evidence |
|---|---|---|
| Proof runs the fingerprint guards | unit | Scenario: Proof runs the fingerprint guards ✓ |
| Vendored files match the lock | unit | Scenario: Vendored files match the lock ✓ |
| App renders with the slate accent | e2e | Scenario: App renders with the slate accent ✓ |
| Fingerprint fonts load from the app | e2e | Scenario: Fingerprint fonts load from the app ✓ |
| App pages load nothing from other origins | e2e | Scenario: App pages load nothing from other origins ✓ |
| Icon files are served | e2e | Scenario: Icon files are served ✓ |
| Manifest references existing icons | e2e | Scenario: Manifest references existing icons ✓ |
| Head carries the icon links | e2e | Scenario: Head carries the icon links ✓ |
| Icon belongs to the family and reads as Notes Archive | manual (visual judgement: fresh-context review and Rue's gate-5 sign-off) | see Manual checklist |
| Home-screen shortcut shows the icon | manual (real hardware: Playwright has no home screen) | see Manual checklist |
| Redesign mockups are hidden without the test flag | unit | Scenario: Redesign mockups are hidden without the test flag ✓ |
| Every mockup screen is shot at three widths | e2e | Scenario: Every mockup screen is shot at three widths ✓ |
| Worst-case data switches the fixtures | e2e | Scenario: Worst-case data switches the fixtures ✓ |
| Wireframes carry no colour | manual (visual judgement; only Rue can sign off gate 4) | see Manual checklist |
| Hi-fi mockups render every contract state | manual (visual judgement; fresh-context review and Rue's sign-off) | see Manual checklist |
| Built screens match the signed-off hi-fi | manual (visual judgement at gate 7) | see Manual checklist |
| Old style files are gone | unit | Scenario: Old style files are gone ✓ |
| Proof runs check-slop without a baseline | unit | Scenario: Proof runs check-slop without a baseline ✓ |
| No horizontal page scroll from 320 to 1920 | e2e | Scenario: No horizontal page scroll from 320 to 1920 ✓ |
| Targets are at least 24 px | e2e | Scenario: Targets are at least 24 px ✓ |
| Focus is visible and not obscured | e2e | Scenario: Focus is visible and not obscured ✓ |
| Reduced motion removes movement | e2e | Scenario: Reduced motion removes movement ✓ |
| WCAG 2.2 AA review passes | manual (expert review; contrast in context, semantics and reading order need judgement) | see Manual checklist |
| Chrome text shows the default cursor | e2e | Scenario: Chrome text shows the default cursor ✓ |
| Fields and the editor keep the text cursor | e2e | Scenario: Fields and the editor keep the text cursor ✓ |
| Chrome text does not start a selection | e2e | Scenario: Chrome text does not start a selection ✓ |
| Contract strings stay | unit | Scenario: Contract strings stay ✓ |
| New strings are in the contract | unit | Scenario: New strings are in the contract ✓ |
| Editor surfaces keep every action after the restyle | e2e | Scenario: Slash menu lists every block type ✓ |
| A level-3 heading reads as a ruled overline | manual (visual, gate 7) | see Manual checklist |
| Handle on touch targets the cursor's block | e2e | Scenario: Handle on touch targets the cursor's block ✓ |
| Slash menu stays above the keyboard in the emulated viewport | e2e | Scenario: Slash menu stays within the visible viewport on phone ✓ |
| Wide tables scroll inside their block | e2e | Scenario: Wide table scrolls inside its block on phone ✓ |
| Long unbroken words wrap | e2e | Scenario: Long unbroken words wrap ✓ |
| Very long note stays usable | e2e | Scenario: Very long note stays usable ✓ |
| Text colours keep their stored names | e2e | Scenario: Text colours keep their stored names ✓ |
| Phone menus stay clear of the keyboard and the selection menu | manual (real hardware: Playwright has no soft keyboard or native selection menu) | see Manual checklist |
| Slash menu inserts toggle, callout and table | e2e | Scenario: Slash menu inserts toggle, callout and table ✓ |
| Toggle opens and closes and doesn't save its state | e2e | Scenario: Toggle opens and closes and doesn't save its state ✓ |
| Nested lists and toggles inside toggles work | e2e | Scenario: Nested lists and toggles inside toggles work ✓ |
| Callout shows an emoji and a tinted panel | e2e | Scenario: Callout shows an emoji and a tinted panel ✓ |
| Code block highlights syntax and switches language | e2e | Scenario: Code block highlights syntax and switches language ✓ |
| Table adds and removes rows and columns | e2e | Scenario: Table adds and removes rows and columns ✓ |
| Wide table scrolls inside its block on phone | e2e | Scenario: Wide table scrolls inside its block on phone ✓ |
| Task checkbox persists after reload | e2e | Scenario: Task checkbox persists after reload ✓ |
| Dragging a toggle moves its content | e2e | Scenario: Dragging a toggle moves its content ✓ |
| Each level is its own page | e2e | Scenario: Each level is its own page ✓ |
| Back goes up a level | e2e | Scenario: Back goes up a level ✓ |
| Deep levels stay readable | e2e | Scenario: Deep levels stay readable ✓ |
| Empty level offers New note and New folder | e2e | Scenario: Empty level offers New note and New folder ✓ |
| Folder page shows path, cover, sub-folders and notes | e2e | Scenario: Folder page shows path, cover, sub-folders and notes ✓ |
| Only sub-folders or only notes omits the other section | e2e | Scenario: Only sub-folders or only notes omits the other section ✓ |
| Cover menu adds, changes and removes the cover | e2e | Scenario: Cover menu adds, changes and removes the cover ✓ |
| Folder note rows show the absolute date | e2e | Scenario: Folder note rows show the absolute date ✓ |
| Cover upload failure shows a toast | e2e | Scenario: Cover upload failure shows a toast ✓ |
| Folder counts read singular | e2e | Scenario: Folder counts read singular ✓ |
| New folder appears without reload | e2e | Scenario: New folder appears without reload ✓ |
| Folder menu offers Rename, Move to and Delete | e2e | Scenario: Folder menu offers Rename, Move to and Delete ✓ |
| Long folder names wrap on the folder page | e2e | Scenario: Long folder names wrap on the folder page ✓ |
| Folder page shows sub-folders and notes by last edited | e2e | Scenario: Folder page shows sub-folders and notes by last edited ✓ |
| Folder page shows breadcrumb, cover header and counts | e2e | Scenario: Folder page shows breadcrumb, cover header and counts ✓ |
| Header and parent row count the same | unit | Scenario: Header and parent row count the same ✓ |
| Empty folder offers New note and New folder | e2e | Scenario: Empty folder offers New note and New folder ✓ |
| New note from a folder page lands in that folder | e2e | Scenario: New note from a folder page lands in that folder ✓ |
| New folder from a folder page creates a sub-folder | e2e | Scenario: New folder from a folder page creates a sub-folder ✓ |
| Upload and replace a folder cover | e2e | Scenario: Upload and replace a folder cover ✓ |
| Removing the cover brings back Add cover | e2e | Scenario: Removing the cover brings back Add cover ✓ |
| Wrong cover file is refused with a toast | e2e | Scenario: Wrong cover file is refused with a toast ✓ |
| Server replaces covers and stores them as WebP | unit | Scenario: Server replaces covers and stores them as WebP ✓ |
| Deleting a folder asks with counts | e2e | Scenario: Deleting a folder asks with counts ✓ |
| Empty folder asks without counts | e2e | Scenario: Empty folder asks without counts ✓ |
| Folder delete leaves out a zero count | unit | Scenario: Folder delete leaves out a zero count ✓ |
| Cancelled folder delete keeps everything | e2e | Scenario: Cancelled folder delete keeps everything ✓ |
| Deleting the folder of the open note navigates to its parent | e2e | Scenario: Deleting the folder of the open note navigates to its parent ✓ |
| Server folder delete removes descendants, notes and uploads | unit | Scenario: Server folder delete removes descendants, notes and uploads ✓ |
| Home shows search, New note, Pinned and Recently edited | e2e | Scenario: Home shows search, New note, Pinned and Recently edited ✓ |
| The Home kicker names the reader's day | e2e | Scenario: The Home kicker names the reader's day ✓ |
| Home search entry opens the palette | e2e | Scenario: Home search entry opens the palette ✓ |
| Home has no folders | e2e | Scenario: Home has no folders ✓ |
| Recently edited shows the eight latest notes | e2e | Scenario: Recently edited shows the eight latest notes ✓ |
| No notes shows the welcome state even with folders | e2e | Scenario: No notes shows the welcome state even with folders ✓ |
| Pinned is absent without pins | e2e | Scenario: Pinned is absent without pins ✓ |
| One pinned note has no reorder controls | e2e | Scenario: One pinned note has no reorder controls ✓ |
| Long titles and snippets stay in their entries | e2e | Scenario: Long titles and snippets stay in their entries ✓ |
| One note reads singular | e2e | Scenario: One note reads singular ✓ |
| Drag a pinned note to a new place | e2e | Scenario: Drag a pinned note to a new place ✓ |
| Move up and Move down reorder from the menu | e2e | Scenario: Move up and Move down reorder from the menu ✓ |
| Move up and Move down are disabled at the ends | e2e | Scenario: Move up and Move down are disabled at the ends ✓ |
| A stale reorder reloads the list with a toast | e2e | Scenario: A stale reorder reloads the list with a toast ✓ |
| Failed reorder reverts with a toast | e2e | Scenario: Failed reorder reverts with a toast ✓ |
| New pins appear first | e2e | Scenario: New pins appear first ✓ |
| Reduced motion moves without animation | e2e | Scenario: Reduced motion moves without animation ✓ |
| Typing in the editor runs no animations | e2e | Scenario: Typing in the editor runs no animations ✓ |
| Editor menus open without animation | e2e | Scenario: Editor menus open without animation ✓ |
| Motion feels smooth on real devices | manual (visual judgement on real hardware at Gate 7) | see Manual checklist |
| A new folder arrives in the tree and its neighbours make room | e2e | Scenario: A new folder arrives in the tree and its neighbours make room ✓ |
| The first folder arrives on an empty Folders page | e2e | Scenario: The first folder arrives on an empty Folders page ✓ |
| Unpinning a note on Home lets it go and the rest make room | e2e | Scenario: Unpinning a note on Home lets it go and the rest make room ✓ |
| Menus and dialogs open and close softly | e2e | Scenario: Menus and dialogs open and close softly ✓ |
| Navigation stays instant | e2e | Scenario: Navigation stays instant ✓ |
| Reduced motion makes all of it instant | e2e | Scenario: Reduced motion makes all of it instant ✓ |
| Opening a new empty note focuses the title | e2e | Scenario: Opening a new empty note focuses the title ✓ |
| New note shows its placeholders | e2e | Scenario: New note shows its placeholders ✓ |
| New note from the shell lands in the current folder | e2e | Scenario: New note from the shell lands in the current folder ✓ |
| New note without a current folder lands at the top level | e2e | Scenario: New note without a current folder lands at the top level ✓ |
| Empty new note is discarded on leaving | e2e | Scenario: Empty new note is discarded on leaving ✓ |
| Note with only a title is kept | e2e | Scenario: Note with only a title is kept ✓ |
| Server creates notes at the root or in a folder | unit | Scenario: Server creates notes at the root or in a folder ✓ |
| Server discards only empty notes | unit | Scenario: Server discards only empty notes ✓ |
| Note page shows icon, title and body | e2e | Scenario: Note page shows icon, title and body ✓ |
| Pick, change and remove the note icon | e2e | Scenario: Pick, change and remove the note icon ✓ |
| Emoji picker is usable on phone | e2e | Scenario: Emoji picker is usable on phone ✓ |
| Untitled note's tab title reads Untitled | e2e | Scenario: Untitled note's tab title reads Untitled ✓ |
| Very long title wraps | e2e | Scenario: Very long title wraps ✓ |
| Properties show under the title | e2e | Scenario: Properties show under the title ✓ |
| Properties collapse into a summary on the phone | e2e | Scenario: Properties collapse into a summary on the phone ✓ |
| Property changes save at once | e2e | Scenario: Property changes save at once ✓ |
| Many tags wrap without horizontal scroll | e2e | Scenario: Many tags wrap without horizontal scroll ✓ |
| Long folder path stays readable in the properties | e2e | Scenario: Long folder path stays readable in the properties ✓ |
| Note without tags shows no tag count | e2e | Scenario: Note without tags shows no tag count ✓ |
| Note card shows its parts | e2e | Scenario: Note card shows its parts ✓ |
| Card shows its first tag and +n | e2e | Scenario: Card shows its first tag and +n ✓ |
| Long tags never run into the time | e2e | Scenario: Long tags never run into the time ✓ |
| Search results are numbered rows with folder and date | e2e | Scenario: Search results are numbered rows with folder and date ✓ |
| Note without text shows Empty note | e2e | Scenario: Note without text shows Empty note ✓ |
| Untitled note card reads Untitled | e2e | Scenario: Untitled note card reads Untitled ✓ |
| Snippet skips a leading image | unit | Scenario: Snippet skips a leading image ✓ |
| Edited time reads relative | unit | Scenario: Edited time reads relative ✓ |
| Pin from the properties row | e2e | Scenario: Pin from the properties row ✓ |
| Pin from a card menu | e2e | Scenario: Pin from a card menu ✓ |
| Pinned notes appear on Home most recently pinned first | e2e | Scenario: Pinned notes appear on Home most recently pinned first ✓ |
| Unpinning the last note hides the Pinned list | e2e | Scenario: Unpinning the last note hides the Pinned list ✓ |
| Server orders pinned notes by pin order | unit | Scenario: Server orders pinned notes by pin order ✓ |
| Reorder sets the pinned order | unit | Scenario: Reorder sets the pinned order ✓ |
| A new pin goes to the top of a custom order | unit | Scenario: A new pin goes to the top of a custom order ✓ |
| Re-pinning does not keep the old position | unit | Scenario: Re-pinning does not keep the old position ✓ |
| A stale reorder is refused | unit | Scenario: A stale reorder is refused ✓ |
| Migration keeps the existing order | unit | Scenario: Migration keeps the existing order ✓ |
| Reordering does not change updatedAt | unit | Scenario: Reordering does not change updatedAt ✓ |
| Deleting the open note asks first and lands on its folder | e2e | Scenario: Deleting the open note asks first and lands on its folder ✓ |
| Delete buttons stack on a phone | e2e | Scenario: Delete buttons stack on a phone ✓ |
| Cancelled note delete keeps everything | e2e | Scenario: Cancelled note delete keeps everything ✓ |
| Delete a note from its card | e2e | Scenario: Delete a note from its card ✓ |
| Server delete removes tag links, uploads and the index row | unit | Scenario: Server delete removes tag links, uploads and the index row ✓ |
| Enter in the title adds a line break | e2e | Scenario: Enter in the title adds a line break ✓ |
| Cmd or Ctrl+Enter moves to the body | e2e | Scenario: Cmd or Ctrl+Enter moves to the body ✓ |
| ArrowDown on the last title line moves to the body | e2e | Scenario: ArrowDown on the last title line moves to the body ✓ |
| Title is the page heading | e2e | Scenario: Title is the page heading ✓ |
| Pasted CRLF text keeps its line breaks | e2e | Scenario: Pasted CRLF text keeps its line breaks ✓ |
| Many short title lines stay in the column | e2e | Scenario: Many short title lines stay in the column ✓ |
| Save status shows Saving and Saved | e2e | Scenario: Save status shows Saving and Saved ✓ |
| Failed saves show one toast and a retry status | e2e | Scenario: Failed saves show one toast and a retry status ✓ |
| Saving stops after the note was deleted elsewhere | e2e | Scenario: Saving stops after the note was deleted elsewhere ✓ |
| Save status is not a live region | e2e | Scenario: Save status is not a live region ✓ |
| Empty palette shows Recent and Actions | e2e | Scenario: Empty palette shows Recent and Actions ✓ |
| Typing shows at most eight highlighted hits | e2e | Scenario: Typing shows at most eight highlighted hits ✓ |
| Back closes the palette on touch | e2e | Scenario: Back closes the palette on touch ✓ |
| Opening the palette leaves the page where it was | e2e | Scenario: Opening the palette leaves the page where it was ✓ |
| Closing the palette restores the editor selection | e2e | Scenario: Palette keeps the editor's selection and content ✓ |
| Cmd or Ctrl+K on a selection edits the link | e2e | Scenario: Cmd or Ctrl+K on a selection edits the link ✓ |
| Typing replaces the URL after 200 ms | e2e | Scenario: Typing replaces the URL after 200 ms ✓ |
| Changing a filter pushes a history entry | e2e | Scenario: Changing a filter pushes a history entry ✓ |
| Idle search page shows the hint | e2e | Scenario: Idle search page shows the hint ✓ |
| Query without hits says No notes match | e2e | Scenario: Query without hits says No notes match ✓ |
| Filters without hits say No results | e2e | Scenario: Filters without hits say No results ✓ |
| One result reads singular | e2e | Scenario: One result reads singular ✓ |
| Results stop at fifty | e2e | Scenario: Results stop at fifty ✓ |
| Filters are compact pills over a 16 px picker | e2e | Scenario: Filters are compact pills over a 16 px picker ✓ |
| Long query wraps and survives a reload | e2e | Scenario: Long query wraps and survives a reload ✓ |
| Cmd or Ctrl+K opens the palette anywhere | e2e | Scenario: Cmd or Ctrl+K opens the palette anywhere ✓ |
| Search buttons open the palette | e2e | Scenario: Search buttons open the palette ✓ |
| Empty palette shows recent notes | e2e | Scenario: Empty palette shows recent notes ✓ |
| Typing shows results with highlighted snippets | e2e | Scenario: Typing shows results with highlighted snippets ✓ |
| A title-only hit highlights its title | e2e | Scenario: A title-only hit highlights its title ✓ |
| Enter on a note waits for the answer | e2e | Scenario: Enter on a note waits for the answer ✓ |
| A failed search clears the hits and says so | e2e | Scenario: A failed search clears the hits and says so ✓ |
| Arrow keys and Enter open a result | e2e | Scenario: Arrow keys and Enter open a result ✓ |
| Palette offers New note and New folder | e2e | Scenario: Palette offers New note and New folder ✓ |
| Escape closes the palette | e2e | Scenario: Escape closes the palette ✓ |
| See all results opens the search page | e2e | Scenario: See all results opens the search page ✓ |
| No hits shows No notes match | e2e | Scenario: No hits shows No notes match ✓ |
| Palette keeps the editor's selection and content | e2e | Scenario: Palette keeps the editor's selection and content ✓ |
| Palette is full-screen on phone | e2e | Scenario: Palette is full-screen on phone ✓ |
| Search in the note menu opens the palette | e2e | Scenario: Search in the note menu opens the palette ✓ |
| Opening a folder focuses the tree on it | e2e | Scenario: Opening a folder focuses the tree on it ✓ |
| Path row links go up | e2e | Scenario: Path row links go up ✓ |
| Top level has no path row | e2e | Scenario: Top level has no path row ✓ |
| Deep path shortens the middle | e2e | Scenario: Deep path shortens the middle ✓ |
| Long names stay readable in the tree | e2e | Scenario: Long names stay readable in the tree ✓ |
| Deleting the focused folder moves the focus up | e2e | Scenario: Deleting the focused folder moves the focus up ✓ |
| Empty tree offers New folder | e2e | Scenario: Empty tree offers New folder ✓ |
| Untitled note in the tree reads Untitled | e2e | Scenario: Untitled note in the tree reads Untitled ✓ |
| Opening a note from search focuses its folder | e2e | Scenario: Opening a note from search focuses its folder ✓ |
| Top-level note shows the top level | e2e | Scenario: Top-level note shows the top level ✓ |
| Moving the open note moves the focus | e2e | Scenario: Moving the open note moves the focus ✓ |
| Deleting the open note keeps its folder focused | e2e | Scenario: Deleting the open note keeps its folder focused ✓ |
| Chevron expands without navigating | e2e | Scenario: Chevron expands without navigating ✓ |
| Manual open state lasts until reload | e2e | Scenario: Manual open state lasts until reload ✓ |
| Empty folder has no chevron | e2e | Scenario: Empty folder has no chevron ✓ |
| Tree focuses the open note folder and marks its row | e2e | Scenario: Tree focuses the open note folder and marks its row ✓ |
| Arrow keys move through the tree | e2e | Scenario: Arrow keys move through the tree ✓ |
| One control folds the tree into a rail | e2e | Scenario: One control folds the tree into a rail ✓ |
| Rail state survives a reload without a flash | e2e | Scenario: Rail state survives a reload without a flash ✓ |
| Storage unavailable falls back to expanded | e2e | Scenario: Storage unavailable falls back to expanded ✓ |
| Rail controls keep accessible names | e2e | Scenario: Rail controls keep accessible names ✓ |
| Tags sit below the tree with counts | e2e | Scenario: Tags sit below the tree with counts ✓ |
| Tags follow the folders on the phone | e2e | Scenario: Tags follow the folders on the phone ✓ |
| The open tag is the current row | e2e | Scenario: The open tag is the current row ✓ |
| Tags section is absent without tags | e2e | Scenario: Tags section is absent without tags ✓ |
| Tag counts update without reload | e2e | Scenario: Tag counts update without reload ✓ |
| Sort picker marks the current mode | e2e | Scenario: Sort picker marks the current mode ✓ |
| Choosing a mode re-sorts and persists | e2e | Scenario: Choosing a mode re-sorts and persists ✓ |
| Failed sort save reverts with a toast | e2e | Scenario: Failed sort save reverts with a toast ✓ |
| Sort leaves the other lists alone | e2e | Scenario: Sort leaves the other lists alone ✓ |
| Sort picker on the phone lives on the Folders page | e2e | Scenario: Sort picker on the phone lives on the Folders page ✓ |
| Phone bar shows three pills and New note | e2e | Scenario: Phone bar shows three pills and New note ✓ |
| Current section is marked | e2e | Scenario: Current section is marked ✓ |
| Bar hides while the editor has focus | e2e | Scenario: Bar hides while the editor has focus ✓ |
| Bar fits 320 px with safe areas | e2e | Scenario: Bar fits 320 px with safe areas ✓ |
| Bar stays out of the soft keyboard | manual (real hardware: Playwright only emulates phones and has no soft keyboard) | see Manual checklist |
| Folders page lists top-level folders with counts, then tags | e2e | Scenario: Folders page lists top-level folders with counts, then tags ✓ |
| Folders pill opens the Folders page | e2e | Scenario: Folders pill opens the Folders page ✓ |
| No folders shows No folders yet | e2e | Scenario: No folders shows No folders yet ✓ |
| New folder from the Folders page | e2e | Scenario: New folder from the Folders page ✓ |
| Desktop Folders page shows the tree at the top level | e2e | Scenario: Desktop Folders page shows the tree at the top level ✓ |
| Delete confirm shows counts once known | e2e | Scenario: Delete confirm shows counts once known ✓ |
| Move to chooser starts with Root in tree order | e2e | Scenario: Move to chooser starts with Root in tree order ✓ |
| Modal dialog traps focus and returns it | e2e | Scenario: Modal dialog traps focus and returns it ✓ |
| Outside click cancels a menu or dialog | e2e | Scenario: Outside click cancels a menu or dialog ✓ |
| Toast is a polite status for about four seconds | e2e | Scenario: Toast is a polite status for about four seconds ✓ |
| Toast survives a redirect | e2e | Scenario: Toast survives a redirect ✓ |
| Controls keep a 44 px target below the wide layout | e2e | Scenario: Controls keep a 44 px target below the wide layout ✓ |
| Note column is capped and centred on wide screens | e2e | Scenario: Note column is capped and centred on wide screens ✓ |
| Note column widens at 1100 px and fills the content area at 1280 | e2e | Scenario: Note column widens at 1100 px and fills the content area at 1280 ✓ |
| Home lists sit side by side on wide screens | e2e | Scenario: Home lists sit side by side on wide screens ✓ |
| Mid-width shows the sidebar with stacked lists | e2e | Scenario: Mid-width shows the sidebar with stacked lists ✓ |
| Tag page shows the tag heading and its notes | e2e | Scenario: Tag page shows the tag heading and its notes ✓ |
| Tag page entries show folder, date and tags | e2e | Scenario: Tag page entries show folder, date and tags ✓ |
| Long tag name heading wraps | e2e | Scenario: Long tag name heading wraps ✓ |
| Long tag pill wraps inside its entry | e2e | Scenario: Long tag pill wraps inside its entry ✓ |
| One tagged note reads singular | e2e | Scenario: One tagged note reads singular ✓ |
| Deleting the last note on the restyled tag page goes Home | e2e | Scenario: Deleting the last tagged note goes Home ✓ |

## Manual checklist

Start: `npm run dev` then http://localhost:5173

- Icon belongs to the family and reads as Notes Archive (manual (visual judgement: fresh-context review and Rue's gate-5 sign-off))
- Home-screen shortcut shows the icon (manual (real hardware: Playwright has no home screen))
- Wireframes carry no colour (manual (visual judgement; only Rue can sign off gate 4))
- Hi-fi mockups render every contract state (manual (visual judgement; fresh-context review and Rue's sign-off))
- Built screens match the signed-off hi-fi (manual (visual judgement at gate 7))
- WCAG 2.2 AA review passes (manual (expert review; contrast in context, semantics and reading order need judgement))
- A level-3 heading reads as a ruled overline (manual (visual, gate 7))
- Phone menus stay clear of the keyboard and the selection menu (manual (real hardware: Playwright has no soft keyboard or native selection menu))
- Motion feels smooth on real devices (manual (visual judgement on real hardware at Gate 7))
- Bar stays out of the soft keyboard (manual (real hardware: Playwright only emulates phones and has no soft keyboard))

## Diffstat

```
main...flow/redesign:  633 files changed, 47211 insertions(+), 8908 deletions(-)
```

## Screenshots (not committed)

168 PNGs under `/home/Rue/Repos/RA-Echosystem/Notes-Archive/test-results/shots/redesign/` (<screen>-<width>-<normal|worst>.png).

## Review

Three rounds (verifier + fresh-context code review + gate-7 UX/a11y review in round 1).

- Round 1 (33 findings, all fixed in cc95571, 8e5c315, 78e12d7, 611bef4): editor Enter moved the caret to the doc start (Chrome's queued selectionchange; core.ts flushes the DOM observer, 10× regression test); title ArrowDown; pinned reorder stale queued saves; sort menu focus + overlapping choices; tree roving tabindex lost after delete/move; treeitem names; folder delete fetch failure; focus lost when controls remove themselves (rename, "…", Shorten path, properties toggle now one aria-expanded button); breadcrumb `more` reset; palette stale-hit Enter, options out of the tab order (aria-activedescendant); search timer on navigation; sessionStorage guard; weakened tests restored (note-icon/COPY, callout delta, credits test, handle, sidebar, breadcrumb order, toast redirect, search 200 ms timing); folders page order; baseline scenario REMOVED; check-drift named test; mobile/a11y (16 px selects on coarse, manifest name "Notes Archive", touch targets, pinned meta line, bubble clamp, one highlight role, kicker ellipsis, hover gating, aria-keyshortcuts).
- Round 2 (7 findings, all fixed in 73772c9, 539cf36, 385871a, bf5ac8d, 4b61b95): a toast showing at a full reload was lost (now parked on pagehide); contract-strings test pins COPY exactly; palette queued Enter keeps the chosen target and works when the search fails; sort menu out-of-order answers resync; whole-word Unicode highlighting; tag-only hits marked again; title-only hits: MODIFIED delta "A title-only hit highlights its title".
- Round 3 (open, after the 3-round limit): palette — after a failed search, Enter opens a hit from the previous query; a mouse-hovered row is not remembered for a queued Enter; a queued Enter on a note opens whatever note sits at that position in the new answer. Proposed fix: simplify — while the answer is pending or failed, Enter does nothing on note rows and stale hits are cleared with an error line. Sort menu: a new choice made during the failure-path invalidate briefly shows the server value. Weak tests: toast reload doesn't pin "for the time it had left" in e2e (the unit test does); palette title-only test doesn't pin that the mark sits in the title element.

Gate 7 (reviewer + design pass, rounds 4 and 5 after the gate-7 polish).

- Round 4 (resolved): R1 a cancelled navigation left motion off, so onNavigate hushes and a regression test pins it (cb736dc); R2 the Home kicker date used the SSR time zone, so it is client-rendered with midnight turnover and a test (aaa07ed); R3-R5 weak motion tests, now pinned to the moving row and to per-frame dialog sampling; R6 polish behaviour had no scenarios, scenarios added (31df544), H3 overline stays manual (visual, gate 7); R7 sidebar 280 / rail 60 px written into the shell spec; D1 the phone palette scrolled the page, fixed with an e2e (1023653); D2 delete dialog as the signed specimen (5a65daf); D3 chrome text not selectable (332eba7); D4 phone search filters as pills (a899e2a); D5 first tag + N (9f169af, 8951423); D6 16 px code-language select; D7 44 px folder rows; D8 passive touchstart (2ad88e4, needs a real iPhone, manual); D9 "Change cover"; L1-L5 palette ring and counter, tag page, palette Enter waits (trade-off: fast typers press Enter twice), sort-menu flash, two weak tests.
- Round 5 (resolved): F1 a closed-mounted Sheet scrolled to top on resize, fixed with an e2e (8c5ae59); F2 the Enter test is pinned after release (1275200); F3 contract section 4.6 updated; F4 a long tag wraps (7de3fae); F5 delete dialogs are role alertdialog and close in 160 ms (cbc8ec7); F6 row "..." as in the hi-fi (91426df); F7 see F5; F8 folder delete drops a zero count (8cb0556).
- Open, for Rue at Gate 7 (not fixed, taste): palette scope pills and slash-menu group rail (signed at gate 5, unbuilt); folder-row "..." kept; phone palette opens instantly; /folders tag pills at desktop; theme-color #ffffff vs the colour field; phone delete button order; search rows show 3 tags vs 1; vendored DESIGN.md still says menus are instant (Design-System request to file).
