CREATE TABLE folders (
  id INTEGER PRIMARY KEY,
  parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX folders_parent ON folders(parent_id);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  icon TEXT,
  content TEXT NOT NULL DEFAULT '{"type":"doc","content":[{"type":"paragraph"}]}' CHECK (json_valid(content)),
  body_text TEXT NOT NULL DEFAULT '',
  pinned_at TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX notes_folder ON notes(folder_id, updated_at);
CREATE INDEX notes_updated ON notes(updated_at);
CREATE INDEX notes_pinned ON notes(pinned_at) WHERE pinned_at IS NOT NULL;

CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id));

ALTER TABLE images ADD COLUMN note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE;
ALTER TABLE images ADD COLUMN folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE;
CREATE INDEX images_note ON images(note_id);
CREATE UNIQUE INDEX images_folder_cover ON images(folder_id) WHERE folder_id IS NOT NULL;

CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, bytes BLOB NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX files_note ON files(note_id);

CREATE VIRTUAL TABLE notes_fts USING fts5(title, body, tags, tokenize = 'unicode61 remove_diacritics 2');
CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN DELETE FROM notes_fts WHERE rowid = old.id; END;
