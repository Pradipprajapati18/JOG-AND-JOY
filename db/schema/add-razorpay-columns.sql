-- Step 2: Add Razorpay tracking columns to orders table
-- Execute this in the Supabase SQL editor if not already executed

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT,
ADD COLUMN IF NOT EXISTS "razorpaySignature" TEXT;

-- Reload PostgREST schema cache to ensure new columns are visible immediately
NOTIFY pgrst, 'reload schema';
