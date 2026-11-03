ALTER TABLE images ADD COLUMN orphaned_at TEXT;
ALTER TABLE files ADD COLUMN orphaned_at TEXT;
CREATE INDEX images_orphaned ON images(orphaned_at) WHERE orphaned_at IS NOT NULL;
CREATE INDEX files_orphaned ON files(orphaned_at) WHERE orphaned_at IS NOT NULL;
