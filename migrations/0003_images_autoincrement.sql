CREATE TABLE images_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, bytes BLOB NOT NULL, created_at TEXT NOT NULL,
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE);
INSERT INTO images_new (id, mime, width, height, bytes, created_at, note_id, folder_id)
  SELECT id, mime, width, height, bytes, created_at, note_id, folder_id FROM images;
DROP TABLE images;
ALTER TABLE images_new RENAME TO images;
CREATE INDEX images_note ON images(note_id);
CREATE UNIQUE INDEX images_folder_cover ON images(folder_id) WHERE folder_id IS NOT NULL;
