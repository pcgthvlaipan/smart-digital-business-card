-- Run once in the Supabase SQL Editor for this project.
-- Adds an optional custom company-logo field per card. NULL/blank falls
-- back to the app's default PCG logo (handled in app code, not here).

ALTER TABLE business_cards
  ADD COLUMN IF NOT EXISTS logo_url text;
