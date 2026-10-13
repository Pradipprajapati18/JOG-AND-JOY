-- Ensure the categories table exists
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL
);

-- Add ALL possible columns that the React frontend might try to save
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INT DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- Reload the schema cache so Supabase recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
