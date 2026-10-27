import React, { useEffect, useState } from 'react';
import { Save, Store, ShoppingCart, Truck, Receipt, SlidersHorizontal, Plus, Trash2, X, RotateCcw, Palette, Users, Tag, IndianRupee, Sparkles } from 'lucide-react';
import { useSettings, useUpdateSettings } from '../../queries/useSettings';
import { useUIContext } from '../../context/UIContext';
import { STANDARD_NAME_TO_HEX } from '../../utils/helpers';

const DEFAULT_FILTER_PANELS = {
  categories: [
    'T-Shirts',
    'Shirts',
    'Jeans',
    'Trousers',
    'Dresses',
    'Jackets',
    'Ethnic Wear',
    'Activewear',
    'Shorts',
    'Track Pants'
  ],
  priceRanges: [
    { id: 'low', label: 'Under ₹499', min: 0, max: 499 },
    { id: 'mid', label: '₹500 - ₹999', min: 500, max: 999 },
    { id: 'high', label: 'Over ₹1000', min: 1000, max: 999999 }
  ],
  ageGroups: [
    '0-2 Years',
    '3-5 Years',
    '6-8 Years',
    '9-12 Years'
  ],
  colors: [
    'Black',
    'White',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Pink',
    'Purple',
    'Orange',
    'Grey',
    'Navy',
    'Beige'
  ]
};

