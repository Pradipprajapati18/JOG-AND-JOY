import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, ShoppingBag, Globe, Plus, Filter, PieChart, Activity, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { useRevenueSummary } from '../../queries/useFinancials';
import { useOrdersList } from '../../queries/useOrders';
import { useCustomersList } from '../../queries/useCustomers';
import { useProductsList } from '../../queries/useProducts';
import { useCategoriesList } from '../../queries/useCategories';
import { useSettingsContext } from '../../context/SettingsContext';

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('30d');
  const { formatCurrency } = useSettingsContext();

  const { data: summary, isLoading } = useRevenueSummary();
  const { data: ordersData } = useOrdersList({ pageSize: 10000 });
  const { data: customersData } = useCustomersList({ pageSize: 10000 });
  const { data: productsData } = useProductsList({ pageSize: 10000 });
  const { data: categoriesData } = useCategoriesList({ pageSize: 1000 });

  const orders = ordersData?.data || [];
  const customers = customersData?.data || [];
  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const now = new Date();
  let startDate = new Date();
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(0); // all time
  }

  const filteredOrders = orders.filter(o => new Date(o.createdAt || now) >= startDate);
  const filteredCustomers = customers.filter(c => new Date(c.createdAt || now) >= startDate);

  // Dynamic Chart Data based on Period
  let chartData = [];
  if (period === 'year') {
    chartData = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now.getFullYear(), i, 1);
      const monthStr = d.toISOString().substring(0, 7);
      const monthOrders = filteredOrders.filter(o => o.createdAt?.startsWith(monthStr) && o.status !== 'cancelled');
      const value = monthOrders.reduce((sum, o) => sum + (o.total || ((o.subtotal || 0) + (o.tax || 0) + (o.shippingCost || 0) - (o.discountAmount || 0))), 0);
      return { label: d.toLocaleDateString('en-US', { month: 'short' }), value };
    });
  } else if (period === 'all') {
    chartData = Array.from({ length: 5 }).map((_, i) => {
      const year = now.getFullYear() - (4 - i);
      const yearStr = String(year);
      const yearOrders = filteredOrders.filter(o => o.createdAt?.startsWith(yearStr) && o.status !== 'cancelled');
      const value = yearOrders.reduce((sum, o) => sum + (o.total || ((o.subtotal || 0) + (o.tax || 0) + (o.shippingCost || 0) - (o.discountAmount || 0))), 0);
      return { label: yearStr, value };
    });
  } else {
    let days = period === 'today' ? 1 : period === '30d' ? 30 : 7;
    chartData = Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = filteredOrders.filter(o => o.createdAt?.startsWith(dateStr) && o.status !== 'cancelled');
      const value = dayOrders.reduce((sum, o) => sum + (o.total || ((o.subtotal || 0) + (o.tax || 0) + (o.shippingCost || 0) - (o.discountAmount || 0))), 0);
      return { label: days > 7 ? d.getDate() : d.toLocaleDateString('en-US', { weekday: 'short' }), value };
    });
  }
  const maxVal = Math.max(...chartData.map(d => d.value), 100);

  // Real logic for Top Products and Categories
  const productStats = {};
  const categoryStats = {};
  filteredOrders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items?.forEach(item => {
        const title = item.titleSnapshot || item.title || item.name || 'Unknown Product';
        const key = item.productId || title;
        if (!productStats[key]) {
          productStats[key] = { name: title, units: 0, revenue: 0 };
        }
        productStats[key].units += item.quantity || 1;
        productStats[key].revenue += ((item.unitPrice || item.price) * (item.quantity || 1)) || 0;

        let category = item.category;
        if (!category && item.productId) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const categoryId = product.categoryId || product.category;
            const matchedCat = categories.find(c => c.id === categoryId || c.label === categoryId);
            if (matchedCat) {
              category = matchedCat.label;
            } else {
              category = categoryId;
            }
          }
        }
        category = category || 'Uncategorized';
        
        if (!categoryStats[category]) {
          categoryStats[category] = { name: category, units: 0 };
        }
        categoryStats[category].units += item.quantity || 1;
      });
    }
  });
  const topProducts = Object.values(productStats).sort((a, b) => b.units - a.units).slice(0, 10);
  const topCategories = Object.values(categoryStats).sort((a, b) => b.units - a.units).slice(0, 10);

  // KPI Calculations
  const totalOrdersCount = filteredOrders.length;
  
  // Returning Customer Rate
  const allValidOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
  const customerOrderHistory = {};
  allValidOrders.forEach(o => {
    const customerId = o.customerId || o.customerInfo?.email || o.shippingAddress?.email || o.userId || o.shippingAddress?.phone || o.id;
    if (customerId) {
      if (!customerOrderHistory[customerId]) {
        customerOrderHistory[customerId] = [];
      }
      customerOrderHistory[customerId].push(new Date(o.createdAt || new Date()));
    }
  });

  let newCustomers = 0;
  let returningCustomers = 0;
  
  Object.values(customerOrderHistory).forEach(dates => {
    dates.sort((a, b) => a - b);
    const firstOrderDate = dates[0];
    const ordersInPeriod = dates.filter(d => d >= startDate);

    if (ordersInPeriod.length > 0) {
      if (firstOrderDate >= startDate) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }
  });

  const totalActiveCustomers = newCustomers + returningCustomers;
  const returningRate = totalActiveCustomers > 0 ? ((returningCustomers / totalActiveCustomers) * 100).toFixed(1) : 0;

  // Gross vs Net
  const grossSales = filteredOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const netSales = grossSales - totalDiscounts;

  // Promotion Tracking
  const promoStats = {};
  filteredOrders.forEach(o => {
    if (o.promotionCodeApplied && o.discountAmount) {
      if (!promoStats[o.promotionCodeApplied]) {
        promoStats[o.promotionCodeApplied] = { code: o.promotionCodeApplied, uses: 0, totalDiscount: 0 };
      }
      promoStats[o.promotionCodeApplied].uses += 1;
      promoStats[o.promotionCodeApplied].totalDiscount += o.discountAmount;
    }
  });
  const topPromos = Object.values(promoStats).sort((a, b) => b.totalDiscount - a.totalDiscount);

  // Payment Status Distribution
  const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid').length;
  const pendingOrdersCount = filteredOrders.filter(o => o.paymentStatus === 'pending' || !o.paymentStatus).length;
  const paidPercent = totalOrdersCount > 0 ? Math.round((paidOrders / totalOrdersCount) * 100) : 0;
  const pendingPercent = totalOrdersCount > 0 ? 100 - paidPercent : 0;

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === 'sales') {
      csvContent += "Date,Sales\n";
      chartData.forEach(d => { csvContent += `${d.label},${d.value}\n`; });
    } else if (activeTab === 'products') {
      csvContent += "Product,Units Sold,Revenue\n";
      topProducts.forEach(p => { csvContent += `"${p.name}",${p.units},${p.revenue}\n`; });
    } else if (activeTab === 'customers') {
      csvContent += "Metric,Value\n";
      csvContent += `Total Customers,${filteredCustomers.length}\n`;
      csvContent += `Avg Orders / Customer,${filteredCustomers.length > 0 ? (filteredOrders.length / filteredCustomers.length).toFixed(1) : '0'}\n`;
      csvContent += `Returning Customer Rate,${returningRate}%\n`;
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `analytics_${activeTab}_export.csv`;
    link.click();
  };

  // Chart Data for Orders (Count)
  let ordersChartData = chartData.map(d => {
    // Find the original day/month/year mapping to get order counts
    let count = 0;
    if (period === 'year') {
      const monthStr = new Date(now.getFullYear(), chartData.indexOf(d), 1).toISOString().substring(0, 7);
      count = filteredOrders.filter(o => o.createdAt?.startsWith(monthStr) && o.status !== 'cancelled').length;
    } else if (period === 'all') {
      const yearStr = d.label;
      count = filteredOrders.filter(o => o.createdAt?.startsWith(yearStr) && o.status !== 'cancelled').length;
    } else {
      let days = period === 'today' ? 1 : period === '30d' ? 30 : 7;
      const date = new Date();
      date.setDate(now.getDate() - (days - 1 - chartData.indexOf(d)));
      const dateStr = date.toISOString().split('T')[0];
      count = filteredOrders.filter(o => o.createdAt?.startsWith(dateStr) && o.status !== 'cancelled').length;
    }
    return { ...d, orders: count };
  });

  // Order Status Distribution for Pie Chart
  const statusCounts = {
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
    RETURNS: 0
  };
  
  filteredOrders.forEach(o => {
    if (['RETURN_REQUESTED', 'EXCHANGE_REQUESTED', 'RETURN_APPROVED', 'EXCHANGE_APPROVED', 'RETURN_REJECTED', 'RETURNS'].includes(o.status)) {
      statusCounts.RETURNS++;
    } else if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  const pieData = [
    { name: 'Processing', value: statusCounts.PROCESSING, color: '#f59e0b' },
    { name: 'Shipped', value: statusCounts.SHIPPED, color: '#3b82f6' },
    { name: 'Delivered', value: statusCounts.DELIVERED, color: '#10b981' },
    { name: 'Cancelled', value: statusCounts.CANCELLED, color: '#ef4444' },
    { name: 'Returns/Exch', value: statusCounts.RETURNS, color: '#8b5cf6' }
  ].filter(d => d.value > 0);


  const tabs = [
    { id: 'sales', icon: <TrendingUp className="w-4 h-4" />, label: 'Sales' },
    { id: 'orders', icon: <FileText className="w-4 h-4" />, label: 'Orders' },
    { id: 'products', icon: <ShoppingBag className="w-4 h-4" />, label: 'Products' },
    { id: 'customers', icon: <Users className="w-4 h-4" />, label: 'Customers' },
  ];

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Reporting</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Analytics</h1>
          <p className="text-xs text-text-muted mt-1">Data driven insights and custom reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-text-dark rounded-xl font-bold text-sm hover:bg-bg-base transition-colors shadow-sm transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button onClick={() => setActiveTab('sales')} className="text-left p-5 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:border-blue-300 hover:shadow-md group">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Total Sales</p>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-black text-text-dark">{isLoading ? '...' : formatCurrency(summary?.totalRevenue || 0)}</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('sales')} className="text-left p-5 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:border-blue-300 hover:shadow-md group">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Avg Order Value</p>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-black text-text-dark">{isLoading ? '...' : formatCurrency(summary?.totalRevenue / (summary?.totalOrders || 1) || 0)}</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('orders')} className="text-left p-5 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:border-blue-300 hover:shadow-md group">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Total Orders</p>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-black text-text-dark">{totalOrdersCount}</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('sales')} className="text-left p-5 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:border-blue-300 hover:shadow-md group flex flex-col justify-between">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Net Sales</p>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-black text-blue-600">{isLoading ? '...' : formatCurrency(netSales)}</p>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 mt-2">GROSS: {formatCurrency(grossSales)}</p>
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col md:flex-row min-h-125">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 bg-zinc-50/50 border-r border-slate-200 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-3 ${activeTab === tab.id ? 'bg-white border border-slate-200 shadow-sm text-text-dark' : 'text-text-muted hover:bg-zinc-100/50 hover:text-text-primary'
                }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-600' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-dark">{tabs.find(t => t.id === activeTab)?.label} Overview</h2>
          </div>

          <div className="p-6">
            {activeTab === 'sales' ? (
              <div className="space-y-6">
                <div className="h-72 bg-white border border-slate-200 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), "Sales"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border border-slate-200 rounded-xl bg-white h-80 flex flex-col">
                    <h3 className="font-bold text-sm mb-4 text-text-dark">Top Categories by Units Sold</h3>
                    <div className="flex-1 min-h-0">
                      {topCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topCategories} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                            <Tooltip 
                              cursor={{ fill: '#f1f5f9' }}
                              formatter={(value) => [value, "Units Sold"]}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-medium">No category data for this period</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-80 bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
                    <h3 className="font-bold text-text-dark mb-4 text-sm">Orders Over Time</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ordersChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} allowDecimals={false} />
                          <Tooltip 
                            cursor={{ fill: '#f1f5f9' }}
                            formatter={(value) => [value, "Orders"]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="h-80 bg-white border border-slate-200 rounded-xl p-4 flex flex-col">
                    <h3 className="font-bold text-text-dark mb-2 text-sm">Order Status</h3>
                    <div className="flex-1 min-h-0">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [value, "Orders"]}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-medium">No order data for this period</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'products' ? (
              <div className="space-y-4">
                <h3 className="font-bold text-text-dark mb-4">Top Products by Units Sold</h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                      <tr><th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium text-right">Units</th><th className="px-5 py-3 font-medium text-right">Revenue</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.length === 0 ? (
                        <tr><td colSpan="3" className="px-4 py-3 text-center text-text-muted">No product data available.</td></tr>
                      ) : topProducts.map((p, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-text-dark line-clamp-1">{p.name || 'Unknown Product'}</td>
                          <td className="px-4 py-3 text-right">{p.units}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'customers' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white text-center">
                  <Users className="w-8 h-8 text-text-dark mx-auto mb-2" />
                  <p className="text-3xl font-black text-text-dark">{filteredCustomers.length}</p>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Total Customers</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-white text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-black text-text-dark">
                    {filteredCustomers.length > 0 ? (filteredOrders.length / filteredCustomers.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Avg Orders / Customer</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
