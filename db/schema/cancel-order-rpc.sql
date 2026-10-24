-- ==============================================================================
-- Supabase RPC Migration: Secure Customer Order Cancellation Handler
-- File: db/schema/cancel-order-rpc.sql
-- 
-- Apply this file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- Allows customers to safely cancel their own pre-fulfillment orders with 
-- atomic inventory restocking and strict RLS protection.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.cancel_order_customer(
  order_id TEXT,
  cancel_reason TEXT DEFAULT 'Cancelled by customer prior to dispatch'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  auth_uid UUID := auth.uid();
  v_user_role TEXT;
  v_user_email TEXT;
  v_clean_id TEXT;
  v_order RECORD;
  v_history_entry JSONB;
  v_new_history JSONB;
  v_new_shipping_address JSONB;
  v_new_payment_status TEXT;
  v_item JSONB;
  v_product RECORD;
  v_variants JSONB;
  v_new_variants JSONB;
  v_variant JSONB;
  v_found BOOLEAN;
  req_qty INT;
  req_size TEXT;
  req_color TEXT;
  req_pid TEXT;
  v_updated_order JSONB;
BEGIN
  -- 1. Authentication check
  IF auth_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required: You must be signed in to cancel an order.';
  END IF;

  -- 2. Clean order ID
  v_clean_id := regexp_replace(TRIM(order_id), '^#+', '');
  IF v_clean_id IS NULL OR v_clean_id = '' THEN
    RAISE EXCEPTION 'Invalid order ID provided.';
  END IF;

  -- 3. Lock and retrieve order row
  SELECT * INTO v_order
  FROM public.orders
  WHERE (id = v_clean_id OR "orderNumber" = v_clean_id OR id = '#' || v_clean_id)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order "%" not found in the database.', order_id;
  END IF;

  -- 4. Check user authorization & ownership
  SELECT role, email INTO v_user_role, v_user_email FROM public.users WHERE id = auth_uid;
  IF (v_user_role IS DISTINCT FROM 'ADMIN' AND v_user_role IS DISTINCT FROM 'admin') THEN
    IF v_order."customerId" IS DISTINCT FROM auth_uid::text AND
       (v_order."shippingAddress"->>'email' IS DISTINCT FROM v_user_email OR v_user_email IS NULL) THEN
      RAISE EXCEPTION 'Unauthorized: You can only cancel your own orders.';
    END IF;
  END IF;

  -- 5. Order eligibility check: Can ONLY cancel pre-dispatch orders
  IF v_order.status NOT IN ('PROCESSING', 'CONFIRMED', 'PENDING', 'ON_HOLD') THEN
    IF v_order.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'This order has already been cancelled.';
    ELSIF v_order.status IN ('SHIPPED', 'DELIVERED') THEN
      RAISE EXCEPTION 'Order cannot be cancelled because it has already been dispatched. You can request a return or exchange once delivered.';
    ELSE
      RAISE EXCEPTION 'Order is not eligible for cancellation in % status.', v_order.status;
    END IF;
  END IF;

  -- 6. Payment status resolution
  IF v_order."paymentStatus" = 'paid' THEN
    v_new_payment_status := 'refunded';
  ELSE
    v_new_payment_status := 'cancelled';
  END IF;

  -- 7. Prepare history entry
  v_history_entry := jsonb_build_object(
    'status', 'CANCELLED',
    'timestamp', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'note', 'Order cancelled by customer: ' || COALESCE(cancel_reason, 'Cancelled prior to dispatch')
  );

  v_new_history := COALESCE(v_order."statusHistory", '[]'::jsonb) || v_history_entry;

  -- 8. Mark _isRestocked in shippingAddress
  v_new_shipping_address := COALESCE(v_order."shippingAddress", '{}'::jsonb) ||
    jsonb_build_object(
      '_isRestocked', true,
      '_restockedAt', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    );

  -- 9. Atomically restock reserved product variants in inventory
  IF v_order.items IS NOT NULL AND jsonb_typeof(v_order.items) = 'array' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items)
    LOOP
      req_pid := v_item->>'productId';
      IF req_pid IS NULL THEN
        req_pid := v_item->>'id';
      END IF;
      req_qty := GREATEST(1, COALESCE((v_item->>'quantity')::INT, 1));
      req_size := v_item->>'size';
      req_color := v_item->>'color';

      IF req_pid IS NOT NULL THEN
        SELECT * INTO v_product FROM public.products WHERE id = req_pid FOR UPDATE;
        IF FOUND THEN
          v_variants := v_product.variants;
          v_found := false;
          v_new_variants := '[]'::jsonb;

          IF v_variants IS NOT NULL AND jsonb_typeof(v_variants) = 'array' AND jsonb_array_length(v_variants) > 0 THEN
            FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
            LOOP
              IF (v_variant->>'size' = req_size OR req_size IS NULL) AND
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

            IF v_found THEN
              UPDATE public.products SET variants = v_new_variants WHERE id = req_pid;
            END IF;
          ELSE
            UPDATE public.products SET stock = COALESCE(stock, 0) + req_qty WHERE id = req_pid;
          END IF;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- 10. Update the order atomically
  UPDATE public.orders
  SET
    status = 'CANCELLED',
    "paymentStatus" = v_new_payment_status,
    "shippingAddress" = v_new_shipping_address,
    "statusHistory" = v_new_history,
    "updatedAt" = NOW()
  WHERE id = v_order.id
  RETURNING to_jsonb(public.orders.*) INTO v_updated_order;

  RETURN v_updated_order;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.cancel_order_customer(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_customer(TEXT, TEXT) TO anon;

NOTIFY pgrst, 'reload schema';
