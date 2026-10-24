-- Add standard shipping and courier tracking columns to orders table
-- Execute in Supabase SQL Editor if top-level columns are desired

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS "trackingId" TEXT,
ADD COLUMN IF NOT EXISTS "carrier" TEXT,
ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
