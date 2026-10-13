import React, { useEffect, useState } from 'react';
import { Save, Store, ShoppingCart, Truck, Receipt, Bell, CreditCard, FileText, Globe } from 'lucide-react';
import { useSettings, useUpdateSettings } from '../../queries/useSettings';
import { useUIContext } from '../../context/UIContext';

export default function AdminSettings() {
  const { data: settingsData, isLoading } = useSettings();
  const settings = settingsData || null;
  const updateMut = useUpdateSettings();
  const { addToast } = useUIContext();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate(formData, {
      onSuccess: () => addToast('Settings updated successfully', 'success')
    });
  };

  const tabs = [
    { id: 'general', icon: <Store className="w-4 h-4" />, label: 'General Details' },
    { id: 'checkout', icon: <ShoppingCart className="w-4 h-4" />, label: 'Checkout & Accounts' },
    { id: 'shipping', icon: <Truck className="w-4 h-4" />, label: 'Shipping & Delivery' },
    { id: 'taxes', icon: <Receipt className="w-4 h-4" />, label: 'Taxes & Duties' },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-blue-600 font-semibold">Loading settings...</div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Configuration</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Settings</h1>
          <p className="text-xs text-text-muted mt-1">Manage global storefront preferences</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={updateMut.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-dark text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {updateMut.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm transition-all overflow-hidden flex flex-col md:flex-row min-h-175">
        
        {/* Vertical Tabs */}
        <div className="w-full md:w-64 shrink-0 bg-zinc-50/50 border-r border-slate-200 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-3 ${
                activeTab === tab.id ? 'bg-white border border-slate-200 shadow-sm text-text-dark' : 'text-text-muted hover:bg-zinc-100/50 hover:text-text-primary'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-blue-600' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-text-dark">{tabs.find(t => t.id === activeTab)?.label}</h2>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
              
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Store Profile</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Store Name</label>
                        <input type="text" value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Contact Email</label>
                        <input type="email" value={formData.contactEmail || ''} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 focus:bg-white outline-none" />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Regional Formats</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Currency</label>
                        <select value={formData.currency || ''} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none">
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Timezone</label>
                        <select value={formData.timezone || ''} onChange={e => setFormData({...formData, timezone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none">
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Weight Unit</label>
                        <select value={formData.weightUnit || 'kg'} onChange={e => setFormData({...formData, weightUnit: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none">
                          <option value="kg">Kilograms (kg)</option>
                          <option value="lb">Pounds (lb)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Dimension Unit</label>
                        <select value={formData.dimensionUnit || 'cm'} onChange={e => setFormData({...formData, dimensionUnit: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none">
                          <option value="cm">Centimeters (cm)</option>
                          <option value="in">Inches (in)</option>
                        </select>
                      </div>
                    </div>
                  </section>
                  
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Admin Automation</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.autoApproveReviews || false} onChange={e => setFormData({...formData, autoApproveReviews: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600" />
                      <span className="text-sm font-bold text-text-muted">Auto-Approve Reviews</span>
                    </label>
                  </section>
                </div>
              )}

              {activeTab === 'checkout' && (
                <div className="space-y-8 animate-in fade-in">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Customer Accounts</h3>
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="checkbox" checked={formData.guestCheckoutAllowed !== false} onChange={e => setFormData({...formData, guestCheckoutAllowed: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600" />
                      <span className="text-sm font-bold text-text-muted">Allow guest checkout</span>
                    </label>
                  </section>
                  
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Order Rules</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Order Edit Window (Hours)</label>
                        <input type="number" value={formData.orderEditWindowHours || 0} onChange={e => setFormData({...formData, orderEditWindowHours: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Abandoned Cart Trigger (Hours)</label>
                        <input type="number" value={formData.abandonedCartThresholdHours || 4} onChange={e => setFormData({...formData, abandonedCartThresholdHours: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-8 animate-in fade-in">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Shipping Rates & Rules</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Base Standard Rate (₹)</label>
                        <input type="number" value={formData.baseShippingRate ?? 0} onChange={e => setFormData({...formData, baseShippingRate: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Free Shipping Threshold (₹)</label>
                        <input type="number" value={formData.freeShippingThreshold ?? 999} onChange={e => setFormData({...formData, freeShippingThreshold: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Express Delivery Add-on (₹)</label>
                        <input type="number" value={formData.expressShippingRate ?? 149} onChange={e => setFormData({...formData, expressShippingRate: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'taxes' && (
                <div className="space-y-8 animate-in fade-in">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-slate-200 pb-2">Tax Calculation</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tax Mode</label>
                        <select value={formData.taxMode || 'exclusive'} onChange={e => setFormData({...formData, taxMode: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none">
                          <option value="exclusive">Prices exclude tax (Added at checkout)</option>
                          <option value="inclusive">Prices include tax</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Base Tax Rate (%)</label>
                        <input type="number" value={formData.taxRatePercent || 0} onChange={e => setFormData({...formData, taxRatePercent: Number(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-zinc-50 focus:ring-1 focus:ring-blue-600 outline-none" />
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                      <input type="checkbox" checked={formData.digitalGoodsTaxable || false} onChange={e => setFormData({...formData, digitalGoodsTaxable: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600" />
                      <span className="text-sm font-bold text-text-muted">Charge tax on digital goods</span>
                    </label>
                  </section>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
