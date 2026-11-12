# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person, the owner of a private homelab, who keeps all her notes in one self-hosted archive. She uses it every day on a desktop browser (keyboard and mouse, long writing, organising) and on her phone (touch, soft keyboard, quick capture). There are no other users, no sharing and no collaboration. Inferred from `README.md` and `openspec/specs/`; not interviewed.

## Product Purpose

Notes Archive keeps notes in nested folders with tags, writes them in a block editor with automatic saving, and finds them again through full-text search. Success is capture without friction (a new note is one action away from anywhere and typing starts at once), retrieval in seconds (by search, folder, tag, recency or pin) and trust that nothing typed is lost or destroyed by accident. The archive is hers alone, so it has no sign-in flow, no onboarding beyond an empty-state prompt and no social features.

## Positioning

A single-user archive that is fully self-hosted: notes, uploaded images and files and link-preview images all live in one SQLite database on her own server, nothing is hotlinked from the web, and search works offline from that database. It pairs a rich block editor with plain structure (folders, tags, pins) and instant search, rather than a feed or a graph of links.

## Operating Context

- Runs as a Node (SvelteKit) server on the homelab, reached in a browser at a private address; the data is one SQLite file.
- Two postures, pointer + keyboard and touch + soft keyboard, each with persistent navigation to Home, Search, New note, the folder tree and the tag list; the form each posture takes is open to redesign. The command palette (Cmd/Ctrl+K, or the Search entry by touch) is the fast path to any note from anywhere; on touch the back gesture closes it.
- Notes are edited in a ProseMirror-based editor that saves as you type (600 ms debounce) and on blur or leave; failure keeps local text and retries on the next edit.
- Two devices may edit the same note; the last write wins.
- Writing happens in both German and English content; all interface copy is English.

## Capabilities and Constraints

- Entities: notes (title that may span several lines, emoji icon, rich content, tags, pin with a manual pin order, timestamps), folders (unlimited nesting, optional cover photo), tags (unique ignoring case and diacritics, exist only while used), uploads (images converted to WebP, files stored as-is, both up to 16 MB).
- Pages: Home (search entry point, pinned notes in her own order, recently edited, top-level folders, welcome state when empty), folder page (breadcrumb, header with counts of everything inside the folder including sub-folders, sub-folders, notes by last edited), note page (icon, title, folder / tags / pin properties, editor, save status), search page (query plus folder and tag filters in the URL), tag page (tagged notes; deleting its last note goes Home), a folder tree whose sort order she chooses and the archive remembers.
- Editing: headings 1 to 3, lists, task lists, quotes, code blocks with syntax highlighting and language choice, dividers, toggles, callouts, tables, images with captions, file cards, link-preview cards; marks bold, italic, strikethrough, inline code, link and six named text colours; slash menu for all blocks; Markdown typing shortcuts; block move and turn-into menu; drag on desktop, menu-based reordering on touch.
- Search: SQLite FTS5 over title, body and tags; prefix, case-insensitive, diacritic-insensitive, "ß" equals "ss"; title matches rank first; highlighted snippets; no query operators, never errors.
- Destructive actions (delete note, delete folder with all contents) always ask first and say what will go; an empty new note is discarded silently when abandoned.
- Link previews are fetched server-side from public http(s) addresses only; failures still produce a card with domain and URL.
- Not present and not planned: accounts, sharing, comments, export, offline mode, notifications, a trash or undo for deletion (removed uploads stay for one hour only).
- Preferences live on the server, not in the browser: the pin order and the tree sort follow her across devices. Only the sidebar collapsed state stays per browser.
- Counts of notes in a folder always include its sub-folders. Unknown ids show the plain 404; New note has no global shortcut (Cmd/Ctrl+K is the only one); a failed save shows both the retry status and a toast.
- Terminology to keep: note, folder, tag, pin, "Untitled", "Recently edited", "command palette".
- Full behaviour, states, copy and test hooks: `docs/functional-contract.md`.

## Brand Commitments

Name: Notes Archive. The interface language is English (including all current copy). No logo or wordmark commitment is recorded beyond the name; any visual identity comes from the shared design system.

## Evidence on Hand

- `README.md`, `openspec/specs/*` (behavioural requirements with scenarios) and `e2e/*` (Playwright journeys on phone and desktop viewports) are the evidence for behaviour.
- `docs/functional-contract.md` is the functional contract derived from them.
- No user research, analytics, testimonials or screenshots exist for this product; none are to be invented.

## Product Principles

1. Capture first: starting a note takes one action from anywhere, and writing never waits on a save step.
2. Find before browse: search is reachable from every screen by keyboard and by touch, and structure (folders, tags, pins, recency) is the second way in.
3. Never lose text: saves are automatic, their state is visible but quiet, failures keep the content, and destructive actions confirm.
4. One archive, two postures: desktop and phone offer the same capabilities; touch gets menus where desktop gets hover and drag.
5. Content owns the page: the interface stays out of the way of the note being read or written.

## Accessibility & Inclusion

Keyboard operation for every action (menus, dialogs, pickers, tree, palette), named landmarks and controls, focus returned after overlays close, reduced-motion preference respected, text that wraps instead of overflowing (long titles, tag names, unbroken words), no horizontal page scroll at any width. No formal standard (such as WCAG level) has been set by the owner; this is undecided.
