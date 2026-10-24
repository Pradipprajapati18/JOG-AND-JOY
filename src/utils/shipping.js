/**
 * Logistics and Delivery Partner Utilities
 * Standardized tracking for Indian delivery partners and aggregators
 */

export const COURIER_PARTNERS = [
  {
    id: 'shiprocket',
    name: 'Shiprocket (Delhivery / BlueDart / XpressBees)',
    trackUrl: (awb) => `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`
  },
  {
    id: 'delhivery',
    name: 'Delhivery',
    trackUrl: (awb) => `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`
  },
  {
    id: 'bluedart',
    name: 'Blue Dart',
    trackUrl: (awb) => `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(awb)}`
  },
  {
    id: 'dtdc',
    name: 'DTDC',
    trackUrl: (awb) => `https://www.dtdc.in/tracking/shipment-tracking.asp?tracking_number=${encodeURIComponent(awb)}`
  },
  {
    id: 'indiapost',
    name: 'India Post (Speed Post)',
    trackUrl: (_awb) => `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`
  },
  {
    id: 'shadowfax',
    name: 'Shadowfax',
    trackUrl: (awb) => `https://tracker.shadowfax.in/#/track?orderId=${encodeURIComponent(awb)}`
  },
  {
    id: 'custom',
    name: 'Custom / Other Courier',
    trackUrl: (awb, customUrl) => customUrl || `https://www.google.com/search?q=${encodeURIComponent(awb + ' tracking')}`
  }
];

/**
 * Generates an official tracking URL based on carrier ID and AWB number
 * @param {string} carrierId - e.g. 'delhivery', 'bluedart', 'shiprocket'
 * @param {string} awb - Tracking / AWB number
 * @param {string} [customUrl] - Optional direct URL
 * @returns {string} Clickable tracking URL
 */
export const generateTrackingUrl = (carrierId = 'shiprocket', awb = '', customUrl = '') => {
  if (customUrl && customUrl.trim()) {
    return customUrl.trim();
  }
  if (!awb || !awb.trim()) {
    return '#';
  }

  const cleanAwb = awb.trim();
  const lowerCarrier = (carrierId || '').toLowerCase();
  // Check exact ID match first (e.g. 'delhivery', 'bluedart')
  let partner = COURIER_PARTNERS.find(p => p.id === lowerCarrier);
  if (!partner) {
    // Check exact name match
    partner = COURIER_PARTNERS.find(p => p.name.toLowerCase() === lowerCarrier);
  }
  if (!partner) {
    // Check if partner name starts with carrier name or matches partial
    partner = COURIER_PARTNERS.find(p => 
      p.name.toLowerCase().startsWith(lowerCarrier) || 
      lowerCarrier.includes(p.id)
    );
  }
  if (!partner) {
    partner = COURIER_PARTNERS.find(p => p.name.toLowerCase().includes(lowerCarrier));
  }

  if (partner) {
    return partner.trackUrl(cleanAwb, customUrl);
  }

  // Default fallback: unified Google Search tracking link
  return `https://www.google.com/search?q=${encodeURIComponent(cleanAwb + ' courier tracking')}`;
};

/**
 * Extracts normalized tracking info from an order object (supporting both top-level and nested shippingAddress fields)
 * @param {Object} order
 * @returns {{ trackingId: string, carrier: string, trackingUrl: string, hasTracking: boolean }}
 */
export const resolveOrderTracking = (order) => {
  if (!order) {
    return { trackingId: '', carrier: 'Express Logistics', trackingUrl: '#', hasTracking: false };
  }

  const trackingId = (
    order.trackingId || 
    order.shippingAddress?.trackingNumber || 
    order.shippingAddress?.trackingId || 
    ''
  ).trim();

  const carrier = (
    order.carrier || 
    order.shippingAddress?.carrier || 
    'Express Logistics'
  ).trim();

  let trackingUrl = (
    order.trackingUrl || 
    order.shippingAddress?.trackingUrl || 
    ''
  ).trim();

  if (!trackingUrl && trackingId) {
    trackingUrl = generateTrackingUrl(carrier, trackingId);
  }

  return {
    trackingId,
    carrier,
    trackingUrl: trackingUrl || '#',
    hasTracking: Boolean(trackingId)
  };
};