export default function AdminSettings() {
  const { data: settingsData, isLoading } = useSettings();
  const settings = settingsData || null;
  const updateMut = useUpdateSettings();
  const { addToast } = useUIContext();

  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});

  // Filter Panel Inputs
  const [newColor, setNewColor] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriceLabel, setNewPriceLabel] = useState('');
  const [newPriceMin, setNewPriceMin] = useState('');
  const [newPriceMax, setNewPriceMax] = useState('');

  useEffect(() => {
    let localPanels = null;
    try {
      const stored = localStorage.getItem('jj_filter_panels');
      if (stored) localPanels = JSON.parse(stored);
    } catch {}

    if (settings) {
      setFormData({
        ...settings,
        filterPanels: settings.filterPanels || localPanels || DEFAULT_FILTER_PANELS
      });
    } else {
      setFormData(prev => ({
        ...prev,
        filterPanels: prev.filterPanels || localPanels || DEFAULT_FILTER_PANELS
      }));
    }
  }, [settings]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (formData.filterPanels) {
      try {
        localStorage.setItem('jj_filter_panels', JSON.stringify(formData.filterPanels));
        window.dispatchEvent(new CustomEvent('jj_filter_panels_updated', { detail: formData.filterPanels }));
      } catch {}
    }
    updateMut.mutate(formData, {
      onSuccess: () => addToast('Settings updated successfully', 'success')
    });
  };

  const updateFilterPanels = (updater) => {
    setFormData(prev => {
      const current = prev.filterPanels || DEFAULT_FILTER_PANELS;
      const updated = typeof updater === 'function' ? updater(current) : updater;
      try {
        localStorage.setItem('jj_filter_panels', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('jj_filter_panels_updated', { detail: updated }));
      } catch {}
      return {
        ...prev,
        filterPanels: updated
      };
    });
  };

  const currentFilters = formData.filterPanels || DEFAULT_FILTER_PANELS;

  const handleAddColor = (e) => {
    e?.preventDefault();
    const trimmed = newColor.trim();
    if (!trimmed) {
      addToast('Please enter a colour name', 'error');
      return;
    }
    if ((currentFilters.colors || []).some(c => (typeof c === 'string' ? c : c.name).toLowerCase() === trimmed.toLowerCase())) {
      addToast('This colour already exists', 'error');
      return;
    }

    let hexCode = newColorHex.trim();
    if (hexCode && !hexCode.startsWith('#')) {
      hexCode = `#${hexCode}`;
    }

    const colorItem = hexCode ? { name: trimmed, hex: hexCode } : trimmed;

    updateFilterPanels(prev => ({
      ...prev,
      colors: [...(prev.colors || []), colorItem]
    }));
    setNewColor('');
    setNewColorHex('');
    addToast(`Added "${trimmed}" to colours`, 'success');
  };

  const handleDeleteColor = (colorItem) => {
    const targetName = typeof colorItem === 'string' ? colorItem : colorItem.name;
    updateFilterPanels(prev => ({
      ...prev,
      colors: (prev.colors || []).filter(c => (typeof c === 'string' ? c : c.name) !== targetName)
    }));
    addToast(`Removed "${targetName}"`, 'info');
  };

  const handleAddAgeGroup = (e) => {
    e?.preventDefault();
    const trimmed = newAgeGroup.trim();
    if (!trimmed) return;
    if ((currentFilters.ageGroups || []).some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      addToast('This age group already exists', 'error');
      return;
    }
    updateFilterPanels(prev => ({
      ...prev,
      ageGroups: [...(prev.ageGroups || []), trimmed]
    }));
    setNewAgeGroup('');
    addToast(`Added "${trimmed}" to age groups`, 'success');
  };

  const handleDeleteAgeGroup = (age) => {
    updateFilterPanels(prev => ({
      ...prev,
      ageGroups: (prev.ageGroups || []).filter(a => a !== age)
    }));
    addToast(`Removed "${age}"`, 'info');
  };

  const handleAddPriceRange = (e) => {
    e?.preventDefault();
    const label = newPriceLabel.trim();
    const min = newPriceMin === '' ? 0 : Number(newPriceMin);
    const max = newPriceMax === '' ? 999999 : Number(newPriceMax);
    if (!label) {
      addToast('Please enter a display label (e.g. Under ₹499)', 'error');
      return;
    }
    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      addToast('Please enter valid minimum and maximum prices', 'error');
      return;
    }
    const id = `price_${Date.now()}`;
    updateFilterPanels(prev => ({
      ...prev,
      priceRanges: [...(prev.priceRanges || []), { id, label, min, max }]
    }));
    setNewPriceLabel('');
    setNewPriceMin('');
    setNewPriceMax('');
    addToast(`Added "${label}" to price categories`, 'success');
  };

  const handleDeletePriceRange = (rangeId) => {
    updateFilterPanels(prev => ({
      ...prev,
      priceRanges: (prev.priceRanges || []).filter(p => p.id !== rangeId)
    }));
    addToast('Removed price category', 'info');
  };

  const handleAddCategory = (e) => {
    e?.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if ((currentFilters.categories || []).some(c => (typeof c === 'string' ? c : c.label).toLowerCase() === trimmed.toLowerCase())) {
      addToast('This category already exists', 'error');
      return;
    }
    updateFilterPanels(prev => ({
      ...prev,
      categories: [...(prev.categories || []), trimmed]
    }));
    setNewCategory('');
    addToast(`Added "${trimmed}" to categories`, 'success');
  };

  const handleDeleteCategory = (catName) => {
    updateFilterPanels(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(c => (typeof c === 'string' ? c : (c.id || c.label)) !== catName)
    }));
    addToast(`Removed "${catName}"`, 'info');
  };

  const handleResetFilters = () => {
    if (window.confirm('Reset all filter panels to default settings?')) {
      updateFilterPanels(DEFAULT_FILTER_PANELS);
      addToast('Filter panels reset to defaults', 'success');
    }
  };

  const getColorHex = (colorItem) => {
    if (!colorItem) return '#cbd5e1';
    if (typeof colorItem === 'object' && colorItem.hex) return colorItem.hex;
    const name = typeof colorItem === 'string' ? colorItem : colorItem.name;
    if (!name) return '#cbd5e1';
    const clean = name.trim().toLowerCase();
    if (STANDARD_NAME_TO_HEX[clean]) return STANDARD_NAME_TO_HEX[clean];
    return '#94a3b8';
  };

  const tabs = [
    { id: 'general', icon: <Store className="w-4 h-4" />, label: 'General Details' },
    { id: 'filters', icon: <SlidersHorizontal className="w-4 h-4" />, label: 'Filter Panels' },
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
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-dark text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
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
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-3 cursor-pointer ${
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
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
              
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

              {/* Storefront Filter Panels Settings */}
              {activeTab === 'filters' && (
                <div className="space-y-10 animate-in fade-in">
                  
                  {/* Informational Header */}
                  <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-xl shrink-0 mt-0.5">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
                        Storefront Filter Sidebar Panels <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      </h4>
                      <p className="text-xs text-sky-700 font-medium mt-0.5 leading-relaxed">
                        Add or delete options that display in the filter sidebar on the storefront All Products catalog (Colours, Age Groups, Price Categories, and Product Types). Changes take effect across the website.
                      </p>
                    </div>
                  </div>

                  {/* 1. Age Groups */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Age Groups ({(currentFilters.ageGroups || []).length})
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Shows on filter bar</span>
                    </div>

                    {/* Age Group Badges */}
                    <div className="flex flex-wrap gap-2.5 min-h-12 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                      {(currentFilters.ageGroups || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No age groups configured. Add one below.</span>
                      ) : (
                        (currentFilters.ageGroups || []).map((age) => (
                          <div 
                            key={age}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs group"
                          >
                            <span>{age}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAgeGroup(age)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer"
                              title={`Delete ${age}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Age Group Form */}
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        placeholder="Add age group (e.g. 13-16 Years, Adult)"
                        value={newAgeGroup}
                        onChange={(e) => setNewAgeGroup(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAgeGroup(); } }}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-zinc-50 focus:ring-1 focus:ring-blue-600 focus:bg-white text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddAgeGroup}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </section>

                  {/* 2. Colours */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Colours ({(currentFilters.colors || []).length})
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Shows on filter bar</span>
                    </div>

                    {/* Colour Badges */}
                    <div className="flex flex-wrap gap-2.5 min-h-12 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                      {(currentFilters.colors || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No colours configured. Add one below.</span>
                      ) : (
                        (currentFilters.colors || []).map((color, idx) => {
                          const cName = typeof color === 'string' ? color : color.name;
                          const cHex = typeof color === 'object' && color.hex ? color.hex : getColorHex(cName);
                          return (
                            <div 
                              key={`${cName}-${idx}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs group"
                            >
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                                style={{ backgroundColor: cHex }}
                              />
                              <span>{cName}</span>
                              {typeof color === 'object' && color.hex && (
                                <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                                  {color.hex}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteColor(color)}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer"
                                title={`Delete ${cName}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Colour Form */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl">
                      {/* Colour Name input */}
                      <input
                        type="text"
                        placeholder="Colour Name (e.g. Navy Blue, Lavender)"
                        value={newColor}
                        onChange={(e) => {
                          setNewColor(e.target.value);
                          const standard = STANDARD_NAME_TO_HEX[e.target.value.trim().toLowerCase()];
                          if (standard && !newColorHex) {
                            setNewColorHex(standard);
                          }
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-zinc-50 focus:ring-1 focus:ring-blue-600 focus:bg-white text-xs font-bold text-slate-800 outline-none"
                      />
                      
                      {/* Colour Code (Hex) input with color preview / picker */}
                      <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl bg-zinc-50 px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-blue-600 focus-within:bg-white sm:w-56 shrink-0">
                        <input
                          type="color"
                          value={newColorHex && newColorHex.startsWith('#') && (newColorHex.length === 7 || newColorHex.length === 4) ? newColorHex : '#000000'}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-5 h-5 rounded-md border-0 p-0 cursor-pointer bg-transparent shrink-0"
                          title="Click to pick colour"
                        />
                        <input
                          type="text"
                          placeholder="Code (e.g. #3b82f6)"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                          className="w-full text-xs font-mono font-bold text-slate-800 bg-transparent outline-none uppercase placeholder:font-sans placeholder:normal-case placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Colour</span>
                      </button>
                    </div>
                  </section>

                  {/* 3. Price Categories */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Price Categories / Brackets ({(currentFilters.priceRanges || []).length})
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Shows on filter bar</span>
                    </div>

                    {/* Price Range Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(currentFilters.priceRanges || []).length === 0 ? (
                        <div className="col-span-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                          No price categories configured. Add one below.
                        </div>
                      ) : (
                        (currentFilters.priceRanges || []).map((range) => (
                          <div 
                            key={range.id}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs group hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-xs shrink-0">
                                ₹
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">{range.label}</div>
                                <div className="text-[11px] font-semibold text-slate-400">
                                  ₹{range.min ?? 0} &mdash; {range.max >= 900000 ? 'Any' : `₹${range.max}`}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePriceRange(range.id)}
                              className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title={`Delete ${range.label}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Price Range Form */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="text-xs font-bold text-slate-700">Add New Price Bracket</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Display Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Under ₹499"
                            value={newPriceLabel}
                            onChange={(e) => setNewPriceLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Price (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 0"
                            value={newPriceMin}
                            onChange={(e) => setNewPriceMin(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Price (₹)</label>
                          <input
                            type="number"
                            placeholder="e.g. 499 (leave blank for unlimited)"
                            value={newPriceMax}
                            onChange={(e) => setNewPriceMax(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddPriceRange}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Price Bracket</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* 4. Product Categories / Types */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Categories / Product Types ({(currentFilters.categories || []).length})
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Shows on filter bar</span>
                    </div>

                    {/* Category Badges */}
                    <div className="flex flex-wrap gap-2.5 min-h-12 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
                      {(currentFilters.categories || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No categories configured. Add one below.</span>
                      ) : (
                        (currentFilters.categories || []).map((cat) => {
                          const label = typeof cat === 'string' ? cat : cat.label;
                          const key = typeof cat === 'string' ? cat : (cat.id || cat.label);
                          return (
                            <div 
                              key={key}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs group"
                            >
                              <span>{label}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(key)}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer"
                                title={`Delete ${label}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Category Form */}
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        placeholder="Add category (e.g. Kurtas, Sleepwear, Hoodies)"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-zinc-50 focus:ring-1 focus:ring-blue-600 focus:bg-white text-xs font-bold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </section>

                  {/* Reset Defaults & Save Bottom Bar */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters to Defaults</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={updateMut.isPending}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary-dark text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {updateMut.isPending ? 'Saving...' : 'Save Filter Panels'}
                    </button>
                  </div>

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
