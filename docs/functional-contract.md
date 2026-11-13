# Notes Archive: functional contract

Input for the UI/UX redesign. It states what the app does, never how it looks. Anything not listed here is free to be redesigned; anything listed here must keep working. Sources: `README.md`, `openspec/specs/*`, `e2e/*`, and the behaviour of the route and component code (data, actions, states, copy, hooks only). Written 2026-11-12 against branch `chore/graphify`; updated the same day with Rue's gate-1 decisions (section 12). Where a decision needs server or data work before the redesign, it is tracked in the OpenSpec change `gate-1-decisions`.

Conventions: "MUST" = behaviour the redesign has to preserve. "Applies" in a route's states table means the state can occur and needs a defined presentation. All UI copy is English (see section 8).

---

## 1. Purpose and context

Notes Archive is a private notes archive for one person on their homelab: notes live in nested folders, carry tags, are written in a block editor and found through full-text search. It is single-user and self-hosted; there is no sign-in, sharing, or collaboration in the app.

Usage context: used daily on a desktop browser (keyboard-first, mouse) and on a phone (touch, soft keyboard, one hand). Both are first-class: capture on the phone, organising and long writing on the desktop. Every note and every action is reachable from both. Two devices may edit the same note; the last write wins.

Two postures must both be served: pointer + keyboard, and touch + soft keyboard. Which navigation form each posture gets, and at which viewport widths it switches, is free. The e2e suite exercises a 390×844 touch viewport and a 1280×800 desktop viewport.

---

## 2. Jobs-to-be-done

- J1. Capture a thought as a new note in one action, from anywhere, and start typing immediately.
- J2. Write and edit rich content (headings, lists, tasks, quotes, code, tables, toggles, callouts, images, files, link previews) without a save step.
- J3. Find a note fast by title, text or tag, from any page, by keyboard or touch.
- J4. Browse the archive by structure: folders (nested), their notes, and the tree.
- J5. Organise: create, rename, move and delete folders; move notes between folders; give notes icons, tags and a pin.
- J6. Return to what matters: recently edited notes and pinned notes at a glance.
- J7. Browse by tag: see every note carrying a tag.
- J8. Attach material to a note: images, files, link previews (stored with the note, never hotlinked).
- J9. Trust the archive: autosave with visible state, recoverable failure, confirmation before destruction.
- J10. Give folders identity with a cover photo.
- J11. Narrow search by folder (including sub-folders) and tag, with shareable URLs.

---

## 3. Entities

