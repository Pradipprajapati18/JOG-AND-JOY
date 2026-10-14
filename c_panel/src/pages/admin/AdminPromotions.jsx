import React, { useState } from 'react';
import { Tag, Plus, Trash2, Search, Edit2, CheckCircle2, Clock, X, Percent, TrendingDown, Gift, Truck } from 'lucide-react';
import { usePromotionsList, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../../queries/usePromotions';
import { useSettingsContext } from '../../context/SettingsContext';

const formatForInput = (isoString) => {
  if (!isoString) return '';
  if (isoString.includes('T') && isoString.length === 16) return isoString;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  } catch (e) {
    return '';
  }
};

export default function AdminPromotions() {
  const [activeTab, setActiveTab] = useState('active');
  const [filterDiscountType, setFilterDiscountType] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({});

  const { formatCurrency, formatDate } = useSettingsContext();

  const { data, isLoading } = usePromotionsList();
  let promotions = data?.data || [];

  const createMut = useCreatePromotion();
  const updateMut = useUpdatePromotion();
  const deleteMut = useDeletePromotion();

  const now = new Date();
  if (activeTab === 'active') promotions = promotions.filter(p => p.active && (!p.startsAt || new Date(p.startsAt) <= now) && (!p.expiresAt || new Date(p.expiresAt) >= now));
  if (activeTab === 'scheduled') promotions = promotions.filter(p => p.startsAt && new Date(p.startsAt) > now);
  if (activeTab === 'expired') promotions = promotions.filter(p => p.expiresAt && new Date(p.expiresAt) < now);

  if (filterDiscountType !== 'all') {
    promotions = promotions.filter(p => p.discountType === filterDiscountType);
  }

  if (search) {
    const q = search.toLowerCase();
    promotions = promotions.filter(p => 
      (p.title || '').toLowerCase().includes(q) || 
      (p.code || '').toLowerCase().includes(q)
    );
  }

  const handleOpenEdit = (promo = null) => {
    if (promo) {
      const formattedPromo = { ...promo };
      if (formattedPromo.startsAt) {
        const d = new Date(formattedPromo.startsAt);
        formattedPromo.startsAt = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      }
      if (formattedPromo.expiresAt) {
        const d = new Date(formattedPromo.expiresAt);
        formattedPromo.expiresAt = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      }
      setEditingPromo(promo);
      setFormData(formattedPromo);
    } else {
      setEditingPromo(null);
      setFormData({
        title: '',
        method: 'code',
        code: '',
        discountType: 'percentage',
        value: 10,
        targetScope: 'entire_order',
        active: true,
        usageLimit: null,
        usageCount: 0,
        minOrderValue: 0
      });
    }
    setView('edit');
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const payload = { ...formData };
    if (payload.startsAt) {
      payload.startsAt = new Date(payload.startsAt).toISOString();
    }
    if (payload.expiresAt) {
      payload.expiresAt = new Date(payload.expiresAt).toISOString();
    }

    if (payload.method === 'automatic' && !payload.code) {
      // Generate a unique dummy code for automatic promotions to bypass UNIQUE NOT NULL constraints
      payload.code = `AUTO-${Date.now()}`;
    }

    if (editingPromo) {
      updateMut.mutate({ id: editingPromo.id, patch: payload }, { onSuccess: () => setView('list') });
    } else {
      createMut.mutate({ ...payload, createdAt: new Date().toISOString() }, { onSuccess: () => setView('list') });
    }
  };

  if (view === 'edit') {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-300 px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setView('list')} className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-zinc-50 transition-colors shrink-0">
              <X className="w-5 h-5 text-zinc-500" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-dark truncate">{editingPromo ? 'Edit Promotion' : 'New Promotion'}</h1>
              <p className="text-xs sm:text-sm text-text-muted truncate">{formData.title || 'Untitled'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={() => setView('list')} className="flex-1 sm:flex-none px-4 py-2 font-bold text-xs sm:text-sm text-text-muted hover:text-text-primary text-center">Discard</button>
            <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="flex-1 sm:flex-none px-5 sm:px-6 py-2 bg-white border border-slate-200 text-[#003366] font-bold text-xs sm:text-sm rounded-xl hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-center">
              {(createMut.isPending || updateMut.isPending) ? 'Processing...' : (editingPromo ? 'Save Changes' : 'Create Promotion')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          {/* General info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm transition-all space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">General Information</h2>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Internal Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none text-sm" placeholder="e.g. Summer Sale 20%" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Discount Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="method" value="code" checked={formData.method === 'code'} onChange={e => setFormData({...formData, method: e.target.value})} className="text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-semibold">Discount Code</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="method" value="automatic" checked={formData.method === 'automatic'} onChange={e => setFormData({...formData, method: e.target.value})} className="text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-semibold">Automatic</span>
                  </label>
                </div>
              </div>
              {formData.method === 'code' && (
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Promo Code</label>
                  <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none font-mono text-sm" placeholder="SUMMER20" />
                </div>
              )}
            </div>
          </div>

          {/* Value */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm transition-all space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-text-dark">Value & Rules</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discountType" value="percentage" checked={formData.discountType === 'percentage'} onChange={e => setFormData({...formData, discountType: e.target.value})} className="text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-semibold">Percentage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="discountType" value="fixed" checked={formData.discountType === 'fixed'} onChange={e => setFormData({...formData, discountType: e.target.value})} className="text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm font-semibold">Fixed Amount</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Discount Value</label>
                <div className="relative w-full">
                  <input 
                    required 
                    type="number" 
                    min="1"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    value={formData.value} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (formData.discountType === 'percentage' && val > 100) val = 100;
                      setFormData({...formData, value: val});
                    }} 
                    className={`w-full ${formData.discountType === 'percentage' ? 'pl-8' : 'pl-10'} pr-4 py-2.5 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm`} 
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t border-slate-100 pt-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Minimum Order Value (Optional)</label>
                <div className="relative w-full">
                  <input type="number" value={formData.minOrderValue ?? ''} onChange={e => setFormData({...formData, minOrderValue: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                </div>
                <p className="text-[10px] text-text-muted mt-1 font-semibold">Set to 0 or leave empty for no minimum requirement.</p>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm transition-all space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-text-dark">Status & Schedule</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4" />
                <span className="text-sm font-bold">Active</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Start Date (Optional)</label>
                <input type="datetime-local" value={formatForInput(formData.startsAt)} onChange={e => setFormData({...formData, startsAt: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">End Date (Optional)</label>
                <input type="datetime-local" value={formatForInput(formData.expiresAt)} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-blue-600 outline-none text-sm" />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Growth</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-dark mt-0.5">Promotions</h1>
          <p className="text-xs text-text-muted mt-1">Discounts, coupons, and automatic rules</p>
        </div>
        <button onClick={() => handleOpenEdit()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-[#003366] rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-all w-full sm:w-auto">
          <Plus className="w-4 h-4 text-blue-600 shrink-0" />
          Create Promotion
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden">
        {/* Tabs and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center border-b border-slate-200 bg-zinc-50/50 p-3 sm:p-4 gap-3 sm:gap-4">
          <div className="flex overflow-x-auto w-full hide-scrollbar gap-1.5 sm:gap-2 pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'expired', label: 'Expired' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-white border border-slate-200 shadow-sm text-text-dark' 
                    : 'text-text-muted hover:text-text-primary hover:bg-zinc-100/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <select 
              value={filterDiscountType} 
              onChange={e => setFilterDiscountType(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs sm:text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search promos..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-600 text-xs sm:text-sm transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Card-Based Promos List */}
        <div className="block md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-400 font-semibold text-sm">Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="font-bold text-text-dark">No promotions found.</p>
            </div>
          ) : (
            promotions.map((promo) => {
              const now = new Date();
              let status = 'Inactive';
              let style = 'bg-zinc-200 text-zinc-600';
              if (promo.expiresAt && new Date(promo.expiresAt) < now) {
                status = 'Expired';
                style = 'bg-red-500/10 text-red-700';
              } else if (promo.startsAt && new Date(promo.startsAt) > now) {
                status = 'Scheduled';
                style = 'bg-blue-500/15 text-blue-700';
              } else if (promo.active) {
                status = 'Active';
                style = 'bg-green-500/15 text-green-700';
              }

              return (
                <div 
                  key={promo.id} 
                  onClick={() => handleOpenEdit(promo)}
                  className="p-4 hover:bg-zinc-50/70 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-text-dark text-sm sm:text-base truncate">{promo.title || 'Untitled'}</h3>
                      {promo.method === 'code' ? (
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono font-bold mt-1">
                          {promo.code}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-bold mt-1">
                          Automatic
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${style}`}>
                        {status}
                      </span>
                      {status === 'Active' && promo.expiresAt && (
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Ends in {Math.ceil((new Date(promo.expiresAt) - now) / (1000 * 60 * 60 * 24))}d
                        </span>
                      )}
                      {status === 'Scheduled' && promo.startsAt && (
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Starts in {Math.ceil((new Date(promo.startsAt) - now) / (1000 * 60 * 60 * 24))}d
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted font-bold block uppercase">Value</span>
                      <span className="font-extrabold text-text-dark text-sm">
                        {promo.discountType === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted font-bold block uppercase">Min Order</span>
                      <span className="font-semibold text-text-dark">
                        {promo.minOrderValue > 0 ? formatCurrency(promo.minOrderValue) : 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted font-bold block uppercase">Uses</span>
                      <span className="font-mono text-text-dark">
                        {promo.usageCount || 0} / {promo.usageLimit || '∞'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/60" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-text-muted capitalize font-medium">
                      Type: <strong className="text-text-dark">{promo.discountType?.replace('_', ' ')}</strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEdit(promo)} 
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteMut.mutate(promo.id)} 
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Promotion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* TABLET & DESKTOP VIEW (>= md): Comprehensive Table with min-width */}
        <div className="hidden md:block overflow-x-auto min-h-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading promotions...</div>
          ) : (
            <table className="w-full text-left text-sm min-w-[680px]">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500 bg-zinc-50/50">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Title / Code</th>
                  <th className="px-5 py-3.5 font-medium">Type</th>
                  <th className="px-5 py-3.5 font-medium">Value</th>
                  <th className="px-5 py-3.5 font-medium">Rules</th>
                  <th className="px-5 py-3.5 font-medium">Uses</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-text-muted">
                      <Tag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="font-bold text-text-dark">No promotions found.</p>
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-zinc-50/60 transition-colors group cursor-pointer" onClick={() => handleOpenEdit(promo)}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-text-dark group-hover:text-blue-600 transition-colors">{promo.title || 'Untitled'}</p>
                        {promo.method === 'code' ? (
                          <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono font-bold mt-1">
                            {promo.code}
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-semibold mt-1">
                            Automatic
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-text-muted capitalize font-semibold">{promo.discountType?.replace('_', ' ')}</td>
                      
                      <td className="px-5 py-4 font-bold text-text-dark">
                        {promo.discountType === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                      </td>
                      
                      <td className="px-5 py-4 text-xs font-semibold text-text-muted">
                        {promo.minOrderValue > 0 ? `Min. ${formatCurrency(promo.minOrderValue)}` : 'None'}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs">
                        {promo.usageCount || 0} / {promo.usageLimit || '∞'}
                      </td>
                      <td className="px-5 py-4">
                        {(() => {
                          const now = new Date();
                          let status = 'Inactive';
                          let style = 'bg-zinc-200 text-zinc-600';
                          if (promo.expiresAt && new Date(promo.expiresAt) < now) {
                            status = 'Expired';
                            style = 'bg-red-500/10 text-red-700';
                          } else if (promo.startsAt && new Date(promo.startsAt) > now) {
                            status = 'Scheduled';
                            style = 'bg-blue-500/15 text-blue-700';
                          } else if (promo.active) {
                            status = 'Active';
                            style = 'bg-green-500/15 text-green-700';
                          }
                          return (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${style}`}>
                                {status}
                              </span>
                              {status === 'Active' && promo.expiresAt && (
                                <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                                  Ends in {Math.ceil((new Date(promo.expiresAt) - now) / (1000 * 60 * 60 * 24))}d
                                </span>
                              )}
                              {status === 'Scheduled' && promo.startsAt && (
                                <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                                  Starts in {Math.ceil((new Date(promo.startsAt) - now) / (1000 * 60 * 60 * 24))}d
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleOpenEdit(promo)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors" title="Edit Promotion">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteMut.mutate(promo.id)} className="p-2 text-zinc-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Delete Promotion">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

