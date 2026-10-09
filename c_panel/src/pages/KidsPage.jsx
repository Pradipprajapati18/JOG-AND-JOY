import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import KidsProductCard from '../components/ui/KidsProductCard';
import QuickViewModal from '../components/ui/QuickViewModal';
import CustomDropdown from '../components/ui/CustomDropdown';
import ClothDoodlesBackground from '../components/ui/ClothDoodlesBackground';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useCategoriesList } from '../queries/useCategories';
import ShopByAge from '../components/home/ShopByAge';
import AnimatedLogoLoader from '../components/ui/AnimatedLogoLoader';



const kidsSortOptions = [
  { label: 'Recommended', value: 'Recommended' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
  { label: 'Rating: High to Low', value: 'Rating: High to Low' },
  { label: 'Newest Arrivals', value: 'Newest Arrivals' }
];

export default function KidsPage() {
  const [searchParams] = useSearchParams();
  const initialGender = searchParams.get('gender');
  const ageParam = searchParams.get('age');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    productType: true,
    price: true,
    ageGroup: true,
    gender: true,
    size: true,
    color: true
  });

  const [filters, setFilters] = useState({
    types: [],
    prices: [],
    ageGroups: ageParam ? [ageParam.replace('–', '-')] : [],
    sizes: [],
    colors: []
  });

  useEffect(() => {
    setCurrentPage(1);
    const newAge = searchParams.get('age');
    if (newAge) {
      setFilters(prev => ({ ...prev, ageGroups: [newAge.replace('–', '-')] }));
    }
  }, [searchParams]);

  const [sortBy, setSortBy] = useState('Recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const productsPerPage = 12;
  const topControlsRef = useRef(null);

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
    setCurrentPage(1); // Reset page on filter change
  };

  const { combinedProducts, isLoading } = useCombinedProducts();

  const kidsProducts = combinedProducts;

  const filteredProducts = useMemo(() => {
    let result = kidsProducts.filter((p) => {
      const nameLower = p.name.toLowerCase();

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
        if (filters.prices.includes('low') && p.price < 500) matchPrice = true;
        if (filters.prices.includes('mid') && p.price >= 500 && p.price <= 999) matchPrice = true;
        if (filters.prices.includes('high') && p.price > 999) matchPrice = true;
      }



      // Size Filter
      let matchSize = filters.sizes.length === 0;
      if (!matchSize) {
        const productSizes = p.sizes || [];
        const variantSizes = (p.variants || []).map(v => v.size).filter(Boolean);
        const allSizes = [...new Set([...productSizes, ...variantSizes])];
        matchSize = allSizes.some(s => filters.sizes.includes(s));
      }

      // Color Filter
      let matchColor = filters.colors.length === 0;
      if (!matchColor) {
        const productColors = (p.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
        const variantColors = (p.variants || []).map(v => v.colorName).filter(Boolean);
        const allColors = [...new Set([...productColors, ...variantColors])];
        matchColor = allColors.some(c => filters.colors.includes(c));
      }

      // Age Group Filter
      let matchAge = filters.ageGroups.length === 0;
      if (!matchAge) {
        matchAge = filters.ageGroups.some(selectedAge => {
          const normAge = selectedAge.toLowerCase().replace('–', '-');
          
          if (p.ageGroup && p.ageGroup.toLowerCase().replace('–', '-') === normAge) {
            return true;
          }

          const allSizes = [
            ...(p.sizes || []),
            ...(p.variants || []).map(v => v.size)
          ].filter(Boolean).map(s => s.toLowerCase().replace('–', '-'));

          if (normAge.includes('0-2')) {
            return allSizes.some(s => s.includes('0-3') || s.includes('3-6') || s.includes('6-12') || s.includes('1-2') || s.includes('2-3') || s.includes('months') || s.includes('0-2'));
          }
          if (normAge.includes('3-5')) {
            return allSizes.some(s => s.includes('3-4') || s.includes('4-5') || s.includes('5-6') || s.includes('3-5'));
          }
          if (normAge.includes('6-8')) {
            return allSizes.some(s => s.includes('6-7') || s.includes('7-8') || s.includes('8-9') || s.includes('6-8'));
          }
          if (normAge.includes('9-12')) {
            return allSizes.some(s => s.includes('9-10') || s.includes('10-11') || s.includes('11-12') || s.includes('9-12'));
          }

          return false;
        });
      }

      return matchType && matchPrice && matchSize && matchColor && matchAge;
    });

    // Sort Logic
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest Arrivals') {
      result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    } else if (sortBy === 'Rating: High to Low') {
      // Mock sorting: just reverse the ID or mock rating
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [kidsProducts, filters, sortBy]);

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

  const { data: categoriesResponse } = useCategoriesList();
  const dbCategories = categoriesResponse?.data || [];

  const productTypes = useMemo(() => {
    return dbCategories.map(c => ({
      id: c.label,
      label: c.label,
      count: kidsProducts.filter(p => p.categoryId === c.id || p.category === c.label).length
    }));
  }, [dbCategories, kidsProducts]);



  const ageGroupOptions = useMemo(() => {
    const ages = new Set(['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years']);
    kidsProducts.forEach(p => {
      if (p.ageGroup) {
        ages.add(p.ageGroup.replace('–', '-'));
      }
    });
    return Array.from(ages).sort();
  }, [kidsProducts]);

  const sizeOptions = useMemo(() => {
    const sizes = new Set();
    kidsProducts.forEach(p => {
      p.sizes?.forEach(s => sizes.add(s));
      p.variants?.forEach(v => {
        if (v.size && v.size !== 'Standard') sizes.add(v.size);
      });
    });
    return Array.from(sizes).sort();
  }, [kidsProducts]);

  const colorOptions = useMemo(() => {
    const colors = new Set();
    kidsProducts.forEach(p => {
      p.colors?.forEach(c => {
        const colorName = typeof c === 'object' ? c.name : c;
        if (colorName) colors.add(colorName);
      });
      p.variants?.forEach(v => {
        if (v.colorName && v.colorName !== 'Standard') colors.add(v.colorName);
      });
    });
    return Array.from(colors).sort();
  }, [kidsProducts]);

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
          <span style={{
            display: 'inline-block',
            backgroundColor: '#FFD800',
            color: '#1a1a1a',
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '6px 18px',
            borderRadius: '30px',
            border: '1.5px solid #222222',
            boxShadow: '0 3px 0 #222222',
            marginBottom: '20px'
          }}>
            🎨 Kids Collection
          </span>

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
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-bold text-slate-700"
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

            {/* Product Type Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('productType')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-black text-slate-800">Product type</span>
                {expandedSections.productType ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.productType && (
                <div className="p-5 space-y-3">
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
                  <button className="text-xs font-black text-slate-800 underline pt-2 hover:text-[#A7DEB9]">
                    See More
                  </button>
                </div>
              )}
            </div>

            {/* Price Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('price')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-black text-slate-800">Price</span>
                {expandedSections.price ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.price && (
                <div className="p-5 space-y-3">
                  {[
                    { id: 'low', label: 'Under ₹499' },
                    { id: 'mid', label: '₹500 - ₹999' },
                    { id: 'high', label: 'Over ₹1000' }
                  ].map((price) => (
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



            {/* Age Group Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('ageGroup')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-black text-slate-800">Age Group</span>
                {expandedSections.ageGroup ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.ageGroup && (
                <div className="p-5 space-y-3">
                  {ageGroupOptions.map((age) => (
                    <label key={age} className="flex items-center gap-3 group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ageGroups.includes(age)}
                        onChange={() => handleFilterChange('ageGroups', age)}
                        className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{age}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Size Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('size')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-black text-slate-800">Size</span>
                {expandedSections.size ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.size && (
                <div className="p-5 space-y-3">
                  {sizeOptions.map((s) => (
                    <label key={s} className="flex items-center gap-3 group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(s)}
                        onChange={() => handleFilterChange('sizes', s)}
                        className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Color Accordion */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleSection('color')}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm font-black text-slate-800">Color</span>
                {expandedSections.color ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {expandedSections.color && (
                <div className="p-5 space-y-3">
                  {colorOptions.map((c) => (
                    <label key={c} className="flex items-center gap-3 group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(c)}
                        onChange={() => handleFilterChange('colors', c)}
                        className="w-4 h-4 rounded border-slate-300 text-[#A7DEB9] focus:ring-[#A7DEB9] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{c}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>



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
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none text-slate-600 transition-all border border-slate-100"
                  >
                    <ChevronLeft className="w-5 h-5 pointer-events-none" />
                  </button>

                  <div className="flex items-center gap-2">
                    {getPageNumbers().map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center border border-slate-100 ${currentPage === pageNum
                          ? 'bg-emerald-800 text-white shadow-md'
                          : 'bg-white text-slate-600 hover:shadow-md shadow-sm'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none text-slate-600 transition-all border border-slate-100"
                  >
                    <ChevronRight className="w-5 h-5 pointer-events-none" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-black text-slate-800">No products found</h3>
                <p className="text-sm text-slate-500 font-semibold">Try adjusting your filters.</p>
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
