import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import KidsProductCard from '../components/ui/KidsProductCard';
import QuickViewModal from '../components/ui/QuickViewModal';
import CustomDropdown from '../components/ui/CustomDropdown';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useCategoriesList } from '../queries/useCategories';
import { useSettings } from '../queries/useSettings';
import ShopByAge from '../components/home/ShopByAge';
import AnimatedLogoLoader from '../components/ui/AnimatedLogoLoader';
import { normalizeColor } from '../utils/helpers';
import { matchesAge, matchesColor, matchesCategory, matchesPrice } from '../utils/filterHelpers';

const kidsSortOptions = [
  { label: 'Recommended', value: 'Recommended' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
  { label: 'Rating: High to Low', value: 'Rating: High to Low' },
  { label: 'Newest Arrivals', value: 'Newest Arrivals' }
];

export default function KidsPage() {
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

  const [sortBy, setSortBy] = useState('Recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const productsPerPage = 12;
  const topControlsRef = useRef(null);

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
    setCurrentPage(1);
    const newAge = searchParams.get('age');
    const cat = searchParams.get('category');
    const color = searchParams.get('color');

    setFilters(prev => {
      const updated = { ...prev };
      if (newAge) {
        const norm = newAge.replace('–', '-');
        if (!updated.ageGroups.includes(norm)) updated.ageGroups = [norm];
      }
      if (cat && cat !== 'All') {
        if (!updated.types.includes(cat)) updated.types = [cat];
      }
      if (color) {
        if (!updated.colors.includes(color)) updated.colors = [color];
      }
      return updated;
    });
  }, [searchParams]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => {
      if (topControlsRef.current) {
        const y = topControlsRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

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
    setCurrentPage(1);
  };

  const { combinedProducts, isLoading } = useCombinedProducts();
  const kidsProducts = combinedProducts;

  const { data: categoriesResponse } = useCategoriesList();
  const dbCategories = useMemo(() => categoriesResponse?.data || [], [categoriesResponse?.data]);

  const productTypes = useMemo(() => {
    if (effectiveFilterPanels?.categories && effectiveFilterPanels.categories.length > 0) {
      return effectiveFilterPanels.categories.map(c => {
        const label = typeof c === 'string' ? c : c.label;
        const id = typeof c === 'string' ? c : (c.id || c.label);
        const count = kidsProducts.filter(p => 
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
        count: kidsProducts.filter(p => p.categoryId === c.id || p.category === c.label).length
      }));
    }
    const catMap = new Map();
    kidsProducts.forEach(p => {
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
  }, [effectiveFilterPanels, dbCategories, kidsProducts]);

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
    if (effectiveFilterPanels?.ageGroups && effectiveFilterPanels.ageGroups.length > 0) {
      return effectiveFilterPanels.ageGroups.map(a => typeof a === 'string' ? a : (a.label || a.name || String(a)));
    }
    const ages = new Set(['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years']);
    kidsProducts.forEach(p => {
      if (p.ageGroup) {
        const agStr = typeof p.ageGroup === 'string' ? p.ageGroup.replace('–', '-') : (p.ageGroup.label || String(p.ageGroup));
        ages.add(agStr);
      }
    });
    return Array.from(ages).sort();
  }, [effectiveFilterPanels, kidsProducts]);

  const colorOptions = useMemo(() => {
    if (effectiveFilterPanels?.colors && effectiveFilterPanels.colors.length > 0) {
      return effectiveFilterPanels.colors.map(c => typeof c === 'string' ? { name: c, hex: null } : c);
    }
    const colors = new Set();
    kidsProducts.forEach(p => {
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
  }, [effectiveFilterPanels, kidsProducts]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.prices.length > 0 ||
      filters.ageGroups.length > 0 ||
      filters.colors.length > 0
    );
  }, [filters]);

  const resetAllFilters = () => {
    setFilters({
      types: [],
      prices: [],
      ageGroups: [],
      colors: []
    });
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = kidsProducts.filter((p) => {
      // Type Filter
      if (!matchesCategory(p, filters.types, dbCategories)) return false;

      // Price Filter
      if (!matchesPrice(p, filters.prices, priceOptions)) return false;

      // Age Group Filter
      if (!matchesAge(p, filters.ageGroups)) return false;

      // Color Filter
      if (!matchesColor(p, filters.colors)) return false;

      return true;
    });

    const getPrice = (p) => {
      const val = p.price ?? p.basePrice ?? 0;
      return typeof val === 'number' ? val : (Number(String(val).replace(/[^0-9.]/g, '')) || 0);
    };

    // Sort Logic
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sortBy === 'Newest Arrivals') {
      result.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1);
      });
    } else if (sortBy === 'Rating: High to Low') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [kidsProducts, filters, sortBy, priceOptions, dbCategories]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const getPageNumbers = () => {
    let pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) end = maxVisible;
      if (end === totalPages) start = totalPages - maxVisible + 1;

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#FFF8EC] relative overflow-hidden pb-20">
      {/* Animated Cloth Doodles Background Swapped from Home */}
      <ClothDoodlesBackground />

      {/* Full-Screen Video Hero Section */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0'
      }}>
        {/* Background Video Swapped from Home */}
        <div className="absolute inset-0 z-0 flex items-center bg-black">
          <video
            src="/videos/kids-hero-new.mp4"
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={(e) => { e.currentTarget.playbackRate = 2; }}
            className="w-full h-full object-cover block opacity-90"
          />
        </div>

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 20px',
          maxWidth: '800px'
        }}>
          {/* Style 4: Sleek Stacked Gradient Typography (Matching New Arrivals Style 4) */}
          <div className="inline-flex flex-col items-center justify-center mb-6 select-none group cursor-default">
            {/* Row 1: KIDS */}
            <div className="inline-flex flex-col items-center">
              <span className="text-sm sm:text-base font-black uppercase tracking-[0.34em] bg-linear-to-r from-[#FF6B4A] via-[#FFAE19] to-[#FFD800] bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-105">
                KIDS
              </span>
              <div className="w-full min-w-[95px] sm:min-w-[115px] h-[3px] rounded-full bg-linear-to-r from-[#FF6B4A] via-[#FFD800] to-[#00A3E0] mt-1.5 shadow-2xs" />
            </div>

            {/* Row 2: COLLECTION */}
            <div className="inline-flex flex-col items-center mt-2.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-[0.44em] text-[#0F172A] transition-colors duration-300 group-hover:text-[#5B2E89]">
                COLLECTION
              </span>
              <div className="w-full min-w-[130px] sm:min-w-[155px] h-[2.5px] rounded-full bg-linear-to-r from-[#00A3E0] via-[#4F46E5] to-[#5B2E89] mt-1.5 shadow-2xs" />
            </div>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 900,
            color: '#2F1B2B',
            lineHeight: 1.2,
            margin: '0 0 20px'
          }}>
            Little Ones,{' '}
            <span style={{ color: '#FFD800' }}>Big Style</span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
            color: '#555555',
            marginBottom: '36px',
            fontWeight: 500,
            lineHeight: 1.6
          }}>
            Premium kids wear — comfortable, colourful & built to play.
          </p>

          <a
            href="#kids-products"
            style={{
              display: 'inline-block',
              backgroundColor: '#EF4A45',
              color: '#ffffff',
              padding: '14px 38px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              border: '1.5px solid #222222',
              boxShadow: '0 4px 0 #222222',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 0 #222222';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 0 #222222';
            }}
          >
            Shop Kids Wear →
          </a>
        </div>
      </div>

      {/* Products Section Anchor */}
      <div id="kids-products" className="max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-8 pt-8">

        {/* Shop By Age Filter Section */}
        <div className="mb-6">
          <ShopByAge />
        </div>

        {/* Top Controls */}
        <div ref={topControlsRef} className="relative z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4 sm:gap-0">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="text-slate-700 font-black text-sm">
              Showing {filteredProducts.length} Products
            </div>
            {/* Mobile Filter Toggle */}
            <button 
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-bold text-slate-700 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> {showMobileFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <CustomDropdown
              options={kidsSortOptions}
              value={sortBy}
              onChange={setSortBy}
              icon={SlidersHorizontal}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Sidebar Filters */}
          <div className={`lg:col-span-1 space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>

            {/* Active Filters Reset Bar */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <span className="text-xs font-bold text-slate-700">Filters Active</span>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-extrabold text-emerald-800 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Product Type Accordion */}
            {productTypes.length > 0 && (
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
                            className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{type.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300">{type.count < 10 ? `0${type.count}` : type.count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                          className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
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
                            className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
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
                            className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
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
              <AnimatedLogoLoader text="Loading Kids Collection..." />
            ) : currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
                  {currentProducts.map((product) => (
                    <KidsProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-3 mt-12 pb-8">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none text-slate-600 transition-all border border-slate-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 pointer-events-none" />
                  </button>

                  <div className="flex items-center gap-2">
                    {getPageNumbers().map(pageNum => (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center border border-slate-100 cursor-pointer ${currentPage === pageNum
                          ? 'bg-emerald-800 text-white shadow-md'
                          : 'bg-white text-slate-600 hover:shadow-md shadow-sm'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none text-slate-600 transition-all border border-slate-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 pointer-events-none" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-black text-slate-800">No products found</h3>
                <p className="text-sm text-slate-500 font-semibold">Try adjusting your filters or resetting them.</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 rounded-full bg-emerald-800 text-white font-extrabold text-xs shadow-sm hover:bg-emerald-900 cursor-pointer"
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
