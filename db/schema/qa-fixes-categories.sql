-- Add missing columns to categories table so the React frontend can save them properly
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;
