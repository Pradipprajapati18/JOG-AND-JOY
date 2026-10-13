-- Add missing columns to orders table that the React frontend expects
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "fulfillmentStatus" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "promotionCodeApplied" TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "shippingCost" NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "statusHistory" JSONB DEFAULT '[]'::jsonb;

-- Backfill orderNumber for any existing mock orders where it is missing
UPDATE public.orders SET "orderNumber" = id WHERE "orderNumber" IS NULL;

-- Reload the schema cache so Supabase recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
