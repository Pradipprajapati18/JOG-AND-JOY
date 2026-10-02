import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, CreditCard, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrdersList } from '../queries/useOrders';
import { useSettingsContext } from '../context/SettingsContext';

export default function CustomerOrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: ordersData, isLoading } = useOrdersList(user ? { customerId: user.id } : {});
  const { settings } = useSettingsContext();
  const order = ordersData?.data?.find(o => o.id === id);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading order details...</div>;
  }

  if (!order && ordersData?.data) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/account/orders" className="text-[#EF4A45] font-bold hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  if (!order) return null;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
  const orderNumber = order.orderNumber || `#${order.id.substring(0,8).toUpperCase()}`;

  // Simple timeline calculation
  const statusIndex = order.status === 'DELIVERED' ? 3 : order.status === 'SHIPPED' ? 2 : order.status === 'PROCESSING' ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
            Order {orderNumber}
            <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
              order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {order.status || 'PROCESSING'}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Placed on {orderDate}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {order.trackingId && (
            <a href={order.trackingUrl || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
              <ExternalLink className="w-4 h-4" /> Track Shipment
            </a>
          )}
          {order.status === 'DELIVERED' && (
            <Link to={`/invoice/${order.id}`} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:border-[#EF4A45] hover:text-[#EF4A45] transition-colors">
              <Download className="w-4 h-4" /> Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Visual Tracking Bar */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500" style={{ width: `${(statusIndex / 3) * 100}%` }}></div>
            
            <div className="relative z-10 flex justify-between">
              {[
                { label: 'Order Placed', icon: Package, active: statusIndex >= 0 },
                { label: 'Processing', icon: Loader2, active: statusIndex >= 1 },
                { label: 'Shipped', icon: Truck, active: statusIndex >= 2 },
                { label: 'Delivered', icon: CheckCircle2, active: statusIndex >= 3 },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors ${step.active ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">Items Ordered</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item, i) => (
                <div key={i} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {item.image ? (
                    <img src={item.image} alt={item.titleSnapshot} className="w-16 h-16 rounded-xl border border-slate-200 object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 shrink-0 font-bold">IMG</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate text-lg">{item.titleSnapshot}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 font-medium">
                      <span>Size: <span className="text-slate-700">{item.size || 'N/A'}</span></span>
                      <span>&bull;</span>
                      <span>Color: <span className="text-slate-700">{item.color || 'N/A'}</span></span>
                      <span>&bull;</span>
                      <span>Qty: <span className="text-slate-700">{item.quantity}</span></span>
                    </div>
                  </div>
                  <div className="text-right sm:w-24">
                    <p className="font-black text-slate-800 text-lg">₹{item.unitPrice * item.quantity}</p>
                    {item.quantity > 1 && <p className="text-xs text-slate-500 font-medium">₹{item.unitPrice} each</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Shipping */}
        <div className="space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 font-medium"><p>Subtotal</p><p>₹{order.subtotal}</p></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-medium"><p>Discount ({order.promotionCodeApplied})</p><p>-₹{order.discountAmount}</p></div>}
              
              {(() => {
                const shippingCharge = settings?.baseShippingRate || 0;
                const total = (order.subtotal || 0) + shippingCharge - (order.discountAmount || 0) + (order.tax || 0);
                
                return (
                  <>
                    <div className="flex justify-between text-slate-600 font-medium"><p>Shipping</p><p>₹{shippingCharge}</p></div>
                    <div className="flex justify-between text-slate-600 font-medium"><p>Tax</p><p>₹{order.tax || 0}</p></div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-lg text-slate-800">
                      <p>Total</p><p>₹{total}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Payment & Shipping Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
            
            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><CreditCard className="w-4 h-4"/> Payment Method</h3>
              <p className="font-bold text-slate-800 uppercase">{order.paymentMethod || 'Online'}</p>
              <p className="text-sm text-slate-500 capitalize font-medium">{order.paymentStatus || 'Paid'}</p>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><MapPin className="w-4 h-4"/> Delivery Address</h3>
              <p className="font-bold text-slate-800">{order.shippingAddress?.name || user?.name || 'Customer'}</p>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                {order.shippingAddress?.line1 || order.shippingAddress?.address}<br/>
                {order.shippingAddress?.city}{order.shippingAddress?.city && order.shippingAddress?.state ? ', ' : ''}{order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              
              {/* Shipping Method Badge */}
              {order.shippingMethod && (
                <div className="mt-3 inline-block px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded">
                  {order.shippingMethod} Shipping
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
