-- Run once in the Supabase SQL Editor for this project.
-- Enforces "one business card per user" at the database level, so a race
-- condition (double-submit, two tabs, a retried request) can never create
-- a second business_cards row for the same user_id again.
-- Safe to run: as of this writing there are 0 duplicate user_id rows and
-- 0 NULL user_id rows in business_cards.

ALTER TABLE business_cards
  ADD CONSTRAINT business_cards_user_id_unique UNIQUE (user_id);
