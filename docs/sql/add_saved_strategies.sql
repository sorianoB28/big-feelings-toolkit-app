-- Add persistent saved coping strategies per profile.
-- This migration is additive only and does not drop or rename existing tables.

BEGIN;

-- Ensure UUID helpers are available for the new table default.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a profile-level saved strategies table so each profile can keep
-- reusable coping ideas outside of individual check-in sessions.
CREATE TABLE IF NOT EXISTS profile_saved_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strategy_key text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicate saved strategies for the same profile.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profile_saved_strategies_profile_id_strategy_key_key'
  ) THEN
    ALTER TABLE profile_saved_strategies
      ADD CONSTRAINT profile_saved_strategies_profile_id_strategy_key_key
      UNIQUE (profile_id, strategy_key);
  END IF;
END $$;

-- Support common profile history and saved-strategy lookup patterns.
CREATE INDEX IF NOT EXISTS idx_profile_saved_strategies_profile_id
  ON profile_saved_strategies(profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_saved_strategies_created_at
  ON profile_saved_strategies(created_at);

COMMIT;
