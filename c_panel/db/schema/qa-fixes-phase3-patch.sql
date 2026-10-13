-- Patch for Infinite Recursion in RLS

-- 1. Create a security definer function to read the user's role safely without triggering RLS loops
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can mutate categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- 3. Re-create them using the safe function
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR get_my_role() = 'ADMIN');

CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (get_my_role() = 'ADMIN');
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (get_my_role() = 'ADMIN');
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (get_my_role() = 'ADMIN');

CREATE POLICY "Admins can mutate categories" ON public.categories FOR ALL USING (get_my_role() = 'ADMIN');

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid()::text = "customerId" OR get_my_role() = 'ADMIN');
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (get_my_role() = 'ADMIN');
