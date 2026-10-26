-- ==============================================================================
-- Supabase RPC Migration: Secure Customer Exchange & Return Request Handlers
-- File: db/schema/order-return-and-exchange-rpc.sql
-- 
-- Apply this file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- ==============================================================================

-- 1. Ensure notes column exists on orders table safely
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Secure Exchange Request RPC
CREATE OR REPLACE FUNCTION public.request_order_exchange(
  order_id TEXT,
  exchange_payload JSONB
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
  v_rep_id TEXT;
  v_rep_title TEXT;
  v_history_entry JSONB;
  v_new_history JSONB;
  v_new_shipping_address JSONB;
  v_updated_order JSONB;
BEGIN
  -- 1. Authentication check
  IF auth_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required: You must be signed in to submit an exchange request.';
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
  SELECT role, email INTO v_user_role, v_user_email FROM public.users WHERE id::text = auth_uid::text;
  IF (v_user_role IS DISTINCT FROM 'ADMIN' AND v_user_role IS DISTINCT FROM 'admin') THEN
    IF v_order."customerId"::text IS DISTINCT FROM auth_uid::text AND
       (v_order."shippingAddress"->>'email' IS DISTINCT FROM v_user_email OR v_user_email IS NULL) THEN
      RAISE EXCEPTION 'Unauthorized: You can only request an exchange for your own orders.';
    END IF;
  END IF;

  -- 5. Order eligibility check
  IF v_order.status != 'DELIVERED' THEN
    IF v_order.status = 'EXCHANGE_REQUESTED' THEN
      RAISE EXCEPTION 'An exchange request is already pending for this order.';
    ELSIF v_order.status = 'EXCHANGE_APPROVED' THEN
      RAISE EXCEPTION 'An exchange request has already been approved for this order.';
    ELSIF v_order.status IN ('RETURN_REQUESTED', 'RETURN_APPROVED', 'REFUNDED') THEN
      RAISE EXCEPTION 'Cannot request exchange: Order is currently in % status.', v_order.status;
    ELSE
      RAISE EXCEPTION 'Order is not eligible for exchange. Status must be DELIVERED (current status: %).', v_order.status;
    END IF;
  END IF;

  -- 6. Duplicate check against existing shippingAddress metadata
  IF v_order."shippingAddress" IS NOT NULL AND
     v_order."shippingAddress" ? '_returnRequest' AND
     (v_order."shippingAddress"->'_returnRequest'->>'type' = 'EXCHANGE') AND
     v_order.status = 'EXCHANGE_REQUESTED' THEN
    RAISE EXCEPTION 'An exchange request is already pending for this order.';
  END IF;

  -- 7. Validate exchange payload
  IF exchange_payload IS NULL THEN
    RAISE EXCEPTION 'Exchange request payload cannot be empty.';
  END IF;

  IF COALESCE(TRIM(exchange_payload->>'reason'), '') = '' THEN
    RAISE EXCEPTION 'A reason for exchange is required.';
  END IF;

  IF exchange_payload->'exchangeItem' IS NULL OR
     COALESCE(exchange_payload->'exchangeItem'->>'productId', '') = '' THEN
    RAISE EXCEPTION 'A replacement product must be selected.';
  END IF;

  IF COALESCE(TRIM(exchange_payload->'exchangeItem'->>'size'), '') = '' THEN
    RAISE EXCEPTION 'A replacement size must be selected.';
  END IF;

  -- Verify replacement product exists in catalog
  SELECT id, title INTO v_rep_id, v_rep_title
  FROM public.products
  WHERE id = exchange_payload->'exchangeItem'->>'productId';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Replacement product "%" not found in catalog.', exchange_payload->'exchangeItem'->>'productId';
  END IF;

  -- 8. Prepare atomic updates
  v_history_entry := jsonb_build_object(
    'status', 'EXCHANGE_REQUESTED',
    'timestamp', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'note', 'Customer requested exchange: ' ||
            COALESCE(exchange_payload->'originalItem'->>'title', 'Item') ||
            ' (' || COALESCE(exchange_payload->'originalItem'->>'size', 'N/A') || ') for ' ||
            COALESCE(v_rep_title, exchange_payload->'exchangeItem'->>'title', 'Product') ||
            ' (' || COALESCE(exchange_payload->'exchangeItem'->>'size', 'N/A') || ') - Reason: ' ||
            COALESCE(exchange_payload->>'reason', '')
  );

  v_new_history := COALESCE(v_order."statusHistory", '[]'::jsonb) || jsonb_build_array(v_history_entry);
  v_new_shipping_address := jsonb_set(
    COALESCE(v_order."shippingAddress", '{}'::jsonb),
    '{_returnRequest}',
    exchange_payload
  );

  -- 9. Persist update atomically (protected order fields like total, subtotal, items remain untouched)
  UPDATE public.orders
  SET status = 'EXCHANGE_REQUESTED',
      "statusHistory" = v_new_history,
      "shippingAddress" = v_new_shipping_address,
      notes = exchange_payload::text,
      "updatedAt" = NOW()
  WHERE id = v_order.id
  RETURNING to_jsonb(orders.*) INTO v_updated_order;

  RETURN v_updated_order;
END;
$$;

-- 3. Secure Return Request RPC
CREATE OR REPLACE FUNCTION public.request_order_return(
  order_id TEXT,
  return_payload JSONB
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
  v_refund_mode TEXT;
  v_history_entry JSONB;
  v_new_history JSONB;
  v_new_shipping_address JSONB;
  v_updated_order JSONB;
BEGIN
  -- 1. Authentication check
  IF auth_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required: You must be signed in to submit a return request.';
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
  SELECT role, email INTO v_user_role, v_user_email FROM public.users WHERE id::text = auth_uid::text;
  IF (v_user_role IS DISTINCT FROM 'ADMIN' AND v_user_role IS DISTINCT FROM 'admin') THEN
    IF v_order."customerId"::text IS DISTINCT FROM auth_uid::text AND
       (v_order."shippingAddress"->>'email' IS DISTINCT FROM v_user_email OR v_user_email IS NULL) THEN
      RAISE EXCEPTION 'Unauthorized: You can only request a return for your own orders.';
    END IF;
  END IF;

  -- 5. Order eligibility check
  IF v_order.status != 'DELIVERED' THEN
    IF v_order.status = 'RETURN_REQUESTED' THEN
      RAISE EXCEPTION 'A return request is already pending for this order.';
    ELSIF v_order.status = 'RETURN_APPROVED' THEN
      RAISE EXCEPTION 'A return request has already been approved for this order.';
    ELSIF v_order.status IN ('EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'REFUNDED') THEN
      RAISE EXCEPTION 'Cannot request return: Order is currently in % status.', v_order.status;
    ELSE
      RAISE EXCEPTION 'Order is not eligible for return. Status must be DELIVERED (current status: %).', v_order.status;
    END IF;
  END IF;

  -- 6. Duplicate check against existing shippingAddress metadata
  IF v_order."shippingAddress" IS NOT NULL AND
     v_order."shippingAddress" ? '_returnRequest' AND
     (v_order."shippingAddress"->'_returnRequest'->>'type' = 'RETURN') AND
     v_order.status = 'RETURN_REQUESTED' THEN
    RAISE EXCEPTION 'A return request is already pending for this order.';
  END IF;

  -- 7. Validate return payload
  IF return_payload IS NULL THEN
    RAISE EXCEPTION 'Return request payload cannot be empty.';
  END IF;

  IF COALESCE(TRIM(return_payload->>'reason'), '') = '' THEN
    RAISE EXCEPTION 'A reason for return is required.';
  END IF;

  v_refund_mode := COALESCE(return_payload->>'refundMode', 'original');
  IF v_refund_mode NOT IN ('original', 'store_credit', 'bank') THEN
    RAISE EXCEPTION 'Invalid refund mode: %. Must be original, store_credit, or bank.', v_refund_mode;
  END IF;

  -- If bank details chosen, validate them server-side
  IF v_refund_mode = 'bank' THEN
    IF return_payload->'bankDetails' IS NULL THEN
      RAISE EXCEPTION 'Bank account details are required for bank refund.';
    END IF;
    IF COALESCE(TRIM(return_payload->'bankDetails'->>'accountName'), '') = '' THEN
      RAISE EXCEPTION 'Account holder name is required.';
    END IF;
    IF COALESCE(TRIM(return_payload->'bankDetails'->>'accountNumber'), '') = '' OR
       NOT (return_payload->'bankDetails'->>'accountNumber' ~ '^[0-9]{9,18}$') THEN
      RAISE EXCEPTION 'Valid bank account number (9 to 18 digits) is required.';
    END IF;
    IF COALESCE(TRIM(return_payload->'bankDetails'->>'ifsc'), '') = '' OR
       NOT (UPPER(return_payload->'bankDetails'->>'ifsc') ~ '^[A-Z]{4}0[A-Z0-9]{6}$') THEN
      RAISE EXCEPTION 'Valid 11-character IFSC code is required.';
    END IF;
  END IF;

  -- 8. Prepare atomic updates
  v_history_entry := jsonb_build_object(
    'status', 'RETURN_REQUESTED',
    'timestamp', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'note', 'Customer requested return for: ' ||
            COALESCE(return_payload->'originalItem'->>'title', 'Item') ||
            ' (' || COALESCE(return_payload->'originalItem'->>'size', 'N/A') || ') - Reason: ' ||
            COALESCE(return_payload->>'reason', '') ||
            ' (Refund Mode: ' || v_refund_mode || ')'
  );

  v_new_history := COALESCE(v_order."statusHistory", '[]'::jsonb) || jsonb_build_array(v_history_entry);
  v_new_shipping_address := jsonb_set(
    COALESCE(v_order."shippingAddress", '{}'::jsonb),
    '{_returnRequest}',
    return_payload
  );

  -- 9. Persist update atomically (protected order fields like total, subtotal, items remain untouched)
  UPDATE public.orders
  SET status = 'RETURN_REQUESTED',
      "statusHistory" = v_new_history,
      "shippingAddress" = v_new_shipping_address,
      notes = return_payload::text,
      "updatedAt" = NOW()
  WHERE id = v_order.id
  RETURNING to_jsonb(orders.*) INTO v_updated_order;

  RETURN v_updated_order;
END;
$$;

-- Permissions (Function internally validates auth.uid() and raises exception if unauthenticated)
GRANT EXECUTE ON FUNCTION public.request_order_exchange(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_order_exchange(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.request_order_exchange(TEXT, JSONB) TO anon;

GRANT EXECUTE ON FUNCTION public.request_order_return(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_order_return(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.request_order_return(TEXT, JSONB) TO anon;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
