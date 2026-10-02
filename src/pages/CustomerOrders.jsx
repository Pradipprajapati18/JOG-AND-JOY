import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrdersList } from '../queries/useOrders';

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
          const firstItem = order.items?.[0];
          const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const orderNumber = order.orderNumber || `#${order.id.substring(0,8).toUpperCase()}`;
          
          return (
            <div key={order.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
              {/* Order Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-800 text-lg">{orderNumber}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status || 'PROCESSING'}
                  </span>
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
                {firstItem && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100/60">
                    {firstItem.image ? (
                      <img src={firstItem.image} alt="Product" className="w-10 h-10 rounded border border-slate-200 object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">IMG</div>
                    )}
                    <span className="text-sm text-slate-600 truncate max-w-[200px] md:max-w-[300px]">
                      {firstItem.titleSnapshot} {itemCount > 1 && <span className="text-slate-400 font-medium ml-1">and {itemCount - 1} other items</span>}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex items-center md:items-start justify-end shrink-0">
                <Link 
                  to={`/account/orders/${order.id}`}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-[#EF4A45] hover:text-[#EF4A45] hover:bg-[#EF4A45]/5 font-bold rounded-xl transition-all"
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
