-- QA Fixes Phase 1: Database Integrity & Security

-- 1. Create the missing categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Fix RLS Policies for All Tables
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Enable all access for all users" ON products;
DROP POLICY IF EXISTS "Enable all access for all users" ON orders;
DROP POLICY IF EXISTS "Enable all access for all users" ON categories;
DROP POLICY IF EXISTS "Enable all access for all users" ON users;
DROP POLICY IF EXISTS "Enable all access for all users" ON messages;
DROP POLICY IF EXISTS "Enable all access for all users" ON reviews;
DROP POLICY IF EXISTS "Enable all access for all users" ON settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON promotions;

-- Products: Anyone can read, but only authenticated users (admin) can write
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Categories: Anyone can read, but only authenticated users (admin) can write
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Anyone can insert (guests), but only admin can read all or update
-- (Assuming guests can't read all orders, they would need their email or ID)
CREATE POLICY "Guests can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- (Other tables similarly locked down)
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Admin write promotions" ON promotions FOR ALL USING (auth.role() = 'authenticated');
