import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrdersList } from '../queries/useOrders';
import { createSlug } from '../utils/helpers';

export default function CustomerOrders() {
  const { user } = useAuth();
  const { data: ordersData, isLoading } = useOrdersList(user ? { customerId: user.id } : {});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (ordersData?.data) {
      setOrders(ordersData.data);
    }
  }, [ordersData]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#EF4A45] animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">No orders yet</h2>
        <p className="text-slate-500 mb-6 max-w-sm">Looks like you haven't made your first purchase yet. Start shopping to see your orders here.</p>
        <Link to="/products" className="bg-[#EF4A45] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d63d38] transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100">
        <h2 className="text-2xl font-black text-slate-800">My Orders</h2>
        <p className="text-slate-500 mt-1">View and track all your recent orders</p>
      </div>

      <div className="divide-y divide-slate-100">
        {orders.map((order) => {
          let orderItems = [];
          if (Array.isArray(order.items)) {
            orderItems = order.items;
          } else if (typeof order.items === 'string') {
            try {
              const parsed = JSON.parse(order.items);
              if (Array.isArray(parsed)) orderItems = parsed;
              else if (parsed && typeof parsed === 'object') orderItems = Object.values(parsed);
            } catch {
              orderItems = [{ titleSnapshot: order.items, quantity: 1 }];
            }
          } else if (order.items && typeof order.items === 'object') {
            orderItems = Object.values(order.items);
          }

          const firstItem = orderItems[0] || null;
          const itemCount = orderItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
          const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const orderNumber = order.orderNumber || `#${String(order.id || '').substring(0, 8).toUpperCase()}`;

          return (
            <div key={order.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
              {/* Order Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-800 text-lg">{orderNumber}</span>
                  {(() => {
                    const hasExchange = order.returnRequest?.type === 'EXCHANGE';
                    const reqStatus = (order.returnRequest?.status || '').toUpperCase();
                    const isExDelivered = hasExchange && (
                      reqStatus === 'COMPLETED' ||
                      (order.status === 'DELIVERED' && (
                        ['APPROVED', 'SHIPPED'].includes(reqStatus) ||
                        order.statusHistory?.some(h => h.status === 'EXCHANGE_APPROVED')
                      ))
                    );
                    const isExShipped = hasExchange && (order.status === 'SHIPPED' || reqStatus === 'SHIPPED' || isExDelivered);
                    const isExApproved = hasExchange && (['EXCHANGE_APPROVED', 'SHIPPED'].includes(order.status) || ['APPROVED', 'SHIPPED', 'COMPLETED'].includes(reqStatus) || isExShipped);

                    const badgeClass = isExDelivered ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      isExShipped ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      isExApproved ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                      order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      order.status === 'EXCHANGE_REQUESTED' || order.status === 'RETURN_REQUESTED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      order.status === 'EXCHANGE_APPROVED' || order.status === 'RETURN_APPROVED' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      order.status === 'CANCELLED' || order.status === 'EXCHANGE_REJECTED' || order.status === 'RETURN_REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' :
                      order.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      order.status === 'PACKED' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      order.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                      'bg-blue-100 text-blue-700';

                    const badgeText = isExDelivered ? 'REPLACEMENT DELIVERED' :
                      isExShipped ? 'REPLACEMENT SHIPPED' :
                      isExApproved ? 'EXCHANGE APPROVED' :
                      order.status === 'ON_HOLD' ? 'ON HOLD' :
                      (order.status?.replace('_', ' ') || 'PROCESSING');

                    return (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {badgeText}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Date Placed</span>
                    <span className="font-medium text-slate-700">{orderDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Total Amount</span>
                    <span className="font-bold text-slate-800">₹{order.total}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Items</span>
                    <span className="font-medium text-slate-700">{itemCount} items</span>
                  </div>
                </div>

                {/* Preview of first item */}
                {firstItem && (() => {
                  const productSlug = createSlug(firstItem.titleSnapshot) || firstItem.productId || firstItem.id;
                  return productSlug ? (
                    <Link
                      to={`/product/${productSlug}`}
                      className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100/60 hover:text-[#EF4A45] transition-colors group w-fit max-w-full"
                      title="View product details"
                    >
                      {firstItem.image ? (
                        <img src={firstItem.image} alt={firstItem.titleSnapshot || 'Product'} className="w-10 h-10 rounded border border-slate-200 object-cover shrink-0 group-hover:border-[#EF4A45]/40 transition-colors" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400 shrink-0">IMG</div>
                      )}
                      <span className="text-sm text-slate-600 group-hover:text-[#EF4A45] transition-colors truncate max-w-[200px] md:max-w-[300px]">
                        {firstItem.titleSnapshot} {itemCount > 1 && <span className="text-slate-400 font-medium ml-1">and {itemCount - 1} other items</span>}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100/60">
                      {firstItem.image ? (
                        <img src={firstItem.image} alt={firstItem.titleSnapshot || 'Product'} className="w-10 h-10 rounded border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">IMG</div>
                      )}
                      <span className="text-sm text-slate-600 truncate max-w-[200px] md:max-w-[300px]">
                        {firstItem.titleSnapshot} {itemCount > 1 && <span className="text-slate-400 font-medium ml-1">and {itemCount - 1} other items</span>}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center md:items-start justify-end gap-2 shrink-0">
                {order.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      const cleanId = String(order.orderNumber || order.id || '').replace(/^#/, '');
                      window.open(`/invoice/${cleanId}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 font-bold rounded-xl transition-all text-xs shadow-2xs"
                    title="Download / Print Receipt"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Receipt
                  </button>
                )}
                <Link
                  to={`/account/orders/${String(order.orderNumber || order.id || '').replace(/^#/, '')}`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-[#EF4A45] hover:text-[#EF4A45] hover:bg-[#EF4A45]/5 font-bold rounded-xl transition-all text-xs shadow-2xs"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

