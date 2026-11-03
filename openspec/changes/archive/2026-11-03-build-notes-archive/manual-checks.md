# Gate 2 manual checks (from U22, task 22.4)

Setup: `npm run dev` on the laptop (http://localhost:5173); `npm run dev -- --host` for the phone, then open
http://<laptop-ip>:5173 on the same wifi. For the mockups run `NOTES_ARCHIVE_TEST=1 npm run dev` and open
/__mockups/home, /folder, /note, /search and /drawer.

## 1. Built screens match the approved mockups
- Open each mockup in one tab and the built screen in another: Home (/__mockups/home), a folder with a cover
  (/__mockups/folder), a note with all blocks (/__mockups/note), the palette via Cmd/Ctrl+K (/__mockups/search),
  the phone Folders drawer (/__mockups/drawer).
- Check layout, type, glass and accent (bronze, clear glass, glass cards) at 390, 1280 and 1600 wide.
- Known deliberate differences: no "Edited today" tile, no "148 notes in 6 folders" lede, no "All notes" /
  "All folders" links, no "01 / 06" folder counters.

## 2. Motion feels smooth on real devices
- On the phone, tap a note card and go back: the card morphs into the note page and back.
- Open and close the drawer, the palette, the card menu and a dialog.
- Type in a note: nothing animates while typing.
- Turn on reduced motion in the OS: only short fades remain.

## 3. Editor menus work on real phones
- Type "/" in a note: the slash menu stays visible above the keyboard and choosing an item inserts it.
- Long-press to select a word: the bubble toolbar sits below the selection and doesn't hide the native selection
  menu. Test Bold, Link and Text colour.
- Tap the drag handle beside the cursor block: Move up, Move down, Turn into and Delete work.
- Open the table menu and scroll a wide table sideways inside its block.

## 4. Bottom bar on a real phone keyboard
- On Home the bottom bar is visible.
- Open a note and tap into the body: the keyboard opens and the bar hides (inert by spec).
- Tap outside the editor or close the keyboard: the bar returns and every button works.
- Tap into the title: the bar stays; only editor focus hides it.

## 5. Previewing a real site
- Paste a real https URL alone on an empty line (e.g. https://en.wikipedia.org/wiki/Notes): a preview card with
  title, description and image appears.
- Paste a URL inside a sentence: it stays an inline link.
- Undo right after the paste: the card turns back into a plain link.
- Paste a private address such as http://192.168.1.1: no card, only a link or plain text.
- Reload: the preview image comes from your server (/images/...), not hotlinked.

## Open decision for Rue
- Palette on phone while the editor has focus: no touch way to open it (the bottom bar is inert, the note header
  has no Search). Cmd/Ctrl+K works on a hardware keyboard when no text is selected. Options: a Search item in the
  note header menu, or an active Search cell in the bar while the editor has focus.
