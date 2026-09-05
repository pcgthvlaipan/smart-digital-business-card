-- Run once in the Supabase SQL Editor for this project.
-- Adds a second email field and Thai-language variants of name/title/company/bio.
-- Existing rows are unaffected (new columns are nullable).

ALTER TABLE business_cards
  ADD COLUMN IF NOT EXISTS email2 text,
  ADD COLUMN IF NOT EXISTS full_name_th text,
  ADD COLUMN IF NOT EXISTS job_title_th text,
  ADD COLUMN IF NOT EXISTS company_th text,
  ADD COLUMN IF NOT EXISTS bio_th text;
