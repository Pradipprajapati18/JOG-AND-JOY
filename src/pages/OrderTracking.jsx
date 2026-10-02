import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, MapPin, Star, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { list } from '../api/mockApi';
import { createSlug } from '../utils/helpers';

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an Order ID.');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Try to fetch from DB first (works for authenticated users / admins)
      const response = await list('orders', { id: orderId.trim() });
      const data = response.data && response.data.length > 0 ? response.data[0] : null;
      
      if (data) {
        setOrder({
          ...data,
          date: new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          totalAmount: data.total ? `₹${data.total}` : (data.items ? `₹${data.items.reduce((s,i) => s + (i.unitPrice * i.quantity), 0)}` : '₹0')
        });
      } else {
        // Fallback for guest users blocked by RLS: Check localStorage
        const localOrders = JSON.parse(localStorage.getItem('jj_orders') || '[]');
        const localMatch = localOrders.find(o => o.id === `#${orderId.trim()}` || o.id === orderId.trim());
        
        if (localMatch) {
          // Reconstruct order object for UI
          setOrder({
            ...localMatch,
            id: localMatch.id.replace('#', ''),
            orderNumber: localMatch.id.replace('#', ''),
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            createdAt: new Date().toISOString(), // fallback date
            status: localMatch.status === 'Placed 📦' ? 'PROCESSING' : 'PENDING',
            totalAmount: localMatch.total ? `₹${localMatch.total}` : (localMatch.items ? `₹${localMatch.items.reduce((s,i) => s + (i.unitPrice * i.quantity), 0)}` : '₹0')
          });
        } else {
          setError('Order not found. Please check your Order ID.');
        }
      }
    } catch (err) {
      setError('Order not found. Please verify your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Track Your Order
          </h1>
          <p className="text-slate-500 font-medium">
            Enter your Order ID below to check the current status of your shipment.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 md:p-10 border border-slate-100">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-2">Order ID</label>
              <input
                type="text"
                placeholder="e.g. ORD-12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#EF4A45] focus:ring-2 focus:ring-[#EF4A45]/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#EF4A45] focus:ring-2 focus:ring-[#EF4A45]/20 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[#EF4A45] text-white font-bold rounded-xl hover:bg-[#d33a36] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Search className="w-5 h-5 animate-pulse" /> : <Search className="w-5 h-5" />}
                Track
              </button>
            </div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm border border-red-100 mb-8"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-3xl bg-[#FFF8EC] border border-amber-100 shadow-sm flex flex-col gap-3"
              >
                {/* Header: Order Number & Status */}
                <div className="flex items-start justify-between border-b border-amber-200/50 pb-3">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">{order.orderNumber || order.id.substring(0, 8).toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 block">Ordered: {order.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white text-slate-700 shadow-xs inline-block mb-1 border border-slate-100">
                      {order.status}
                    </span>
                    <span className="block text-sm font-black text-[#EF4A45]">{order.totalAmount}</span>
                  </div>
                </div>
                
                {/* Items List */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-1.5 py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-700 font-semibold">
                         <span className="flex-1 truncate pr-4">
                           <span className="text-slate-400 mr-2">{item.quantity}x</span> 
                           {item.titleSnapshot || item.name || 'Item'}
                           {item.size && <span className="text-slate-400 ml-1">({item.size})</span>}
                         </span>
                         <span className="font-bold">₹{item.unitPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Shipping & Payment Grid */}
                <div className="bg-white/80 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white">
                   <div>
                      <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3"/> Shipping To</p>
                      <p className="font-bold text-slate-800 line-clamp-1">{order.shippingAddress?.name || 'Customer'}</p>
                      <p className="text-slate-500 font-medium leading-tight mt-0.5 line-clamp-2">
                        {order.shippingAddress ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}` : 'Standard Shipping'}
                      </p>
                   </div>
                   <div>
                      <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-1.5 flex items-center gap-1"><Package className="w-3 h-3"/> Payment</p>
                      <p className="font-bold text-slate-800">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'} 
                        <span className="text-slate-400 font-medium ml-1 capitalize">({order.paymentStatus || 'paid'})</span>
                      </p>
                   </div>
                </div>
                
                {/* Footer Actions */}
                <div className="mt-1 pt-3 border-t border-amber-200/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2 w-full sm:w-auto ml-auto">
                    {['DELIVERED', 'SHIPPED'].includes(order.status) && (
                      <button onClick={() => window.open(`/invoice/${order.id}`, '_blank')} className="flex items-center justify-center px-4 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold gap-2">
                        <FileText className="w-4 h-4" /> Invoice
                      </button>
                    )}
                    {order.status === 'DELIVERED' && order.items && order.items.length > 0 && (
                      <Link
                        to={`/product/${createSlug(order.items[0].titleSnapshot || 'product') || order.items[0].productId}?review=true&orderId=${order.orderNumber || order.id}`}
                        className="flex items-center justify-center px-4 h-8 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Write Review
                      </Link>
                    )}
                  </div>
                </div>

                {/* Vertical Order Status Timeline */}
                <div className="mt-2 p-4 sm:p-5 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 bg-white border-t border-amber-100 rounded-b-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracking Journey</p>
                    {(order.trackingId || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                      <div className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                        {order.carrier || 'Logistics'}: {order.trackingId || 'Pending'}
                      </div>
                    )}
                  </div>

                  <div className="relative pl-3 flex flex-col gap-6">
                    {(() => {
                      const isDeliveredOrBeyond = ['DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'REFUNDED'].includes(order.status);
                      const isShippedOrBeyond = ['SHIPPED'].includes(order.status) || isDeliveredOrBeyond;
                      const isReturnOrExchange = ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 'EXCHANGE_REQUESTED', 'EXCHANGE_APPROVED', 'EXCHANGE_REJECTED', 'REFUNDED'].includes(order.status);
                      const isCancelled = order.status === 'CANCELLED';

                      if (isCancelled) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-red-500 font-bold text-sm">This order has been cancelled.</p>
                          </div>
                        );
                      }

                      const steps = [
                        { label: 'Order Processing', active: true, desc: 'We are preparing your order.' },
                        { label: 'Shipped', active: isShippedOrBeyond, desc: 'Your order is on the way.' },
                        { label: 'Delivered', active: isDeliveredOrBeyond, desc: 'Delivered to your address.' },
                      ];

                      if (isReturnOrExchange) {
                        let returnLabel = 'Return Pending';
                        if (order.status === 'RETURN_APPROVED') returnLabel = 'Return Approved';
                        if (order.status === 'RETURN_REJECTED') returnLabel = 'Return Rejected';
                        if (order.status === 'EXCHANGE_REQUESTED') returnLabel = 'Exchange Pending';
                        if (order.status === 'EXCHANGE_APPROVED') returnLabel = 'Exchange Approved';
                        if (order.status === 'EXCHANGE_REJECTED') returnLabel = 'Exchange Rejected';
                        if (order.status === 'REFUNDED') returnLabel = 'Refund Processed';
                        
                        steps.push({ label: returnLabel, active: true, desc: 'Post-delivery process initiated.' });
                      }

                      // Calculate height of the active line based on number of active steps
                      const totalSegments = steps.length - 1;
                      const activeSegments = steps.filter(s => s.active).length - 1;
                      const progressHeight = totalSegments === 0 ? '0%' : `${(activeSegments / totalSegments) * 100}%`;

                      return (
                        <>
                          {/* Vertical Connecting Line Background */}
                          <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-amber-100 z-0"></div>
                          {/* Vertical Connecting Line Active */}
                          <div className="absolute left-4 top-2 w-[2px] bg-[#EF4A45] z-0 transition-all duration-700 ease-out" style={{ height: progressHeight }}></div>
                          
                          {steps.map((step, idx) => (
                            <div key={idx} className="relative z-10 flex items-start gap-4">
                              <div className={`mt-[2px] w-3 h-3 shrink-0 rounded-full flex items-center justify-center ${step.active ? 'bg-[#EF4A45] ring-4 ring-red-50' : 'bg-amber-200'}`}>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                              <div className="flex flex-col -mt-1">
                                <span className={`text-[13px] font-black ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.label}
                                </span>
                                {step.active && (
                                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{step.desc}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
