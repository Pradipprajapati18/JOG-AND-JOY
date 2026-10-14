import React, { useState, useMemo } from 'react';
import { IndianRupee, FileText, ArrowUpRight, Search, Download, Calculator, TrendingUp } from 'lucide-react';
import { useSettingsContext } from '../../context/SettingsContext';
import { useOrdersList } from '../../queries/useOrders';

export default function AdminFinancials() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [period, setPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const { formatCurrency, formatDate } = useSettingsContext();
  
  const { data: ordersData, isLoading } = useOrdersList({ pageSize: 10000 });
  const orders = ordersData?.data || [];

  const financials = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    if (period === 'today') { 
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
    } else if (period === '7d') { 
      startDate = new Date(); 
      startDate.setDate(now.getDate() - 7); 
    } else if (period === '30d') { 
      startDate = new Date(); 
      startDate.setDate(now.getDate() - 30); 
    } else if (period === 'year') { 
      startDate = new Date(now.getFullYear(), 0, 1); 
    }

    const paidOrders = orders.filter(o => o.paymentStatus === 'paid' && new Date(o.createdAt || new Date()) >= startDate);
    
    let grossRevenue = 0;
    let taxesCollected = 0;
    let gatewayFees = 0;
    
    const transactions = paidOrders.map(order => {
      const gross = order.total || 0;
      const tax = order.tax || 0;
      // Gateway fee: Flat 2.5%
      const fee = gross * 0.025; 
      const net = gross - fee;
      
      grossRevenue += gross;
      taxesCollected += tax;
      gatewayFees += fee;
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        gross,
        net,
        fee,
        tax
      };
    });
    
    // sort transactions by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const netRevenue = grossRevenue - gatewayFees;

    return {
      grossRevenue,
      netRevenue,
      taxesCollected,
      gatewayFees,
      transactions,
    };
  }, [orders, period]);

  const handleExport = () => {
    let csvData = "data:text/csv;charset=utf-8,Date,Order,Gross,Net,Fee,Tax\n";
    financials.transactions.forEach(t => {
      csvData += `${t.date},${t.orderNumber},${t.gross},${t.net},${t.fee},${t.tax}\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csvData);
    link.download = "financials_export.csv";
    link.click();
  };

  const tabs = [
    { id: 'transactions', icon: <ArrowUpRight className="w-4 h-4" />, label: 'Transactions' },
    { id: 'taxes', icon: <FileText className="w-4 h-4" />, label: 'Taxes' },
    { id: 'expenses', icon: <Calculator className="w-4 h-4" />, label: 'Fees & Expenses' },
  ];

  return (
    <div className="w-full animate-in fade-in duration-300 pb-8 sm:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Reporting</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Financials</h1>
          <p className="text-xs text-text-muted mt-1">Transactions, taxes, and expenses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs sm:text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm w-full sm:w-auto"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-white border border-slate-200 text-text-dark rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-50 shadow-sm transition-all w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button onClick={() => setActiveTab('transactions')} className="text-left p-3.5 sm:p-5 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 gap-1">
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider group-hover:text-blue-600 transition-colors truncate">Gross Revenue</p>
            <div className="p-1 sm:p-1.5 bg-success/10 rounded-lg text-success shrink-0"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-text-dark truncate">
            {isLoading ? '...' : formatCurrency(financials.grossRevenue)}
          </p>
        </button>
        <button onClick={() => setActiveTab('transactions')} className="text-left p-3.5 sm:p-5 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 gap-1">
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider group-hover:text-blue-600 transition-colors truncate">Net Revenue</p>
            <div className="p-1 sm:p-1.5 bg-zinc-100 rounded-lg text-zinc-500 shrink-0"><IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-text-dark truncate">
            {isLoading ? '...' : formatCurrency(financials.netRevenue)}
          </p>
        </button>
        <button onClick={() => setActiveTab('expenses')} className="text-left p-3.5 sm:p-5 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 gap-1">
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider group-hover:text-blue-600 transition-colors truncate">Gateway Fees</p>
            <div className="p-1 sm:p-1.5 bg-error/10 rounded-lg text-error shrink-0"><Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-text-dark truncate">
            {isLoading ? '...' : formatCurrency(financials.gatewayFees)}
          </p>
        </button>
        <button onClick={() => setActiveTab('taxes')} className="text-left p-3.5 sm:p-5 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 gap-1">
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider group-hover:text-blue-600 transition-colors truncate">Taxes Collected</p>
            <div className="p-1 sm:p-1.5 bg-info/10 rounded-lg text-info-dark shrink-0"><FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-text-dark truncate">
            {isLoading ? '...' : formatCurrency(financials.taxesCollected)}
          </p>
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col md:flex-row min-h-125">
        {/* Sidebar Tabs - Horizontal scroll on mobile, vertical sidebar on desktop */}
        <div className="w-full md:w-64 shrink-0 bg-zinc-50/50 border-b md:border-b-0 md:border-r border-slate-200 p-2 sm:p-4 flex flex-row md:flex-col overflow-x-auto gap-1 custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap shrink-0 md:shrink md:w-full text-left px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 sm:gap-3 ${
                activeTab === tab.id ? 'bg-white border border-slate-200 shadow-sm text-text-dark' : 'text-text-muted hover:bg-zinc-100/50 hover:text-text-primary'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-600' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeTab === 'transactions' && (
            <div className="p-3.5 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg font-bold text-text-dark">Recent Transactions</h2>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search Order Ref..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg text-xs sm:text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-blue-600 w-full sm:w-auto"
                  >
                    <option value="date-desc">Sort by: Newest</option>
                    <option value="date-asc">Sort by: Oldest</option>
                    <option value="amount-desc">Sort by: Highest Amount</option>
                    <option value="amount-asc">Sort by: Lowest Amount</option>
                  </select>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[460px]">
                    <thead className="border-b border-slate-100 text-[11px] sm:text-xs font-bold text-zinc-500 bg-zinc-50/30">
                      <tr><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium">Date</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium">Order / Ref</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium text-right">Gross</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium text-right">Net</th></tr>
                    </thead>
                  <tbody className="divide-y divide-slate-100">
                    {financials.transactions.length === 0 && (
                      <tr><td colSpan="4" className="px-4 py-8 text-center text-text-muted">No transactions found</td></tr>
                    )}
                    {financials.transactions
                      .filter(t => {
                        if (!searchQuery) return true;
                        const search = searchQuery.toLowerCase();
                        const orderRef = (t.orderNumber || t.id || '').toLowerCase();
                        return orderRef.includes(search);
                      })
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'amount-desc':
                            return b.gross - a.gross;
                          case 'amount-asc':
                            return a.gross - b.gross;
                          case 'date-asc':
                            return new Date(a.date).getTime() - new Date(b.date).getTime();
                          case 'date-desc':
                          default:
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                        }
                      })
                      .map(t => (
                        <tr key={t.id} className="hover:bg-zinc-50">
                          <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-text-muted whitespace-nowrap">{formatDate(t.date, true)}</td>
                          <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-text-dark whitespace-nowrap">#{t.orderNumber || (t.id ? t.id.slice(0, 8) : 'N/A')}</td>
                          <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-right whitespace-nowrap">{formatCurrency(t.gross)}</td>
                          <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-right font-bold text-success-dark whitespace-nowrap">{formatCurrency(t.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="p-3.5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4">Tax Liability</h2>
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[420px]">
                    <thead className="border-b border-slate-100 text-[11px] sm:text-xs font-bold text-zinc-500 bg-zinc-50/30">
                      <tr><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium">Region</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium text-right">Sales Subject to Tax</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium text-right">Tax Collected</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-zinc-50">
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-text-dark whitespace-nowrap">Default Region (Store)</td>
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-right whitespace-nowrap">{formatCurrency(financials.grossRevenue - financials.taxesCollected)}</td>
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-right font-bold whitespace-nowrap">{formatCurrency(financials.taxesCollected)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="p-3.5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-text-dark mb-4">Platform Fees & Expenses</h2>
              <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[420px]">
                    <thead className="border-b border-slate-100 text-[11px] sm:text-xs font-bold text-zinc-500 bg-zinc-50/30">
                      <tr><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium">Category</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium">Details</th><th className="px-3.5 sm:px-5 py-2.5 sm:py-3 font-medium text-right">Amount</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-zinc-50">
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 font-bold text-text-dark whitespace-nowrap">Payment Gateway</td>
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-text-muted whitespace-nowrap">2.5% per transaction</td>
                        <td className="px-3.5 sm:px-4 py-2.5 sm:py-3 text-right font-bold text-error whitespace-nowrap">{formatCurrency(financials.gatewayFees)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
