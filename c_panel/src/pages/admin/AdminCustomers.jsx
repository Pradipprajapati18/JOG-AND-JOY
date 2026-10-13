import React, { useState, useMemo } from 'react';
import { useCustomersList } from '../../queries/useCustomers';
import { useOrdersList } from '../../queries/useOrders';
import { Users, Search, ShoppingBag, ArrowUpRight, FileText, X, Mail, Phone, MapPin, Calendar, CheckCircle, Package } from 'lucide-react';
import { useSettingsContext } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const { data: customersData, isLoading } = useCustomersList({ pageSize: 10000 });
  const { formatCurrency, formatDate } = useSettingsContext();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, returning, new
  const [sortBy, setSortBy] = useState('newest'); // newest, spent, orders
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = useMemo(() => {
    return customersData?.data || [];
  }, [customersData]);

  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    // Apply Type Filter
    if (filterType === 'returning') result = result.filter(c => (c.totalOrders || 0) > 1);
    if (filterType === 'new') result = result.filter(c => (c.totalOrders || 0) <= 1);

    // Apply Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.postalCode?.toLowerCase().includes(q)
      );
    }

    // Apply Sort
    result.sort((a, b) => {
      if (sortBy === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0);
      // newest (default by createdAt if available, else fallback)
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return result;
  }, [customers, search, filterType, sortBy]);

  const { data: allOrdersData } = useOrdersList({ pageSize: 10000 });
  
  // Filter orders specifically for the selected customer drawer
  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer || !allOrdersData?.data) return [];
    
    return allOrdersData.data.filter(o => {
      const matchEmail = selectedCustomer.email && selectedCustomer.email !== 'N/A' && 
        (o.customerInfo?.email === selectedCustomer.email || o.shippingAddress?.email === selectedCustomer.email || o.email === selectedCustomer.email);
      
      const matchPhone = selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && 
        (o.shippingAddress?.phone === selectedCustomer.phone || o.phone === selectedCustomer.phone);
        
      const matchId = o.customerId === selectedCustomer.id || o.userId === selectedCustomer.id || o.customerInfo?.id === selectedCustomer.id;
      
      return matchEmail || matchPhone || matchId;
    });
  }, [selectedCustomer, allOrdersData]);


  const exportToCSV = () => {
    if (!filteredCustomers.length) return;
    const headers = ["Name", "Email", "Phone", "City", "Total Orders", "LTV (INR)", "Last Order Date"];
    const rows = filteredCustomers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.email || '',
      c.phone || '',
      `"${(c.city || '').replace(/"/g, '""')}"`,
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DELIVERED': return 'bg-green-500/10 text-green-700';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-700';
      case 'CANCELLED': case 'REFUNDED': return 'bg-red-500/10 text-red-700';
      default: return 'bg-orange-500/10 text-orange-700';
    }
  };

  const getRelativeDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'});
  };

  const purchasingCustomersCount = customers.filter(c => (c.totalOrders || 0) > 0).length;
  const repeatCustomersCount = customers.filter(c => (c.totalOrders || 0) > 1).length;
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const averageLTV = purchasingCustomersCount ? totalSpentAll / purchasingCustomersCount : 0;
  const repeatRate = purchasingCustomersCount ? Math.round((repeatCustomersCount / purchasingCustomersCount) * 100) : 0;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark">Customers</h1>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-text-dark font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm">
          <FileText className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button onClick={() => { setFilterType('all'); setSortBy('newest'); }} className="text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="font-bold text-zinc-500 mb-4 group-hover:text-blue-600 transition-colors">Total Customers</p>
          <p className="text-2xl font-black text-text-dark">{customers.length}</p>
        </button>
        <button onClick={() => { setFilterType('all'); setSortBy('spent'); }} className="text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="font-bold text-zinc-500 mb-4 group-hover:text-blue-600 transition-colors">Average LTV</p>
          <p className="text-2xl font-black text-text-dark">
            {formatCurrency(averageLTV)}
          </p>
        </button>
        <button onClick={() => { setFilterType('returning'); setSortBy('newest'); }} className="text-left p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="font-bold text-zinc-500 mb-4 group-hover:text-blue-600 transition-colors">Repeat Rate</p>
          <p className="text-2xl font-black text-text-dark">
            {repeatRate}%
          </p>
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Customers</option>
              <option value="returning">Returning ({'>'}1 orders)</option>
              <option value="new">New (0-1 orders)</option>
            </select>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="spent">Sort by: Highest Spent</option>
              <option value="orders">Sort by: Most Orders</option>
            </select>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading customers...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium text-center">Orders</th>
                  <th className="px-5 py-3 font-medium">Lifetime Value</th>
                  <th className="px-5 py-3 font-medium">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-text-muted">
                      <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="font-bold text-text-dark">No customers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => setSelectedCustomer(c)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-text-dark">{c.name}</p>
                          {c.isGuest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                              Guest
                            </span>
                          )}
                        </div>
                        {c.totalOrders > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 mt-1">
                            Repeat
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{c.email}</p>
                        <p className="text-xs text-text-muted">{c.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm max-w-[200px] truncate">
                        {(() => {
                          const addr = c.addresses?.[0];
                          const city = c.city || addr?.city;
                          const state = c.state || addr?.state;
                          if (city) return `${city}${state ? `, ${state}` : ''}`;
                          return c.address || addr?.line1 || 'N/A';
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {c.totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-text-dark">
                        {formatCurrency(c.totalSpent || 0)}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-xs font-medium">
                        {getRelativeDate(c.lastOrderDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Details Drawer Overlay */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setSelectedCustomer(null)}
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-sm">
                  {(selectedCustomer.name || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedCustomer.name || 'Guest User'}</h2>
                    {selectedCustomer.isGuest && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500">{selectedCustomer.totalOrders || 0} Orders • {formatCurrency(selectedCustomer.totalSpent || 0)} LTV</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Contact Info */}
              <div className="p-6 border-b border-slate-100 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contact Information</h3>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.email !== 'N/A' ? selectedCustomer.email : 'No Email Provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.phone !== 'N/A' ? selectedCustomer.phone : 'No Phone Provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.address || selectedCustomer.addresses?.[0]?.line1 || 'No Address Provided'}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {(() => {
                        const addr = selectedCustomer.addresses?.[0];
                        const city = selectedCustomer.city || addr?.city;
                        const state = selectedCustomer.state || addr?.state;
                        const pin = selectedCustomer.postalCode || addr?.postalCode;
                        if (city || state || pin) return `${city || ''}${state ? `, ${state}` : ''} ${pin || ''}`.trim();
                        return 'N/A';
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="p-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  Order History
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{selectedCustomerOrders?.length || 0}</span>
                </h3>
                
                <div className="space-y-3">
                  {(selectedCustomerOrders || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => (
                    <div key={order.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition-colors bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link to={`/admin/orders?search=${order.orderNumber || order.id}`} className="text-sm font-black text-blue-600 hover:underline">
                            #{order.orderNumber || order.id.slice(0,8)}
                          </Link>
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatCurrency(order.total)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase ${getStatusBadge(order.status)}`}>
                            {order.status || 'PROCESSING'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                        <Package className="w-3.5 h-3.5" />
                        {order.items?.length || 0} item(s) • {order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Actions Footer */}
            {selectedCustomer.email !== 'N/A' && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <a 
                  href={`mailto:${selectedCustomer.email}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-slate-200 text-[#003366] font-extrabold text-sm shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Customer
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
