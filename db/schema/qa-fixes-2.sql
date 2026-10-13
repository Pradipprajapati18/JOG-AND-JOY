-- QA Fixes Phase 1 Part 2: Fix Auth RLS & Seed Admin User

-- 1. Restore SELECT access to the users table so the frontend AuthContext can verify logins.
-- (Note: Storing plain text passwords and querying them from the client is highly insecure. 
-- For a production app, Supabase Auth should be used. For now, this restores functionality.)
CREATE POLICY "Allow public read of users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert of users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update themselves" ON users FOR UPDATE USING (id = auth.uid());

-- 2. Seed an Admin User so we can test the Admin Dashboard
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@jogandjoy.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;
