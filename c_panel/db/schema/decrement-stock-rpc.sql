-- Supabase RPC for Atomic JSONB Stock Decrement
-- Apply this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_id TEXT,
  p_qty INT,
  p_size TEXT DEFAULT NULL,
  p_color TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_product RECORD;
  v_variants JSONB;
  v_found BOOLEAN := false;
  v_new_variants JSONB := '[]'::jsonb;
  v_variant JSONB;
  v_current_stock INT;
BEGIN
  -- 1. Lock the row for update to ensure atomicity and prevent race conditions
  SELECT * INTO v_product FROM public.products WHERE id = p_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', p_id;
  END IF;

  v_variants := v_product.variants;

  -- 2. If a specific variant is requested, decrement inside the JSONB array
  IF p_size IS NOT NULL OR p_color IS NOT NULL THEN
    IF v_variants IS NOT NULL AND jsonb_typeof(v_variants) = 'array' AND jsonb_array_length(v_variants) > 0 THEN
      FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
      LOOP
        -- Match variant by size and/or color
        IF (v_variant->>'size' = p_size OR p_size IS NULL) AND
           (LOWER(v_variant->>'colorHex') = LOWER(p_color) OR p_color IS NULL) AND 
           NOT v_found THEN -- ensure we only decrement one matching variant
           
           v_found := true;
           v_current_stock := COALESCE((v_variant->>'stock')::INT, 0);
           
           IF v_current_stock < p_qty THEN
             RAISE EXCEPTION 'Insufficient stock for variant % %. Available: %, Requested: %', p_size, p_color, v_current_stock, p_qty;
           END IF;
           
           -- Update the stock value in the JSON object
           v_variant := jsonb_set(v_variant, '{stock}', (v_current_stock - p_qty)::TEXT::JSONB);
        END IF;
        
        v_new_variants := v_new_variants || v_variant;
      END LOOP;
      
      IF v_found THEN
        UPDATE public.products SET variants = v_new_variants WHERE id = p_id;
        RETURN;
      END IF;
    END IF;
  END IF;

  -- 3. Fallback to top-level stock if no variant matched or was requested
  IF COALESCE(v_product.stock, 0) < p_qty THEN
    RAISE EXCEPTION 'Insufficient stock for product. Available: %, Requested: %', COALESCE(v_product.stock, 0), p_qty;
  END IF;

  UPDATE public.products SET stock = COALESCE(stock, 0) - p_qty WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
