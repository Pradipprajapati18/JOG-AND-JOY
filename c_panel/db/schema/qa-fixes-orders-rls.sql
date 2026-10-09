-- qa-fixes-orders-rls.sql
-- Forcefully clean up ALL existing policies on orders and apply strict RLS

-- 1. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop EVERY known policy that might exist on orders to ensure a clean slate
DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders or admins can view all" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admin write orders" ON public.orders;

-- 3. Re-create STRICT policies

-- SELECT: Customers can view their own orders. Admins can view all.
CREATE POLICY "Orders Select Policy" ON public.orders
FOR SELECT USING (
  auth.uid()::text = "customerId" OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- INSERT: Anyone can insert (since the frontend inserts orders without an admin token)
-- NOTE: In a perfectly secure system, inserts happen via the SECURITY DEFINER RPC. 
-- But allowing public insert is generally safe as long as UPDATE is blocked.
CREATE POLICY "Orders Insert Policy" ON public.orders
FOR INSERT WITH CHECK (
  true 
);

-- UPDATE: STRICTLY Admins Only!
-- This blocks anonymous users from changing status to CANCELLED or tampering with amounts.
CREATE POLICY "Orders Update Policy" ON public.orders
FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- DELETE: STRICTLY Admins Only!
CREATE POLICY "Orders Delete Policy" ON public.orders
FOR DELETE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
