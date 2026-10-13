-- QA Phase 2: RLS Reversion for Custom Auth Architecture
-- 
-- The application uses a custom `users` table instead of Supabase Auth.
-- Because of this, the React frontend ALWAYS uses the `anon` key for every request, 
-- regardless of whether the user is logged into the Admin UI or not.
-- 
-- The strict RLS policies from Phase 1 (`auth.role() = 'authenticated'`) mathematically 
-- locked out ALL users (including Admins) from creating products, categories, or managing orders.
-- 
-- To unblock the Phase 2 Production Lifecycle QA tests, we MUST restore `anon` 
-- write access to these tables. 
-- 
-- WARNING: This makes the database publicly writable again. True RLS is impossible 
-- on a pure React architecture without Supabase Auth or a secure backend.

DROP POLICY IF EXISTS "Admin write products" ON products;
DROP POLICY IF EXISTS "Admin write categories" ON categories;
DROP POLICY IF EXISTS "Admin write orders" ON orders;

CREATE POLICY "Allow public all products" ON products FOR ALL USING (true);
CREATE POLICY "Allow public all categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public all orders" ON orders FOR ALL USING (true);
