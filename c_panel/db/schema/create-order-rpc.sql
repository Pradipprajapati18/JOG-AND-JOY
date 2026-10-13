-- Supabase RPC for Atomic Order Creation and Stock Deduction
-- Apply this in the Supabase SQL Editor

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
  new_order JSONB;
BEGIN
  -- 1. Loop through all items to validate and deduct stock
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
  END LOOP;

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
    order_payload->>'customerId',
    COALESCE((order_payload->>'createdAt')::TIMESTAMP WITH TIME ZONE, NOW()),
    NOW(),
    COALESCE(order_payload->>'status', 'PROCESSING'),
    order_payload->>'paymentStatus',
    order_payload->>'paymentMethod',
    COALESCE(order_payload->>'fulfillmentStatus', 'unfulfilled'),
    order_payload->>'channel',
    (order_payload->>'subtotal')::NUMERIC,
    (order_payload->>'discountAmount')::NUMERIC,
    (order_payload->>'shippingCost')::NUMERIC,
    (order_payload->>'tax')::NUMERIC,
    (order_payload->>'total')::NUMERIC,
    order_payload->'items',
    order_payload->'shippingAddress',
    order_payload->'statusHistory'
  ) RETURNING to_jsonb(orders.*) INTO new_order;

  RETURN new_order;
END;
$$ LANGUAGE plpgsql;
