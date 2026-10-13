-- Add missing columns to products table that the React frontend expects
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "isNewArrival" BOOLEAN DEFAULT false;

-- Reload the schema cache so Supabase recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
