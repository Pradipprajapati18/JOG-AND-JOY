-- Fix Infinite Recursion in RLS

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON users;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Users can view own orders or admins can view all" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

DROP POLICY IF EXISTS "Products are editable by admins" ON products;
DROP POLICY IF EXISTS "Admins can modify promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can modify settings" ON settings;
DROP POLICY IF EXISTS "Admins can view and modify messages" ON messages;
DROP POLICY IF EXISTS "Admins can modify reviews" ON reviews;

-- 2. Create a secure function to check admin status bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. Re-create policies using the secure function

-- PRODUCTS
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING ( public.is_admin() );

-- USERS
CREATE POLICY "Users can view own profile or admins can view all" ON users FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);
CREATE POLICY "Users can update own profile or admins can update all" ON users FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK ( public.is_admin() );
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING ( public.is_admin() );

-- ORDERS
CREATE POLICY "Users can view own orders or admins can view all" ON orders FOR SELECT USING (
  auth.uid()::text = "customerId" OR public.is_admin()
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING ( public.is_admin() );
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING ( public.is_admin() );

-- PROMOTIONS
CREATE POLICY "Admins can modify promotions" ON promotions FOR ALL USING ( public.is_admin() );

-- SETTINGS
CREATE POLICY "Admins can modify settings" ON settings FOR ALL USING ( public.is_admin() );

-- MESSAGES
CREATE POLICY "Admins can view and modify messages" ON messages FOR ALL USING ( public.is_admin() );

-- REVIEWS
CREATE POLICY "Admins can modify reviews" ON reviews FOR ALL USING ( public.is_admin() );
