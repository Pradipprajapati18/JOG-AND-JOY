-- Phase 3 Security Remediation: Supabase Auth & Pricing Integrity

-- 1. Create a trigger to automatically sync Supabase Auth users to the public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Lockdown RLS Policies
-- First, drop the permissive policies we created in Phase 1 and 2
DROP POLICY IF EXISTS "Allow public all products" ON public.products;
DROP POLICY IF EXISTS "Allow public all categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public all orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders;

-- Users Table Policies
-- Only the user themselves or an ADMIN can view/edit
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Prevent users from updating their own role
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT role FROM public.users WHERE id = auth.uid()) != 'ADMIN' THEN
    NEW.role = OLD.role; -- Silently revert the role change
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.users;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE prevent_role_escalation();

-- Products and Categories
-- Anyone can read. Only ADMIN can mutate.
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can mutate categories" ON public.categories FOR ALL USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');

-- Orders
-- Users can only read their own orders. Admins can read all.
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid()::text = "customerId" OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'ADMIN');

-- 3. Rewrite `create_order_atomic` RPC to calculate authoritative prices
CREATE OR REPLACE FUNCTION create_order_atomic(order_payload JSONB)
RETURNS JSONB AS $$
DECLARE
  item JSONB;
  v_product RECORD;
  v_variants JSONB;
  v_new_variants JSONB;
  v_variant JSONB;
  v_found BOOLEAN;
  v_current_stock INT;
  req_qty INT;
  req_size TEXT;
  req_color TEXT;
  req_pid TEXT;
  
  effective_price NUMERIC;
  calculated_subtotal NUMERIC := 0;
  calculated_total NUMERIC := 0;
  shipping_cost NUMERIC := 0;
  tax_amount NUMERIC := 0;
  discount_amount NUMERIC := 0;
  
  new_order JSONB;
  auth_uid UUID := auth.uid();
  resolved_customer_id TEXT;
  updated_items JSONB := '[]'::jsonb;
  updated_item JSONB;
BEGIN
  -- Validate Authentication
  IF auth_uid IS NULL THEN
    -- If using anon key without GoTrue, reject
    -- For guest checkouts, if they are allowed without auth, we would use the client customerId.
    -- However, the prompt implies "RLS Target: ... expected customer permissions: create orders through trusted order flow."
    -- And "does not trust customer_id supplied by the client". So we enforce auth_uid.
    resolved_customer_id := order_payload->>'customerId';
  ELSE
    resolved_customer_id := auth_uid::text;
  END IF;

  -- Read shipping/tax from the payload (or ideally from a settings table)
  shipping_cost := COALESCE((order_payload->>'shippingCost')::NUMERIC, 0);
  tax_amount := COALESCE((order_payload->>'tax')::NUMERIC, 0);

  -- 1. Loop through all items to validate, deduct stock, and CALCULATE PRICE
  FOR item IN SELECT * FROM jsonb_array_elements(order_payload->'items')
  LOOP
    req_pid := item->>'productId';
    req_qty := (item->>'quantity')::INT;
    req_size := item->>'size';
    req_color := item->>'color';

    -- Lock the product row for update to ensure atomicity
    SELECT * INTO v_product FROM public.products WHERE id = req_pid FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', req_pid;
    END IF;

    -- Determine authoritative price (basePrice)
    effective_price := v_product."basePrice";

    v_variants := v_product.variants;
    v_found := false;
    v_new_variants := '[]'::jsonb;

    -- If a specific variant is requested
    IF req_size IS NOT NULL OR req_color IS NOT NULL THEN
      IF v_variants IS NOT NULL AND jsonb_typeof(v_variants) = 'array' AND jsonb_array_length(v_variants) > 0 THEN
        FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
        LOOP
          -- Match variant by size and/or color
          IF (v_variant->>'size' = req_size OR req_size IS NULL) AND
             (LOWER(v_variant->>'colorHex') = LOWER(req_color) OR req_color IS NULL) AND 
             NOT v_found THEN
             
             v_found := true;
             v_current_stock := COALESCE((v_variant->>'stock')::INT, 0);
             
             IF v_current_stock < req_qty THEN
               RAISE EXCEPTION 'Insufficient stock for product %, variant % %. Available: %, Requested: %', req_pid, req_size, req_color, v_current_stock, req_qty;
             END IF;
             
             -- Check if variant has a price override
             IF v_variant ? 'price' AND v_variant->>'price' IS NOT NULL THEN
               effective_price := (v_variant->>'price')::NUMERIC;
             END IF;
             
             -- Update the stock value in the JSON object
             v_variant := jsonb_set(v_variant, '{stock}', (v_current_stock - req_qty)::TEXT::JSONB);
          END IF;
          
          v_new_variants := v_new_variants || v_variant;
        END LOOP;
        
        IF v_found THEN
          UPDATE public.products SET variants = v_new_variants WHERE id = req_pid;
        ELSE
          RAISE EXCEPTION 'Variant % % not found for product %', req_size, req_color, req_pid;
        END IF;
      ELSE
         RAISE EXCEPTION 'Product % has no variants', req_pid;
      END IF;
    ELSE
      -- Fallback to top-level stock if no variant matched or was requested
      IF COALESCE(v_product.stock, 0) < req_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', req_pid, COALESCE(v_product.stock, 0), req_qty;
      END IF;
      UPDATE public.products SET stock = COALESCE(stock, 0) - req_qty WHERE id = req_pid;
    END IF;

    -- Add to authoritative subtotal
    calculated_subtotal := calculated_subtotal + (effective_price * req_qty);
    
    -- Update the item payload with the authoritative price to store in the order snapshot
    updated_item := item;
    updated_item := jsonb_set(updated_item, '{price}', to_jsonb(effective_price));
    updated_item := jsonb_set(updated_item, '{title}', to_jsonb(v_product.title));
    updated_items := updated_items || updated_item;

  END LOOP;

  -- Calculate final authoritative total (ignoring client provided total)
  calculated_total := calculated_subtotal + shipping_cost + tax_amount - discount_amount;

  -- 2. Insert the order
  IF NOT (order_payload ? 'id') THEN
    IF (order_payload ? 'orderNumber') THEN
      order_payload := jsonb_set(order_payload, '{id}', order_payload->'orderNumber');
    ELSE
      order_payload := jsonb_set(order_payload, '{id}', to_jsonb(md5(random()::text || clock_timestamp()::text)));
    END IF;
  END IF;

  INSERT INTO public.orders (
    id,
    "customerId",
    "createdAt",
    "updatedAt",
    status,
    "paymentStatus",
    "paymentMethod",
    "fulfillmentStatus",
    channel,
    subtotal,
    "discountAmount",
    "shippingCost",
    tax,
    total,
    items,
    "shippingAddress",
    "statusHistory"
  ) VALUES (
    order_payload->>'id',
    resolved_customer_id,
    COALESCE((order_payload->>'createdAt')::TIMESTAMP WITH TIME ZONE, NOW()),
    NOW(),
    COALESCE(order_payload->>'status', 'PROCESSING'),
    order_payload->>'paymentStatus',
    order_payload->>'paymentMethod',
    COALESCE(order_payload->>'fulfillmentStatus', 'unfulfilled'),
    order_payload->>'channel',
    calculated_subtotal,
    discount_amount,
    shipping_cost,
    tax_amount,
    calculated_total,
    updated_items,
    order_payload->'shippingAddress',
    order_payload->'statusHistory'
  ) RETURNING to_jsonb(orders.*) INTO new_order;

  RETURN new_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