### Note
- Fields: `id`, `folderId` (null = root), `title` (may be empty; displayed as "Untitled"; may contain line breaks, stored with CRLF/CR normalised to LF; a title that is only whitespace and line breaks counts as empty), `icon` (one emoji or none), `content` (ProseMirror JSON document), `tags` (ordered list), `pinned` (stored as a pin time) and a pin order (manual: the user can reorder pinned notes; a newly pinned note goes to the top, so an untouched list reads most recently pinned first; unpinning drops the note's position, a later re-pin goes to the top), `createdAt`, `updatedAt`.
- Derived: plain-text `body_text` (for search and the snippet shown with a note in lists; snippet is whitespace-collapsed and cut to 240 characters, a leading image is skipped); search index row over title, body text and tag names.
- Lifecycle: created empty (root or in a folder) -> edited with autosave -> optionally pinned/moved/tagged -> deleted by the user. A note created and left completely empty (no title, no content, no icon, no tags, not pinned) is discarded when the user navigates away; a note with only a title or only an icon or only a pin is kept. `updatedAt` changes on any content/title/folder/icon/tag edit; a pin-only change or a pin reorder does not change `updatedAt`. Moving a note bumps `updatedAt`.
- Deleting a note removes its tag links, uploads (images, files, preview images) and index row; tags no note uses disappear.
- States: untitled; empty body ("Empty note" as snippet); pinned; deleted-elsewhere (a stale open tab, see Note route).

### Folder
- Fields: `id`, `parentId` (null = root), `name`, `coverImageId` (optional), `createdAt`, `updatedAt`.
- Nesting is unlimited. Names need not be unique among siblings. An empty or whitespace-only name becomes "Untitled folder".
- Relations: contains sub-folders and notes. A folder cannot be moved into itself or any descendant (server answers 400; the move picker never offers those).
- Counts: one rule everywhere. A folder's note count = every note in the folder and all its sub-folders, in a folder entry (4.7), in the folder page summary and in the delete dialog ("3 notes", singular "1 note"); a folder's folder count = all descendant folders (summary and delete dialog). Interpreted from Rue's "count the same way everywhere" (decision 7); confirmed by Rue on 2026-11-13 (gate 1 / task 2.5). A list that names the items it shows (the sub-folders on a folder page, the notes on a tag page) counts those items, which is a list length, not a folder count.
- Delete removes the folder, all descendant folders, all their notes and uploads, and its cover. Cannot be undone.

### Tag
- Fields: `id`, `name`; relation to notes (ordered per note).
- Names are unique ignoring case and Unicode diacritics ("Übung" = "übung"); the first spelling stored wins. Whitespace is collapsed and trimmed; blank names and duplicates on the same note are ignored.
- A tag exists only while at least one note uses it. Consequently an empty tag page cannot exist; a tag id that no longer exists is a 404.
- Count = notes using it.

### Uploads (images, files, link-preview images, folder covers)
- Images: any `image/*` up to 16 MB, converted server-side to WebP (long side at most 2400 px), owned by a note. Folder covers are WebP too (one per folder, replaced on re-upload). Served at `/images/<id>` with long-lived caching; ids are never reused.
- Files: any type up to 16 MB (empty files allowed), stored as-is with the original name; opened at `/files/<id>` (PDF inline, other types as download; `?download=1` always downloads).
- Link-preview images are fetched server-side, stored as WebP (long side at most 1600 px) and never hotlinked.
- Grace period: an upload no longer referenced by a saved body is marked removed, still served, and purged one hour later (purge runs at server start and on every note save). Re-referencing it (undo, paste into another note) clears the mark and transfers ownership. Uploads never saved into a body are left alone.

### Link preview
- Fields: `url`, `domain`, optional `title`, `description`, `siteName`, `imageId`. On any fetch failure only domain and URL are kept.

### Save state (client)
- `idle` (reads as saved), `pending` (unsaved change waiting), `saving`, `saved`, `error`, `deleted`.

### Search hit
- A note entry (4.6) plus snippet parts: ordered `{text, hit}` pieces; `hit: true` marks the matched words. Empty parts when the search is filter-only.

---

## 4. Routes

User-facing routes under `src/routes` (excluding `/__test*` and `/__mockups*`): `/`, `/folders/[id]`, `/notes/[id]`, `/search`, `/tags/[id]`. All sit inside one app shell (section 7) which supplies the folder tree, the tag list, the command palette and toasts.

Non-page endpoints (no UI, listed so nothing is assumed missing): `/api/notes`, `/api/notes/[id]`, `/api/notes/[id]/discard`, `/api/notes/[id]/images`, `/api/notes/[id]/files`, `/api/folders`, `/api/folders/[id]`, `/api/folders/[id]/cover`, `/api/search`, `/api/preview`, `/images/[id]`, `/files/[id]`, `/healthz`.

Unknown or malformed ids on `/notes/[id]`, `/folders/[id]`, `/tags/[id]` answer the framework's 404 ("Note not found" / "Folder not found" / "Tag not found"). There is no custom error page and none is planned (gate-1 decision 2). The one exception is the tag page redirect in 4.5, which applies only while that page is open.

Document titles (behaviour, used in tabs/history): `/` "Notes Archive"; folder "<name> · Notes Archive"; note "<title or Untitled> · Notes Archive"; search "Search · Notes Archive"; tag "<name> · Notes Archive".

### 4.1 `/` Home

Serves: J1, J3, J6, J4.

**Data shown**
- Intro copy: "Notes — Folders — Tags" and the page heading "Every note, in its place".
- Search entry point (reads "Search notes", shows the shortcut hint "⌘K").
- Pinned notes (only when at least one is pinned), in the user's manual pin order (a new pin goes first), with a count.
- Recently edited: the 8 most recently updated notes, newest first, as note entries (4.6).
- Folders: top-level folders as folder entries (4.7): name, note count (including sub-folders), cover image when set.
- Empty archive (no notes and no folders): welcome state "Write your first note".

**Actions**
- Open the command palette (search entry point).
- Reorder pinned notes: change the position of one pinned note in the list; the new order is saved immediately and kept across reloads and devices. It must work by keyboard and by touch (no drag-only interaction on touch). If the order was changed from another device meanwhile, the request is refused (409) and the list reloads in its current order. The interaction is designed in the redesign.
- "New note": creates a root note, navigates to `/notes/<id>`, title field focused.
- Open a note; open a folder.
- Note entry menu actions (Pin/Unpin, Move to…, Delete); changes are reflected without reload (folder note counts update after a move; the Pinned section disappears when the last pin is removed).

**States**
| State | Applies | Behaviour |
|---|---|---|
| Empty (no notes, no folders) | yes | Welcome copy plus New note; no Pinned/Recently edited/Folders sections |
| Notes but no folders | yes | Recently edited shown, Folders section omitted |
| Folders but no notes | yes | Not the welcome state; Folders section shown, Recently edited omitted |
| No pinned notes | yes | Pinned section absent entirely |
| One pinned note | yes | no reorder possible; the reorder action is absent or inert |
| Loading | n/a | data is server-loaded before the page renders; navigation shows no partial page |
| Error | no | no per-page error state (framework error if the server fails) |
| Single item | yes | one note / one folder must read correctly (counts "1 note") |
| Many items | yes | recent is capped at 8; folders and pinned are not capped (no pagination) |
| Overlong text | yes | long titles, folder names, tag names, snippets |

**Keyboard and touch**: Cmd/Ctrl+K opens palette; every action reachable by Tab and Enter; notes, folders and their menus usable by touch; New note reachable without a keyboard.

### 4.2 `/folders/[id]` Folder page

Serves: J4, J5, J10, J1.

**Data shown**
- Breadcrumb from the top-level folder down to the current folder; ancestors are links, the current folder is plain and marked current.
- Folder summary: folder name (the page heading), "N folder(s) · M note(s)" counting all descendant folders and all notes in the folder and its sub-folders (e.g. a folder with one sub-folder holding two notes and four notes of its own reads "1 folder · 6 notes"; an empty folder "0 folders · 0 notes"), cover image when set.
- Sub-folders as folder entries (4.7: name, note count including descendants, cover when set), with a count.
- The folder's direct notes as note entries (4.6), sorted by last edited, newest first, with the sort named "Last edited".
- Empty folder: "Nothing here yet" with the two creation actions.

**Actions**
- "New note": creates a note inside this folder and opens it.
- "New folder": creates a sub-folder named "Untitled folder" in this folder; it appears among this page's sub-folders and in the tree without reload.
- Cover: "Add cover" (no cover yet) or "Change cover" (replace), plus "Remove cover" when a cover exists. Accepts one image file. Wrong type: toast "That file isn't an image". Over 16 MB: toast "That image is too large". Any other failure: toast "Couldn't upload — try again". On success the new cover is shown with the folder; removing it removes the cover everywhere the folder appears (including the parent folder's page and Home).
- Open a sub-folder, a note or a breadcrumb link.
- Note entry menu: Pin/Unpin, Move to… (the note leaves this folder's list without reload when moved away), Delete (with confirm, the note leaves the list without reload).

**States**
| State | Applies | Behaviour |
|---|---|---|
| Empty (no sub-folders, no notes) | yes | "Nothing here yet" + New note + New folder |
| Only sub-folders / only notes | yes | the absent section is omitted |
| No cover | yes | no cover image; "Add cover" action offered |
| Loading | n/a | server-loaded |
| Error | partial | cover upload errors are toasts; unknown id = 404 |
| Single item | yes | "1 folder", "1 note" |
| Many items | yes | no pagination |
| Overlong text | yes | long folder name, breadcrumb with deep nesting (10+ levels), long sub-folder names |

**Keyboard and touch**: file chooser reachable by keyboard; all actions as buttons; breadcrumb is keyboard navigable.

### 4.3 `/notes/[id]` Note page

Serves: J1, J2, J5, J8, J9, J3.

**Data shown**
- Path: Home link plus the note's ancestor folders as links (root note: Home only).
- Save status: "Saving…" / "Saved"; on a failed save the status reads "Couldn't save — try again" and is itself an actionable retry.
- Note icon (emoji) or an "Add icon" action when none.
- Title field (label "Title", placeholder "Untitled"): plain text that may span several lines; a long or multi-line title stays fully readable without horizontal scroll and grows with its content. Enter inserts a line break (identical with a hardware and a soft keyboard); pasted line breaks are kept (interpreted from decision 4, confirmed by Rue on 2026-11-13 (gate 1 / task 2.5): this is the only behaviour that works on touch, where Shift+Enter is not reliably available). Moving from the title to the body is explicit: Cmd/Ctrl+Enter, or ArrowDown from the last line, puts the caret at the start of the body; on touch the person taps the body. Wherever a title is shown on one line (tab title, tree, command palette, confirm dialogs, folder chooser, note entries' single-line forms) each run of line breaks reads as one space.
- Properties (a group named "Properties"): Folder (accessible name "Folder: <current folder name>", "Root" when none), Tags (the note's tags, each removable, plus a text input "Add a tag"), Pinned (an on/off control exposing its state).
- Timestamps: "Edited <date>, <time> · Created <date>" (en-GB format, e.g. "12 Nov 2026, 14:05").
- Body: the editor (section 5).
- Deleted notice: "This note was deleted" (an alert) when the server reports the note gone while the page is open; saving stops.

**Actions**
- Edit title, body (autosaved, see below).
- Icon: open emoji chooser; pick an emoji; "Remove" clears the icon. Chooser has a search box ("Search emoji") that filters by keyword (e.g. "book" finds the book emoji, "herb" finds the herb); a result list of emoji (each named); empty result reads "No emoji match “<query>”". Escape closes and returns focus. Arrow keys move through the emoji results.
- Folder: opens a chooser titled "Move to" (accessible name "Choose a folder") listing "Root" and every folder in tree order, conveying each folder's nesting depth; the current one is marked; picking applies immediately (the tree updates without reload); Cancel and Escape close without change.
- Tags: type a name; matching existing tags are suggested (case- and diacritic-insensitive substring match, existing tags not already on the note, at most 8; arrow keys + Enter pick, Enter or comma confirms the typed text, comma also splits pasted "a, b, c"); Backspace in the empty input removes the last tag; each tag is removable on its own; Escape with text clears the text. Adding a new name creates the tag and it appears in the tag list (shell) with count 1 without reload.
- Pinned: toggles pin immediately.
- Note menu ("Note menu"): Search (opens palette; on touch it is the search entry that stays reachable while the editor has focus and the shell navigation is inert), Pin/Unpin, Move to… (same chooser as Folder), Delete.
- Delete: confirm dialog "Delete “<title or Untitled>”? This can't be undone." with Cancel / Delete. On confirm: note removed; navigates to the parent folder page, or Home for a root note. Cancel keeps everything and the page stays.
- Retry a failed save by activating the error status.

**Save and leave behaviour**
- Typed fields (title, body) save after a 600 ms pause; icon, folder, tags and pin save immediately. One request at a time; changes made meanwhile go out merged afterwards. Blur flushes. Navigating away waits for the pending save (and for the discard of an empty new note) before leaving. If the save fails, the page stays and local content is kept; the next edit or the retry saves it. Closing the tab sends a best-effort flush (or discards an empty new note).
- A new note opens with the title focused. A note that was already empty when opened gets the title focus; one the user emptied by hand does not auto-discard.
- Failure (decision 5, both kept): the status turns into the actionable "Couldn't save — try again" retry and, additionally, the toast of the same text appears once per run of failures (later failures stay quiet until a save succeeds again); network loss behaves the same; the next change retries.
- Server answers 404 on save: "This note was deleted", further saves stop, other notes' saving is unaffected.
- Two tabs: last write wins.

**States**
| State | Applies | Behaviour |
|---|---|---|
| New empty note | yes | title focused, placeholders, discarded if left untouched |
| Loading | n/a | note is server-loaded; editor mounts after |
| Error | yes | save failed (toast + retry status), note deleted (notice), 404 for unknown id |
| Single item | n/a | |
| Many tags | yes | every tag stays visible and removable; no horizontal page scroll |
| Overlong text | yes | 200+ character title and a title of many short lines stay readable with no horizontal scroll; very long tag names, folder names in the chooser, long unbroken words in the body, wide tables (scroll inside the table, never the page), very long notes |
| Note with unknown block types (old/new schema) | yes | shown as paragraphs of text, no page error |
| Read-only | no | |

**Keyboard and touch**: Title Enter -> line break, Cmd/Ctrl+Enter or ArrowDown from the last title line -> body start; Cmd/Ctrl+K with a text selection edits a link, without a selection opens the palette; Cmd/Ctrl+B/I/E marks; undo/redo (Cmd/Ctrl+Z, Shift+Z); Escape closes menus/choosers; Tab does not trap in the page but traps inside open dialogs. On touch, while the editor has focus no persistent navigation may cover the caret or sit above the soft keyboard: the shell's touch navigation is hidden and inert while the editor has focus and returns on blur; the note menu provides Search; the block menu provides reordering (no drag on touch).

### 4.4 `/search` Search page

Serves: J3, J11.

**Data shown**
- Query box ("Search notes"), filled from `?q=`.
- Filters: Folder ("Any folder", otherwise every folder as "Parent / Child" path labels) and Tag ("Any tag", otherwise every tag in use), reflected in `?folder=` and `?tag=`.
- Result count ("1 result" / "N results").
- Results as note entries (4.6); with a text query each shows the highlighted snippet in place of the plain snippet; with filters only, plain snippets and last-edited order.
- Idle copy (no query, no filter): "Search by title, text or tag, or pick a folder or tag."
- No match: "No notes match “<q>”" (text query) or "No results" (filter-only with nothing found).

**Actions**
- Type: the URL updates (history replaced, not added) 200 ms after typing stops; Enter submits at once.
- Change a filter: adds a history entry; folder filter includes sub-folders; filters combine with the query and with each other; Back removes the last filter change; reload keeps all three.
- Note entry menu actions (Pin/Unpin, Move to…, Delete).
- Open a result.
- Back/forward bring the URL's query into the box, unless the person is typing.

**States**
| State | Applies | Behaviour |
|---|---|---|
| Idle (no query/filter) | yes | idle copy, no results |
| Empty (no hits) | yes | the no-match copy |
| Loading | n/a | server-loaded per URL change; the typed text must not be lost while the page reloads |
| Error | no | queries never throw; special characters are safe |
| Single item | yes | "1 result" |
| Many items | yes | at most 50 results; no pagination |
| Overlong text | yes | long titles and snippets; very long query |

**Keyboard and touch**: the field is a search box; Enter submits; each filter is a single-choice selector (labelled "Folder" and "Tag") operable by keyboard and touch.

### 4.5 `/tags/[id]` Tag page

Serves: J7.

**Data shown**: label identifying this as a tag, the tag name, "N note(s)", and all tagged notes as note entries (4.6), last edited first.

**Redirect (decision 1)**: when the last note of the open tag page is deleted from its menu, the app navigates Home (no empty state, no error page); the tag disappears from the tag list. This applies only to a change made on this page; a tag id that no longer exists, opened directly or after a reload, is the plain 404.

**Actions**: open a note; note entry menu (Pin/Unpin, Move to…, Delete; a deleted note leaves the list without reload, the last one triggers the redirect above).

**States**
| State | Applies | Behaviour |
|---|---|---|
| Empty | no | a tag disappears when its last note drops it; deleting the last note on this page redirects Home; there is no empty tag page; a stale id is a 404 |
| Loading | n/a | server-loaded |
| Error | 404 | unknown tag id |
| Single item | yes | "1 note" |
| Many items | yes | no pagination |
| Overlong text | yes | long tag name as the page heading |

**Keyboard and touch**: standard link/button behaviour.

### 4.6 Shared object: Note entry (Home, folder, tag, search)
How a note is represented wherever notes are listed.
- Data: icon (when set), title ("Untitled" when empty; line breaks shown as spaces if the entry shows the title on one line), snippet (plain-text excerpt, at most 240 characters; "Empty note" when the body has no text; on search results, highlighted snippet parts), up to 3 tag names plus "+n" for the rest, relative edited time ("just now", "5m ago", "2h ago", "3d ago", "12 Mar", or "12 Mar 2025" when not in the current year; dates from 30 days on), pinned state (exposed with the name "Pinned") when pinned.
- Actions: open the note; menu "Note actions": Pin/Unpin; "Move to…" (chooser, section 4.3); Delete (confirm "Delete “<title>”? This can't be undone."). The menu opens without opening the note.
- Edge: no icon, no tags, long title, five tags ("+2"), note with only an image (snippet skips a leading image).

### 4.7 Shared object: Folder entry (Home, folder page)
How a folder is represented wherever folders are listed.
- Data: name, "N note(s)" (including descendants, the same count the folder page summary shows), cover image when set (none otherwise).
- Action: open the folder.

---

## 5. Editor behaviour (TipTap / ProseMirror)

The redesign keeps the ProseMirror core. This section separates what the core does (MUST be preserved) from the chrome around it (free to be redesigned, but every listed action MUST remain available).

### 5.1 Core editing behaviour (kept)

**Document model**: ProseMirror JSON. Server derives plain text on every save. Unknown node types render as text paragraphs; unknown marks are dropped; an invalid document becomes an empty paragraph. The body has the accessible name "Note body" and the placeholder "Write, or type / for blocks".

**Blocks**: paragraph; Heading 1-3; bullet list; numbered list; task list (checkboxes; checked state persists; nested items allowed, Tab indents); quote; code block (syntax highlighting, language picker, 21 languages: Bash, C, C++, C#, CSS, Diff, Go, HTML, Java, JavaScript, JSON, Kotlin, Markdown, PHP, Python, Ruby, Rust, SQL, Swift, TypeScript, YAML, plus "Plain text"; the language is stored); divider; toggle (collapsible: summary + nested content; open/closed state is NOT saved, always closed on load; toggles nest; dragging a toggle moves its content); callout (emoji + text paragraphs; emoji changeable via the emoji chooser, default 💡); table (3x3 with header row on insert; add/remove rows and columns; header row stays; a table wider than the available width scrolls inside itself, the page never scrolls sideways); image block (caption; scales down to the available width, never causes horizontal scroll); file block (type, name, size); link-preview block.

**Marks**: bold, italic, strikethrough, inline code (combinable with other marks), link, text colour (stored by name: stone, clay, ochre, moss, sea, plum; "Default" removes it).

**Markdown shortcuts** (typed at the start of a line): `# `, `## `, `### ` headings; `- ` or `* ` bullet list; `1. ` numbered list; `[] ` task list; `> ` quote; three backticks code block; `---` divider. They do NOT fire inside code blocks. Enter on an empty list/quote line leaves the block.

**Keyboard**: Cmd/Ctrl+B bold, +I italic, +E inline code, +K link on a selection (opens the link field; without a selection it opens the command palette), +Z undo, +Shift+Z redo, Tab/Shift+Tab nested lists, Cmd/Ctrl+A select all (formatting a whole note is allowed).

**Slash menu**: typing `/` at the start of a block or after a space opens a filtered block list; not inside a word ("a/b"), not inside code blocks. Items in order: Text, Heading 1, Heading 2, Heading 3, Bullet list, Numbered list, Task list, Quote, Code, Divider, Toggle, Callout, Table, Image, File. Typing filters by label and keywords (case/diacritic-insensitive: `/hea` -> the three headings; keywords such as "todo", "hr", "details", "photo", "pdf"); ArrowUp/ArrowDown move (wrapping); Enter or Tab inserts and removes the typed `/text`; Escape closes and leaves the typed text; a space after a no-match query closes it and leaves the text; no match shows "No results". On touch it must stay fully visible and never be hidden by the soft keyboard. Image and File items open the system file chooser and insert on selection.

**Paste, drop, upload**
- Paste or drop an image: placeholder while uploading, then an image block at the caret/drop position (an empty paragraph is replaced, otherwise the block goes after the current block). Image above 16 MB: toast "That image is too large"; non-image via the image path: "That file isn't an image"; upload failure (server error, network): placeholder removed, toast "Couldn't upload — try again". Upload placeholders are never saved into the document.
- Drop a non-image file (or "/file"): file block with type, name (umlauts and spaces kept), size ("1 KB", "2.4 MB"); above 16 MB: toast "Files can be up to 16 MB". Activating a file block opens `/files/<id>` in a new tab (PDF shows in the browser, others download).
- Paste a lone http(s) URL into an empty paragraph: becomes a link-preview block (title, description, site name, image when found; domain + URL when nothing could be fetched or the address is private/unreachable); one undo reverts the block to a plain linked URL. A URL pasted inside a sentence stays an inline link. An invalid URL stays plain text. Activating a preview block opens the URL in a new tab.
- Server rules behind this (informational): only http(s); hosts resolving to private/loopback/link-local/CGNAT addresses refused (also on each of at most 3 redirects); 5 s timeout; 1 MB page cap; `text/html` only; preview image stored locally.
- A block cut from one note and pasted into another keeps its upload (see uploads grace period).

**Drag and reorder**: with a pointer, blocks can be dragged to a new position, and the drop position is indicated during the drag; dragging a toggle or table moves the whole block. On touch there is no drag; reordering happens through the block menu.

**Code highlighting**: lowlight tokens classes (`hljs-*`) inside code blocks; changing the language re-highlights; plain text has no tokens.

**Autosave coupling**: every document change triggers the autosave described in 4.3; editor blur flushes; on touch the editor's focus state is what makes the shell's touch navigation hidden and inert (4.3, 7).

### 5.2 Editor chrome (redesignable; every action must remain)

- **Formatting controls** (role toolbar, named "Format", offered for a non-empty text selection, not inside code blocks; on touch they must not cover the native selection menu): Bold, Italic, Strikethrough, Inline code (each exposes its active state), Link, Text colour. Link: field "Link URL" (placeholder "Paste or type a link"), apply with Enter or the "Apply link" action, Escape cancels, an empty value removes the link, "Remove link" removes an existing one; a bare host gets `https://` prepended. Text colour: choose one of stone, clay, ochre, moss, sea, plum or "Default"; a "Close colours" action backs out.
- **"Block actions" control** (with a pointer it targets the block under the pointer and doubles as the drag source; on touch it targets the block containing the cursor): opens "Block menu" with Move up, Move down, Turn into, Delete. Move up is disabled on the first block, Move down on the last. "Turn into" lists Text, Heading 1, Heading 2, Heading 3, Bullet list, Numbered list, Task list, Quote, Code, Callout; text content stays.
- **Table actions** (offered while the cursor is inside a table): Add row below, Add column right, Delete row, Delete column (each disabled when not possible).
- **Code language picker** ("Language"): Plain text plus the 21 languages above.
- **Callout emoji control** ("Change emoji") opening the emoji chooser (4.3).
- **Image caption** field ("Caption"); empty caption leaves no visible caption.
- **Toggle** open/close control; **task checkbox** per item.
- **Upload placeholder** ("Uploading", a status) during uploads.
- **Slash menu** (listbox "Blocks"): visual form free, behaviour as in 5.1.

---

## 6. Search behaviour

**Engine**: SQLite FTS5 over three columns: title, body text, tag names. The index is updated on every save and on note delete.

**Query syntax** (deliberately none): the input is split into letter/number runs (Unicode); every run becomes a prefix term; all terms must match (AND). Punctuation and operators (`"`, `*`, `-`, `(`, `AND`, `NEAR(`) are not interpreted and never cause an error. Empty or whitespace-only text returns nothing.

**Matching**: case-insensitive; diacritic-insensitive for all Unicode letters ("uber" finds "über", "cafe" finds "Café"); "ß" is equivalent to "ss" in both directions; prefix match while typing ("kirsch" finds "Kirschblüte"); hits can be in title, body or tag.

**Ranking**: notes with a title match first, then by relevance (title weighs 10, body 1, tags 5). Filter-only searches sort by last edited, newest first.

**Result data**: note entry (id, title, icon, tags, pinned, updated time, snippet) plus snippet parts. The snippet is about 12 tokens around the match with "…" at cut ends; matched words are `hit: true` and must be presented as a highlight with semantic meaning (a `mark`-equivalent that assistive tech can identify); original spelling is kept ("Straße" stays "Straße" even when "strasse" was typed).

**Filters**: `folder` (the folder and all descendants) and `tag`; both combine with a text query and with each other; without text they list all matching notes. Limits: 50 on the search page, 8 in the palette.

**Command palette**: opened from anywhere by Cmd/Ctrl+K (not when a text selection exists in the editor, where it edits a link), by the shell's Search entry (in both postures), the Home search entry point, the note menu "Search" item. It is a dialog named "Search". Contents: empty input shows "Recent" (8 most recently edited notes, each with a relative time) and "Actions" (New note, New folder); typing (120 ms debounce, stale requests cancelled) shows "Notes · N result(s)" with title and highlighted snippet per hit, the same Actions, and "See all results" (opens `/search?q=<query>`); no hits: "No notes match “<q>”" (shown only once that query has been answered). Keyboard: ArrowUp/ArrowDown walk notes, then actions, then "See all results" (wrapping); Enter activates; Escape closes and restores focus to where it was; if opened from the editor with a collapsed or no selection the previous selection and content are restored when closed without choosing. Choosing a note, an action, or See all closes it. "New folder" creates "Untitled folder" at the root and opens its folder page. In the touch posture (today: below 768 px) it owns one history entry, so the back gesture or browser Back closes it without leaving the page, and a note chosen from it replaces that entry (Back does not land on the same page twice); in the pointer posture it adds no history entry. Opening it never alters editor content.

---

## 7. Cross-cutting behaviour

**Persistent navigation (shell)**
- Targets always reachable: Home, Search (opens the palette), New note, the folder tree, the tag list.
- Pointer posture (today: 1024 px and wider): one navigation landmark (accessible name "Sidebar", asserted by e2e) offering Home, Search (with the shortcut hint "⌘K"), New note, the folder tree headed "Folders" with a "New folder" action and, when tags exist, the tag list headed "Tags". The user can reduce it to a compact form and back with a toggle that exposes its expanded state ("Collapse sidebar" / "Expand sidebar"); the choice is remembered per browser (localStorage key `notes-archive:sidebar-collapsed`) and is already in effect on first render, with no visible switch after load.
- Touch posture (today: below 1024 px): one navigation landmark (accessible name "Bottom bar", asserted by e2e) offering Home, Search, New note and Folders. "Folders" opens a dialog named "Folders" holding the same tree plus the tag list and a "Close" action. That dialog closes on Escape, on the back gesture/browser Back (it owns one history entry and the URL is unchanged afterwards), on choosing any item, and on navigation; an item chosen from it replaces its history entry. While the editor has focus this landmark is hidden from assistive tech and not focusable (`aria-hidden`/inert), returning on blur.
- The landmark names "Sidebar" and "Bottom bar" describe today's forms; renaming them is allowed together with migrating the e2e specs that use them (section 8).
- New note from any entry creates an untitled root note and navigates to it.

**Folder tree (same behaviour in both postures)**
- Folders (expand/collapse per folder, control named "Expand <name>" / "Collapse <name>"; a folder with nothing inside is not expandable) and notes inside them; root notes listed after folders; order follows the stored tree sort (below); by default folders sort by name (natural order, numbers by value) and notes by last edited.
- Items: name ("Untitled" for untitled notes), the emoji for notes with an icon; a name that is shortened for space keeps the full name available (today a `title` tooltip); each item's nesting depth is conveyed.
- Current note/folder marked as current; its ancestors expand automatically; manual open/close state is kept until reload.
- Tree sort (decision 8): the user chooses how the tree is ordered, at every nesting level, applying to folders and notes alike. Modes (interpreted, confirmed by Rue on 2026-11-13 (gate 1 / task 2.5); the labels are the designers'): `mixed` = folders by natural name order, notes by last edited (the default and today's behaviour); `name` = folders and notes by natural name order (untitled notes sort as "Untitled"); `edited` = by last edited, newest first (a folder counts as edited when any note inside it, at any depth, was last edited, else by its own update time); `created` = by creation time, newest first. The choice is stored on the server, so it follows the person across devices and is in effect on first render. It affects the tree only, not the folder page, Home, tag or search lists. Changing it updates the tree without reload.
- Empty tree: "No folders yet" with "New folder".
- The tree's "New folder" action creates a root folder and opens its inline rename. Each folder has a menu named "<name> actions" opened by a control named "<name> menu": New note (inside), New folder (inside, opened in rename mode and the parent expands), Rename (inline field "Folder name"; Enter or blur commits, Escape cancels; empty becomes "Untitled folder"), Move to… (chooser excluding itself and descendants; offers "Root"), Delete.
- Delete folder: dialog (title "Delete folder") "Delete “<name>”? This deletes N folders and M notes inside it. This can't be undone." (counts include all descendants, "1 folder"/"1 note" singular; an empty folder reads "Delete “<name>”? This can't be undone."), Cancel / Delete. Confirm removes everything; if the open page is the folder or inside it, the app navigates to the folder's parent (or Home). Cancel keeps everything. The dialog is only shown once counts are known.

**Tag list** (shell): every tag in use, with note count, linking to its tag page; the whole section is absent when no tags exist; counts update without reload after tag edits.

**Menus, dialogs, choosers (behaviour)**
- Menus: opened by an explicit control; ArrowUp/ArrowDown/Home/End move; Escape closes with focus back to the opener; Tab closes; disabled items are skipped/inert; destructive items marked as such.
- Dialogs (confirm, folder chooser): modal behaviour (the rest of the page is not operable while open); focus moves inside; Tab stays inside; Escape and a click outside cancel; focus returns to the opener on close. Confirm dialogs: Cancel plus a confirm button named like the action ("Delete").
- Chooser lists use listbox semantics and arrow/Home/End navigation.

**Toasts**: transient messages (about 4 s) for failures: "Couldn't save — try again", "Couldn't upload — try again", "That image is too large", "That file isn't an image", "Files can be up to 16 MB". Announced politely (status). A toast raised just before a redirect or full page load survives to the next page.

**Persistence**
- Server: SQLite (`DATABASE_PATH`), migrations on start; images, files, covers stored in the database.
- Server preferences: the folder tree sort mode (one value, default `mixed`).
- Browser: only the navigation collapsed flag (localStorage) and queued toasts (sessionStorage). Nothing else is remembered per browser (no unsent drafts; unsaved text is held in the page until saved or lost on a hard failure with tab closure, which sends a best-effort flush).
- URL: search state (`q`, `folder`, `tag`) is in the URL; all route ids are in the URL; deep links work.

**Keyboard shortcuts (global)**: Cmd/Ctrl+K opens the palette from anywhere except where it edits a link (editor with a text selection). Escape closes the topmost overlay. No other global shortcuts exist; there is none for New note and none is planned (decision 3).

**Cross-page consistency**: after any change made in a menu, tree or properties row, every visible list of the same data (tree, Home folders and counts, tag list and counts, folder page) updates without a manual reload.

**Overflow**: nothing scrolls the page horizontally at any width; wide content (tables) scrolls inside itself. The e2e `layout` spec also asserts today's reading width and list column counts; those are layout, not contract, and are rewritten with the redesign.

**Accessibility behaviour**: landmarks and names as listed ("Sidebar", "Bottom bar", "Breadcrumb", "Properties"); the title field acts as the page heading; every icon-only control has an accessible name; results announce counts; the tree uses tree/treeitem roles with a current marker; reduced-motion preferences are respected.

---

## 8. Copy list (strings asserted by e2e)

Target language is English throughout. All current UI strings are already English, so every `English target` equals the current string. German appears only as fixture content in the specs (user note titles, folder names, tags such as "Reisen", "Packliste", "Übung", "Kirschblüte"); that is test data, not UI copy, and is not translated. Spec column: file under `e2e/` without `.test.ts`. Patterns written as `<...>` carry dynamic text.

| current string | English target | used in spec file |
|---|---|---|
| Sidebar | Sidebar | bottom-bar, drawer, folder-create, journey, layout, move-note, sidebar, tag-input, tags-section, tree (+8) |
| Bottom bar | Bottom bar | bottom-bar, drawer, folder-create, journey, move-note, palette, sidebar, tag-input, tags-section, tree (+8) |
| Breadcrumb | Breadcrumb | folder-header |
| Home | Home | bottom-bar, drawer, sidebar, sidebar-collapse |
| Search | Search | bottom-bar, home-hero, journey, note-menu-search, palette, palette-actions, palette-editor, palette-results, sidebar |
| Search notes | Search notes | home-hero, journey, palette, palette-actions, palette-editor, palette-results, search-page |
| Recent | Recent | palette, palette-results |
| Actions | Actions | palette-actions |
| Notes | Notes | journey, palette-results |
| See all results | See all results | palette-actions |
| No notes match “<q>” | No notes match “<q>” | palette-results |
| No results | No results | slash |
| New note | New note | bottom-bar, folder-actions, folder-create, home-hero, home-welcome, journey, palette-actions, sidebar |
| New folder | New folder | folder-actions, folder-create, palette-actions, tree-edges |
| Folders | Folders | bottom-bar, drawer, folder-create, folder-delete, folder-rename-move, home-bento, home-welcome, journey, layout, move-note, sidebar, sidebar-collapse (+5) |
| No folders yet | No folders yet | tree-edges |
| Untitled | Untitled | cards, tree |
| Untitled folder | Untitled folder | folder-rename-move, palette-actions |
| Empty note | Empty note | cards |
| Nothing here yet | Nothing here yet | folder-actions |
| Write your first note | Write your first note | home-welcome |
| Recently edited | Recently edited | home-bento, home-pinned, home-welcome, morph |
| Pinned | Pinned | home-pinned, journey, properties-pin |
| Pin | Pin | card-menu, properties-pin |
| Unpin | Unpin | card-menu, home-pinned, properties-pin |
| Note actions | Note actions | card-menu, home-pinned, home-welcome |
| Note menu | Note menu | journey, move-note, note-delete, note-menu-search, properties-pin |
| Move to… | Move to… | card-menu, folder-rename-move, home-welcome, move-note |
| Choose a folder | Choose a folder | card-menu, folder-rename-move, home-welcome, journey, move-note |
| Folder: <name> (accessible name of the Folder property; "Folder" also names the search filter) | Folder: <name> | journey, move-note, properties-pin, search-page |
| Root | Root | card-menu, folder-rename-move, move-note |
| Tag | Tag | search-page |
| Tags | Tags | tag-page, tags-section |
| Any tag | Any tag | search-page |
| Add a tag | Add a tag | journey, tag-input |
| Add tag | Add tag | tag-input |
| Cancel | Cancel | card-menu, folder-delete, journey, note-delete |
| Delete | Delete | block-menu, card-menu, folder-delete, handle, journey, note-delete |
| Delete folder | Delete folder | folder-delete, journey |
| Delete “<title>”? This can't be undone. | Delete “<title>”? This can't be undone. | card-menu, folder-delete, journey, note-delete |
| Delete “<name>”? This deletes N folders and M notes inside it. This can't be undone. | same | folder-delete, journey |
| Rename | Rename | folder-rename-move |
| Folder name | Folder name | folder-create, folder-rename-move |
| <name> menu | <name> menu | folder-rename-move, folder-create, journey, folder-delete |
| Collapse <name> / Expand <name> | same | move-note, tree, tree-edges, folder-rename-move |
| Collapse sidebar / Expand sidebar | same | sidebar-collapse |
| Add cover / Change cover / Remove cover | same | folder-cover |
| Add icon / Change icon | same | note-icon |
| Choose an emoji | Choose an emoji | callout, note-icon |
| Search emoji | Search emoji | note-icon |
| Remove | Remove | note-icon |
| Title | Title | autosave, autosave-errors, bottom-bar-typing, discard, home-hero, journey, note-delete, note-page, note-switch, palette-actions |
| Saving… | Saving… | autosave |
| Saved | Saved | autosave, autosave-errors |
| Couldn't save — try again | Couldn't save — try again | autosave-errors |
| This note was deleted | This note was deleted | autosave-errors |
| That image is too large | That image is too large | folder-cover, image-block |
| That file isn't an image | That file isn't an image | folder-cover, image-block |
| Couldn't upload — try again | Couldn't upload — try again | image-block |
| Files can be up to 16 MB | Files can be up to 16 MB | file-card |
| Format | Format | bubble, bubble-link, journey |
| Bold / Italic / Strikethrough / Inline code | same | journey (Italic), bubble |
| Link | Link | bubble-link |
| Link URL | Link URL | bubble-link |
| Remove link | Remove link | bubble-link |
| Text colour | Text colour | bubble |
| Default | Default | bubble |
| clay (text colour option name; stone, ochre, moss, sea, plum alike) | clay | bubble |
| Blocks | Blocks | blocks-slash, callout, file-card, image-block, image-insert, journey, slash, slash-all, slash-phone, toggle |
| Text / Heading 1 / Heading 2 / Heading 3 / Bullet list / Numbered list / Task list / Quote / Code / Divider / Toggle / Callout / Table / Image / File | same, in this order | slash-all, slash, block-menu, callout, table, toggle, image-block, file-card |
| Block actions | Block actions | block-menu, callout, handle, journey, toggle |
| Block menu | Block menu | block-menu, handle, journey |
| Move up / Move down | same | block-menu, journey |
| Turn into | Turn into | block-menu, callout |
| Caption | Caption | image-block |
| Add row below / Add column right / Delete row / Delete column | same | table |
| <n> notes (e.g. "0 notes", "1 note", "3 notes") | same | home-bento, home-welcome, folder-body |
| <n> folder(s) · <m> note(s) | same | folder-header |
| +<n> (count of a note's tags beyond the first 3) | +<n> | cards |
| <n>h ago | <n>h ago | cards |

Notes on the table:
- `Neueste`, `Neu` and similar German words in `folder-body`, `tag-page`, `home-pinned` are note titles seeded by the specs, not UI. The folder-page sort label in the app is "Last edited"; no spec asserts it.
- `primitives`/`mockups` specs match design-showcase strings ("Open dialog", "Specimen drawer", "Delete this note?", "Duplicate", "Move", ...). They belong to the `/__mockups` showcase, which is excluded from this contract and will be replaced.
- English target is unchanged for all rows: 0 current strings are German.

### Strings in the app that no spec matches exactly (also English; designers keep or reword)
Home intro "Notes — Folders — Tags"; Home heading "Every note, in its place"; "Search by title, text or tag, or pick a folder or tag."; "Any folder"; "<n> result(s)"; "Notes · <n> result(s)"; "Last edited" (sort label); "Folder"/"Tag" labels on those pages; "Edited <date>, <time> · Created <date>"; "Write, or type / for blocks"; "Note body"; "Properties"; "Tag suggestions"; "Add tag"; "Paste or type a link"; "Apply link"; "Close colours"; "Change emoji"; "Language"; "Plain text"; "Uploading"; "Move to" (chooser title); "No emoji match “<q>”"; "Close" (Folders dialog); "Results" (palette list); "Esc" and "⌘K"/"↵" key hints; "just now", "<n>m ago", "<n>d ago", short dates.

---

## 9. Behavioural `data-*` allow-list

Rule: only hooks that express state or are a required integration point with no accessible equivalent. Tests should otherwise address elements by role, accessible name, label, placeholder or text.

| hook | signals | why no role/label covers it |
|---|---|---|
| `[data-save-state]` (values `idle`, `pending`, `saving`, `saved`, `error`) | the autosave state of the open note | the visible text "Saving…"/"Saved" is not enough: `idle` and `saved` read the same, and tests must wait for `pending`/`saving` to clear before asserting stored data; the status is intentionally not a live region |
| `.ProseMirror` (class, library-owned) | the editable document root, the TipTap/ProseMirror core | the core is kept; the e2e keyboard, paste, drop and selection tests need this exact element (it also carries the label "Note body") |
| `[data-editor-root]` | the container the editor core is mounted into | scopes the body editor apart from the other text inputs on the note page (title, tag input, link field, caption); there is no landmark role for it |
| `[data-type="details"]`, `[data-type="detailsContent"]`, `[data-type="taskList"]` | node-type markers rendered by the TipTap extensions (toggle, its content, task list) | generated by the editor core, not chrome; toggles have no role equivalent |
| `[data-color="<name>"]` | text colour mark value in rendered output (stone, clay, ochre, moss, sea, plum) | state of a mark in the document; no role or label exists for coloured text |
| `html[data-hydrated]` | the client app finished starting | tests must not interact before event handlers are attached; no accessible signal |
| `[data-editor-root] .hljs-*` classes (library-owned) | highlighted code tokens | produced by lowlight, proves highlighting works |
| `[data-card-glow]` | the decorative glow span on a note entry during the open/close morph | it is `aria-hidden` decoration, so it has no role or name; the morph test needs it to prove the glow plays and then clears (allow-listed by Rue on 2026-11-13) |
| `.prosemirror-dropcursor-block` (class, library-owned) | the drop cursor while a block is dragged | rendered by the ProseMirror dropcursor plugin, not chrome; the drag-handle tests need it to prove where a block will land (allow-listed by Rue on 2026-11-13) |

Not allow-listed (they mark today's layout regions or visual treatments; the redesign may drop or rename them; migrate the tests to roles): `data-bottom-bar` (use the touch navigation landmark by name and `aria-hidden`/inert for its hidden state), `data-sidebar`, `data-drawer`, `data-hero`, `data-welcome`, `data-pinned`, `data-recent`, `data-folders`, `data-subfolders`, `data-notes`, `data-note-grid`, `data-note-card`, `data-card-*` (except `data-card-glow`, allow-listed above), `data-folder-tile`, `data-tile-*`, `data-folder-counts`, `data-cover-header`, `data-note-page`, `data-note-header`, `data-note-title`, `data-note-column`, `data-properties`, `data-tag-chip`, `data-search-page`, `data-search-results`, `data-search-filters`, `data-tag-page`, `data-folder-page`, `data-morph`, `data-glass`, `data-accent`, `data-card`, `data-revealed`, `data-line`, `data-rail`, `data-strength`, `data-glass-sample`, `data-card-sample`, `data-slash-menu`, `data-bubble-menu`, `data-palette`, `data-result`, `data-action`, `data-recent-search`, `data-search-bar`, `data-screen`, `data-callout`, `data-kind`, `data-chip`, `data-cta`. Replacement guidance: a note entry = an `article` containing a heading link; its pinned state = element named "Pinned"; a folder entry = link; each Home/folder-page group = a region named by its heading ("Pinned", "Recently edited", "Folders", "Notes").

---

## 10. Route coverage check

| `src/routes` user-facing route | contract section |
|---|---|
| `(app)/+page.svelte` -> `/` | 4.1 |
| `(app)/folders/[id]/+page.svelte` -> `/folders/[id]` | 4.2 |
| `(app)/notes/[id]/+page.svelte` (+ `NotePage.svelte`) -> `/notes/[id]` | 4.3 (+ section 5) |
| `(app)/search/+page.svelte` -> `/search` | 4.4 (+ section 6) |
| `(app)/tags/[id]/+page.svelte` -> `/tags/[id]` | 4.5 |
| `(app)/+layout.svelte` (shell for all of the above) | section 7 |
| `+layout.svelte` (root: hydration flag, toast host) | section 7 |
| `api/*`, `files/[id]`, `images/[id]`, `healthz` (no UI) | listed in section 4 intro |
| `__test*`, `__mockups*` | excluded by design |
| no `+error.svelte` at any level | 404/error behaviour in section 4 intro; gate-1 decision 2 |

Coverage: 5 of 5 user-facing page routes (100%), plus the shared shell. Re-checked 2026-11-12 in review against `src/routes` (all `+page`, `+layout` and `+server` files outside `__test`/`__mockups`): no route missing.

---

## 11. Graph notes

Checked `graphify-out/graph.json` (1890 nodes): all five user-facing routes and the shell layout are present with their server loaders; no `.graphifyignore` exists and none was needed; no node points at a deleted source file (the only paths not on disk are npm packages and generated `$types`). `/__mockups` routes are in the graph (they exist on disk and are excluded here on purpose). Fixes made: none. This contract and `PRODUCT.md` were added to the graph with an `--update` rebuild.

---

## 12. Gate-1 decisions

Rue's answers to the open questions of the first version of this contract. Type: `contract-only` = no code change; `server/data` = code change before the redesign (OpenSpec change `gate-1-decisions`); `UI` = built in the redesign, with the server side already available where noted.

| # | question (short) | decision | type |
|---|---|---|---|
| 1 | Tag page whose last note loses the tag while open | Redirect Home (4.5). Done client-side from the page's delete action because the tag page's server load cannot tell a vanished tag from an unknown id. Confirmed by Rue on 2026-11-13 (gate 1 / task 2.5) | server/data |
| 2 | Unknown note/folder/tag id | Keep the framework's plain 404 (section 4); no not-found page | contract-only |
| 3 | Global new-note shortcut | None; Cmd/Ctrl+K stays the only global shortcut (section 7) | contract-only |
| 4 | Multi-line note titles | Allowed. Enter inserts a line break; Cmd/Ctrl+Enter or ArrowDown from the last line moves to the body (interpreted, 4.3; confirmed by Rue on 2026-11-13, gate 1 / task 2.5). Storage and search support is server/data; the editing behaviour is UI | server/data (storage, search) + UI (editing) |
| 5 | Failed save feedback | Keep both: actionable retry status and the once-per-run toast (4.3) | contract-only |
| 6 | Pinned notes order | Manually reorderable, new pins on top (entities, 4.1); the order is stored on the server and is the same on every device (confirmed by Rue on 2026-11-13, gate 1 / task 2.5). Stored order and reorder request are server/data; the reorder interaction is UI | server/data (order) + UI (interaction) |
| 7 | Folder note counts | Interpreted as "all notes in the folder including sub-folders" everywhere, folder count = all descendant folders (entities); confirmed by Rue on 2026-11-13 (gate 1 / task 2.5). Folder page summary changes; entries and delete dialog already did | server/data |
| 8 | Folder tree sort order | User-selectable, persisted on the server; modes `mixed` (default), `name`, `edited`, `created` (interpreted, section 7; confirmed by Rue on 2026-11-13, gate 1 / task 2.5). Stored preference is server/data; the picker is UI | server/data (preference) + UI (picker) |

Interpreted by the writer, not stated by Rue, and **confirmed by Rue on 2026-11-13 (gate 1 / task 2.5)**: the Enter and body-focus keys in 4 (chosen so touch and keyboard behave the same), the choice of descendants for 7 (three of four places already counted that way), the set of four sort modes and their server-side storage in 8 (the tree is server-rendered and the archive is used on two devices), and the client-side tag-page redirect in 1. Storing the pin order on the server, so it is the same on every device (6), was confirmed by Rue on 2026-11-13 as well.
