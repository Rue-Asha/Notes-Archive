ALTER TABLE notes ADD COLUMN pin_order INTEGER;
UPDATE notes SET pin_order = ranked.rank
FROM (
  SELECT id, row_number() OVER (ORDER BY pinned_at DESC, id DESC) AS rank
  FROM notes
  WHERE pinned_at IS NOT NULL
) AS ranked
WHERE notes.id = ranked.id;
CREATE INDEX notes_pin_order ON notes(pin_order) WHERE pin_order IS NOT NULL;
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
