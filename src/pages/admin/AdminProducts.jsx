import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, CheckCircle2, Image as ImageIcon, Plus, X, ChevronLeft, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { useProductsList, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../queries/useProducts';
import { useCategoriesList } from '../../queries/useCategories';
import { useSizesList } from '../../queries/useSizes';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    groupId: '',
    categoryId: 'KIDS Co-ord Suit',
    vendor: 'Jog & Joy',
    originalPrice: '',
    discountPercent: '20',
    stock: '',
    images: [],
    description: '',
    fabric: '',
    care: '',
    shipping: '',
    sizes: [],
    colors: [],
    variants: [],
    collections: [],
    isNewArrival: false,
    status: 'draft'
  });
  
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  
  const AVAILABLE_COLORS = [
    { hex: '#000000', name: 'Black' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#FF0000', name: 'Red' },
    { hex: '#0000FF', name: 'Blue' },
    { hex: '#FFC0CB', name: 'Pink' },
    { hex: '#FFFF00', name: 'Yellow' },
    { hex: '#000080', name: 'Navy' },
    { hex: '#808000', name: 'Olive' },
  ];

  const { data, isLoading } = useProductsList();
  let products = data?.data || [];

  const { data: categoriesResponse } = useCategoriesList();
  const { data: sizesResponse } = useSizesList();
  const dbSizes = sizesResponse?.data || [];
  const AVAILABLE_SIZES = dbSizes.map(s => s.label);
  const dbCategories = categoriesResponse?.data || [];

  // Compute all unique categories (DB + existing on products)
  const allCategories = React.useMemo(() => {
    const categoryMap = new Map();
    const idMap = new Map();
    dbCategories.forEach(c => {
      categoryMap.set(c.label, c);
      if (c.id) idMap.set(c.id, c);
    });
    
    products.forEach(p => {
      // If the product categoryId matches a known category ID in the DB, skip adding it
      if (p.categoryId && idMap.has(p.categoryId)) {
        return;
      }
      const catLabel = p.categoryLabel || p.category || p.categoryId;
      // Skip if it's empty, or if it looks like a raw UUID (36 chars)
      if (catLabel && typeof catLabel === 'string' && catLabel.length !== 36 && !categoryMap.has(catLabel)) {
        categoryMap.set(catLabel, { id: `legacy_${catLabel}`, label: catLabel });
      }
    });
    return Array.from(categoryMap.values());
  }, [dbCategories, products]);

  if (search) {
    products = products.filter(p => {
      const q = search.toLowerCase();
      const skus = p.variants?.map(v => v.sku).join(' ') || '';
      const searchStr = `${p.title} ${p.vendor} ${skus}`.toLowerCase();
      return searchStr.includes(q);
    });
  }

  if (filterCategory !== 'all') {
    const selectedCat = allCategories.find(c => c.id === filterCategory);
    if (selectedCat) {
      products = products.filter(p => 
        p.categoryId === selectedCat.id || 
        p.categoryId === selectedCat.label || 
        p.categoryLabel === selectedCat.label || 
        p.category === selectedCat.label
      );
    } else {
      products = products.filter(p => p.categoryId === filterCategory);
    }
  }

  if (filterStock !== 'all') {
    products = products.filter(p => {
      const stock = Number(p.stock) || 0;
      if (filterStock === 'in_stock') return stock > 10;
      if (filterStock === 'low_stock') return stock > 0 && stock <= 10;
      if (filterStock === 'out_of_stock') return stock <= 0;
      return true;
    });
  }

  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();

  const resetForm = () => {
    setFormData({
      title: '', groupId: '', categoryId: '', vendor: '', originalPrice: '', discountPercent: '20', stock: '', images: [], description: '', fabric: '', care: '', shipping: '', sizes: [], colors: [], variants: [], collections: [], isNewArrival: false, ageGroup: '', status: 'draft'
    });
    setEditingId(null);
    setShowForm(false);
  };

  useEffect(() => {
    const newVariants = [];
    const sizes = formData.sizes.length > 0 ? formData.sizes : ['Standard'];
    const colors = formData.colors.length > 0 ? formData.colors : [{ hex: '#000000', name: 'Standard' }];

    colors.forEach(color => {
      sizes.forEach(size => {
        const existing = formData.variants.find(v => v.colorHex === color.hex && v.size === size);
        newVariants.push({
          id: existing?.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          sku: existing?.sku || `SKU-${Date.now().toString().slice(-4)}-${color.name.slice(0,3).toUpperCase()}-${size.replace(/[^a-zA-Z0-9]/g, '')}`,
          colorHex: color.hex,
          colorName: color.name,
          size: size,
          stock: existing?.stock || 0,
          price: existing?.price || '',
          image: existing?.image || '',
          isHidden: existing?.isHidden || false
        });
      });
    });

    const variantsChanged = newVariants.length !== formData.variants.length || newVariants.some((nv, i) => nv.colorHex !== formData.variants[i]?.colorHex || nv.size !== formData.variants[i]?.size || nv.isHidden !== formData.variants[i]?.isHidden);
    
    if (variantsChanged) {
      setFormData(prev => ({ ...prev, variants: newVariants }));
    }
  }, [formData.colors, formData.sizes]);

  const handleUpdateVariant = (variantId, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v)
    }));
  };

  const handleLoadTemplate = (templateId) => {
    if (!templateId) {
      resetForm();
      return;
    }
    const productData = products.find(p => String(p.id) === String(templateId));
    if (!productData) return;

    const p = {
      ...productData,
      ...(productData.variants?.find(v => v._isMetadata) || {}),
      variants: productData.variants?.filter(v => !v._isMetadata) || []
    };

    let discPct = '20';
    if (p.compareAtPrice && p.basePrice) {
      discPct = Math.round((1 - (p.basePrice / p.compareAtPrice)) * 100).toString();
    } else if (p.originalPrice && p.price) {
      discPct = Math.round((1 - (p.price / p.originalPrice)) * 100).toString();
    } else if (p.discountPercent) {
      discPct = p.discountPercent.toString();
    }

    setFormData({
      title: p.title ? `${p.title} (Variant)` : '',
      groupId: p.groupId || p.id,
      categoryId: p.categoryId || '',
      vendor: p.vendor || 'Jog & Joy',
      originalPrice: p.compareAtPrice || p.originalPrice || p.basePrice || '',
      discountPercent: discPct,
      stock: '0',
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      description: p.description || '',
      fabric: p.fabric || '',
      care: p.care || '',
      shipping: p.shipping || '',
      sizes: p.sizes || [],
      colors: [], 
      variants: [],
      collections: p.collections || [],
      isNewArrival: p.isNewArrival || false,
      ageGroup: p.ageGroup || '',
      status: p.status || 'draft'
    });
  };

  const handleEdit = (productData) => {
    const p = {
      ...productData,
      ...(productData.variants?.find(v => v._isMetadata) || {}),
      variants: productData.variants?.filter(v => !v._isMetadata) || []
    };

    setEditingId(p.id);
    
    // Calculate reverse discount percentage if not explicitly present
    let discPct = '20'; // default
    if (p.compareAtPrice && p.basePrice) {
      discPct = Math.round((1 - (p.basePrice / p.compareAtPrice)) * 100).toString();
    } else if (p.originalPrice && p.price) {
      discPct = Math.round((1 - (p.price / p.originalPrice)) * 100).toString();
    } else if (p.discountPercent) {
      discPct = p.discountPercent.toString();
    }

    const computedTotalStock = p.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || p.stock || 0;

    setFormData({
      title: p.title || '',
      groupId: p.groupId || '',
      categoryId: p.categoryId || '',
      vendor: p.vendor || 'Jog & Joy',
      originalPrice: p.compareAtPrice || p.originalPrice || p.basePrice || '',
      discountPercent: discPct,
      stock: computedTotalStock.toString(),
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      description: p.description || '',
      fabric: p.fabric || '',
      care: p.care || '',
      shipping: p.shipping || '',
      sizes: p.sizes || [],
      colors: p.colors || [],
      variants: p.variants || [],
      collections: p.collections || [],
      isNewArrival: p.isNewArrival || false,
      ageGroup: p.ageGroup || '',
      status: p.status || 'draft'
    });
    
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.vendor || !formData.originalPrice || 
        formData.images.length === 0 || 
        formData.sizes.length === 0 || 
        formData.colors.length === 0) {
      return alert('Please fill out all required fields (including Images, Sizes, and Colors).');
    }

    const calculatedPrice = Math.round(Number(formData.originalPrice) * (1 - Number(formData.discountPercent) / 100));
    
    // Auto-sync logic for stock and variants
    let finalStock = Number(formData.stock) || 0;
    let finalVariants = formData.variants;
    
    if (finalVariants.length === 1) {
      // If only one variant (standard), force variant stock to match total stock input
      finalVariants[0] = { ...finalVariants[0], stock: finalStock };
    } else if (finalVariants.length > 1) {
      // If multiple variants, force total stock to equal the sum of variant stocks
      finalStock = finalVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }

    let submitStatus = formData.status || 'live';
    if (submitStatus === 'live') {
      const isValid = finalVariants.length > 0 && finalVariants.every(v => v.colorHex && v.size && v.sku && Number(v.stock) >= 0) && formData.images.length > 0;
      if (!isValid) {
        alert('Validation failed for Publish: Product must have variants with non-negative stock and at least one image. Saving as Draft instead.');
        submitStatus = 'draft';
      }
    }

    const productPayload = {
      title: formData.title,
      categoryId: formData.categoryId,
      vendor: formData.vendor,
      basePrice: calculatedPrice,
      compareAtPrice: Number(formData.originalPrice),
      description: formData.description,
      fabric: formData.fabric,
      care: formData.care,
      shipping: formData.shipping,
      sizes: formData.sizes.length > 0 ? formData.sizes : ['Standard'],
      colors: formData.colors,
      status: submitStatus,
      images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop'],
      stock: finalStock,
      collections: formData.collections || [],
      isNewArrival: formData.isNewArrival || false,
      ageGroup: formData.ageGroup || undefined,
      variants: finalVariants.map(v => ({
        id: v.id,
        sku: v.sku,
        colorHex: v.colorHex,
        colorName: v.colorName,
        size: v.size,
        stock: Number(v.stock),
        price: v.price ? Number(v.price) : undefined,
        image: v.image || undefined,
        isHidden: v.isHidden || false
      }))
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, patch: productPayload }, {
        onSuccess: resetForm
      });
    } else {
      createMut.mutate(productPayload, {
        onSuccess: resetForm
      });
    }
  };

  const applyFabricDefault = () => setFormData(prev => ({ ...prev, fabric: '100% Bio-Washed Premium Cotton. Sourced from certified mills using non-toxic Azo-free dyes. Pre-shrunk fabric ensures no shrinkage after washing.' }));
  const applyCareDefault = () => setFormData(prev => ({ ...prev, care: 'Machine wash cold inside out with similar colors. Do not bleach. Tumble dry low. Do not iron directly on print.' }));
  const applyShippingDefault = () => setFormData(prev => ({ ...prev, shipping: 'Standard delivery takes 3-5 business days across India. Free shipping applies on all orders above ₹999. Hassle-free 15-day return policy.' }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 7) {
      alert("Maximum 7 pictures allowed. Please select fewer images.");
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: uploadData
        });
        
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (error) {
      console.error(error);
      alert('Failed to upload. Check Cloudinary settings in .env');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (formData.images.length >= 7) {
      alert("Maximum 7 pictures allowed.");
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput('');
  };

  const setSequence = (currentIndex, targetSequenceStr) => {
    const targetIndex = parseInt(targetSequenceStr) - 1;
    if (targetIndex === currentIndex) return;
    
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(currentIndex, 1);
    newImages.splice(targetIndex, 0, movedImage);
    
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const deleteFromCloudinary = async (url) => {
    try {
      if (!url.includes('cloudinary.com')) return;
      
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(p => p === 'upload');
      if (uploadIndex === -1) return;
      
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      
      if (!apiKey || !apiSecret) {
        console.warn("Cloudinary API Key or Secret missing. Skipping CDN deletion.");
        return;
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      
      const msgBuffer = new TextEncoder().encode(strToSign);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
      const signature = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  };

  const removeImage = async (indexToRemove) => {
    const imageUrl = formData.images[indexToRemove];
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      // Optionally delete immediately, or wait until save?
      // Since it's a draft form, deleting immediately might be aggressive if they cancel.
      // But we will delete it immediately for simplicity as requested.
      await deleteFromCloudinary(imageUrl);
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const product = products.find(p => p.id === id);
      if (product && product.images?.length > 0) {
        for (const imgUrl of product.images) {
          await deleteFromCloudinary(imgUrl);
        }
      }
      deleteMut.mutate(id);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">

      {/* Top Header & Button */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest font-mono">Catalog Management</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-dark mt-0.5">Products</h1>
          <p className="text-xs text-text-muted mt-1">Manage active listings and add new products.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-[#003366] rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              Cancel {editingId ? 'Edit' : 'Listing'}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Register New Product Listing
            </>
          )}
        </button>
      </div>

      {/* Register New Product Form (Toggled) */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm transition-all mb-12 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-text-dark">
              {editingId ? 'Edit Product Listing' : 'Register New Product Listing'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Product Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none" placeholder="e.g. Handmade Terracotta Bowl" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Category *</label>
                <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none" required>
                  <option value="">Select Category</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Status *</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none" required>
                  <option value="draft">Draft</option>
                  <option value="live">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Brand Name *</label>
                  <input type="text" value="Jog & Joy" readOnly className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed outline-none" required />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-text-muted">Total Stock *</label>
                    {formData.variants.length > 1 && (
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Auto-calculated</span>
                    )}
                  </div>
                  <input 
                    type="number" 
                    value={formData.variants.length > 1 ? formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : formData.stock} 
                    onChange={e => {
                      if (formData.variants.length <= 1) {
                        setFormData({ ...formData, stock: e.target.value });
                      }
                    }} 
                    disabled={formData.variants.length > 1}
                    className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none ${formData.variants.length > 1 ? 'bg-zinc-50 text-zinc-500 cursor-not-allowed' : ''}`} 
                    placeholder="e.g. 50" 
                    required 
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-zinc-50 border border-slate-200 rounded-xl">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-text-muted mb-3">Seasonal Collections</label>
                  <div className="flex flex-wrap gap-3">
                    {['Summer', 'Winter', 'Monsoon', 'Festive'].map(season => (
                      <label key={season} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.collections?.includes(season) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 group-hover:border-blue-600 bg-white'}`}>
                          {formData.collections?.includes(season) && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-bold text-zinc-600">{season}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={formData.collections?.includes(season)} 
                          onChange={(e) => {
                            const newCols = e.target.checked 
                              ? [...(formData.collections || []), season]
                              : (formData.collections || []).filter(c => c !== season);
                            setFormData({ ...formData, collections: newCols });
                          }} 
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="h-full w-px bg-border hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-muted whitespace-nowrap">New Arrival</span>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isNewArrival: !formData.isNewArrival })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.isNewArrival ? 'bg-blue-600' : 'bg-zinc-300'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isNewArrival ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 mb-6">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Age Group Targeting</label>
                  <select value={formData.ageGroup || ''} onChange={e => setFormData({ ...formData, ageGroup: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none">
                    <option value="">None / All Ages</option>
                    <option value="0-2 Years">0-2 Years (Baby & Toddler)</option>
                    <option value="3-5 Years">3-5 Years (Little Adventurers)</option>
                    <option value="6-8 Years">6-8 Years (Active Explorers)</option>
                    <option value="9-12 Years">9-12 Years (Junior Fashion)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Original Price (₹) *</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none" placeholder="e.g. 500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-muted mb-2">Discount (%)</label>
                  <input type="number" value={formData.discountPercent} onChange={e => setFormData({ ...formData, discountPercent: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none" placeholder="20" />
                  {formData.originalPrice && (
                    <p className="text-xs font-bold text-blue-600 mt-2">
                      Final Price: ₹{Math.round(Number(formData.originalPrice) * (1 - Number(formData.discountPercent) / 100))}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-text-muted mb-2">
                Product Images (Max 7) * <span className="font-normal text-xs ml-2 text-slate-400">First image is the Main Picture</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* File Upload */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-2">Upload Local Picture</label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={formData.images.length >= 7 || isUploadingImage}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-none file:mr-4      file:font-bold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 disabled:opacity-50 transition-all text-sm" 
                  />
                  {isUploadingImage && <span className="text-xs text-blue-600 mt-1 font-bold">Uploading to Cloudinary...</span>}
                </div>
                
                {/* URL Upload */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-2">Or Add Image Link (URL)</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={formData.images.length >= 7}
                      className="grow px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-none disabled:opacity-50 text-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={handleAddImageUrl}
                      disabled={formData.images.length >= 7 || !imageUrlInput.trim()}
                      className="px-4 py-2 bg-white border border-slate-200 text-[#003366] rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 shrink-0 text-sm transition-colors shadow-sm"
                    >
                      <LinkIcon className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Previews & Sequencer */}
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className={`relative flex flex-col items-center gap-3 p-3 rounded-xl border-2 bg-white shadow-sm transition-all ${idx === 0 ? 'border-[#EF4A45] ring-4 ring-[#EF4A45]/10' : 'border-slate-200 hover:border-slate-300'}`}>
                      
                      {idx === 0 && (
                        <span className="absolute -top-3 bg-[#EF4A45] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Main
                        </span>
                      )}
                      
                      <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-100 bg-[#FFF8EC]">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="absolute top-1.5 right-1.5 bg-red-500/90 backdrop-blur text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-transform hover:scale-110"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Sequencer Controls */}
                      <div className="flex items-center w-full justify-between px-2 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500">Seq No:</label>
                        <select 
                          value={idx + 1}
                          onChange={(e) => setSequence(idx, e.target.value)}
                          className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none focus:border-blue-600 cursor-pointer"
                        >
                          {formData.images.map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>

                      {/* Explicit Set as Main Button */}
                      {idx !== 0 && (
                        <button 
                          type="button" 
                          onClick={() => setSequence(idx, 1)}
                          className="w-full mt-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-md transition-colors uppercase tracking-wider"
                        >
                          Set as Main
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants Section */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Variants & Options</h3>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">Available Sizes *</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => {
                        const newSizes = formData.sizes.includes(size)
                          ? formData.sizes.filter(s => s !== size)
                          : [...formData.sizes, size];
                        setFormData({ ...formData, sizes: newSizes });
                      }}
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${formData.sizes.includes(size)
                          ? 'bg-slate-900 text-white shadow-md scale-105 border-transparent'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">Available Colors *</label>
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    const displayedColors = [...AVAILABLE_COLORS];
                    formData.colors.forEach(c => {
                      if (!displayedColors.some(dc => dc.hex === c.hex)) {
                        displayedColors.push(c);
                      }
                    });
                    return displayedColors.map(color => (
                      <button
                        type="button"
                        key={color.hex}
                        onClick={() => {
                          const hasColor = formData.colors.some(c => c.hex === color.hex);
                          const newColors = hasColor
                            ? formData.colors.filter(c => c.hex !== color.hex)
                            : [...formData.colors, color];
                          setFormData({ ...formData, colors: newColors });
                        }}
                        className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform ${formData.colors.some(c => c.hex === color.hex)
                            ? 'scale-125 ring-2 ring-slate-900 border-white'
                            : 'border-slate-200 hover:scale-110'
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ));
                  })()}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm w-full md:w-max">
                  <input 
                    type="color" 
                    value={customColorHex} 
                    onChange={e => setCustomColorHex(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    title="Choose custom color"
                  />
                  <input 
                    type="text" 
                    placeholder="Hex Code (e.g. #FF0000)" 
                    value={customColorHex}
                    onChange={e => setCustomColorHex(e.target.value)}
                    className="text-sm font-mono uppercase border border-slate-200 rounded-md px-2 py-1.5 w-28 focus:border-blue-600 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Color Name (e.g. Mint)" 
                    value={customColorName}
                    onChange={e => setCustomColorName(e.target.value)}
                    className="text-sm border border-slate-200 rounded-md px-2 py-1.5 w-32 focus:border-blue-600 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if(customColorHex && customColorHex.startsWith('#')) {
                        const finalName = customColorName.trim() || customColorHex.toUpperCase();
                        const newColor = { name: finalName, hex: customColorHex };
                        if (!formData.colors.some(c => c.hex === customColorHex)) {
                          setFormData({ ...formData, colors: [...formData.colors, newColor] });
                        }
                        setCustomColorName('');
                      }
                    }}
                    className="text-xs font-bold bg-white border border-slate-200 text-[#003366] px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Variant Matrix */}
            {(formData.variants?.length > 0) && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Variant Matrix (Inventory & Pricing)</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-xs tracking-wider">
                      <tr>
                        <th className="p-4">Variant</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4 w-32">Stock *</th>
                        <th className="p-4 w-32">Price (Override)</th>
                        <th className="p-4 w-48">Image (Optional)</th>
                        <th className="p-4 w-20 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.variants.map((variant) => (
                        <tr key={variant.id} className={`hover:bg-slate-50 transition-colors ${variant.isHidden ? 'opacity-50 bg-slate-50/50' : ''}`}>
                          <td className="p-4 font-bold flex items-center gap-2">
                            {variant.colorName !== 'Standard' && (
                              <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: variant.colorHex }}></span>
                            )}
                            <span>
                              {variant.colorName !== 'Standard' ? variant.colorName : ''} 
                              {variant.colorName !== 'Standard' && variant.size !== 'Standard' ? ' - ' : ''} 
                              {variant.size !== 'Standard' ? variant.size : (variant.colorName === 'Standard' ? 'Standard Edition' : '')}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-500">{variant.sku}</td>
                          <td className="p-4">
                            <input 
                              type="number" 
                              min="0"
                              value={variant.stock} 
                              onChange={e => handleUpdateVariant(variant.id, 'stock', e.target.value)}
                              className={`w-full p-2 border rounded-lg focus:outline-none transition-colors ${
                                Number(variant.stock) === 0 
                                  ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-500 font-bold' 
                                  : 'border-slate-200 focus:border-blue-600'
                              }`}
                              required
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="number" 
                              min="0"
                              placeholder="Default"
                              value={variant.price} 
                              onChange={e => handleUpdateVariant(variant.id, 'price', e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-600 outline-none"
                            />
                          </td>
                          <td className="p-4">
                            <select 
                              value={variant.image}
                              onChange={e => handleUpdateVariant(variant.id, 'image', e.target.value)}
                              className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none bg-white"
                            >
                              <option value="">-- No Image --</option>
                              {formData.images.map((img, i) => (
                                <option key={i} value={img}>Main Image {i + 1}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              type="button"
                              onClick={() => handleUpdateVariant(variant.id, 'isHidden', !variant.isHidden)}
                              className={`p-2 rounded-lg transition-colors ${variant.isHidden ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'}`}
                              title={variant.isHidden ? 'Hidden from customers' : 'Visible to customers'}
                            >
                              {variant.isHidden ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-2">Leave price blank to use the default calculated price. Total stock will be automatically calculated.</p>
              </div>
            )}

            {/* Rich Details Section */}
            <div className="bg-[#FFF8EC] p-6 rounded-xl border border-amber-100 space-y-6">
              <div className="border-b border-amber-200 pb-2">
                <h3 className="font-bold text-slate-800">Product Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-600">Fabric & Material</label>
                    <button type="button" onClick={applyFabricDefault} className="text-[10px] font-bold text-[#EF4A45] hover:underline bg-white px-2 py-1 rounded shadow-sm border border-amber-200">⚡ Auto-fill</button>
                  </div>
                  <textarea rows="3" value={formData.fabric} onChange={e => setFormData({ ...formData, fabric: e.target.value })} className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:border-red-500 outline-none resize-none" placeholder="e.g. 100% Bio-Washed Premium Cotton..."></textarea>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-600">Care Instructions</label>
                    <button type="button" onClick={applyCareDefault} className="text-[10px] font-bold text-[#EF4A45] hover:underline bg-white px-2 py-1 rounded shadow-sm border border-amber-200">⚡ Auto-fill</button>
                  </div>
                  <textarea rows="3" value={formData.care} onChange={e => setFormData({ ...formData, care: e.target.value })} className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:border-red-500 outline-none resize-none" placeholder="e.g. Machine wash cold..."></textarea>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-600">Shipping & Returns</label>
                  <button type="button" onClick={applyShippingDefault} className="text-[10px] font-bold text-[#EF4A45] hover:underline bg-white px-2 py-1 rounded shadow-sm border border-amber-200">⚡ Auto-fill</button>
                </div>
                <textarea rows="2" value={formData.shipping} onChange={e => setFormData({ ...formData, shipping: e.target.value })} className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:border-red-500 outline-none resize-none" placeholder="e.g. Standard delivery takes 3-5 days..."></textarea>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-muted mb-2">Product Description & Overview</label>
              <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-600 outline-none resize-none" placeholder="Rich description of the product..."></textarea>
            </div>

            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-[#003366] font-bold rounded-xl shadow-sm transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {(createMut.isPending || updateMut.isPending) ? 'Processing...' : (editingId ? 'Update Product Listing' : 'Submit Product Listing')}
            </button>
          </form>
        </div>
      )}

      {/* Active Product Listings */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm transition-all overflow-hidden mb-12">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h2 className="text-xl font-extrabold text-text-dark whitespace-nowrap">Active Listings</h2>
            <div className="px-3 py-1 bg-zinc-100 text-zinc-500 rounded-lg text-sm font-bold whitespace-nowrap">
              {products.length} Total
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <select 
              value={filterStock} 
              onChange={e => setFilterStock(e.target.value)}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-bold text-text-dark focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock ({'>'}10)</option>
              <option value="low_stock">Low Stock (1-10)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-600 text-sm transition-colors shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-zinc-400 font-semibold">Loading catalog...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product Details</th>
                  <th className="px-5 py-3 font-medium">SKU / Code</th>
                  <th className="px-5 py-3 font-medium">Stock Level</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-zinc-400">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                    const sku = product.variants?.[0]?.sku || '-';
                    const image = product.image || product.images?.[0];

                    return (
                      <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {image ? (
                                <img src={image} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-zinc-300" />
                              )}
                            </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-text-dark">{product.title}</p>
                                  {product.isNewArrival && (
                                    <span className="px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-600 text-[9px] font-extrabold tracking-widest uppercase">New</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-zinc-400 font-bold">{product.categoryId || product.vendor}</p>
                                  {product.collections?.length > 0 && (
                                    <>
                                      <span className="text-zinc-300">•</span>
                                      <div className="flex gap-1">
                                        {product.collections.map(c => (
                                          <span key={c} className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">{c}</span>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-600">{sku}</td>
                        <td className="px-6 py-4 font-bold text-zinc-600">
                          <span className={totalStock <= 5 ? "text-orange-600" : ""}>{totalStock} units</span>
                          {product.variants?.some(v => Number(v.stock) === 0) && totalStock > 0 && (
                            <p className="text-[9px] text-red-500 font-extrabold uppercase mt-1">⚠️ Low Size Avail</p>
                          )}
                          {totalStock === 0 && (
                            <p className="text-[9px] text-red-500 font-extrabold uppercase mt-1">Sold Out</p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-text-dark">₹{product.price || product.basePrice}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            product.status === 'live' ? 'bg-green-500/15 text-green-700' : 
                            product.status === 'pending_review' ? 'bg-orange-500/15 text-orange-700' : 
                            product.status === 'archived' ? 'bg-red-500/10 text-red-700' :
                            'bg-zinc-200 text-zinc-600'
                          }`}>
                            {product.status === 'live' && <CheckCircle2 className="w-3 h-3" />}
                            {product.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleEdit(product)} className="text-blue-600 hover:opacity-80 transition-opacity" title="Edit Product">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:opacity-80 transition-opacity" title="Delete Product">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
