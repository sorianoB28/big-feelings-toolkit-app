-- Upgrade the guided check-in schema with richer session data.
-- This migration is additive only and does not drop or rename existing tables.

BEGIN;

-- Ensure UUID helpers are available for new related tables.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Expand checkins with richer session context for reporting and analytics.
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS intensity integer,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Store tools used during a completed check-in in a separate table.
CREATE TABLE IF NOT EXISTS checkin_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id uuid NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  tool_key text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Store body clue selections in a separate table for richer analysis.
CREATE TABLE IF NOT EXISTS checkin_body_clues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id uuid NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  clue_key text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes to support profile history lookups and related child-table queries.
CREATE INDEX IF NOT EXISTS idx_checkins_profile_id ON checkins(profile_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_checkin_tools_checkin_id ON checkin_tools(checkin_id);
CREATE INDEX IF NOT EXISTS idx_checkin_body_clues_checkin_id ON checkin_body_clues(checkin_id);

COMMIT;
