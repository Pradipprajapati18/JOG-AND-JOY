import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Folder, AlertTriangle, X } from 'lucide-react';
import { useCategoriesList, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../queries/useCategories';
import { useProductsList } from '../../queries/useProducts';
import { useSizesList, useCreateSize, useUpdateSize, useDeleteSize } from '../../queries/useSizes';


export default function AdminCategories() {
  const { data: categoriesResponse, isLoading } = useCategoriesList();
  const { data: productsData } = useProductsList({});
  const categories = categoriesResponse?.data || [];
  const products = productsData?.data || [];
  
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ label: '', icon: '', status: 'Active' });
  const [search, setSearch] = useState('');

  // Sizes state and hooks
  const { data: sizesResponse, isLoading: isLoadingSizes } = useSizesList();
  const sizes = sizesResponse?.data || [];
  
  const createSizeMut = useCreateSize();
  const updateSizeMut = useUpdateSize();
  const deleteSizeMut = useDeleteSize();

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [editSize, setEditSize] = useState(null);
  const [sizeForm, setSizeForm] = useState({ label: '', status: 'Active' });
  const [searchSize, setSearchSize] = useState('');

  const openAddSize = () => {
    setEditSize(null);
    setSizeForm({ label: '', status: 'Active' });
    setShowSizeModal(true);
  };

  const openEditSize = (s) => {
    setEditSize(s);
    setSizeForm({ label: s.label, status: s.status || 'Active' });
    setShowSizeModal(true);
  };

  const handleSaveSize = () => {
    if (editSize) {
      updateSizeMut.mutate({ id: editSize.id, patch: sizeForm });
    } else {
      createSizeMut.mutate({ ...sizeForm, order: sizes.length + 1 });
    }
    setShowSizeModal(false);
  };

  const handleDeleteSize = (id) => {
    if (window.confirm('Delete this size?')) {
      deleteSizeMut.mutate(id);
    }
  };

  const filteredSizes = sizes.filter(s => s.label.toLowerCase().includes(searchSize.toLowerCase()));


  const openAdd = () => {
    setEditCat(null);
    setForm({ label: '', icon: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ label: cat.label, icon: cat.icon || '', status: cat.status || 'Active' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editCat && !editCat.isLegacy) {
      updateMut.mutate({ id: editCat.id, patch: form });
    } else {
      createMut.mutate({ 
        ...form, 
        slug: form.label.toLowerCase().replace(/\s+/g, '-'),
        order: categories.length + 1
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this category?')) {
      deleteMut.mutate(id);
    }
  };

  const categoriesWithCounts = useMemo(() => {
    // 1. Map existing DB categories
    const mappedCategories = categories.map(cat => ({
      ...cat,
      productsCount: products.filter(p => p.categoryId === cat.label || p.categoryLabel === cat.label || p.category === cat.label || p.categoryId === cat.id).length
    }));

    // 2. Discover missing categories from products
    const existingLabels = new Set(mappedCategories.map(c => c.label));
    const missingLabels = new Set();
    
    products.forEach(p => {
      const catLabel = p.categoryId || p.categoryLabel || p.category;
      // if catLabel is not in existing labels, and it's not a known cat.id
      const isKnownId = mappedCategories.some(c => c.id === catLabel);
      if (catLabel && !existingLabels.has(catLabel) && !isKnownId) {
        missingLabels.add(catLabel);
      }
    });

    // 3. Append missing categories as 'Unsaved' legacy items
    Array.from(missingLabels).forEach(label => {
      mappedCategories.push({
        id: `legacy_${label}`,
        label: label,
        icon: '⚠️',
        status: 'Unsaved',
        isLegacy: true,
        productsCount: products.filter(p => (p.categoryId || p.categoryLabel || p.category) === label).length
      });
    });

    return mappedCategories;
  }, [categories, products]);

  const filteredCategories = categoriesWithCounts.filter(c => {
    const matchesSearch = c.label.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalUnsaved = categoriesWithCounts.filter(c => c.isLegacy).length;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-dark">Categories</h1>
          <p className="text-sm text-text-muted mt-1">Manage product categories</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#003366] rounded-lg font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button className="text-left bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Total Categories</p>
          <p className="text-3xl font-extrabold text-text-dark">{categoriesWithCounts.length}</p>
        </button>
        <div className={`text-left border rounded-xl p-6 shadow-sm transition-all ${totalUnsaved > 0 ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-white border-slate-100'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${totalUnsaved > 0 ? 'text-[#B45309]' : 'text-zinc-500'}`}>Unsaved / Legacy</p>
          <p className={`text-3xl font-extrabold ${totalUnsaved > 0 ? 'text-[#78350F]' : 'text-text-dark'}`}>{totalUnsaved}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm transition-all overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative flex-1 sm:w-72 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading categories...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium text-center">Products</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center">
                        <Folder className="w-12 h-12 opacity-30 mb-4" />
                        <h3 className="text-base font-bold text-text-dark">No categories found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{cat.icon || '📁'}</div>
                          <div className="font-bold text-text-dark text-sm">
                            {cat.label}
                            {cat.isLegacy && <span className="ml-2 text-[10px] bg-error text-white px-2 py-0.5 rounded-md uppercase font-extrabold tracking-wider">Legacy</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-zinc-100 text-xs font-bold text-text-dark">
                          {cat.productsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          cat.status === 'Active' ? 'bg-green-500/15 text-green-700' : 
                          cat.isLegacy ? 'bg-red-500/10 text-red-700' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(cat)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Category">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Category">
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

      
      {/* SIZES SECTION */}
      <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-dark">Sizes</h2>
          <p className="text-sm text-text-muted mt-1">Manage global product sizes</p>
        </div>
        <button 
          onClick={openAddSize}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#003366] rounded-lg font-bold text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Size
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm transition-all overflow-hidden mb-12">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative flex-1 sm:w-72 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search sizes..." 
              value={searchSize}
              onChange={(e) => setSearchSize(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingSizes ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 font-semibold">Loading sizes...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSizes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center">
                        <Folder className="w-12 h-12 opacity-30 mb-4" />
                        <h3 className="text-base font-bold text-text-dark">No sizes found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSizes.map(size => (
                    <tr key={size.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-text-dark text-sm">{size.label}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          size.status === 'Active' ? 'bg-green-500/15 text-green-700' : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          {size.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditSize(size)} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Size">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteSize(size.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Size">
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text-dark">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:text-text-dark hover:bg-zinc-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Category Name</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
                  value={form.label} 
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} 
                  placeholder="e.g. Boys, Trunks" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Icon (Emoji)</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
                  value={form.icon} 
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} 
                  placeholder="👦" 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white" 
                    value={form.status} 
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-zinc-50 flex items-center justify-end gap-3">
              <button 
                className="px-5 py-2.5 text-zinc-600 font-bold text-sm hover:bg-zinc-200 rounded-xl transition-colors" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-white border border-slate-200 text-[#003366] font-bold text-sm hover:bg-slate-50 shadow-sm rounded-xl transition-colors disabled:opacity-50" 
                disabled={createMut.isPending || updateMut.isPending} 
                onClick={handleSave}
              >
                {createMut.isPending || updateMut.isPending ? 'Saving...' : editCat ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSizeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text-dark">{editSize ? 'Edit Size' : 'Add Size'}</h2>
              <button onClick={() => setShowSizeModal(false)} className="p-2 text-zinc-400 hover:text-text-dark hover:bg-zinc-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Size Name</label>
                <input 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
                  value={sizeForm.label} 
                  onChange={(e) => setSizeForm((p) => ({ ...p, label: e.target.value }))} 
                  placeholder="e.g. S, M, L, XL" 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white" 
                    value={sizeForm.status} 
                    onChange={(e) => setSizeForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-zinc-50 flex items-center justify-end gap-3">
              <button 
                className="px-5 py-2.5 text-zinc-600 font-bold text-sm hover:bg-zinc-200 rounded-xl transition-colors" 
                onClick={() => setShowSizeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-5 py-2.5 bg-white border border-slate-200 text-[#003366] font-bold text-sm hover:bg-slate-50 shadow-sm rounded-xl transition-colors disabled:opacity-50" 
                disabled={createSizeMut.isPending || updateSizeMut.isPending} 
                onClick={handleSaveSize}
              >
                {createSizeMut.isPending || updateSizeMut.isPending ? 'Saving...' : editSize ? 'Save Changes' : 'Add Size'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
