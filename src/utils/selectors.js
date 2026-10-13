import { startOfWeek, startOfMonth, format, parseISO, isAfter, isBefore } from 'date-fns';

export function computeProductTotalStock(product) {
  if (!product?.variants) return 0;
  return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

export function computeLowStockFlag(product, settings) {
  const threshold = product.lowStockThreshold ?? settings?.defaultLowStockThreshold ?? 5;
  if (!product?.variants) return false;
  return product.variants.some(v => v.stock <= threshold);
}

export function computeOrderTotal(order) {
  const subtotal = order.subtotal || 0;
  const shipping = order.shippingCost || 0;
  const tax = order.tax || 0;
  const discount = order.discountAmount || 0;
  return subtotal - discount + shipping + tax;
}

export function computeCustomerLifetimeValue(customerId, orders) {
  if (!orders) return 0;
  return orders
    .filter(o => o.customerId === customerId && o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + computeOrderTotal(o), 0);
}

export function computeRevenueSummary(orders, { from, to } = {}) {
  let filtered = orders || [];
  if (from) {
    const fromDate = new Date(from);
    filtered = filtered.filter(o => new Date(o.createdAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    filtered = filtered.filter(o => new Date(o.createdAt) <= toDate);
  }

  const paidOrders = filtered.filter(o => o.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + computeOrderTotal(o), 0);
  const totalOrders = filtered.length;
  
  return {
    totalRevenue,
    totalOrders,
    paidOrders: paidOrders.length,
    pendingOrders: filtered.filter(o => o.status === 'PROCESSING').length,
  };
}

export function computeSalesSeries(orders, { granularity = 'week' } = {}) {
  if (!orders) return [];
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  
  const buckets = {};
  
  paidOrders.forEach(o => {
    const date = parseISO(o.createdAt);
    let bucketKey;
    if (granularity === 'day') {
      bucketKey = format(date, 'yyyy-MM-dd');
    } else if (granularity === 'week') {
      bucketKey = format(startOfWeek(date), 'yyyy-MM-dd');
    } else {
      bucketKey = format(startOfMonth(date), 'yyyy-MM');
    }
    
    if (!buckets[bucketKey]) buckets[bucketKey] = 0;
    buckets[bucketKey] += computeOrderTotal(o);
  });
  
  return Object.entries(buckets)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computePayoutSchedule(orders, feeRules) {
  // Mock payout computation based on platform fees
  return [];
}

export function computePromotionUsage(promotionCode, orders) {
  if (!orders) return 0;
  return orders.filter(o => o.promotionCodeApplied === promotionCode).length;
}
