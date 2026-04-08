-- Make guided profile check-in saves idempotent and prevent duplicate child rows.
-- Run this in Neon after the existing saved-strategies and checkins schema upgrades.

BEGIN;

ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS client_session_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_client_session_key_unique
  ON checkins(client_session_key)
  WHERE client_session_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkin_strategies_checkin_strategy_unique
  ON checkin_strategies(checkin_id, strategy_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkin_tools_checkin_tool_unique
  ON checkin_tools(checkin_id, tool_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkin_body_clues_checkin_clue_unique
  ON checkin_body_clues(checkin_id, clue_key);

COMMIT;
