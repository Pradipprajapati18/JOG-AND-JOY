-- Jog & Joy Supabase SQL Migration Script
-- Copy and paste this into the Supabase SQL Editor and click 'Run'.

-- 0. Create Users Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'CUSTOMER',
  phone TEXT,
  address TEXT,
  wishlist JSONB DEFAULT '[]'::jsonb,
  cart JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "categoryId" TEXT,
  "basePrice" NUMERIC NOT NULL,
  "compareAtPrice" NUMERIC,
  "costPerItem" NUMERIC,
  status TEXT DEFAULT 'draft',
  vendor TEXT,
  "productType" TEXT,
  variants JSONB,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "trackQuantity" BOOLEAN DEFAULT true,
  "allowBackorder" BOOLEAN DEFAULT false,
  "taxStatus" TEXT DEFAULT 'taxable',
  weight NUMERIC,
  dimensions JSONB,
  image TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "customerId" TEXT,
  "customerName" TEXT,
  "customerEmail" TEXT,
  "customerPhone" TEXT,
  "shippingAddress" JSONB,
  items JSONB,
  subtotal NUMERIC,
  "shippingCost" NUMERIC,
  "discountAmount" NUMERIC,
  tax NUMERIC,
  total NUMERIC,
  "paymentStatus" TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'PROCESSING',
  "fulfillmentStatus" TEXT DEFAULT 'unfulfilled',
  "statusHistory" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  "customerName" TEXT,
  "customerEmail" TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  "productId" TEXT,
  name TEXT,
  rating INTEGER,
  comment TEXT,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  "storeName" TEXT,
  "contactEmail" TEXT,
  currency TEXT,
  "taxRatePercent" NUMERIC,
  "defaultLowStockThreshold" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT,
  value NUMERIC,
  status TEXT DEFAULT 'active',
  "startDate" TIMESTAMP WITH TIME ZONE,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Set up RLS (Row Level Security) - Optional but recommended for production
-- For development, we will allow all access. You can secure these later.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON users;
CREATE POLICY "Enable all access for all users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON products;
CREATE POLICY "Enable all access for all users" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON orders;
CREATE POLICY "Enable all access for all users" ON orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON messages;
CREATE POLICY "Enable all access for all users" ON messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON reviews;
CREATE POLICY "Enable all access for all users" ON reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON settings;
CREATE POLICY "Enable all access for all users" ON settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON promotions;
CREATE POLICY "Enable all access for all users" ON promotions FOR ALL USING (true);
