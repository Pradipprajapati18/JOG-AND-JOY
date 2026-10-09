-- Run this in your Supabase SQL Editor to bypass the rate limit and forcefully create an admin account.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  -- This is the bcrypt hash for the password: 'securepassword123'
  test_password_hash TEXT := '$2a$10$T8Z/p/i/8D7Vv4eA5cOhb.K62sD4U7Zp/71.6T8.Y3pZp86G0s7W2'; 
BEGIN
  -- 1. Insert into Supabase Auth
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, created_at, updated_at, 
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'superadmin@jogandjoy.com', test_password_hash,
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}', '{"name":"Super Admin"}', false
  );

  -- 2. Insert into public.users
  INSERT INTO public.users (id, name, email, role)
  VALUES (new_user_id, 'Super Admin', 'superadmin@jogandjoy.com', 'ADMIN')
  ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';

  -- 3. Create a fake identity (needed for some GoTrue logic)
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, new_user_id::text, 
    json_build_object('sub', new_user_id, 'email', 'superadmin@jogandjoy.com'), 
    'email', NOW(), NOW(), NOW()
  );

END $$;
