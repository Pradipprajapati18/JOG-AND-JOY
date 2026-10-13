-- qa-fixes-inventory-restock.sql
-- Create a trigger to restock inventory when an order is CANCELLED or RETURNED

-- 1. Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION restore_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  v_product RECORD;
  v_variants JSONB;
  v_new_variants JSONB;
  v_variant JSONB;
  v_found BOOLEAN;
  req_qty INT;
  req_size TEXT;
  req_color TEXT;
  req_pid TEXT;
BEGIN
  -- We only want to run this if the status changed to CANCELLED, RETURN_APPROVED, or REFUNDED
  -- And it wasn't already in one of those statuses
  IF NEW.status IN ('CANCELLED', 'RETURN_APPROVED', 'REFUNDED') 
     AND OLD.status NOT IN ('CANCELLED', 'RETURN_APPROVED', 'REFUNDED') THEN
     
     -- Loop through all items in the order
     FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
     LOOP
        req_pid := item->>'productId';
        req_qty := (item->>'quantity')::INT;
        req_size := item->>'size';
        req_color := item->>'color';

        -- Lock the product row for update
        SELECT * INTO v_product FROM public.products WHERE id = req_pid FOR UPDATE;

        IF FOUND THEN
          v_variants := v_product.variants;
          v_found := false;
          v_new_variants := '[]'::jsonb;

          -- If it was a variant purchase
          IF req_size IS NOT NULL OR req_color IS NOT NULL THEN
            IF v_variants IS NOT NULL AND jsonb_typeof(v_variants) = 'array' THEN
              FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
              LOOP
                IF (v_variant->>'size' = req_size OR req_size IS NULL) AND
                   (LOWER(v_variant->>'colorHex') = LOWER(req_color) OR req_color IS NULL) AND 
                   NOT v_found THEN
                   
                   v_found := true;
                   -- Increment the stock
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
            END IF;
          ELSE
            -- Top level stock purchase
            UPDATE public.products SET stock = COALESCE(stock, 0) + req_qty WHERE id = req_pid;
          END IF;
        END IF;
     END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trg_restore_inventory ON public.orders;

-- 3. Create the trigger on the orders table
CREATE TRIGGER trg_restore_inventory
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION restore_inventory_on_cancel();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
