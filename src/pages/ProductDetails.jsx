import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCombinedProducts } from '../queries/useCombinedProducts';
import { useReviewsList, useCreateReview } from '../queries/useReviews';
import { ordersApi } from '../api/endpoints/orders';
import { createSlug, getColorName, normalizeColor } from '../utils/helpers';

import ProductCard from '../components/ui/ProductCard';
import SizeGuideModal from '../components/ui/SizeGuideModal';
import QuickViewModal from '../components/ui/QuickViewModal';
import AnimatedLogoLoader from '../components/ui/AnimatedLogoLoader';
import { flyToCart } from '../utils/animations';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Share2,
  X,
  ArrowLeft
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const { combinedProducts, isLoading } = useCombinedProducts();
  const product = combinedProducts.find((p) => {
    if (String(p.id) === String(id)) return true;
    return createSlug(p.title || p.name) === id;
  });

  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#AEE6FF');
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const colorScrollRef = useRef(null);
  const scrollColors = (direction) => {
    if (colorScrollRef.current) {
      colorScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };
  
  const createReviewMut = useCreateReview();
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '', orderId: '', email: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (searchParams.get('review') === 'true') {
      setActiveTab('reviews');
      setIsReviewModalOpen(true);
      const prefillOrderId = searchParams.get('orderId');
      if (prefillOrderId) {
        setReviewForm(prev => ({ ...prev, orderId: prefillOrderId }));
      }
      setTimeout(() => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setIsSubmittingReview(true);
    try {
      const isAdmin = Boolean(user && user.role === 'ADMIN');
      let customerName = 'Verified Buyer';

      if (isAdmin) {
        customerName = 'Store Admin';
      } else {
        let order;
        try {
          order = await ordersApi.get(reviewForm.orderId);
        } catch (err) {
          throw new Error('Order not found. Please check your Order ID.');
        }
        
        const orderEmail = order.customerInfo?.email || order.email || '';
        if (orderEmail.toLowerCase() !== reviewForm.email.toLowerCase()) {
          throw new Error('Email does not match this order.');
        }
        
        const hasProduct = order.items?.some(item => String(item.id) === String(product.id) || String(item.productId) === String(product.id));
        if (!hasProduct) {
          throw new Error('This product was not found in the specified order.');
        }
        
        customerName = order.customerInfo?.name || order.shippingAddress?.fullName || 'Verified Buyer';
      }
      
      // Verified! Submit review.
      const commentText = reviewForm.body || '';
      const titleText = reviewForm.title || '';
      const combinedComment = titleText && !commentText.startsWith(titleText)
        ? `${titleText} - ${commentText}`
        : commentText;

      await createReviewMut.mutateAsync({
        productId: String(product.id),
        rating: Number(reviewForm.rating || 5),
        title: titleText,
        comment: combinedComment,
        name: customerName,
        customerName,
        customerEmail: reviewForm.email,
        orderId: isAdmin ? 'ADMIN-OVERRIDE' : reviewForm.orderId,
        status: isAdmin ? 'approved' : 'pending'
      });
      
      setReviewSuccess(true);
      
    } catch (err) {
      setReviewError(err.message || 'Verification failed. Please check your details.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const { data: reviewsData } = useReviewsList({ productId: String(id), status: 'approved' });
  const reviews = reviewsData?.data || [];
  
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1))
    : 0;

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      
      const inStockVariant = product.variants?.find(v => Number(v.stock) > 0);
      
      if (inStockVariant) {
        setSelectedColor(normalizeColor(inStockVariant.colorHex).hex);
      } else {
        const fallback = normalizeColor(product.colors?.[0] || product.variants?.[0]?.colorHex).hex;
        setSelectedColor(fallback);
      }
      setSelectedSize(null);
      setSizeError(false);
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [product]);

  
  const activeVariantImage = product?.variants?.find(
    (v) => v.colorHex?.toLowerCase() === selectedColor?.toLowerCase() && v.size === selectedSize
  )?.image;

  


  const availableSizesForColor = product?.sizes?.filter(size => {
    if (!product?.variants) return true;
    return product.variants.some(v => v.size === size && v.colorHex?.toLowerCase() === selectedColor?.toLowerCase() && !v.isHidden);
  }) || [];

  useEffect(() => {
    if (selectedSize && availableSizesForColor.length > 0 && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize(availableSizesForColor[0]);
    }
  }, [selectedColor, availableSizesForColor, selectedSize]);

  useEffect(() => {
    if (activeVariantImage) {
      setActiveImage(activeVariantImage);
    } else if (product?.image) {
      setActiveImage(product.image);
    }
  }, [activeVariantImage, product?.image, selectedColor, selectedSize]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8EC]">
        <AnimatedLogoLoader text="Loading Product Details..." />
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFF8EC] font-black text-slate-800 text-2xl">Product not found.</div>;
  }

  const siblingProducts = combinedProducts.filter(p => 
    (product.groupId && p.groupId === product.groupId) ||
    (product.groupId && String(p.id) === String(product.groupId)) ||
    (p.groupId && String(p.groupId) === String(product.id)) ||
    String(p.id) === String(product.id)
  );

  const globalColors = [];
  siblingProducts.forEach(sibling => {
    // 1. From sibling.colors
    if (Array.isArray(sibling?.colors) && sibling.colors.length > 0) {
      sibling.colors.forEach(color => {
        const norm = normalizeColor(color);
        if (norm.hex && !globalColors.some(c => c.hex?.toLowerCase() === norm.hex.toLowerCase())) {
          const variantWithImage = sibling.variants?.find(
            (v) => v.colorHex?.toLowerCase() === norm.hex.toLowerCase() && v.image
          );
          globalColors.push({ 
            hex: norm.hex,
            name: norm.name,
            productId: sibling.id,
            image: variantWithImage?.image || (typeof color === 'object' ? color.image : null) || sibling.image || product.image,
            price: sibling.price || product.price,
            originalPrice: sibling.originalPrice || product.originalPrice
          });
        }
      });
    }
    // 2. From sibling.variants
    if (Array.isArray(sibling?.variants)) {
      sibling.variants.forEach(v => {
        if (v.colorHex) {
          const norm = normalizeColor({ hex: v.colorHex, name: v.colorName });
          if (norm.hex && !globalColors.some(c => c.hex?.toLowerCase() === norm.hex.toLowerCase())) {
            globalColors.push({
              hex: norm.hex,
              name: norm.name,
              productId: sibling.id,
              image: v.image || sibling.image || product.image,
              price: sibling.price || product.price,
              originalPrice: sibling.originalPrice || product.originalPrice
            });
          }
        }
      });
    }
  });

  const getVisibleColors = () => {
    if (showAllColors || globalColors.length <= 9) return globalColors;
    const selectedIdx = globalColors.findIndex(c => c.hex === selectedColor);
    if (selectedIdx >= 9) {
      return [...globalColors.slice(0, 8), globalColors[selectedIdx]];
    }
    return globalColors.slice(0, 9);
  };


  const getVisibleSizes = () => {
    if (showAllSizes || !availableSizesForColor || availableSizesForColor.length <= 9) return availableSizesForColor;
    const selectedIdx = availableSizesForColor.findIndex(s => s === selectedSize);
    if (selectedIdx >= 9) {
      return [...availableSizesForColor.slice(0, 8), availableSizesForColor[selectedIdx]];
    }
    return availableSizesForColor.slice(0, 9);
  };


  const activeVariant = product.variants?.find(
    (v) => v.colorHex?.toLowerCase() === selectedColor?.toLowerCase() && v.size === selectedSize
  );

  const displayPrice = activeVariant?.price || product.price;
  const displayStock = activeVariant ? Number(activeVariant.stock) : Number(product.stock);

  const isFavorited = isInWishlist(product.id, selectedSize, selectedColor);

  const handleBuyNow = () => {
    if (!selectedSize && availableSizesForColor && availableSizesForColor.length > 0) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const colorObj = globalColors.find(c => c.hex?.toLowerCase() === selectedColor?.toLowerCase());
    const colorName = colorObj?.name || getColorName(selectedColor);
    const rawPrice = displayPrice ?? product.price ?? 499;
    const numericPrice = typeof rawPrice === 'number'
      ? rawPrice
      : parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || 499;

    navigate('/checkout', {
      state: {
        buyNowItem: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: rawPrice,
          numericPrice: numericPrice,
          image: activeImage || product.image,
          size: selectedSize,
          color: selectedColor,
          colorName: colorName,
          quantity: quantity,
          stock: displayStock
        }
      }
    });
  };

  const handleAddToCart = (e, isBuyNow = false) => {
    if (!selectedSize && availableSizesForColor && availableSizesForColor.length > 0) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    const colorObj = globalColors.find(c => c.hex?.toLowerCase() === selectedColor?.toLowerCase());
    const colorName = colorObj?.name || getColorName(selectedColor);
    addToCart(product, selectedSize, selectedColor, e, quantity, isBuyNow, displayStock, colorName);
  };

  const galleryImages = product.gallery || [product.image];
  
  const navigateGallery = (direction) => {
    const currentIndex = galleryImages.indexOf(activeImage);
    if (currentIndex === -1) return;
    
    if (direction === 'left') {
      const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
      setActiveImage(galleryImages[prevIndex]);
    } else {
      const nextIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
      setActiveImage(galleryImages[nextIndex]);
    }
  };
  const relatedProducts = combinedProducts.filter((p) => p.category === product.category && String(p.id) !== String(product.id));

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8 pb-24 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center gap-3 mb-4 sm:mb-8 md:px-2">
          <button
            type="button"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/products');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#EF4A45]/10 text-slate-700 hover:text-[#EF4A45] font-bold text-xs sm:text-sm transition-all group cursor-pointer border border-slate-200/60 shadow-xs"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 group-hover:text-[#EF4A45] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <span className="text-slate-300">|</span>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 min-w-0">
            <Link to="/" className="text-[#301c56] hover:underline shrink-0">Home</Link>
            <span className="text-slate-300">/</span>
            {product.category && (
              <>
                <Link
                  to={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-[#301c56] hover:underline shrink-0 hidden sm:inline"
                >
                  {product.category}
                </Link>
                <span className="text-slate-300 hidden sm:inline">/</span>
              </>
            )}
            <span className="text-slate-700 font-semibold truncate">{product.name}</span>
          </nav>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* Left Column: Image Gallery & Thumbnails */}
          <div className="lg:col-span-6 flex flex-row gap-3 sm:gap-4 lg:sticky lg:top-24 md:h-[650px]">
            
            {/* Thumbnail Selectors (Left Side Vertical Stack) */}
            <div className="flex flex-col gap-2 sm:gap-3 w-14 sm:w-20 shrink-0 overflow-y-auto no-scrollbar pb-2">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-[#F5F5F5] ${
                    activeImage === img ? 'border-slate-300 ring-2 ring-slate-100' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Active Image Viewport */}
            <div className="relative flex-1 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-[#F5F5F5] border border-slate-100 group flex items-center justify-center aspect-[3/4] md:aspect-auto md:h-full">
              {/* Left Gallery Arrow */}
              {galleryImages.length > 1 && (
                <button
                  onClick={() => navigateGallery('left')}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 border border-slate-200 shadow-sm flex items-center justify-center z-10 text-slate-800 hover:bg-white/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}

              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Right Gallery Arrow */}
              {galleryImages.length > 1 && (
                <button
                  onClick={() => navigateGallery('right')}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 border border-slate-200 shadow-sm flex items-center justify-center z-10 text-slate-800 hover:bg-white/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2">
                {product.discount && (
                  <span className="px-3 py-1 rounded-full bg-[#EF4A45] text-white text-xs font-black uppercase tracking-wider shadow-sm">
                    {product.discount}
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 rounded-full bg-[#FFD800] text-slate-900 text-xs font-black uppercase tracking-wider shadow-sm">
                    BEST SELLER
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button 
                onClick={() => toggleWishlist(product.id, selectedSize, selectedColor)}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all shadow-sm z-10 ${isFavorited ? 'bg-[#EF4A45] text-white' : 'bg-white/80 text-slate-700 hover:bg-white'}`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Meta, Selectors & Actions */}
          <div className="lg:col-span-6 space-y-5 lg:pr-4 pb-4 md:pt-0">

            <div className="space-y-1">
              <h1 className="text-[1.35rem] sm:text-2xl font-bold text-black tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 pt-1 text-sm font-medium">
                <div className="flex items-center gap-1 text-[#EF4A45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-[18px] h-[18px] ${i < Math.round(averageRating) ? 'fill-[#EF4A45] text-[#EF4A45]' : 'text-[#EF4A45] stroke-[1.5px]'}`} />
                  ))}
                </div>
                <span className="text-black text-[15px] ml-1">No reviews</span>
              </div>
            </div>

            {/* Color Swatch Selector */}
            <div className="space-y-3 mt-6">
              <label className="text-[15px] font-semibold text-black flex items-center gap-2">
                <span>Colour</span>
                {selectedColor && (
                  <span className="font-bold text-[#5B2E89]">
                    ({globalColors.find(c => c.hex?.toLowerCase() === selectedColor?.toLowerCase())?.name || getColorName(selectedColor)})
                  </span>
                )}
              </label>
              {globalColors && globalColors.length > 0 ? (
                <div className="relative group">
                  <div ref={colorScrollRef} className="flex overflow-x-auto no-scrollbar gap-2 pb-2 snap-x items-center pl-3 -ml-3 pr-3 -mr-3">
                    {getVisibleColors()?.map((col, idx) => (
                      <button
                        key={col.hex}
                        onClick={() => {
                          if (String(col.productId) !== String(product.id)) {
                            navigate(`/product/${col.productId}`);
                          } else {
                            setSelectedColor(col.hex);
                            setShowAllColors(false);
                          }
                        }}
                        className={`flex flex-col w-[95px] sm:w-[102px] shrink-0 rounded-xl border transition-all snap-start overflow-hidden bg-white ${
                          selectedColor === col.hex ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="w-full aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center relative">
                          <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="px-2 pt-1.5 pb-2 text-left w-full h-[52px] flex flex-col justify-start">
                          <p className="text-[13px] font-bold text-black truncate leading-tight">{col.name}</p>
                          <p className="text-[12px] text-black font-medium mt-0.5 leading-tight">₹ {col.price}+</p>
                        </div>
                      </button>
                    ))}
                    {!showAllColors && globalColors?.length > 9 && (
                      <button 
                        onClick={() => setShowAllColors(true)}
                        className="flex flex-col w-[95px] sm:w-[102px] shrink-0 rounded-xl border border-slate-300 bg-slate-50 items-center justify-center text-[13px] font-semibold text-black hover:bg-slate-100 transition-colors snap-start h-full min-h-[155px]"
                      >
                        +{globalColors.length - 9} More
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="inline-flex px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-[13px] font-bold text-black">N/A - Single Edition</span>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="pt-2 flex flex-col gap-1 border-t border-transparent">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-black tracking-tight">₹ {displayPrice.toLocaleString()}</span>
                {product.originalPrice && (
                  <div className="flex items-center gap-2 pb-0.5">
                    <span className="text-[17px] text-black font-medium">MRP <span className="line-through">₹ {product.originalPrice.toLocaleString()}</span></span>
                    <span className="text-[15px] font-semibold text-green-600">
                      ({Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%OFF)
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[13px] font-bold italic text-black mt-0.5">MRP inclusive of all taxes</p>
            </div>

            {/* Size Selector + Size Guide Modal Trigger */}
            <div id="size-selector" className={`space-y-3 pt-3 p-2 -mx-2 rounded-xl transition-colors duration-300 ${sizeError ? 'bg-red-50 border border-red-200' : ''}`}>
              <div className="flex items-center justify-between">
                <label className={`text-[15px] font-semibold ${sizeError ? 'text-red-600' : 'text-slate-700'}`}>
                  {sizeError ? 'Please select a size' : 'Size in Age'}
                </label>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[15px] font-medium text-red-500 hover:underline flex items-center gap-1 underline underline-offset-4 decoration-red-500"
                >
                  Size Chart
                </button>
              </div>

              {availableSizesForColor && availableSizesForColor.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {getVisibleSizes()?.map((size, idx) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setShowAllSizes(false);
                      }}
                      className={`min-w-[70px] sm:min-w-[80px] h-10 px-3 rounded-lg border font-medium text-[15px] transition-all flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-[#EF4A45] bg-[#EF4A45] text-white'
                          : 'border-slate-300 text-black hover:border-slate-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  {!showAllSizes && product.sizes?.length > 9 && (
                    <button 
                      onClick={() => setShowAllSizes(true)}
                      className="min-w-[70px] sm:min-w-[80px] h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 font-medium text-[15px] text-black hover:bg-slate-100 transition-colors flex items-center justify-center"
                    >
                      +{availableSizesForColor.length - 9}
                    </button>
                  )}
                </div>
              ) : (
                <div className="inline-flex h-10 px-4 bg-slate-50 border border-slate-300 rounded-lg items-center">
                  <span className="text-sm font-medium text-black">Standard Size</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-[15px] font-semibold text-black block">
                  Quantity
                </label>
                {displayStock > 0 && displayStock < 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full"
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-600">
                      🔥 Hurry! Only {displayStock} left
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="inline-flex items-center rounded-full border border-slate-300 bg-white h-11">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-full flex items-center justify-center text-black text-xl transition-colors hover:bg-slate-50"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-[15px] text-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, displayStock))}
                  className="w-12 h-full flex items-center justify-center text-black text-xl transition-colors hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={(e) => handleAddToCart(e, true)}
                disabled={displayStock === 0}
                className={`w-full py-3.5 rounded-full font-medium text-[16px] transition-all ${
                  displayStock === 0
                    ? 'border border-slate-300 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border border-slate-400 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-50 shadow-sm'
                }`}
              >
                {displayStock === 0 ? 'Out of Stock' : 'Add to cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={displayStock === 0}
                className={`w-full py-3.5 rounded-full font-medium text-[16px] transition-all ${
                  displayStock === 0
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-black text-white hover:bg-slate-900 shadow-sm'
                }`}
              >
                Buy it Now
              </button>
            </div>

            {/* Guarantees Box */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Express Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>3-Day Returns</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs for Description, Fabric Details, Shipping Info */}
        <div id="reviews-section" className="mt-12 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
          <div className="flex border-b border-slate-100 font-black text-sm text-slate-500 space-x-8 overflow-x-auto pb-1">
            {['description', 'fabric', 'care', 'shipping', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[#EF4A45] text-[#EF4A45]' : 'border-transparent hover:text-slate-900'
                  }`}
              >
                {tab === 'description' ? 'Description & Overview' : tab === 'fabric' ? 'Fabric & Material' : tab === 'care' ? 'Care Instructions' : tab === 'shipping' ? 'Shipping & Returns' : 'Customer Reviews'}
              </button>
            ))}
          </div>

          <div className="py-6 text-sm text-slate-700 leading-relaxed font-medium">
            {activeTab === 'description' && (
              <div className="animate-in fade-in duration-300">
                <p>{product.description || 'Premium product designed for comfort and style.'}</p>
              </div>
            )}
            {activeTab === 'fabric' && (
              <div className="animate-in fade-in duration-300">
                <p><strong>Fabric Composition:</strong> {product.fabric || '100% Bio-Washed Premium Cotton. Sourced from certified mills using non-toxic Azo-free dyes. Pre-shrunk fabric ensures no shrinkage after washing.'}</p>
              </div>
            )}
            {activeTab === 'care' && (
              <div className="animate-in fade-in duration-300">
                <p><strong>Washing Instructions:</strong> {product.care || 'Machine wash cold inside out with similar colors. Do not bleach. Tumble dry low.'}</p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="animate-in fade-in duration-300">
                <p>{product.shipping || 'Standard delivery takes 3-5 business days across India. Free shipping applies on all orders above ₹999. Hassle-free 3-day return policy.'}</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {reviewCount === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                      <Star className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">No reviews yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">Be the first to share your thoughts and help others make a decision!</p>
                    <button 
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-[#EF4A45] transition-colors shadow-md"
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Review Summary */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50 rounded-2xl border border-amber-100 min-w-50">
                        <div className="text-5xl font-black text-slate-900">{averageRating}</div>
                        <div className="flex items-center gap-1 my-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                          ))}
                        </div>
                        <div className="text-xs font-bold text-slate-500">Based on {reviewCount} reviews</div>
                      </div>
                      
                      <div className="flex-1 w-full space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                          return (
                            <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <span className="w-12 text-right">{stars} Stars</span>
                              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 text-slate-400">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <h4 className="font-black text-slate-900 text-lg">Recent Reviews</h4>
                        <button 
                          onClick={() => setIsReviewModalOpen(true)}
                          className="px-4 py-2 bg-slate-100 text-slate-900 hover:bg-slate-200 text-xs font-bold rounded-full transition-colors"
                        >
                          Write a Review
                        </button>
                      </div>
                      
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E6D6FF] flex items-center justify-center font-black text-purple-700">
                                {review.customerName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  {review.customerName || 'Verified Buyer'}
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm mb-1">{review.title}</h5>
                          <p className="text-slate-600 text-sm leading-relaxed">{review.body}</p>
                          
                          {review.merchantReply && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-accent-green" />
                                Jog & Joy Team
                              </div>
                              <p className="text-slate-600">{review.merchantReply.body}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-slate-900">{averageRating || product.rating}</div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 mb-1">
                        {[...Array(Math.round(averageRating || product.rating || 5))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 font-bold">Based on {reviewCount || product.reviewsCount || 0} reviews</p>
                    </div>
                  </div>
                  <button onClick={() => setIsReviewModalOpen(true)} className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-md hover:bg-slate-800 transition-colors">
                    Write a Review
                  </button>
                </div>
                
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((r, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#AEE6FF] flex items-center justify-center text-sky-900 font-black text-xs uppercase">
                              {(r.customerName || r.author_name || r.authorName || 'G')[0]}
                            </div>
                            <span className="font-extrabold text-slate-900 text-sm">{r.customerName || r.author_name || r.authorName || 'Guest User'}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Verified Buyer</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-400">
                            {new Date(r.created_at || r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 mb-2">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        {r.title && <h5 className="font-bold text-slate-900 text-sm mb-1">{r.title}</h5>}
                        <p className="text-sm font-medium text-slate-700">{r.body || r.comment}</p>

                        {r.merchantReply?.body && (
                          <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-sm">
                            <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-extrabold text-slate-900">Jog & Joy Official Response</span>
                              {r.merchantReply.repliedAt && (
                                <span className="text-[10px] text-slate-400 font-normal ml-auto">
                                  {new Date(r.merchantReply.repliedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pl-5">
                              {r.merchantReply.body}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-slate-400">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel (Goes Well With) */}
        <div className="mt-16 space-y-4">
          <div className="flex items-center justify-between px-2 sm:px-0">
            <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Goes Well With</h3>
            <Link to="/products" className="text-sm font-semibold text-[#301c56] hover:underline">
              View All
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x px-2 sm:px-0">
            {relatedProducts.slice(0, 8).map((p) => {
              const displayPrice = p.price || 999;
              const originalPrice = p.originalPrice || Math.floor(displayPrice * 1.5);
              const discountPct = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

              return (
                <div key={p.id} className="w-[160px] sm:w-[200px] shrink-0 snap-start flex flex-col group relative">
                  
                  {/* Image Container */}
                  <div className="relative w-full aspect-[3/4] bg-[#F5F5F5] rounded-[1.5rem] overflow-hidden">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105" 
                      onError={(e) => { e.target.onerror = null; e.target.src = p.fallback || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop' }}
                    />
                    
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id, '4Y-5Y', '#FFFFFF'); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm z-10"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(p.id, '4Y-5Y', '#FFFFFF') ? 'fill-[#301c56] text-[#301c56]' : 'text-[#301c56]'}`} />
                    </button>

                    {/* Quick View Button (Shows on hover on desktop, always there or via tap on mobile) */}
                    <div className="absolute bottom-3 left-0 right-0 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center z-10">
                      <button 
                        onClick={() => setQuickViewProduct(p)}
                        className="w-full py-2 bg-[#5B2E89] hover:bg-[#46236b] text-white text-xs font-semibold rounded-full shadow-lg"
                      >
                        Quick view
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="pt-3 px-1 space-y-1">
                    <h4 className="text-[13px] font-medium text-slate-800 line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                    
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-sm font-semibold text-[#5B2E89]">₹ {displayPrice}</span>
                      <span className="text-xs font-medium text-slate-400 line-through">₹ {originalPrice}</span>
                    </div>
                    
                    <div className="text-[11px] font-semibold text-emerald-600">
                      ({discountPct}%OFF)
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add To Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-slate-200 md:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-xs font-bold text-slate-500">Price</span>
          <p className="text-lg font-black text-slate-900">₹{product.price}</p>
        </div>
        <button
          onClick={(e) => handleAddToCart(e, true)}
          disabled={displayStock === 0}
          className="grow py-3 rounded-full bg-[#EF4A45] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" /> Add To Bag
        </button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsReviewModalOpen(false); setReviewSuccess(false); setReviewForm({ rating: 5, title: '', body: '', orderId: '', email: '' }); }} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900">Write a Review</h2>
              <button onClick={() => { setIsReviewModalOpen(false); setReviewSuccess(false); setReviewForm({ rating: 5, title: '', body: '', orderId: '', email: '' }); }} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {reviewSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Review Submitted!</h3>
                  <p className="text-sm text-slate-500">Thank you for your feedback. Your review is currently pending moderation and will appear on the site soon.</p>
                  <button onClick={() => { setIsReviewModalOpen(false); setReviewSuccess(false); setReviewForm({ rating: 5, title: '', body: '', orderId: '', email: '' }); }} className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-[#EF4A45] transition-colors">
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <h4 className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Purchase Verification Required</h4>
                    <p className="text-xs text-blue-700">To ensure authentic reviews, please provide your Order ID and Email address used during checkout.</p>
                  </div>

                  {reviewError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 text-center">
                      {reviewError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Order ID *</label>
                      <input required type="text" value={reviewForm.orderId} onChange={e => setReviewForm(prev => ({...prev, orderId: e.target.value}))} placeholder="e.g. ORD-12345" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition-all text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email Address *</label>
                      <input required type="email" value={reviewForm.email} onChange={e => setReviewForm(prev => ({...prev, email: e.target.value}))} placeholder="Your checkout email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition-all text-sm font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Overall Rating *</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewForm(prev => ({...prev, rating: star}))} className="p-1 hover:scale-110 transition-transform">
                          <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Review Title *</label>
                    <input required type="text" value={reviewForm.title} onChange={e => setReviewForm(prev => ({...prev, title: e.target.value}))} placeholder="Sum up your experience" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition-all text-sm font-medium" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Your Review *</label>
                    <textarea required value={reviewForm.body} onChange={e => setReviewForm(prev => ({...prev, body: e.target.value}))} placeholder="What did you like or dislike?" rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white outline-none transition-all text-sm font-medium resize-none" />
                  </div>

                  <button disabled={isSubmittingReview} type="submit" className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl hover:bg-[#EF4A45] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmittingReview ? 'Verifying Purchase...' : 'Submit Verified Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
