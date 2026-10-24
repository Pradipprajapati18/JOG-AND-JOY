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

  // Multi-layer double-restock prevention (checks direct flag, metadata, and history)
  const alreadyRestocked = Boolean(
    order.isRestocked ||
    order.shippingAddress?._isRestocked ||
    order.statusHistory?.some(h => /inventory restocked|restock/i.test(h.note || ''))
  );
  if (alreadyRestocked) {
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

      const reqSize = typeof item.size === 'object' ? (item.size?.name || item.size?.label) : item.size;
      const reqColor = typeof item.color === 'object' ? item.color?.hex : item.color;
      const reqColorName = item.colorName;

      let variants = Array.isArray(product.variants) ? [...product.variants] : null;
      let variantFound = false;

      if (variants && variants.length > 0) {
        variants = variants.map((v) => {
          if (variantFound) return v;

          const sizeMatch = !reqSize || String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase();
          const colorMatch = !reqColor || 
            (v.colorHex && reqColor && v.colorHex.toLowerCase() === String(reqColor).toLowerCase()) ||
            (v.colorName && reqColorName && v.colorName.toLowerCase() === String(reqColorName).toLowerCase());

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

/**
 * Deducts a single item/variant from inventory (used when replacement package is shipped in an exchange).
 *
 * @param {Object} item - The replacement item object ({ productId, size, color, quantity }).
 * @param {Object} [queryClient] - Optional React Query client.
 * @returns {Promise<boolean>}
 */
export async function deductInventoryItem(item, queryClient) {
  if (!item) return false;
  const productId = item.productId || item.id;
  if (!productId) return false;

  const qty = Math.max(1, Number(item.quantity) || 1);
  let product = null;

  try {
    product = await productsApi.get(productId);
  } catch (err) {
    console.warn(`[Inventory Deduct] Product ${productId} not found:`, err);
  }

  if (!product) return false;

  const reqSize = typeof item.size === 'object' ? (item.size?.name || item.size?.label) : item.size;
  const reqColor = typeof item.color === 'object' ? item.color?.hex : item.color;
  const reqColorName = item.colorName;

  let variants = Array.isArray(product.variants) ? [...product.variants] : null;
  let variantFound = false;

  if (variants && variants.length > 0) {
    variants = variants.map((v) => {
      if (variantFound) return v;

      const sizeMatch = !reqSize || String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase();
      const colorMatch = !reqColor || 
        (v.colorHex && reqColor && v.colorHex.toLowerCase() === String(reqColor).toLowerCase()) ||
        (v.colorName && reqColorName && v.colorName.toLowerCase() === String(reqColorName).toLowerCase());

      if (sizeMatch && colorMatch) {
        variantFound = true;
        const currentStock = Number(v.stock) || 0;
        return { ...v, stock: Math.max(0, currentStock - qty) };
      }
      return v;
    });

    if (!variantFound && reqSize) {
      variants = variants.map((v) => {
        if (variantFound) return v;
        if (String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase()) {
          variantFound = true;
          const currentStock = Number(v.stock) || 0;
          return { ...v, stock: Math.max(0, currentStock - qty) };
        }
        return v;
      });
    }
  }

  const totalStock = variants && variants.length > 0
    ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : Math.max(0, (Number(product.stock) || 0) - qty);

  const patch = variants && variants.length > 0
    ? { variants, stock: totalStock }
    : { stock: totalStock };

  try {
    await productsApi.update(product.id, patch);
    console.log(`[Inventory Deduct] Deducted -${qty} for replacement item ${product.id} (${product.title || product.name})`);
    if (queryClient && typeof queryClient.invalidateQueries === 'function') {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
    return true;
  } catch (err) {
    console.error('[Inventory Deduct] Error deducting replacement stock:', err);
    return false;
  }
}

/**
 * Restocks a single returned item/variant back into inventory (used when exchange delivery completes).
 *
 * @param {Object} item - The returned item object ({ productId, size, color, quantity }).
 * @param {Object} [queryClient] - Optional React Query client.
 * @returns {Promise<boolean>}
 */
export async function restockInventoryItem(item, queryClient) {
  if (!item) return false;
  const productId = item.productId || item.id;
  if (!productId) return false;

  const qty = Math.max(1, Number(item.quantity) || 1);
  let product = null;

  try {
    product = await productsApi.get(productId);
  } catch (err) {
    console.warn(`[Inventory Restock] Product ${productId} not found:`, err);
  }

  if (!product) return false;

  const reqSize = typeof item.size === 'object' ? (item.size?.name || item.size?.label) : item.size;
  const reqColor = typeof item.color === 'object' ? item.color?.hex : item.color;
  const reqColorName = item.colorName;

  let variants = Array.isArray(product.variants) ? [...product.variants] : null;
  let variantFound = false;

  if (variants && variants.length > 0) {
    variants = variants.map((v) => {
      if (variantFound) return v;

      const sizeMatch = !reqSize || String(v.size || '').trim().toLowerCase() === String(reqSize).trim().toLowerCase();
      const colorMatch = !reqColor || 
        (v.colorHex && reqColor && v.colorHex.toLowerCase() === String(reqColor).toLowerCase()) ||
        (v.colorName && reqColorName && v.colorName.toLowerCase() === String(reqColorName).toLowerCase());

      if (sizeMatch && colorMatch) {
        variantFound = true;
        const currentStock = Number(v.stock) || 0;
        return { ...v, stock: currentStock + qty };
      }
      return v;
    });

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

  try {
    await productsApi.update(product.id, patch);
    console.log(`[Inventory Restock] Restocked +${qty} for exchanged item ${product.id} (${product.title || product.name})`);
    if (queryClient && typeof queryClient.invalidateQueries === 'function') {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
    return true;
  } catch (err) {
    console.error('[Inventory Restock] Error restocking exchanged item:', err);
    return false;
  }
}
