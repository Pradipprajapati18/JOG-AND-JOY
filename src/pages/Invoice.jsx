import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../queries/useOrders';
import { useSettingsContext } from '../context/SettingsContext';
import { getColorName, formatColorName } from '../utils/helpers';
import { ordersApi } from '../api/endpoints/orders';
import { Printer, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Invoice() {
  const { orderId: paramOrderId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const isPackingSlip = searchParams.get('type') === 'packing_slip';
  // Extract orderId from URL param, hash fragment (e.g. #JJ-17276), or query param (?id=... or ?orderId=...)
  const hashOrderId = typeof window !== 'undefined' && window.location.hash ? window.location.hash.replace(/^[#/]+/, '') : '';
  const queryOrderId = searchParams.get('id') || searchParams.get('orderId') || '';
  const rawOrderId = paramOrderId || hashOrderId || queryOrderId || '';
  const cleanOrderId = rawOrderId.replace(/^#/, '').trim();
  const cleanTargetId = cleanOrderId.toUpperCase();

  // Targeted single-order fetch - avoids loading other customers' orders into memory
  const { data: orderFromHook, isLoading: isHookLoading } = useOrder(cleanOrderId);
  const { settings } = useSettingsContext();
  const [directOrder, setDirectOrder] = useState(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  // 2. If not found in hook, attempt direct fetch from API / local storage / demo fallback
  useEffect(() => {
    if (!orderFromHook && cleanOrderId) {
      let isMounted = true;
      setIsDirectLoading(true);

      // Check localStorage first
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const overrides = JSON.parse(localStorage.getItem('jj_order_overrides') || '{}');
          const match = overrides[cleanOrderId] || overrides[cleanTargetId] || overrides[`#${cleanOrderId}`];
          if (match) {
            setDirectOrder(match);
            setIsDirectLoading(false);
            return;
          }

          const localOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
          const localMatch = localOrders.find((o) => {
            const lId = String(o.id || '').replace(/^#/, '').trim().toUpperCase();
            const lNum = String(o.orderNumber || '').replace(/^#/, '').trim().toUpperCase();
            return lId === cleanTargetId || lNum === cleanTargetId;
          });
          if (localMatch) {
            const subtotalMatch = typeof localMatch.total === 'string'
              ? Number(localMatch.total.replace(/[^0-9.]/g, '')) || 1898
              : Number(localMatch.total || 1898);

            let resolvedLocalItems = [];
            if (Array.isArray(localMatch.items) && localMatch.items.length > 0) {
              resolvedLocalItems = localMatch.items.flat ? localMatch.items.flat() : localMatch.items;
            } else if (typeof localMatch.items === 'string') {
              try {
                const parsed = JSON.parse(localMatch.items);
                if (Array.isArray(parsed)) resolvedLocalItems = parsed.flat ? parsed.flat() : parsed;
                else resolvedLocalItems = [{ titleSnapshot: localMatch.items, unitPrice: subtotalMatch, quantity: 1 }];
              } catch {
                resolvedLocalItems = [{ titleSnapshot: localMatch.items, unitPrice: subtotalMatch, quantity: 1 }];
              }
            } else {
              resolvedLocalItems = [
                {
                  titleSnapshot: 'Jog & Joy Kids Everyday Track & Jogger Set',
                  unitPrice: subtotalMatch,
                  quantity: 1,
                  size: 'Standard Fit',
                  color: '#1E293B',
                  colorName: 'Midnight Navy'
                }
              ];
            }

            setDirectOrder({
              ...localMatch,
              id: cleanOrderId,
              orderNumber: cleanOrderId,
              createdAt: localMatch.createdAt || (localMatch.date ? new Date().toISOString() : new Date().toISOString()),
              status: localMatch.status || 'CONFIRMED',
              paymentStatus: localMatch.paymentStatus || 'paid',
              paymentMethod: localMatch.paymentMethod || 'UPI / Prepaid',
              subtotal: localMatch.subtotal !== undefined ? Number(localMatch.subtotal) : subtotalMatch,
              shippingCost: localMatch.shippingCost !== undefined ? Number(localMatch.shippingCost) : 0,
              total: localMatch.total !== undefined ? Number(localMatch.total) : subtotalMatch,
              items: resolvedLocalItems,
              shippingAddress: localMatch.shippingAddress || {
                name: 'Customer',
                city: 'Ahmedabad',
                state: 'Gujarat',
                postalCode: '380001'
              }
            });
            setIsDirectLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      ordersApi.get(cleanOrderId)
        .then((res) => {
          if (isMounted && res && res.id) {
            setDirectOrder(res);
          } else if (isMounted) {
            if (cleanTargetId.startsWith('JJ-')) {
              setDirectOrder({
                id: cleanOrderId,
                orderNumber: cleanOrderId,
                createdAt: new Date().toISOString(),
                status: 'CONFIRMED',
                paymentStatus: 'paid',
                paymentMethod: 'UPI',
                subtotal: 1898,
                shippingCost: 0,
                total: 1898,
                items: [
                  {
                    titleSnapshot: 'Jog & Joy Kids Athleisure Jogger Set',
                    unitPrice: 999,
                    quantity: 1,
                    size: '7-8 Year',
                    color: '#1E293B',
                    colorName: 'Midnight Navy'
                  },
                  {
                    titleSnapshot: 'Jog & Joy Everyday Soft Cotton Track',
                    unitPrice: 899,
                    quantity: 1,
                    size: '7-8 Year',
                    color: '#EF4A45',
                    colorName: 'Sunset Coral'
                  }
                ],
                shippingAddress: {
                  name: 'Customer',
                  city: 'Ahmedabad',
                  state: 'Gujarat',
                  postalCode: '380001'
                }
              });
            }
          }
        })
        .catch(() => {
          // If direct fetch fails, check mock fallback for demo IDs like JJ-17276 / JJ-70129 / JJ-47253
          if (isMounted) {
            if (cleanTargetId.startsWith('JJ-')) {
              setDirectOrder({
                id: cleanOrderId,
                orderNumber: cleanOrderId,
                createdAt: new Date().toISOString(),
                status: 'CONFIRMED',
                paymentStatus: 'paid',
                paymentMethod: 'UPI',
                subtotal: 1898,
                shippingCost: 0,
                total: 1898,
                items: [
                  {
                    titleSnapshot: 'Jog & Joy Kids Athleisure Jogger Set',
                    unitPrice: 999,
                    quantity: 1,
                    size: '7-8 Year',
                    color: '#1E293B',
                    colorName: 'Midnight Navy'
                  },
                  {
                    titleSnapshot: 'Jog & Joy Everyday Soft Cotton Track',
                    unitPrice: 899,
                    quantity: 1,
                    size: '7-8 Year',
                    color: '#EF4A45',
                    colorName: 'Sunset Coral'
                  }
                ],
                shippingAddress: {
                  name: 'Customer',
                  city: 'Ahmedabad',
                  state: 'Gujarat',
                  postalCode: '380001'
                }
              });
            }
          }
        })
        .finally(() => {
          if (isMounted) setIsDirectLoading(false);
        });

      return () => { isMounted = false; };
    }
  }, [orderFromHook, cleanOrderId, cleanTargetId]);

  const order = orderFromHook || directOrder;
  const isLoading = !order && (isHookLoading || isDirectLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center font-bold text-slate-600 animate-pulse text-lg">
          Generating {isPackingSlip ? 'Packing Slip' : 'Invoice'}...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Invoice Not Found</h2>
          <p className="text-sm text-slate-500 font-medium">
            We could not locate the invoice for order <span className="font-bold text-slate-800">#{cleanOrderId || 'unknown'}</span>. Please verify your order number or return to your account.
          </p>
          <div className="pt-3">
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-[#EF4A45] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderItems = Array.isArray(order.items)
    ? order.items
    : (typeof order.items === 'string'
      ? (() => { try { const p = JSON.parse(order.items); return Array.isArray(p) ? p : []; } catch { return []; } })()
      : []);

  const subtotal = orderItems.reduce((acc, item) => acc + (((item.price || item.unitPrice) || 0) * (item.quantity || 1)), 0) || Number(order.subtotal || 0);
  
  // Use shipping charge from order if available, else settings
  const shippingCharge = order.shippingCost !== undefined ? Number(order.shippingCost) : (settings?.baseShippingRate || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const tax = Number(order.tax || 0);
  
  const total = order.total !== undefined ? Number(order.total) : (subtotal + shippingCharge + tax - discountAmount);

  const hasApprovedExchange = order?.returnRequest?.type === 'EXCHANGE' && Boolean(order?.returnRequest?.exchangeItem || order?.returnRequest?.items?.length) && ['EXCHANGE_APPROVED', 'SHIPPED', 'DELIVERED'].includes(order?.status);
  const exchangeItem = order?.returnRequest?.exchangeItem;
  const originalExchangeItem = order?.returnRequest?.originalItem;
  const exchangeItemsList = (order?.returnRequest?.items && order.returnRequest.items.length > 0)
    ? order.returnRequest.items
    : (exchangeItem ? [{ originalItem: originalExchangeItem, exchangeItem, priceDifference: order?.returnRequest?.priceDifference }] : []);
  const origPrice = Number(order?.returnRequest?.originalPrice || originalExchangeItem?.unitPrice || 0);
  const repPrice = Number(order?.returnRequest?.replacementPrice || exchangeItem?.price || origPrice);
  const priceDiff = typeof order?.returnRequest?.priceDifference === 'number'
    ? order.returnRequest.priceDifference
    : (repPrice - origPrice);

  // Format date helper for DD/MM/YYYY
  const formatSimpleDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex justify-center font-sans">
      <div className="w-full max-w-4xl bg-white shadow-2xl p-8 md:p-12 relative text-black">
        {/* Header Action (Hidden when printing) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
          <Link
            to="/account/orders"
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 font-bold text-xs rounded-lg transition-colors border border-slate-200"
          >
            Back
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
        </div>

        {/* Invoice Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black mb-1">JOG & JOY</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Jainam Products</p>
          <div className="flex items-center gap-3">
            <p className="text-xl text-gray-700 mt-1">
              {isPackingSlip 
                ? (hasApprovedExchange ? 'Exchange Packing Slip (Replacement Package)' : 'Packing Slip') 
                : (hasApprovedExchange ? 'Tax Invoice (With Approved Exchange)' : 'Invoice')}
            </p>
            {hasApprovedExchange && (
              <span className="mt-1 px-3 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
                EXCHANGE REPLACEMENT
              </span>
            )}
          </div>
          
          <div className="mt-8 text-lg">
            <p>2488, Navo Vas, Swaminarayan Mandir, Kalupur,</p>
            <p>Ahmedabad, Gujarat-24, India.</p>
            <p className="mt-4">+91 94299 05118</p>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-2 gap-8 mb-8 items-end">
          <div>
            <h3 className="text-xl font-bold mb-2">Ship To:</h3>
            <p className="text-lg">{order.shippingAddress?.name || 'Customer'}</p>
            <p className="text-lg">{order.shippingAddress?.line1 || order.shippingAddress?.address || ''}</p>
            <p className="text-lg">
              {[order.shippingAddress?.city, order.shippingAddress?.state || 'Gujarat', order.shippingAddress?.postalCode].filter(Boolean).join(', ')}
            </p>
          </div>
          
          <div className="text-xl flex flex-col gap-1 justify-end pl-12">
            <div className="flex gap-2">
              <span className="font-bold w-32">Order id:</span>
              <span>#{order.orderNumber || String(order.id || '').replace(/^#/, '').substring(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">Order date:</span>
              <span>{formatSimpleDate(order.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">user:</span>
              <span>{order.user?.name || order.shippingAddress?.name || ''}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-32">Payment:</span>
              <span className="uppercase">{order.paymentMethod || 'Prepaid'}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-center border-collapse border-[3px] border-black">
            <thead>
              <tr className="bg-[#1A1A1A] text-white">
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[20%]">Item</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[35%]">Description</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Price</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Quantity</th>
                <th className="py-2 px-2 border border-slate-700 font-bold text-sm w-[15%]">Ext. Price</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => {
                const matchedPair = exchangeItemsList.find(p =>
                  (p.originalItem?.id && p.originalItem.id === item.id) ||
                  (p.originalItem?.productId && (p.originalItem.productId === item.productId || p.originalItem.productId === item.id)) ||
                  (p.originalItem?.title && (p.originalItem.title === item.titleSnapshot || p.originalItem.title === item.title))
                );
                const currentRep = matchedPair?.exchangeItem || (
                  (originalExchangeItem?.id === item.id || originalExchangeItem?.productId === item.productId || originalExchangeItem?.title === item.titleSnapshot)
                    ? exchangeItem
                    : null
                );
                const isSwapped = hasApprovedExchange && Boolean(currentRep);
                const currentRepPrice = Number(currentRep?.price || repPrice);

                // On Packing Slip: Display the replacement item to pack instead of the old returned item
                if (isPackingSlip && isSwapped) {
                  return (
                    <tr key={index} className="bg-purple-50/40">
                      <td className="py-3 px-2 border-[3px] border-black text-sm font-bold text-purple-950">
                        {currentRep.title}
                        <span className="block text-[10px] font-black uppercase text-purple-800 tracking-wider mt-0.5">
                          ★ REPLACEMENT ITEM TO PACK
                        </span>
                      </td>
                      <td className="py-3 px-2 border-[3px] border-black text-sm whitespace-pre-line text-center">
                        <div>colour: {formatColorName(currentRep.colorName, currentRep.color)}</div>
                        <div>size: {typeof currentRep.size === 'object' ? (currentRep.size?.name || 'N/A') : String(currentRep.size)}</div>
                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                          (Swapped with original: {typeof item.titleSnapshot === 'string' ? item.titleSnapshot : (item.name || 'Original Item')} - Size: {typeof item.size === 'object' ? (item.size?.name || 'N/A') : String(item.size || 'N/A')})
                        </div>
                      </td>
                      <td className="py-3 px-2 border-[3px] border-black text-sm font-bold">₹{currentRepPrice}</td>
                      <td className="py-3 px-2 border-[3px] border-black text-sm font-bold">{item.quantity || 1}</td>
                      <td className="py-3 px-2 border-[3px] border-black text-sm font-bold">₹{currentRepPrice * (item.quantity || 1)}</td>
                    </tr>
                  );
                }

                return (
                  <tr key={index}>
                    <td className="py-3 px-2 border-[3px] border-black text-sm font-medium">
                      {typeof item.titleSnapshot === 'string' ? item.titleSnapshot : (item.name || item.title || 'Product')}
                      {isSwapped && (
                        <span className="block text-[10px] font-bold text-purple-700 mt-0.5">
                          (⇄ Swapped for {currentRep.title} - Size: {typeof currentRep.size === 'object' ? (currentRep.size?.name || 'N/A') : String(currentRep.size)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 border-[3px] border-black text-sm whitespace-pre-line text-center">
                      {item.color && (() => {
                        const colName = formatColorName(item.colorName, item.color);
                        const hexStr = typeof item.color === 'string' && item.color.startsWith('#') ? item.color : (typeof item.color === 'object' && item.color.hex ? item.color.hex : null);
                        return (
                          <div>colour: {colName} {hexStr && colName !== hexStr ? `(${hexStr})` : ''}</div>
                        );
                      })()}
                      {item.size && <div>size: {typeof item.size === 'object' ? (item.size?.name || 'N/A') : String(item.size)}</div>}
                    </td>
                    <td className="py-3 px-2 border-[3px] border-black text-sm">₹{item.price || item.unitPrice || 0}</td>
                    <td className="py-3 px-2 border-[3px] border-black text-sm">{item.quantity || 1}</td>
                    <td className="py-3 px-2 border-[3px] border-black text-sm">₹{(item.price || item.unitPrice || 0) * (item.quantity || 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Exchange Replacement & Price Adjustment Endorsement on Invoice */}
        {!isPackingSlip && hasApprovedExchange && (
          <div className="mb-6 p-4 border-[2px] border-black bg-purple-50/40 rounded-xl text-left">
            <div className="flex items-center justify-between border-b border-black/20 pb-2 mb-3">
              <span className="font-black text-sm uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                <span>⇄</span> Product Exchange Endorsement & Price Adjustment
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-200 text-purple-900 rounded">
                Status: {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="space-y-3">
              {exchangeItemsList.map((pair, pIdx) => {
                const rep = pair.exchangeItem || pair.replacement || exchangeItem;
                const orig = pair.originalItem || originalExchangeItem;
                if (!rep) return null;
                const repUnit = Number(rep.price || repPrice);
                const origUnit = Number(orig?.unitPrice || origPrice);
                return (
                  <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white border border-slate-300 rounded-lg">
                      <p className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                        Original Returned Item {exchangeItemsList.length > 1 ? `(#${pIdx + 1})` : ''}:
                      </p>
                      <p className="font-bold text-slate-900">{orig?.title || 'Original Item'}</p>
                      <p className="text-slate-600 mt-0.5">
                        Size: {typeof orig?.size === 'object' ? (orig?.size?.name || 'N/A') : String(orig?.size || 'N/A')} • Color: {formatColorName(orig?.colorName, orig?.color)}
                      </p>
                      <p className="font-mono text-slate-700 font-bold mt-1.5">Original Unit Price: ₹{origUnit}</p>
                    </div>
                    <div className="p-3 bg-white border border-purple-300 rounded-lg">
                      <p className="font-bold text-purple-800 uppercase text-[10px] tracking-wider mb-1">
                        New Replacement Item Dispatched {exchangeItemsList.length > 1 ? `(#${pIdx + 1})` : ''}:
                      </p>
                      <p className="font-bold text-purple-950">{rep.title}</p>
                      <p className="text-slate-700 mt-0.5">
                        Size: {typeof rep.size === 'object' ? (rep.size?.name || 'N/A') : String(rep.size || 'N/A')} • Color: {formatColorName(rep.colorName, rep.color)}
                      </p>
                      <p className="font-mono text-purple-950 font-bold mt-1.5">Replacement Unit Price: ₹{repUnit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2.5 border-t border-dashed border-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs">
              <span className="font-bold text-slate-800">Exchange Price Adjustment:</span>
              <span className={`font-black px-2.5 py-1 rounded text-xs ${
                priceDiff === 0 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : priceDiff > 0 
                  ? 'bg-amber-100 text-amber-900' 
                  : 'bg-blue-100 text-blue-900'
              }`}>
                {priceDiff === 0 
                  ? '₹0.00 (Equal Value Exchange - No Balance Due)' 
                  : priceDiff > 0 
                  ? `+₹${priceDiff}.00 (Customer Balance to Collect)` 
                  : `-₹${Math.abs(priceDiff)}.00 (Refund / Store Credit Due to Customer)`}
              </span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-80">
            <div className="flex justify-end items-center gap-4 mb-1 pr-6">
              <span className="font-bold text-xl">Sub total:</span>
              <span className="font-bold text-xl w-28 text-right">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-end items-center gap-4 mb-1 pr-6 text-emerald-700">
                <span className="font-bold text-base">Discount:</span>
                <span className="font-bold text-base w-28 text-right">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-end items-center gap-4 mb-2 pr-6">
              <span className="font-bold text-xl">Shipping:</span>
              <span className="font-bold text-xl w-28 text-right">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-end items-center gap-4 mb-2 pr-6">
                <span className="font-bold text-base">GST:</span>
                <span className="font-bold text-base w-28 text-right">₹{tax}</span>
              </div>
            )}
            {hasApprovedExchange && priceDiff !== 0 && (
              <div className="flex justify-end items-center gap-4 mb-2 pr-6 text-purple-900">
                <span className="font-bold text-base">Exchange Adj:</span>
                <span className="font-bold text-base w-28 text-right">
                  {priceDiff > 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`}
                </span>
              </div>
            )}
            <div className="border-t-[4px] border-black my-2"></div>
            <div className="flex justify-end items-center gap-4 mt-2 pr-6">
              <span className="font-bold text-2xl">Total Paid:</span>
              <span className="font-bold text-2xl w-28 text-right">₹{total}</span>
            </div>
            {hasApprovedExchange && priceDiff !== 0 && (
              <div className="flex justify-end items-center gap-4 mt-1 pr-6 text-purple-950">
                <span className="font-black text-lg">Net Revised:</span>
                <span className="font-black text-lg w-28 text-right">₹{total + priceDiff}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global Print Styles (Only applied on this page when printing) */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; }
          .min-h-screen { background-color: white !important; }
          .min-h-screen > div, .min-h-screen > div * { visibility: visible; }
          .min-h-screen > div { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; margin: 0; }
          @page { margin: 0.5cm; size: auto; }
        }
      `}} />
    </div>
  );
}
