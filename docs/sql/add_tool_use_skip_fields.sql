-- Add skip outcome fields for tool uses so signed-in check-in summaries
-- can report whether a tool was skipped and roughly how far the session got.

BEGIN;

ALTER TABLE tool_uses
  ADD COLUMN IF NOT EXISTS was_skipped boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS progress_percent integer;

COMMIT;
