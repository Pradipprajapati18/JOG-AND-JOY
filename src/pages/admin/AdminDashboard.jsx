import React, { useState } from 'react';
import { Package, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrdersList } from '../../queries/useOrders';
import { useSettingsContext } from '../../context/SettingsContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProductsList } from '../../queries/useProducts';

export default function AdminDashboard() {
  const [period, setPeriod] = useState('30d');
  const { formatCurrency, formatCompactCurrency, formatDate } = useSettingsContext();
  const { data: ordersData, isLoading: isLoadingOrders } = useOrdersList({ pageSize: 10000 });
  const { data: productsData } = useProductsList();
  
  const orders = ordersData?.data || [];
  
  // Filtering logic
  const now = new Date();
  let startDate = new Date(0);
  let prevStartDate = new Date(0);
  let prevEndDate = new Date(0);

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), prevEndDate.getDate());
  }
  else if (period === 'week') {
    startDate = new Date(); startDate.setDate(now.getDate() - 7);
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate); prevStartDate.setDate(prevEndDate.getDate() - 7);
  }
  else if (period === '30d') {
    startDate = new Date(); startDate.setDate(now.getDate() - 30);
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate); prevStartDate.setDate(prevEndDate.getDate() - 30);
  }
  else if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), 1);
  }
  else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getFullYear(), 0, 1);
  }

  const filteredOrders = orders.filter(o => {
    const d = new Date(o.createdAt || new Date());
    if (period === 'last_month') {
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return d >= startDate && d <= endOfLastMonth;
    }
    return d >= startDate;
  });

  const validOrders = filteredOrders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
  
  const prevOrders = orders.filter(o => {
    const d = new Date(o.createdAt || new Date());
    return d >= prevStartDate && d <= prevEndDate;
  }).filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');

  // KPIs
  const totalSales = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = validOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  const prevSales = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const prevOrdersCount = prevOrders.length;
  const prevAov = prevOrdersCount > 0 ? prevSales / prevOrdersCount : 0;

  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const salesTrend = calculateTrend(totalSales, prevSales);
  const ordersTrend = calculateTrend(totalOrdersCount, prevOrdersCount);
  const aovTrend = calculateTrend(avgOrderValue, prevAov);
  
  // Customers
  const allValidOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REFUNDED');
  const customerOrderHistory = {};
  allValidOrders.forEach(o => {
    const customerId = o.customerInfo?.email || o.shippingAddress?.email || o.userId || o.shippingAddress?.phone || o.shippingAddress?.fullName || o.shippingAddress?.name || o.customerInfo?.name || o.id;
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
    
    const ordersInPeriod = dates.filter(d => {
      if (period === 'last_month') {
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return d >= startDate && d <= endOfLastMonth;
      }
      return d >= startDate;
    });

    if (ordersInPeriod.length > 0) {
      if (firstOrderDate >= startDate) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }
  });

  // Sales Over Time Chart Data
  let chartData = [];
  let days = period === 'today' ? 1 : period === 'week' ? 7 : period === '30d' || period === 'last_month' ? 30 : 12;
  
  if (period === 'year') {
    chartData = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(startDate.getFullYear(), i, 1);
      const monthStr = d.toISOString().substring(0, 7);
      const val = validOrders.filter(o => o.createdAt?.startsWith(monthStr)).reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: d.toLocaleDateString('en-US', { month: 'short' }), sales: val };
    });
  } else {
    chartData = Array.from({ length: days }).map((_, i) => {
      const d = new Date(period === 'last_month' ? now : new Date());
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const val = validOrders.filter(o => o.createdAt?.startsWith(dateStr)).reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: days > 7 ? d.getDate() : d.toLocaleDateString('en-US', { weekday: 'short' }), sales: val };
    });
  }

  // Order Status Distribution
  const statusCounts = { PROCESSING: 0, SHIPPED: 0, Others: 0, DELIVERED: 0, CANCELLED: 0, REFUNDED: 0 };
  filteredOrders.forEach(o => {
    const s = o.status || 'PROCESSING';
    if (statusCounts[s] !== undefined && s !== 'Others') {
      statusCounts[s] += 1;
    } else {
      statusCounts['Others'] += 1;
    }
  });

  const statusData = [
    { name: 'PROCESSING', value: statusCounts.PROCESSING },
    { name: 'SHIPPED', value: statusCounts.SHIPPED },
    { name: 'DELIVERED', value: statusCounts.DELIVERED },
    { name: 'CANCELLED', value: statusCounts.CANCELLED },
    { name: 'REFUNDED', value: statusCounts.REFUNDED },
    { name: 'Others', value: statusCounts.Others }
  ].filter(item => item.value > 0 || item.name === 'SHIPPED' || item.name === 'Others');
  
  const STATUS_COLORS = ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9'];

  // Payment Method Distribution
  const paymentCounts = {};
  filteredOrders.forEach(o => {
    const p = o.paymentMethod === 'cod' ? 'COD' : 'Prepaid';
    paymentCounts[p] = (paymentCounts[p] || 0) + 1;
  });
  const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));
  const PAYMENT_COLORS = ['#3b82f6', '#93c5fd'];

  // Recent Orders (Top 6)
  const recentOrders = [...validOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  // Product Performance
  const productStats = {};
  validOrders.forEach(o => {
    o.items?.forEach(item => {
      const title = item.titleSnapshot || 'Unknown';
      if (!productStats[title]) productStats[title] = { name: title, units: 0, rev: 0 };
      productStats[title].units += item.quantity || 1;
      productStats[title].rev += (item.unitPrice || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productStats).sort((a, b) => b.rev - a.rev).slice(0, 5);

  const TrendBadge = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isPositive ? 'bg-success/15 text-success-dark' : 'bg-error/15 text-error'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-success-dark bg-success/10';
      case 'SHIPPED': return 'text-info-dark bg-info/10';
      case 'PROCESSING': return 'text-warning-dark bg-warning/10';
      case 'CANCELLED': case 'REFUNDED': return 'text-error bg-error/10';
      default: return 'text-zinc-600 bg-zinc-100';
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark">Overview</h1>
        </div>
        <select 
          value={period} 
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="30d">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/admin/financials" className="block p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="font-bold text-zinc-500 group-hover:text-blue-600 transition-colors">Total Sales</p>
            <TrendBadge value={salesTrend} />
          </div>
          <p className="text-2xl font-black text-text-dark">{formatCompactCurrency(totalSales)}</p>
        </Link>
        <Link to="/admin/orders" className="block p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="font-bold text-zinc-500 group-hover:text-blue-600 transition-colors">Total Orders</p>
            <TrendBadge value={ordersTrend} />
          </div>
          <p className="text-2xl font-black text-text-dark">{totalOrdersCount}</p>
        </Link>
        <Link to="/admin/analytics" className="block p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="font-bold text-zinc-500 group-hover:text-blue-600 transition-colors">Avg Order Value</p>
            <TrendBadge value={aovTrend} />
          </div>
          <p className="text-2xl font-black text-text-dark">{formatCompactCurrency(avgOrderValue)}</p>
        </Link>
        <Link to="/admin/customers" className="block p-5 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group">
          <p className="font-bold text-zinc-500 mb-4 group-hover:text-blue-600 transition-colors">Customers</p>
          <div className="flex justify-between items-end">
            <div><p className="text-xl font-black text-text-dark">{newCustomers}</p><p className="text-[10px] font-bold text-zinc-400 uppercase">New</p></div>
            <div className="text-right"><p className="text-xl font-black text-text-dark">{returningCustomers}</p><p className="text-[10px] font-bold text-zinc-400 uppercase">Returning</p></div>
          </div>
        </Link>
      </div>

      {/* Row 2: Sales Chart & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="font-bold text-text-dark mb-6">Sales Overview</h2>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="sales" stroke="#334155" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 bg-zinc-50/50">
            <h2 className="font-bold text-text-dark flex items-center gap-2"><Package className="w-4 h-4 text-zinc-400"/> Top Products</h2>
          </div>
          <div className="divide-y divide-slate-50 px-4 py-2 flex-1">
            {topProducts.length === 0 ? <p className="text-zinc-400 py-4 text-center">No data.</p> : 
              topProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-3">
                  <p className="font-medium text-text-dark truncate mr-2">{p.name}</p>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-text-dark">{formatCurrency(p.rev)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders & Payment Modes / Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="font-bold text-text-dark">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="px-5 py-8 text-center text-zinc-400">No recent orders.</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-text-dark">
                        <Link to="/admin/orders" className="hover:text-blue-600 hover:underline">#{order.orderNumber || (order.id ? order.id.slice(0, 8) : 'N/A')}</Link>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{formatDate(order.createdAt, true)}</td>
                      <td className="px-5 py-3 text-text-dark font-medium">{order.shippingAddress?.name || order.shippingAddress?.fullName || 'Guest'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-text-dark">{formatCurrency(order.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Payment Modes & Top Products */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-text-dark mb-4">Payment Modes</h2>
            {paymentData.length > 0 ? (
              <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                      {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-zinc-400 text-center py-4">No data</p>}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
               {paymentData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }}></span>
                    {s.name} <span className="font-bold text-text-dark ml-0.5">{s.value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col flex-1 justify-between">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-text-dark">Order Status</h2>
              <div className="text-right">
                <span className="text-sm font-black text-text-dark">{filteredOrders.length}</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Orders</span>
              </div>
            </div>
            {statusData.length > 0 ? (
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-sm text-zinc-400 text-center py-8">No data</p>}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
               {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}></span>
                    {s.name} <span className="font-bold text-text-dark ml-0.5">{s.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
