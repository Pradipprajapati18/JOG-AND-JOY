import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import QuickViewModal from '../components/ui/QuickViewModal';
import CategoryHero from '../components/ui/CategoryHero';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useCategoriesList } from '../queries/useCategories';
import { useSettings } from '../queries/useSettings';
import { ChevronDown, ChevronUp, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';
import AnimatedLogoLoader from '../components/ui/AnimatedLogoLoader';
import { normalizeColor } from '../utils/helpers';
import { matchesAge, parseAgeRange } from '../utils/filterHelpers';

const sortOptions = [
  { label: 'Sort: Recommended', value: 'popular' },
  { label: 'Price: Low to High', value: 'low' },
  { label: 'Price: High to Low', value: 'high' },
  { label: 'Newest Arrivals', value: 'new' }
];

export default function Products({ pageCategory = null }) {
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    productType: true,
    price: true,
    ageGroup: true,
    color: true
  });

  const [filters, setFilters] = useState({
    types: [],
    prices: [],
    ageGroups: [],
    colors: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Settings & Custom Filter Panels
  const { data: settingsData } = useSettings();
  const [localFilterPanels, setLocalFilterPanels] = useState(() => {
    try {
      const stored = localStorage.getItem('jj_filter_panels');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setLocalFilterPanels(e.detail);
      } else {
        try {
          const stored = localStorage.getItem('jj_filter_panels');
          if (stored) setLocalFilterPanels(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener('jj_filter_panels_updated', handleUpdate);
    return () => window.removeEventListener('jj_filter_panels_updated', handleUpdate);
  }, []);

  const effectiveFilterPanels = settingsData?.filterPanels || localFilterPanels || null;

  useEffect(() => {
    const cat = pageCategory || searchParams.get('category');
    const age = searchParams.get('age');
    const search = searchParams.get('search');

    if (search !== null && search !== undefined) {
      setSearchQuery(search);
    }

    if (cat && cat !== 'All') {
      setFilters(prev => ({
        ...prev,
        types: prev.types.includes(cat) ? prev.types : [cat]
      }));
    }

    if (age) {
      setFilters(prev => ({
        ...prev,
        ageGroups: [age.replace('–', '-')]
      }));
    }
  }, [pageCategory, searchParams]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (category, value) => {
    setFilters((prev) => {
      const updated = prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: updated };
    });
  };

  const { combinedProducts, isLoading } = useCombinedProducts();
  const { data: categoriesResponse } = useCategoriesList();
  const dbCategories = useMemo(() => categoriesResponse?.data || [], [categoriesResponse?.data]);

  const productTypes = useMemo(() => {
    if (effectiveFilterPanels?.categories && effectiveFilterPanels.categories.length > 0) {
      return effectiveFilterPanels.categories.map(c => {
        const label = typeof c === 'string' ? c : c.label;
        const id = typeof c === 'string' ? c : (c.id || c.label);
        const count = combinedProducts.filter(p => 
          p.categoryId === id || 
          p.category === label || 
          p.categoryLabel === label ||
          (p.category || '').toLowerCase() === label.toLowerCase()
        ).length;
        return { id, label, count };
      });
    }

    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map(c => ({
        id: c.label,
        label: c.label,
        count: combinedProducts.filter(p => p.categoryId === c.id || p.category === c.label).length
      }));
    }
    const catMap = new Map();
    combinedProducts.forEach(p => {
      const cat = p.category || p.categoryLabel;
      if (cat) {
        catMap.set(cat, (catMap.get(cat) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([label, count]) => ({
      id: label,
      label,
      count
    }));
  }, [effectiveFilterPanels, dbCategories, combinedProducts]);

  const priceOptions = useMemo(() => {
    if (effectiveFilterPanels?.priceRanges && effectiveFilterPanels.priceRanges.length > 0) {
      return effectiveFilterPanels.priceRanges;
    }
    return [
      { id: 'low', label: 'Under ₹499', min: 0, max: 499 },
      { id: 'mid', label: '₹500 - ₹999', min: 500, max: 999 },
      { id: 'high', label: 'Over ₹1000', min: 1000, max: 999999 }
    ];
  }, [effectiveFilterPanels]);

  const ageGroupOptions = useMemo(() => {
    const ages = new Set();
    if (effectiveFilterPanels?.ageGroups && effectiveFilterPanels.ageGroups.length > 0) {
      effectiveFilterPanels.ageGroups.forEach(a => {
        const val = typeof a === 'string' ? a : (a.label || a.name || String(a));
        if (val) ages.add(val.replace('–', '-'));
      });
    } else {
      ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years'].forEach(a => ages.add(a));
    }
    (filters.ageGroups || []).forEach(a => {
      if (a) ages.add(String(a).replace('–', '-'));
    });
    combinedProducts.forEach(p => {
      if (p.ageGroup) {
        const agStr = typeof p.ageGroup === 'string' ? p.ageGroup.replace('–', '-') : (p.ageGroup.label || String(p.ageGroup));
        if (agStr) ages.add(agStr);
      }
    });

    return Array.from(ages).sort((a, b) => {
      const rA = parseAgeRange(a);
      const rB = parseAgeRange(b);
      if (rA && rB) {
        if (rA[0] !== rB[0]) return rA[0] - rB[0];
        return rA[1] - rB[1];
      }
      return a.localeCompare(b);
    });
  }, [effectiveFilterPanels, combinedProducts, filters.ageGroups]);

  const colorOptions = useMemo(() => {
    if (effectiveFilterPanels?.colors && effectiveFilterPanels.colors.length > 0) {
      return effectiveFilterPanels.colors.map(c => typeof c === 'string' ? { name: c, hex: null } : c);
    }
    const colors = new Set();
    combinedProducts.forEach(p => {
      p.colors?.forEach(c => {
        const colorName = normalizeColor(c).name;
        if (colorName && colorName !== 'Standard') colors.add(colorName);
      });
      p.variants?.forEach(v => {
        const colorName = normalizeColor({ hex: v.colorHex, name: v.colorName }).name;
        if (colorName && colorName !== 'Standard') colors.add(colorName);
      });
    });
    return Array.from(colors).sort().map(name => ({ name, hex: null }));
  }, [effectiveFilterPanels, combinedProducts]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.prices.length > 0 ||
      filters.ageGroups.length > 0 ||
      filters.colors.length > 0 ||
      Boolean(searchQuery.trim())
    );
  }, [filters, searchQuery]);

  const resetAllFilters = () => {
    setFilters({
      types: [],
      prices: [],
      ageGroups: [],
      colors: []
    });
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    let result = combinedProducts.filter((p) => {
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchDesc) return false;
      }

      // Type Filter
      let matchType = filters.types.length === 0;
      if (!matchType) {
        if (
          filters.types.includes(p.categoryId) || 
          filters.types.includes(p.categoryLabel) || 
          filters.types.includes(p.category)
        ) {
          matchType = true;
        }
      }

      // Price Filter
      let matchPrice = filters.prices.length === 0;
      if (!matchPrice) {
        matchPrice = priceOptions.some(pr => {
          if (!filters.prices.includes(pr.id)) return false;
          const min = pr.min !== undefined ? pr.min : 0;
          const max = pr.max !== undefined ? pr.max : 999999;
          return p.price >= min && p.price <= max;
        });
      }

      // Color Filter
      let matchColor = filters.colors.length === 0;
      if (!matchColor) {
        const productColors = (p.colors || []).map(c => normalizeColor(c).name).filter(Boolean);
        const variantColors = (p.variants || []).map(v => normalizeColor({ hex: v.colorHex, name: v.colorName }).name).filter(Boolean);
        const allColors = [...new Set([...productColors, ...variantColors])];
        matchColor = allColors.some(c => filters.colors.some(fc => fc.toLowerCase() === c.toLowerCase()));
      }

      // Age Group Filter
      const matchAge = matchesAge(p, filters.ageGroups);

      return matchType && matchPrice && matchColor && matchAge;
    });

    // Sort Logic
    if (sortBy === 'low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'new') {
      result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    } else {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [combinedProducts, filters, searchQuery, sortBy, priceOptions]);

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Kids Hero Section */}
      {pageCategory === 'Kids' && <CategoryHero />}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${pageCategory === 'Kids' ? 'pt-4' : 'pt-10'}`}>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <span className="px-4 py-1.5 rounded-full bg-[#AEE6FF]/50 text-sky-900 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Explore Collection
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight capitalize pt-1">
            {filters.types.length === 1 ? filters.types[0] : "All Products"} <span className="text-[#EF4A45]">Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed px-2">
            Browse our premium collection of bio-washed cotton apparel, ethnic wear, and activewear.
          </p>
        </div>

        {/* Top Controls Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Showing Count, Mobile Filter Button & Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="text-slate-600 font-bold text-xs sm:text-sm whitespace-nowrap">
                Showing <strong className="text-slate-900 font-black">{filteredProducts.length}</strong> Products
              </div>

              {/* Mobile Filter Toggle */}
              <button 
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
              </button>

              {/* Sort Select */}
              <div className="min-w-0 flex items-center justify-end">
                <CustomDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  icon={SlidersHorizontal}
                  className="w-full sm:w-auto"
                  buttonClassName="px-3! sm:px-4!"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Main Content Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left Sidebar Filters (Matching Kids Wear Page) */}
          <div className={`lg:col-span-1 space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Active Filters Reset Bar */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-200/80">
                <span className="text-xs font-bold text-slate-700">Filters Active</span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-extrabold text-[#EF4A45] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Product Type Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('productType')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="text-sm font-black text-slate-800">Product type</span>
                {expandedSections.productType ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.productType && (
                <div className="p-5 space-y-3 max-h-64 overflow-y-auto hide-scrollbar">
                  {productTypes.map((type) => (
                    <label key={type.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type.id)}
                          onChange={() => handleFilterChange('types', type.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#EF4A45] focus:ring-[#EF4A45] cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{type.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-300">{type.count < 10 ? `0${type.count}` : type.count}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Accordion */}
            {priceOptions.length > 0 && (
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('price')}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-black text-slate-800">Price</span>
                  {expandedSections.price ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {expandedSections.price && (
                  <div className="p-5 space-y-3">
                    {priceOptions.map((price) => (
                      <label key={price.id} className="flex items-center gap-3 group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.prices.includes(price.id)}
                          onChange={() => handleFilterChange('prices', price.id)}
                          className="w-4 h-4 rounded border-slate-300 text-[#EF4A45] focus:ring-[#EF4A45] cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{price.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Age Group Accordion */}
            {ageGroupOptions.length > 0 && (
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('ageGroup')}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-black text-slate-800">Age Group</span>
                  {expandedSections.ageGroup ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {expandedSections.ageGroup && (
                  <div className="p-5 space-y-3">
                    {ageGroupOptions.map((age) => {
                      const label = typeof age === 'string' ? age : (age.label || age.name || String(age));
                      const key = typeof age === 'string' ? age : (age.id || label);
                      return (
                        <label key={key} className="flex items-center gap-3 group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.ageGroups.includes(label)}
                            onChange={() => handleFilterChange('ageGroups', label)}
                            className="w-4 h-4 rounded border-slate-300 text-[#EF4A45] focus:ring-[#EF4A45] cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Color Accordion */}
            {colorOptions.length > 0 && (
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleSection('color')}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-black text-slate-800">Color</span>
                  {expandedSections.color ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {expandedSections.color && (
                  <div className="p-5 space-y-3 max-h-60 overflow-y-auto hide-scrollbar">
                    {colorOptions.map((c) => {
                      const cName = typeof c === 'string' ? c : c.name;
                      const cHex = (typeof c === 'object' && c.hex) ? c.hex : normalizeColor(cName)?.hex;
                      return (
                        <label key={cName} className="flex items-center gap-3 group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.colors.includes(cName)}
                            onChange={() => handleFilterChange('colors', cName)}
                            className="w-4 h-4 rounded border-slate-300 text-[#EF4A45] focus:ring-[#EF4A45] cursor-pointer"
                          />
                          {cHex && (
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs" 
                              style={{ backgroundColor: cHex }} 
                            />
                          )}
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{cName}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-4">
            {isLoading ? (
              <AnimatedLogoLoader text="Loading Products..." />
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="text-xl font-black text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 font-semibold">Try resetting filters or searching with different keywords.</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-sm hover:bg-red-600 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
