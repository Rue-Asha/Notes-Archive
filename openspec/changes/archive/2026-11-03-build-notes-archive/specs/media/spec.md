## ADDED Requirements

### Requirement: Inline images
Pasting, dropping or choosing "/image" SHALL upload an image that the server converts to WebP with sharp and stores in SQLite, owned by the note; the block SHALL show it at column width with an optional caption; images over 16 MB or files that aren't images SHALL be refused with "That image is too large" or "That file isn't an image"; an upload in progress SHALL show a placeholder, and a failed upload SHALL remove it with the toast "Couldn't upload — try again".

#### Scenario: Paste an image into a note
- **WHEN** a PNG is pasted into an empty paragraph
- **THEN** an image block appears whose `img` loads from `/images/<id>`, and the stored content holds an `image` node with that id, width and height
- **proof:** e2e

#### Scenario: Drop an image into a note
- **WHEN** a JPEG is dropped onto the editor
- **THEN** an image block with the uploaded image appears at the drop position
- **proof:** e2e

#### Scenario: Insert an image with the slash command
- **WHEN** "/image" is chosen and a PNG is picked in the file chooser
- **THEN** an image block with the uploaded image replaces the slash text
- **proof:** e2e

#### Scenario: Image block shows at column width with a caption
- **WHEN** a 3000 px wide image is inserted on desktop and the caption "Blick vom Balkon" typed
- **THEN** the image's rendered width equals the note column's width, and after a reload the caption is shown
- **proof:** e2e

#### Scenario: Oversized or non-image upload is refused in the editor
- **WHEN** "/image" is used with a 17 MB file, then with a PDF
- **THEN** the toasts "That image is too large" and then "That file isn't an image" appear and no block or upload is created
- **proof:** e2e

#### Scenario: Upload shows a placeholder and a failure removes it
- **WHEN** an image is pasted while the upload is delayed, and a second paste's upload answers 500
- **THEN** a placeholder shows during the delay and becomes the image; the failed one's placeholder disappears and "Couldn't upload — try again" appears
- **proof:** e2e

#### Scenario: Deleting an image block releases the upload
- **WHEN** an image is pasted into a note, its block is deleted, and the autosave completes
- **THEN** a reload shows no image, and `/images/<id>` still answers until the grace period ends
- **proof:** e2e

#### Scenario: A cut image can be pasted into another note
- **WHEN** an image block is cut from note A, note B is opened (which saves A without the block), and the image is pasted into B and saved
- **THEN** after a reload B shows the image and it loads
- **proof:** e2e

#### Scenario: Uploaded image is stored as WebP
- **WHEN** a PNG, a JPEG and a 3000 px wide image are stored for a note
- **THEN** each row is `image/webp`, owned by the note, with the long side at most 2400 px
- **proof:** unit

#### Scenario: Server refuses oversized and non-image uploads
- **WHEN** `POST /api/notes/<id>/images` receives 17 MB, then a PDF
- **THEN** it answers 413 `{ error: 'too-large' }`, then 415 `{ error: 'not-image' }`, and stores nothing
- **proof:** unit

#### Scenario: Image is served with caching headers
- **WHEN** `/images/<id>` is requested for a stored image and for a missing id
- **THEN** the first answers 200 `image/webp` with an immutable cache header, the second 404
- **proof:** unit

#### Scenario: A removed image's id is never reused
- **WHEN** a folder cover or note image is removed and another image is stored afterwards
- **THEN** the new image gets a different id, so a cached `/images/<id>` can never show the old picture
- **proof:** unit

#### Scenario: A copied upload outlives its source note
- **WHEN** an image block or file card is copied from note A into note B, and then A removes the block, is deleted, or its folder is deleted
- **THEN** the upload stays and is owned by B, so B still shows the image or file
- **proof:** unit

### Requirement: Inline files
Dropping a non-image file or choosing "/file" SHALL upload it as-is (up to 16 MB, empty files allowed, the filename with umlauts and spaces preserved) and insert a file card with type icon, name and size; clicking the card SHALL open the file in a new tab (PDFs display in the browser), with a download fallback; larger files SHALL be refused with "Files can be up to 16 MB".

#### Scenario: Drop a file to insert a file card
- **WHEN** a PDF named "Mietvertrag Köln.pdf" is dropped onto the editor
- **THEN** a file card shows a PDF icon, "Mietvertrag Köln.pdf" and its size, and the stored content holds a `fileCard` node
- **proof:** e2e

#### Scenario: Insert a file with the slash command
- **WHEN** "/file" is chosen and a `.txt` file picked
- **THEN** a file card for that file replaces the slash text
- **proof:** e2e

#### Scenario: File card opens in a new tab
- **WHEN** a PDF's file card is clicked
- **THEN** a new tab opens `/files/<id>`, which answers `application/pdf` with `Content-Disposition: inline`
- **proof:** e2e

#### Scenario: Oversized file is refused in the editor
- **WHEN** a 17 MB file is dropped
- **THEN** the toast "Files can be up to 16 MB" appears and no card or upload is created
- **proof:** e2e

#### Scenario: Server stores files as-is with their names
- **WHEN** an empty file, a 1 KB file named "Übung 1 (final).txt" and a 17 MB file are posted
- **THEN** the first two are stored byte for byte with their names, the third answers 413 `{ error: 'file-too-large' }`
- **proof:** unit

#### Scenario: Files are served safely with a download fallback
- **WHEN** `/files/<id>` is requested for a PDF, for an HTML file and with `?download=1`
- **THEN** the PDF is inline, the HTML is an attachment, `?download=1` is always an attachment, every response carries `X-Content-Type-Options: nosniff`, `Content-Security-Policy: sandbox` and `filename*=UTF-8''` with the encoded name
- **proof:** unit
