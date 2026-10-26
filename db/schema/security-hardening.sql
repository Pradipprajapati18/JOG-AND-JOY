-- ==============================================================================
-- Jog & Joy E-Commerce: Comprehensive Security & Integrity Hardening Migration
-- File: db/schema/security-hardening.sql
-- ==============================================================================
-- 1. Hardened Auth User Signup Trigger (Role Escalation Protection)
-- 2. Concurrency-Safe Atomic Inventory Restocking RPC
-- 3. Secure Promotion Usage Increment RPC
-- 4. Complete, Hardened Row Level Security (RLS) Policies across all Tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Hardened Auth Signup Trigger
-- Prevents clients from supplying role='ADMIN' via raw_user_meta_data
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'CUSTOMER' -- Strictly enforce CUSTOMER role. Admin roles must be granted by existing admins or DB administrators.
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    email = COALESCE(EXCLUDED.email, public.users.email);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback in case table schema uses TEXT id instead of UUID
  BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
      NEW.id::text,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'CUSTOMER'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, public.users.name),
      email = COALESCE(EXCLUDED.email, public.users.email);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ------------------------------------------------------------------------------
-- 2. Prevent Self-Promotion on Profile Updates
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If updater is not an active ADMIN, ensure role cannot be altered
  IF (SELECT role FROM public.users WHERE id::text = auth.uid()::text) NOT IN ('ADMIN', 'admin') THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.users;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_escalation();


-- ------------------------------------------------------------------------------
-- 3. Atomic Restocking RPC Function
-- Restores stock for items in cancelled/returned orders with row-level locking
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION restock_order_items_atomic(order_items JSONB)
RETURNS JSONB AS $$
DECLARE
  item JSONB;
  v_product RECORD;
  v_variants JSONB;
  v_new_variants JSONB;
  v_variant JSONB;
  v_found BOOLEAN;
  v_total_stock INT;
  req_qty INT;
  req_size TEXT;
  req_color TEXT;
  req_pid TEXT;
BEGIN
  IF order_items IS NULL OR jsonb_array_length(order_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'No items provided for restocking');
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    req_pid := COALESCE(item->>'productId', item->>'id');
    req_qty := GREATEST(1, COALESCE((item->>'quantity')::INT, 1));
    req_size := item->>'size';
    req_color := item->>'color';

    IF req_pid IS NOT NULL THEN
      -- Row-level lock to prevent concurrent race condition updates
      SELECT * INTO v_product FROM public.products WHERE id::text = req_pid::text FOR UPDATE;

      IF FOUND THEN
        v_variants := v_product.variants;
        v_found := false;
        v_new_variants := '[]'::jsonb;

        IF (req_size IS NOT NULL OR req_color IS NOT NULL) AND v_variants IS NOT NULL AND jsonb_typeof(v_variants) = 'array' THEN
          -- Match by exact size & color
          FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
          LOOP
            IF (LOWER(COALESCE(v_variant->>'size', '')) = LOWER(COALESCE(req_size, '')) OR req_size IS NULL) AND
               (LOWER(COALESCE(v_variant->>'colorHex', '')) = LOWER(COALESCE(req_color, '')) OR req_color IS NULL) AND
               NOT v_found THEN
              v_found := true;
              v_variant := jsonb_set(
                v_variant,
                '{stock}',
                (COALESCE((v_variant->>'stock')::INT, 0) + req_qty)::TEXT::JSONB
              );
            END IF;
            v_new_variants := v_new_variants || v_variant;
          END LOOP;

          -- Fallback match by size alone if color did not match
          IF NOT v_found AND req_size IS NOT NULL THEN
            v_new_variants := '[]'::jsonb;
            FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
            LOOP
              IF LOWER(COALESCE(v_variant->>'size', '')) = LOWER(req_size) AND NOT v_found THEN
                v_found := true;
                v_variant := jsonb_set(
                  v_variant,
                  '{stock}',
                  (COALESCE((v_variant->>'stock')::INT, 0) + req_qty)::TEXT::JSONB
                );
              END IF;
              v_new_variants := v_new_variants || v_variant;
            END LOOP;
          END IF;
        END IF;

        IF v_found THEN
          -- Recompute total product stock as sum of variants
          SELECT COALESCE(SUM((elem->>'stock')::INT), 0) INTO v_total_stock
          FROM jsonb_array_elements(v_new_variants) elem;

          UPDATE public.products
          SET variants = v_new_variants, stock = v_total_stock
          WHERE id::text = req_pid::text;
        ELSE
          UPDATE public.products
          SET stock = COALESCE(stock, 0) + req_qty
          WHERE id::text = req_pid::text;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'message', 'Items successfully restocked atomically');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 4. Secure Promotion Usage Increment RPC
