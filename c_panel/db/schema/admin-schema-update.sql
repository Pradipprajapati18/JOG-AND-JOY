-- Update Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS "groupId" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "originalPrice" NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Update Orders Table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS "promotionCodeApplied" TEXT;

-- Update Settings Table (if missing)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS "storeName" TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS "orderPrefix" TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS "currency" TEXT;

-- Create Promotions Table (or alter if exists)
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY
);

ALTER TABLE promotions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "discountType" TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS value NUMERIC;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "targetScope" TEXT DEFAULT 'entire_order';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "usageLimit" INTEGER;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "usageCount" INTEGER DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "minOrderValue" NUMERIC DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Note: Ensure RLS is enabled and accessible for the admin UI
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON promotions;
CREATE POLICY "Enable all access for all users" ON promotions FOR ALL USING (true);

-- Update Users Table for Cart Sync & Addresses
ALTER TABLE users ADD COLUMN IF NOT EXISTS cart JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB;

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  "postalCode" TEXT,
  "totalOrders" INTEGER DEFAULT 0,
  "totalSpent" NUMERIC DEFAULT 0,
  "lastOrderDate" TIMESTAMP WITH TIME ZONE,
  "isGuest" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Ensure RLS is enabled and accessible for the admin UI
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON customers;
CREATE POLICY "Enable all access for all users" ON customers FOR ALL USING (true);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT,
  slug TEXT,
  section TEXT,
  icon TEXT,
  status TEXT DEFAULT 'Active',
  "order" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON categories;
CREATE POLICY "Enable all access for all users" ON categories FOR ALL USING (true);
