-- Add count column to todos (default 1, minimum 1)
ALTER TABLE todos ADD COLUMN count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE todos ADD CONSTRAINT todos_count_min CHECK (count >= 1);