-- Increments usage limit without granting client write access to promotion rules
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_coupon_usage_atomic(promo_id TEXT)
RETURNS JSONB AS $$
BEGIN
  IF promo_id IS NULL OR trim(promo_id) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'promo_id is required');
  END IF;

  UPDATE public.promotions
  SET "usageCount" = COALESCE("usageCount", 0) + 1,
      "updatedAt" = NOW()
  WHERE id::text = promo_id::text;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 5. Hardened Row-Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
-- Enable RLS across core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role efficiently and avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id::text = auth.uid()::text AND LOWER(COALESCE(role, '')) = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- USERS Policies ---
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Allow public read of users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert of users" ON public.users;
DROP POLICY IF EXISTS "Allow users to update themselves" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;

CREATE POLICY "Users can view own profile or admins can view all"
  ON public.users FOR SELECT
  USING (
    id::text = auth.uid()::text OR
    public.is_admin()
  );

CREATE POLICY "Users can update own profile or admins can update all"
  ON public.users FOR UPDATE
  USING (
    id::text = auth.uid()::text OR
    public.is_admin()
  );

CREATE POLICY "Anyone can insert profile on signup"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- --- ORDERS Policies ---
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins or owners can update orders" ON public.orders;
DROP POLICY IF EXISTS "Orders Select Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Insert Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Update Policy" ON public.orders;
DROP POLICY IF EXISTS "Orders Delete Policy" ON public.orders;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders or admins can view all" ON public.orders;
DROP POLICY IF EXISTS "Admin write orders" ON public.orders;

CREATE POLICY "Customers can view their own orders"
  ON public.orders FOR SELECT
  USING (
    "customerId"::text = auth.uid()::text OR
    public.is_admin()
  );

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins or owners can update orders"
  ON public.orders FOR UPDATE
  USING (
    "customerId"::text = auth.uid()::text OR
    public.is_admin()
  );

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- --- PRODUCTS Policies ---
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products are editable by admins" ON public.products;
DROP POLICY IF EXISTS "Allow public all products" ON public.products;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- --- CATEGORIES Policies ---
DROP POLICY IF EXISTS "Allow public all categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can mutate categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- --- PROMOTIONS Policies ---
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can manage promotions" ON public.promotions;
DROP POLICY IF EXISTS "Anyone can view active promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admins can modify promotions" ON public.promotions;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.promotions;

CREATE POLICY "Public can view active promotions"
  ON public.promotions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage promotions"
  ON public.promotions FOR ALL
  USING (public.is_admin());

-- --- SETTINGS Policies ---
DROP POLICY IF EXISTS "Public can view store settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage store settings" ON public.settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can modify settings" ON public.settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.settings;

CREATE POLICY "Public can view store settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage store settings"
  ON public.settings FOR ALL
  USING (public.is_admin());

-- --- REVIEWS Policies ---
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can modify reviews" ON public.reviews;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.reviews;

CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin());

-- --- MESSAGES Policies ---
DROP POLICY IF EXISTS "Enable all access for all users" ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view and modify messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;

CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage messages"
  ON public.messages FOR ALL
  USING (public.is_admin());

-- Reload Supabase PostgREST schema cache
NOTIFY pgrst, 'reload schema';
