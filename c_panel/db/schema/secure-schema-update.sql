-- Secure Backend and RLS Implementation Script
-- Run this in the Supabase SQL Editor

-- 1. Drop existing insecure policies
DROP POLICY IF EXISTS "Enable all access for all users" ON users;
DROP POLICY IF EXISTS "Enable all access for all users" ON products;
DROP POLICY IF EXISTS "Enable all access for all users" ON orders;
DROP POLICY IF EXISTS "Enable all access for all users" ON messages;
DROP POLICY IF EXISTS "Enable all access for all users" ON reviews;
DROP POLICY IF EXISTS "Enable all access for all users" ON settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON promotions;

-- 2. Create trigger to sync auth.users to public.users
-- This ensures when a user signs up via Supabase Auth, they get a profile in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER')
  )
  ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Strict RLS Policies

-- PRODUCTS
-- Anyone can read products. Only ADMINs can modify.
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- USERS
-- Users can read and update their own profile. Admins can do anything.
CREATE POLICY "Users can view own profile or admins can view all" ON users FOR SELECT USING (
  auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Users can update own profile or admins can update all" ON users FOR UPDATE USING (
  auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- ORDERS
-- Anyone (including guests) can insert orders. Users can view their own orders. Admins can view all.
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own orders or admins can view all" ON orders FOR SELECT USING (
  auth.uid()::text = "customerId" OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- PROMOTIONS
-- Anyone can view active promotions. Admins can modify.
CREATE POLICY "Anyone can view active promotions" ON promotions FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can modify promotions" ON promotions FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- SETTINGS
-- Anyone can view settings. Admins can modify.
CREATE POLICY "Anyone can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify settings" ON settings FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- MESSAGES
-- Anyone can insert messages. Admins can view and modify.
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and modify messages" ON messages FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);

-- REVIEWS
-- Anyone can view reviews. Anyone can insert. Admins can modify.
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can modify reviews" ON reviews FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN'
);
