import { productsApi } from '../api/endpoints/products';

/**
 * Restocks items from a cancelled or returned order back into the inventory.
 * Safely updates variant stock as well as total product stock.
 * 
 * @param {Object} order - The order object containing items.
 * @param {Object} [queryClient] - Optional React Query client to invalidate product queries.
 * @returns {Promise<boolean>} - True if restocking completed, false otherwise.
 */
export async function restockOrderItems(order, queryClient) {
  if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
    return false;
  }

  // Double-restock prevention
  if (order.isRestocked) {
    console.log(`Order ${order.orderNumber || order.id} has already been restocked.`);
    return false;
  }

  try {
    for (const item of order.items) {
      const productId = item.productId || item.id;
      if (!productId) continue;

      const qty = Math.max(1, Number(item.quantity) || 1);
      let product = null;

      try {
        product = await productsApi.get(productId);
      } catch (err) {
        console.warn(`[Restock] Product ${productId} not found:`, err);
      }

      if (!product) continue;

      const reqSize = item.size;
      const reqColor = item.color;
      const reqColorName = item.colorName;

      let variants = Array.isArray(product.variants) ? [...product.variants] : null;
      let variantFound = false;

      if (variants && variants.length > 0) {
        variants = variants.map((v) => {
          if (variantFound) return v;

          const sizeMatch = !reqSize || String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase();
          const colorMatch = !reqColor || 
            (v.colorHex && reqColor && v.colorHex.toLowerCase() === reqColor.toLowerCase()) ||
            (v.colorName && reqColorName && v.colorName.toLowerCase() === reqColorName.toLowerCase());

          if (sizeMatch && colorMatch) {
            variantFound = true;
            const currentStock = Number(v.stock) || 0;
            return { ...v, stock: currentStock + qty };
          }
          return v;
        });

        // Fallback: If no exact size+color match, match by size alone
        if (!variantFound && reqSize) {
          variants = variants.map((v) => {
            if (variantFound) return v;
            if (String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase()) {
              variantFound = true;
              const currentStock = Number(v.stock) || 0;
              return { ...v, stock: currentStock + qty };
            }
            return v;
          });
        }
      }

      const totalStock = variants && variants.length > 0
        ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        : (Number(product.stock) || 0) + qty;

      const patch = variants && variants.length > 0
        ? { variants, stock: totalStock }
        : { stock: totalStock };

      await productsApi.update(product.id, patch);
      console.log(`[Restock] Restocked +${qty} for product ${product.id} (${product.title || product.name})`);
    }

    if (queryClient && typeof queryClient.invalidateQueries === 'function') {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
    return true;
  } catch (err) {
    console.error('[Restock] Error restocking order items:', err);
    return false;
  }
}
