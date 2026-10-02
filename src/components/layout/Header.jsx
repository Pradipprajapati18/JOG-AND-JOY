import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../../utils/getImageUrl';
import { createSlug } from '../../utils/helpers';

export const productCategories = [
  { name: 'KIDS Co-ord Suit', slug: 'kids-co-ord-suit', category: 'Kids' },
  { name: 'KIDS T-shirts', slug: 'kids-t-shirts', category: 'Kids' },
  { name: 'KIDS Night Suit', slug: 'kids-night-suit', category: 'Kids' },
  { name: 'KIDS Short Co-ord Suit', slug: 'kids-short-co-ord-suit', category: 'Kids' },
  { name: 'KIDS Shorts', slug: 'kids-shorts', category: 'Kids' },
  { name: 'KIDS Sweat_Pants', slug: 'kids-sweat-pants', category: 'Kids' },
  { name: 'KIDS Track_Pants', slug: 'kids-track-pants', category: 'Kids' },
  { name: 'KIDS Track_Suit', slug: 'kids-track-suit', category: 'Kids' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const { list } = await import('../../api/mockApi');
          const { data } = await list('products', { search: searchQuery, pageSize: 5 });
          setSearchResults(data || []);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProductsDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-header py-3 shadow-xl' : 'bg-slate-950/80 backdrop-blur-md py-4 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-xl bg-[#ccff00] p-1.5 transition-transform group-hover:scale-105">
                <img 
                  src={getImageUrl('logo.webp')} 
                  alt="Jog & Joy Logo" 
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center font-black text-slate-950 text-base px-2 py-0.5 tracking-tighter">
                  JOG&JOY
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
                  JOG&JOY
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  Love Is In The Wear
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about-us" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/about-us' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                About Us
              </Link>

              {/* Products Mega Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={() => setIsProductsDropdownOpen(false)}
              >
                <button 
                  onClick={() => navigate('/products')}
                  className={`flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    location.pathname.startsWith('/products') ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Products
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180 text-[#ccff00]' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProductsDropdownOpen && (
                  <div className="absolute top-full left-0 w-80 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                        Category Catalog
                      </div>
                      <div className="space-y-1">
                        {productCategories.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`/products?category=${cat.slug}`}
                            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-200 hover:text-[#ccff00] hover:bg-white/5 rounded-xl transition-all group"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-[#ccff00]/10 group-hover:text-[#ccff00]">
                              {cat.category}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <Link 
                          to="/products"
                          className="flex items-center justify-center gap-2 text-xs font-semibold text-[#ccff00] hover:underline py-1"
                        >
                          View All Categories <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/collections" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/collections' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Collections
              </Link>
              <Link 
                to="/why-us" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/why-us' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Why Us
              </Link>
              <Link 
                to="/distributors" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/distributors' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Distributor Network
              </Link>
              <Link 
                to="/career" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/career' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Career
              </Link>
              <Link 
                to="/contact-us" 
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  location.pathname === '/contact-us' ? 'text-[#ccff00] bg-white/5' : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                to="/products"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-[#ccff00] text-slate-950 hover:bg-[#b8e600] transition-all transform hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Shop
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 p-4 bg-slate-900/95 border-b border-slate-700/80 backdrop-blur-xl shadow-2xl z-50 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search activewear, kids t-shirts, joggers, boxers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-24 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-[#ccff00]"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 text-xs font-bold uppercase bg-[#ccff00] text-slate-950 rounded-xl hover:bg-[#b8e600]"
              >
                Search
              </button>
            </form>

            {/* Live Search Results */}
            {searchQuery.trim().length > 1 && (
              <div className="max-w-3xl mx-auto mt-2 bg-slate-800/95 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative z-[60]">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map((product) => (
                      <Link 
                        key={product.id}
                        to={`/product/${createSlug(product.name || product.title) || product.id}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-4 p-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        <img src={product.image || product.images?.[0] || getImageUrl('placeholder.jpg')} alt={product.title} className="w-12 h-12 rounded-lg object-cover bg-slate-900" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white line-clamp-1">{product.title || product.name}</h4>
                          <p className="text-xs text-slate-400">{product.category}</p>
                        </div>
                        <div className="text-sm font-bold text-[#ccff00]">₹{product.price}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">No products found.</div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-slate-950/95 backdrop-blur-2xl pt-24 px-6 overflow-y-auto pb-12">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Home</Link>
            <Link to="/about-us" className="py-3 text-lg font-bold border-b border-slate-800 text-white">About Us</Link>
            
            <div className="py-3 border-b border-slate-800">
              <div className="flex items-center justify-between text-lg font-bold text-white mb-2">
                <span>Products Catalog</span>
                <ChevronDown className="w-5 h-5 text-[#ccff00]" />
              </div>
              <div className="pl-4 space-y-2 text-sm text-slate-300">
                {productCategories.map((cat) => (
                  <Link 
                    key={cat.slug} 
                    to={`/products?category=${cat.slug}`}
                    className="block py-1.5 hover:text-[#ccff00]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/collections" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Collections</Link>
            <Link to="/why-us" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Why Us</Link>
            <Link to="/distributors" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Distributor Network</Link>
            <Link to="/career" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Career</Link>
            <Link to="/contact-us" className="py-3 text-lg font-bold border-b border-slate-800 text-white">Contact Us</Link>
            <Link to="/admin" className="py-3 text-lg font-bold text-[#ccff00]">Admin Dashboard</Link>
          </nav>
        </div>
      )}
    </>
  );
}
