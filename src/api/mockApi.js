import { supabase } from '../lib/supabase';

export const parseNumericAmount = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const getCanonicalOrderId = (order) => {
  if (!order) return '';
  return String(order.orderNumber || order.id || '').replace(/^#+/, '').trim();
};

export const normalizeOrderItems = (rawItems) => {
  if (Array.isArray(rawItems)) return rawItems;
  if (!rawItems) return [];
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
    } catch {
      return rawItems.split(',').filter(Boolean).map((s, idx) => {
        const m = s.trim().match(/^(.*?)\s*\(x(\d+)\)$/);
        return {
          id: `item-${idx}`,
          productId: `item-${idx}`,
          titleSnapshot: m ? m[1] : s.trim(),
          quantity: m ? parseInt(m[2], 10) : 1,
          unitPrice: 0
        };
      });
    }
  }
  if (typeof rawItems === 'object') {
    return Object.values(rawItems);
  }
  return [];
};

export const DEFAULT_DEMO_ORDERS = [
  {
    id: 'JJ-70129',
    orderNumber: 'JJ-70129',
    customerId: 'cust_aarav_sharma',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    customerPhone: '+91 98765 43210',
    status: 'DELIVERED',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    fulfillmentStatus: 'fulfilled',
    channel: 'Web Storefront',
    subtotal: 1898,
    shippingCost: 0,
    discountAmount: 0,
    tax: 0,
    total: 1898,
    items: [
      {
        id: 'p-101',
        productId: 'p-101',
        titleSnapshot: 'Jog & Joy Kids Athleisure Jogger Set',
        unitPrice: 999,
        quantity: 1,
        size: '7-8 Year',
        color: '#1E293B',
        colorName: 'Midnight Navy',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 'p-102',
        productId: 'p-102',
        titleSnapshot: 'Jog & Joy Everyday Soft Cotton Track',
        unitPrice: 899,
        quantity: 1,
        size: '7-8 Year',
        color: '#EF4A45',
        colorName: 'Sunset Coral',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      line1: 'Flat 402, Lotus Grandeur, Sector 78',
      city: 'Noida',
      state: 'Uttar Pradesh',
      postalCode: '201304',
      country: 'India',
      trackingNumber: 'BD-88392019',
      trackingId: 'BD-88392019',
      carrier: 'BlueDart Express',
      trackingUrl: 'https://www.bluedart.com'
    },
    trackingId: 'BD-88392019',
    carrier: 'BlueDart Express',
    trackingUrl: 'https://www.bluedart.com',
    statusHistory: [
      {
        status: 'PROCESSING',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
        note: 'Order placed & confirmed'
      },
      {
        status: 'SHIPPED',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'Shipped via BlueDart Logistics (AWB: BD-88392019)'
      },
      {
        status: 'DELIVERED',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'Package safely delivered to customer'
      }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'JJ-47253',
    orderNumber: 'JJ-47253',
    customerId: 'cust_diya_patel',
    customerName: 'Diya Patel',
    customerEmail: 'diya.patel@example.com',
    customerPhone: '+91 98234 56789',
    status: 'SHIPPED',
    paymentStatus: 'paid',
    paymentMethod: 'Prepaid',
    fulfillmentStatus: 'fulfilled',
    channel: 'Web Storefront',
    subtotal: 2499,
    shippingCost: 0,
    discountAmount: 0,
    tax: 0,
    total: 2499,
    items: [
      {
        id: 'p-103',
        productId: 'p-103',
        titleSnapshot: 'Jog & Joy Pure Cotton Active Hoodie',
        unitPrice: 1499,
        quantity: 1,
        size: '5-6 Year',
        color: '#3B82F6',
        colorName: 'Royal Blue',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 'p-101',
        productId: 'p-101',
        titleSnapshot: 'Jog & Joy Kids Athleisure Jogger Set',
        unitPrice: 1000,
        quantity: 1,
        size: '5-6 Year',
        color: '#10B981',
        colorName: 'Emerald Green',
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Diya Patel',
      email: 'diya.patel@example.com',
      phone: '+91 98234 56789',
      line1: 'B-12 Shantiniketan Society',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380015',
      country: 'India',
      trackingNumber: 'DL-994821',
      trackingId: 'DL-994821',
      carrier: 'Delhivery',
      trackingUrl: 'https://www.delhivery.com'
    },
    trackingId: 'DL-994821',
    carrier: 'Delhivery',
    statusHistory: [
      {
        status: 'PROCESSING',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        note: 'Order placed & confirmed'
      },
      {
        status: 'SHIPPED',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        note: 'Dispatched via Delhivery (AWB: DL-994821)'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export async function list(table, params = {}) {
  const { page = 1, pageSize = 20, sort, ...filters } = params;

  let query = supabase.from(table).select('*', { count: 'exact' });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;

    if (key === 'search') {
      // Very basic text search (Note: For real apps, you'd configure Full Text Search in Postgres)
      // This is a placeholder since Supabase doesn't support generic JSON stringify search natively
      // You'd typically search specific columns like `title.ilike.%${value}%`
      // For now, we'll try to find an 'id' or 'name' or 'title' match
      query = query.or(`id.ilike.%${value}%,title.ilike.%${value}%,name.ilike.%${value}%`);
    } else if (Array.isArray(value)) {
      query = query.in(key, value);
    } else {
      query = query.eq(key, value);
    }
  });

  // Apply sorting
  if (sort) {
    const dir = sort.startsWith('-') ? false : true;
    const key = sort.replace('-', '');
    query = query.order(key, { ascending: dir });
  } else {
    // Default sort by createdAt desc
    query = query.order('createdAt', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  let { data, error, count } = await query;

  if (error) {
    console.error(`Supabase List Error [${table}]:`, error);
    if (table === 'reviews') {
      data = [];
    } else {
      throw new Error(error.message);
    }
  }

  // Enhance reviews with title, body, customerName, author_name, and merge local overrides
  if (table === 'reviews') {
    let listData = (data || []).map(row => {
      let title = '';
      let body = row.comment || '';
      if (body.includes(' - ')) {
        const parts = body.split(' - ');
        title = parts[0];
        body = parts.slice(1).join(' - ');
      } else if (body.includes(': ')) {
        const parts = body.split(': ');
        title = parts[0];
        body = parts.slice(1).join(': ');
      }
      return {
        ...row,
        name: row.name || 'Verified Buyer',
        customerName: row.customerName || row.name || 'Verified Buyer',
        authorName: row.name || 'Verified Buyer',
        author_name: row.name || 'Verified Buyer',
        title: title || 'Verified Review',
        body: body || row.comment || '',
        comment: row.comment || ''
      };
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localReviews = JSON.parse(localStorage.getItem('jj_reviews_overrides') || '[]');
        if (Array.isArray(localReviews)) {
          let filteredLocal = localReviews;
          if (filters.productId) {
            filteredLocal = filteredLocal.filter(r => String(r.productId) === String(filters.productId));
          }
          if (filters.status) {
            filteredLocal = filteredLocal.filter(r => r.status === filters.status);
          }
          const existingIds = new Set(listData.map(r => r.id));
          const newLocal = filteredLocal.filter(r => !existingIds.has(r.id));
          listData = [...newLocal, ...listData];
        }
      } catch {
        // ignore storage parse error
      }
    }
    data = listData;
  }

  // Enhance orders with parsed returnRequest, local storage merges, and canonical deduplication
  if (table === 'orders') {
    const canonicalMap = new Map();

    // 1. Ingest Supabase database rows first (authoritative source)
    (data || []).forEach(row => {
      const canonId = getCanonicalOrderId(row);
      if (canonId) {
        canonicalMap.set(canonId, {
          ...row,
          id: row.id || canonId,
          orderNumber: row.orderNumber || canonId,
          total: parseNumericAmount(row.total),
          subtotal: parseNumericAmount(row.subtotal || row.total),
          discountAmount: parseNumericAmount(row.discountAmount),
          shippingCost: parseNumericAmount(row.shippingCost),
          tax: parseNumericAmount(row.tax),
        });
      }
    });

    // 2. Ensure DEFAULT_DEMO_ORDERS are available if not present in database
    DEFAULT_DEMO_ORDERS.forEach(demo => {
      const canonId = getCanonicalOrderId(demo);
      if (canonId && !canonicalMap.has(canonId)) {
        canonicalMap.set(canonId, { ...demo });
      }
    });

    // 3. Merge local storage orders (jj_orders) safely without duplicating Supabase orders
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
        if (Array.isArray(localOrders)) {
          localOrders.forEach(lo => {
            const canonId = getCanonicalOrderId(lo);
            if (!canonId) return;

            if (canonicalMap.has(canonId)) {
              // Existing database order: do NOT overwrite authoritative items array or status with local mock strings
              const dbOrder = canonicalMap.get(canonId);
              const loReqStatus = (lo.returnRequest?.status || '').toUpperCase();
              const loIsExchange = lo.returnRequest?.type === 'EXCHANGE';
              const loIsReturn = lo.returnRequest?.type === 'RETURN';

              let resolvedStatus = dbOrder.status || lo.status || 'PROCESSING';
              if (lo.status && ['EXCHANGE_APPROVED', 'RETURN_APPROVED', 'SHIPPED', 'DELIVERED', 'REFUNDED', 'CANCELLED'].includes(lo.status)) {
                resolvedStatus = lo.status;
              } else if (loReqStatus === 'APPROVED') {
                resolvedStatus = loIsExchange ? 'EXCHANGE_APPROVED' : 'RETURN_APPROVED';
              } else if (loReqStatus === 'SHIPPED') {
                resolvedStatus = 'SHIPPED';
              } else if (loReqStatus === 'REJECTED') {
                resolvedStatus = loIsExchange ? 'EXCHANGE_REJECTED' : 'RETURN_REJECTED';
              } else if (loReqStatus === 'COMPLETED') {
                resolvedStatus = loIsReturn ? 'REFUNDED' : 'DELIVERED';
              } else if (lo.returnRequest && loReqStatus === 'PENDING') {
                resolvedStatus = loIsExchange ? 'EXCHANGE_REQUESTED' : 'RETURN_REQUESTED';
              }

              canonicalMap.set(canonId, {
                ...lo,
                ...dbOrder, // db takes priority for core fields
                shippingAddress: {
                  ...(lo.shippingAddress || {}),
                  ...(dbOrder.shippingAddress || {})
                },
                total: parseNumericAmount(dbOrder.total || lo.total),
                subtotal: parseNumericAmount(dbOrder.subtotal || lo.subtotal || dbOrder.total),
                status: resolvedStatus
              });
            } else {
              // Local-only order: normalize fields safely
              let normalizedItems = lo.items;
              if (typeof lo.items === 'string') {
                try {
                  const parsed = JSON.parse(lo.items);
                  if (Array.isArray(parsed)) normalizedItems = parsed;
                } catch {
                  // Keep as string or parse
                }
              }
              canonicalMap.set(canonId, {
                ...lo,
                id: canonId,
                orderNumber: lo.orderNumber || canonId,
                items: normalizedItems,
                status: (lo.status === 'Placed 📦' || !lo.status) ? 'PROCESSING' : lo.status,
                paymentStatus: lo.paymentStatus || 'pending',
                total: parseNumericAmount(lo.total),
                subtotal: parseNumericAmount(lo.subtotal || lo.total),
                discountAmount: parseNumericAmount(lo.discountAmount),
                shippingCost: parseNumericAmount(lo.shippingCost),
                tax: parseNumericAmount(lo.tax)
              });
            }
          });
        }

        // 4. Apply multi-tab UI overrides (jj_order_overrides) using canonical deduplication
        const overrides = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
        Object.entries(overrides).forEach(([key, override]) => {
          if (!override || typeof override !== 'object') return;
          const canonKey = getCanonicalOrderId({ id: key, orderNumber: override.orderNumber || key });
          if (!canonKey) return;

          if (canonicalMap.has(canonKey)) {
            const existing = canonicalMap.get(canonKey);
            canonicalMap.set(canonKey, {
              ...override,
              ...existing, // Authoritative database record takes priority over local cache
              id: existing.id || override.id || canonKey,
              orderNumber: existing.orderNumber || override.orderNumber || canonKey,
              total: parseNumericAmount(existing.total !== undefined ? existing.total : override.total),
              subtotal: parseNumericAmount(existing.subtotal !== undefined ? existing.subtotal : override.subtotal),
              returnRequest: existing.returnRequest || override.returnRequest
            });
          } else if (override.items || override.total) {
            // Only add if it represents a standalone order that isn't already present
            canonicalMap.set(canonKey, {
              ...override,
              id: canonKey,
              orderNumber: override.orderNumber || canonKey,
              total: parseNumericAmount(override.total),
              subtotal: parseNumericAmount(override.subtotal || override.total)
            });
          }
        });
      } catch (err) {
        console.warn('Orders storage merge error:', err);
      }
    }

    // 5. Final pass: normalize returnRequest, monetary values, and convert to array
    let listData = Array.from(canonicalMap.values()).map(order => {
      let enhanced = { ...order };
      if (enhanced.notes && typeof enhanced.notes === 'string' && enhanced.notes.startsWith('{')) {
        try {
          const parsed = JSON.parse(enhanced.notes);
          if (parsed && (parsed.type === 'RETURN' || parsed.type === 'EXCHANGE')) {
            enhanced.returnRequest = enhanced.returnRequest || parsed;
          }
        } catch {}
      }
      if (enhanced.shippingAddress?._returnRequest) {
        enhanced.returnRequest = enhanced.returnRequest || enhanced.shippingAddress._returnRequest;
      }
      if (enhanced.returnRequest) {
        const isExchange = enhanced.returnRequest.type === 'EXCHANGE';
        const isReturn = enhanced.returnRequest.type === 'RETURN';
        const reqStatus = (enhanced.returnRequest.status || '').toUpperCase();

        const hasCompletedReplacement = isExchange && (
          reqStatus === 'COMPLETED' ||
          (enhanced.status === 'DELIVERED' && (
            ['APPROVED', 'SHIPPED'].includes(reqStatus) ||
            enhanced.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
          ))
        );

        if (hasCompletedReplacement) {
          enhanced.status = 'DELIVERED';
          if (enhanced.returnRequest.status !== 'COMPLETED') {
            enhanced.returnRequest = { ...enhanced.returnRequest, status: 'COMPLETED' };
          }
        } else if (isExchange) {
          if (!['EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(enhanced.status) && !['APPROVED', 'SHIPPED', 'REJECTED', 'COMPLETED'].includes(reqStatus)) {
            enhanced.status = 'EXCHANGE_REQUESTED';
          }
        } else if (isReturn) {
          const hasCompletedReturn = reqStatus === 'COMPLETED' || enhanced.status === 'REFUNDED';
          if (!hasCompletedReturn && !['RETURN_APPROVED', 'RETURN_REJECTED', 'REFUNDED', 'DELIVERED', 'CANCELLED'].includes(enhanced.status) && !['APPROVED', 'REJECTED', 'COMPLETED'].includes(reqStatus)) {
            enhanced.status = 'RETURN_REQUESTED';
          }
        }
      }
      enhanced.items = normalizeOrderItems(enhanced.items);
      enhanced.total = parseNumericAmount(enhanced.total);
      enhanced.subtotal = parseNumericAmount(enhanced.subtotal || enhanced.total);
      enhanced.discountAmount = parseNumericAmount(enhanced.discountAmount);
      enhanced.shippingCost = parseNumericAmount(enhanced.shippingCost);
      enhanced.tax = parseNumericAmount(enhanced.tax);
      return enhanced;
    });

    listData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    data = listData;
  }

  return { data, total: count || data?.length || 0, page, pageSize };
}

export async function get(table, id) {
  let query = supabase.from(table).select('*');
  const cleanId = String(id || '').replace(/^#+/, '').trim();
  const numericPart = cleanId.replace(/^JJ-/, '');
  if (table === 'orders' && id) {
    query = query.or(`id.eq.${cleanId},id.eq.JJ-${numericPart},id.eq.#${cleanId},orderNumber.eq.${cleanId},orderNumber.eq.JJ-${numericPart},orderNumber.eq.#${cleanId}`);
  } else {
    query = query.eq('id', id);
  }

  let { data, error } = await query.maybeSingle();

  if (table === 'reviews') {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localReviews = JSON.parse(localStorage.getItem('jj_reviews_overrides') || '[]');
        const match = localReviews.find(r => r.id === id);
        if (match) {
          data = data ? { ...data, ...match } : match;
        }
      } catch {
        // ignore
      }
    }
    if (data) {
      let title = '';
      let body = data.comment || '';
      if (body.includes(' - ')) {
        const parts = body.split(' - ');
        title = parts[0];
        body = parts.slice(1).join(' - ');
      } else if (body.includes(': ')) {
        const parts = body.split(': ');
        title = parts[0];
        body = parts.slice(1).join(': ');
      }
      data = {
        ...data,
        name: data.name || 'Verified Buyer',
        customerName: data.customerName || data.name || 'Verified Buyer',
        authorName: data.name || 'Verified Buyer',
        author_name: data.name || 'Verified Buyer',
        title: title || 'Verified Review',
        body: body || data.comment || '',
      };
    }
  }

  if (table === 'orders') {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const overrides = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
        const match = overrides[cleanId] ||
          overrides[`#${cleanId}`] ||
          overrides[id] ||
          overrides[`JJ-${numericPart}`] ||
          overrides[numericPart] ||
          (data && (overrides[data.id] || overrides[data.orderNumber]));
        if (match) {
          // Authoritative database data takes priority over local cache
          data = data ? { ...match, ...data } : match;
        }

        // Also check jj_orders placed during recent checkout sessions
        const localOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
        const localMatch = localOrders.find(o => {
          const oNum = String(o.orderNumber || o.id || '').replace(/^#+/, '').trim();
          return (
            String(o.id || '').replace(/^#+/, '') === cleanId ||
            String(o.orderNumber || '').replace(/^#+/, '') === cleanId ||
            oNum === cleanId ||
            (numericPart && oNum.includes(numericPart))
          );
        });
        if (localMatch) {
          data = data ? { ...localMatch, ...(match || {}), ...data } : (match ? { ...localMatch, ...match } : localMatch);
        }

        // If the database has an advanced lifecycle status, clean up the stale override from local storage
        if (data && ['EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'SHIPPED', 'DELIVERED', 'REFUNDED'].includes(data.status)) {
          if (overrides[cleanId] || overrides[id] || overrides[`#${cleanId}`] || overrides[`JJ-${numericPart}`] || overrides[numericPart]) {
            delete overrides[cleanId];
            delete overrides[id];
            delete overrides[`#${cleanId}`];
            delete overrides[`JJ-${numericPart}`];
            delete overrides[numericPart];
            try {
              localStorage.setItem('jj_order_overrides', JSON.stringify(overrides));
            } catch {}
          }
        }
      } catch {
        // ignore
      }
    }

    // Check DEFAULT_DEMO_ORDERS if not found in database or local storage
    if (!data) {
      const demoMatch = DEFAULT_DEMO_ORDERS.find(o =>
        String(o.id).replace(/^#+/, '') === cleanId ||
        String(o.orderNumber).replace(/^#+/, '') === cleanId
      );
      if (demoMatch) {
        data = { ...demoMatch };
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const overrides = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
            const match = overrides[cleanId] || overrides[`#${cleanId}`] || overrides[id];
            if (match) data = { ...data, ...match };
          } catch {}
        }
      }
    }

    if (data) {
      if (data.notes && typeof data.notes === 'string' && data.notes.startsWith('{')) {
        try {
          const parsed = JSON.parse(data.notes);
          if (parsed && (parsed.type === 'RETURN' || parsed.type === 'EXCHANGE')) {
            data.returnRequest = data.returnRequest || parsed;
          }
        } catch {
          // ignore
        }
      }
      if (data.shippingAddress?._returnRequest) {
        data.returnRequest = data.returnRequest || data.shippingAddress._returnRequest;
      }
      if (data.returnRequest) {
        const isExchange = data.returnRequest.type === 'EXCHANGE';
        const isReturn = data.returnRequest.type === 'RETURN';
        const reqStatus = (data.returnRequest.status || '').toUpperCase();

        const hasCompletedReplacement = isExchange && (
          reqStatus === 'COMPLETED' ||
          (data.status === 'DELIVERED' && (
            ['APPROVED', 'SHIPPED'].includes(reqStatus) ||
            data.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
          ))
        );

        if (hasCompletedReplacement) {
          data.status = 'DELIVERED';
          if (data.returnRequest.status !== 'COMPLETED') {
            data.returnRequest = { ...data.returnRequest, status: 'COMPLETED' };
          }
        } else if (isExchange) {
          if (!['EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(data.status) && !['APPROVED', 'SHIPPED', 'REJECTED', 'COMPLETED'].includes(reqStatus)) {
            data.status = 'EXCHANGE_REQUESTED';
          }
        } else if (isReturn) {
          const hasCompletedReturn = reqStatus === 'COMPLETED' || data.status === 'REFUNDED';
          if (!hasCompletedReturn && !['RETURN_APPROVED', 'RETURN_REJECTED', 'REFUNDED', 'DELIVERED', 'CANCELLED'].includes(data.status) && !['APPROVED', 'REJECTED', 'COMPLETED'].includes(reqStatus)) {
            data.status = 'RETURN_REQUESTED';
          }
        }
      }
      data.items = normalizeOrderItems(data.items);
      data.total = parseNumericAmount(data.total);
      data.subtotal = parseNumericAmount(data.subtotal || data.total);
      data.discountAmount = parseNumericAmount(data.discountAmount);
      data.shippingCost = parseNumericAmount(data.shippingCost);
      data.tax = parseNumericAmount(data.tax);
    }
  }

  if (error && !data) {
    console.error(`Supabase Get Error [${table}]:`, error);
    throw new Error(error.message);
  }
  return data;
}

export async function create(table, payload) {
  const now = new Date().toISOString();

  // Clean payload from undefined values which Supabase rejects
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  );

  if (!cleanPayload.id) {
    cleanPayload.id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `rev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Temporary fix for schema cache issue
  if (table === 'orders' && cleanPayload.channel !== undefined) {
    delete cleanPayload.channel;
  }

  let enrichedReview = null;
  if (table === 'reviews') {
    const commentText = cleanPayload.comment || cleanPayload.body || '';
    const titleText = cleanPayload.title || '';
    const combinedComment = titleText && !commentText.startsWith(titleText)
      ? `${titleText} - ${commentText}`
      : (commentText || titleText || 'Verified Review');

    enrichedReview = {
      id: cleanPayload.id,
      productId: String(cleanPayload.productId || ''),
      name: cleanPayload.name || cleanPayload.customerName || 'Verified Buyer',
      customerName: cleanPayload.customerName || cleanPayload.name || 'Verified Buyer',
      customerEmail: cleanPayload.customerEmail || '',
      rating: Number(cleanPayload.rating || 5),
      title: titleText || 'Verified Review',
      body: commentText || combinedComment,
      comment: combinedComment,
      status: cleanPayload.status || 'approved',
      orderId: cleanPayload.orderId || '',
      createdAt: cleanPayload.createdAt || now,
      updatedAt: now
    };

    // Filter cleanPayload strictly to Supabase columns:
    // ['id', 'productId', 'name', 'rating', 'comment', 'status', 'createdAt', 'updatedAt']
    const allowedReviewCols = new Set(['id', 'productId', 'name', 'rating', 'comment', 'status', 'createdAt', 'updatedAt']);
    Object.keys(cleanPayload).forEach(key => {
      if (!allowedReviewCols.has(key)) {
        delete cleanPayload[key];
      }
    });
    cleanPayload.name = enrichedReview.name;
    cleanPayload.comment = enrichedReview.comment;
    cleanPayload.rating = enrichedReview.rating;
    cleanPayload.status = enrichedReview.status;
  }

  const record = {
    ...cleanPayload,
    createdAt: cleanPayload.createdAt || now,
    updatedAt: now
  };

  // The sizes table doesn't have an updatedAt column
  if (table === 'sizes') {
    delete record.updatedAt;
  }

  let query = supabase.from(table).insert([record]);

  // Guest orders and reviews will fail RLS if we try to SELECT after INSERT. 
  // We can safely omit the select for orders and reviews since we already know the payload.
  if (table !== 'orders' && table !== 'reviews') {
    query = query.select().single();
  }

  const { data, error } = await query;

  if (error) {
    if (table === 'reviews') {
      console.warn(`Supabase Create Note [reviews]:`, error.message);
    } else {
      console.error(`Supabase Create Error [${table}]:`, error);
      throw new Error(error.message);
    }
  }

  if (table === 'reviews' && enrichedReview) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localReviews = JSON.parse(localStorage.getItem('jj_reviews_overrides') || '[]');
        const existingIdx = localReviews.findIndex(r => r.id === enrichedReview.id);
        if (existingIdx >= 0) {
          localReviews[existingIdx] = enrichedReview;
        } else {
          localReviews.unshift(enrichedReview);
        }
        localStorage.setItem('jj_reviews_overrides', JSON.stringify(localReviews));
      } catch {
        // ignore
      }
    }
    return enrichedReview;
  }

  return data || record;
}

export async function update(table, id, patch) {
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([_, v]) => v !== undefined)
  );

  const cleanId = String(id || '').replace(/^#+/, '').trim();
  let returnRequestObj = null;

  if (table === 'orders') {
    if (cleanPatch.returnRequest) {
      returnRequestObj = cleanPatch.returnRequest;
      // Persist in notes column as JSON string safely
      cleanPatch.notes = JSON.stringify(returnRequestObj);
      delete cleanPatch.returnRequest;
    }

    // Merge any courier/tracking fields safely without destroying existing address
    const trackingNo = cleanPatch.trackingNumber || cleanPatch.trackingId;
    const carrierName = cleanPatch.carrier;
    const trackingUrl = cleanPatch.trackingUrl;

    if (cleanPatch.shippingAddress || trackingNo || carrierName || trackingUrl || returnRequestObj) {
      cleanPatch.shippingAddress = {
        ...(cleanPatch.shippingAddress || {}),
        ...(trackingNo ? { trackingNumber: trackingNo, trackingId: trackingNo } : {}),
        ...(carrierName ? { carrier: carrierName } : {}),
        ...(trackingUrl ? { trackingUrl } : {}),
        ...(returnRequestObj ? { _returnRequest: returnRequestObj } : {})
      };
    }

    // Persist to local storage overrides for instant multi-tab UI synchronization under all canonical aliases
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existing = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
        let currentOverride = existing[cleanId] || existing[id] || {};
        const orderNumFromPatch = cleanPatch.orderNumber;

        // Check if any existing entry has matching orderNumber or id
        Object.entries(existing).forEach(([k, v]) => {
          if (!v || typeof v !== 'object') return;
          const kClean = String(k).replace(/^#+/, '').trim();
          const vNum = String(v.orderNumber || v.id || '').replace(/^#+/, '').trim();
          const targetNum = String(orderNumFromPatch || cleanId).replace(/^#+/, '').trim();
          if (kClean === targetNum || vNum === targetNum || (targetNum.length > 3 && vNum.includes(targetNum)) || (vNum.length > 3 && targetNum.includes(vNum))) {
            currentOverride = { ...v, ...currentOverride };
          }
        });

        const effectiveOrderNumber = cleanPatch.orderNumber || currentOverride.orderNumber || (cleanId.startsWith('JJ-') ? cleanId : `JJ-${cleanId.replace(/^JJ-/, '')}`);
        const cleanOrderNum = String(effectiveOrderNumber || '').replace(/^#+/, '').trim();
        const numericPart = cleanOrderNum.replace(/^JJ-/, '');

        const updatedOverride = {
          ...currentOverride,
          ...cleanPatch,
          id: cleanPatch.id || currentOverride.id || cleanId,
          orderNumber: effectiveOrderNumber,
          shippingAddress: {
            ...(currentOverride.shippingAddress || {}),
            ...(cleanPatch.shippingAddress || {})
          },
          ...(returnRequestObj ? { returnRequest: returnRequestObj } : (currentOverride.returnRequest ? { returnRequest: currentOverride.returnRequest } : {}))
        };

        // Save under ALL alias keys so that any lookup by UUID, JJ-82177, 82177, #82177 immediately finds the updated override!
        const aliasKeys = new Set([
          cleanId,
          id,
          effectiveOrderNumber,
          cleanOrderNum,
          numericPart,
          `#${cleanOrderNum}`,
          `#${numericPart}`,
          `JJ-${numericPart}`
        ].filter(Boolean));

        // Also update any existing key in existing that previously mapped to this order
        Object.entries(existing).forEach(([k, v]) => {
          if (!v || typeof v !== 'object') return;
          const vNum = String(v.orderNumber || v.id || '').replace(/^#+/, '').trim();
          if (vNum === cleanOrderNum || (numericPart && vNum.includes(numericPart))) {
            aliasKeys.add(k);
          }
        });

        aliasKeys.forEach(k => {
          existing[k] = { ...updatedOverride };
        });

        localStorage.setItem('jj_order_overrides', JSON.stringify(existing));

        // Also update jj_orders in localStorage so customer tracking, status and exchange requests reflect immediately
        const storedOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
        let matchedStored = false;
        const updatedStoredOrders = storedOrders.map(o => {
          const oNum = String(o.orderNumber || o.id || '').replace(/^#+/, '').trim();
          const isMatch = (
            String(o.id || '').replace(/^#+/, '') === cleanId ||
            String(o.orderNumber || '').replace(/^#+/, '') === cleanId ||
            oNum === cleanOrderNum ||
            (numericPart && oNum.includes(numericPart)) ||
            (cleanId && oNum.includes(cleanId))
          );
          if (isMatch) {
            matchedStored = true;
            return {
              ...o,
              ...cleanPatch,
              status: cleanPatch.status || o.status,
              orderNumber: effectiveOrderNumber,
              returnRequest: returnRequestObj || o.returnRequest,
              shippingAddress: {
                ...(o.shippingAddress || {}),
                ...(cleanPatch.shippingAddress || {})
              }
            };
          }
          return o;
        });

        if (!matchedStored && (cleanPatch.status || returnRequestObj)) {
          updatedStoredOrders.unshift({
            ...updatedOverride,
            orderNumber: effectiveOrderNumber
          });
        }
        localStorage.setItem('jj_orders', JSON.stringify(updatedStoredOrders));

        // Broadcast cross-tab and in-tab synchronization event
        try {
          window.dispatchEvent(new CustomEvent('jj_orders_updated', {
            detail: { id: cleanId, orderNumber: effectiveOrderNumber, status: cleanPatch.status }
          }));
        } catch {}
      } catch {
        // ignore
      }
    }
  }

  if (table === 'reviews') {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localReviews = JSON.parse(localStorage.getItem('jj_reviews_overrides') || '[]');
        const updated = localReviews.map(r => r.id === id ? { ...r, ...cleanPatch, updatedAt: new Date().toISOString() } : r);
        localStorage.setItem('jj_reviews_overrides', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    const allowedReviewCols = new Set(['id', 'productId', 'name', 'rating', 'comment', 'status', 'createdAt', 'updatedAt']);
    Object.keys(cleanPatch).forEach(key => {
      if (!allowedReviewCols.has(key)) {
        delete cleanPatch[key];
      }
    });
  }

  const updateData = { ...cleanPatch, updatedAt: new Date().toISOString() };
  if (table === 'sizes') {
    delete updateData.updatedAt;
  }
  if (table === 'orders') {
    delete updateData.isRestocked;
    delete updateData.restockedAt;
    delete updateData.trackingId;
    delete updateData.carrier;
    delete updateData.trackingUrl;
  }

  let query = supabase.from(table).update(updateData);
  if (table === 'orders' && id) {
    const numericPart = cleanId.replace(/^JJ-/, '');
    query = query.or(`id.eq.${cleanId},id.eq.JJ-${numericPart},id.eq.#${cleanId},orderNumber.eq.${cleanId},orderNumber.eq.JJ-${numericPart},orderNumber.eq.#${cleanId}`);
  } else {
    query = query.eq('id', id);
  }

  let data = null;
  try {
    const res = await query.select();
    data = res.data;
    if (res.error) {
      console.warn(`Supabase Update Note [${table}]:`, res.error.message);
    }
  } catch (err) {
    console.warn(`Supabase Update Exception [${table}]:`, err?.message || err);
  }

  // Retrieve cached order / local override to ensure UI always receives complete, accurate order state
  const cachedOrder = (table === 'orders' && typeof window !== 'undefined' && window.localStorage)
    ? (JSON.parse(localStorage.getItem('jj_order_overrides') || '{}')[cleanId] || JSON.parse(localStorage.getItem('jj_order_overrides') || '{}')[id] || {})
    : {};
  const result = data && data.length > 0
    ? { ...cachedOrder, ...data[0] }
    : { ...cachedOrder, id, ...cleanPatch };

  if (returnRequestObj) {
    result.returnRequest = returnRequestObj;
  }
  return result;
}

export async function remove(table, id) {
  if (table === 'reviews' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const localReviews = JSON.parse(localStorage.getItem('jj_reviews_overrides') || '[]');
      const filtered = localReviews.filter(r => r.id !== id);
      localStorage.setItem('jj_reviews_overrides', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.warn(`Supabase Delete Note [${table}]:`, error.message);
    if (table !== 'reviews') {
      throw new Error(error.message);
    }
  }
  return { id };
}
