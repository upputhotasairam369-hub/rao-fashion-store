import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, endpoints } from '../api/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, setIsDrawerOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Sync favorites count
  useEffect(() => {
    const updateFavoritesCount = async () => {
      if (!isAuthenticated) {
        setFavoritesCount(0);
        return;
      }
      try {
        const response = await api.get(endpoints.favorites.list);
        setFavoritesCount(response.data?.length || 0);
      } catch (error) {
        setFavoritesCount(0);
      }
    };

    updateFavoritesCount();

    const handleFavoritesChange = () => updateFavoritesCount();
    window.addEventListener('favoritesUpdated', handleFavoritesChange);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesChange);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      navigate('/products');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/');
  };

  const navCategories = [
    { name: 'NEW DROPS', path: '/products?sort_by=newest' },
    { name: 'SHOP ALL', path: '/products' },
    { name: 'TEES', path: '/products?category=Oversized%20Tees' },
    { name: 'HOODIES', path: '/products?category=Hoodies%20%26%20Sweatshirts' },
    { name: 'DENIM', path: '/products?category=Baggy%20Denim' },
    { name: 'VINTAGE', path: '/products?category=Vintage%20Shirts' },
    { name: 'OUTERWEAR', path: '/products?category=Jackets%20%26%20Outerwear' },
    { name: 'ACCESSORIES', path: '/products?category=Accessories' },
  ];

  const currentCategory = searchParams.get('category');

  return (
    <>
      {/* Editorial Announcement Bar */}
      <div className="bg-[#151515] text-[#F2EFE8] text-[11px] font-mono tracking-widest py-2 px-4 border-b border-[#2A2A2A] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></span>
            <span className="text-[#CCFF00] font-bold">DROP 04 LIVE</span>
            <span className="text-[#787873]">|</span>
            <span className="text-[#9E9C96]">CURATED ONE-OF-ONE STREETWEAR</span>
          </div>
          <div className="mx-auto sm:mx-0 text-center font-bold tracking-mega uppercase">
            FREE EXPRESS SHIPPING OVER ₹1,999 • ALL SIZES MEASURED BY HAND
          </div>
          <div className="hidden lg:flex items-center space-x-4 text-[#9E9C96]">
            <span>DELHI • MUMBAI • BLR</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F2EFE8]/95 backdrop-blur-md border-b border-[#D6D3CD] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand Logo Treatment */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="group flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#151515] text-[#CCFF00] flex items-center justify-center font-display font-black text-xl border border-[#151515] group-hover:bg-[#CCFF00] group-hover:text-[#151515] transition-all duration-200">
                  RT
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-black text-2xl tracking-tighter text-[#151515] uppercase leading-none group-hover:text-[#CCFF00] group-hover:bg-[#151515] px-1 transition-all">
                    RAO'S THRIFT
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-[#787873] uppercase mt-0.5">
                    EST. 2024 • CURATED STREETWEAR
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navCategories.map((item) => {
                const isActive = item.name === 'SHOP ALL' 
                  ? location.pathname === '/products' && !currentCategory
                  : item.path.includes(encodeURIComponent(currentCategory || ''));

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`font-display text-xs font-bold tracking-wider transition-all duration-150 py-1 border-b-2 ${
                      isActive 
                        ? 'border-[#151515] text-[#151515]' 
                        : 'border-transparent text-[#787873] hover:text-[#151515] hover:border-[#CCFF00]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-[#151515] hover:bg-[#E5E1D8] transition-colors rounded-none"
                aria-label="Search catalog"
              >
                <Search size={20} />
              </button>

              {/* Wishlist / Favorites */}
              <Link
                to={isAuthenticated ? "/favorites" : "/login"}
                className="relative p-2 text-[#151515] hover:bg-[#E5E1D8] transition-colors rounded-none"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#151515] text-[#CCFF00] font-mono text-[10px] font-bold h-4 w-4 flex items-center justify-center border border-[#CCFF00]">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-[#151515] hover:bg-[#E5E1D8] transition-colors rounded-none"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#CCFF00] text-[#151515] font-mono text-[10px] font-black h-4 w-4 flex items-center justify-center border border-[#151515]">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setIsAccountOpen(!isAccountOpen)}
                      className="flex items-center space-x-1.5 py-1.5 px-3 bg-[#151515] text-[#F2EFE8] text-xs font-mono uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#151515] transition-all"
                    >
                      <User size={14} />
                      <span className="hidden md:inline font-bold">{user.first_name || user.name?.split(' ')[0] || 'ACCOUNT'}</span>
                    </button>

                    {isAccountOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-[#151515] shadow-brutal py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#D6D3CD]">
                          <p className="text-[10px] font-mono text-[#787873] uppercase">Signed in as</p>
                          <p className="text-xs font-bold truncate text-[#151515]">{user.email}</p>
                        </div>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#151515] hover:bg-[#F2EFE8]"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Order History
                        </Link>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#151515] hover:bg-[#F2EFE8]"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          Saved Pieces ({favoritesCount})
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#151515] bg-[#CCFF00]/40 hover:bg-[#CCFF00]"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="my-1 border-[#D6D3CD]" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#151515] hover:bg-[#151515] hover:text-[#CCFF00]"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#151515] hover:text-[#787873] transition-colors"
                    >
                      LOG IN
                    </Link>
                    <Link
                      to="/signup"
                      className="hidden sm:inline-block bg-[#151515] text-[#F2EFE8] text-xs font-bold uppercase tracking-wider py-2 px-3 hover:bg-[#CCFF00] hover:text-[#151515] transition-all border border-[#151515]"
                    >
                      JOIN
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-[#151515] hover:bg-[#E5E1D8] transition-colors"
                aria-label="Toggle navigation"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Search Overlay */}
        {isSearchOpen && (
          <div className="border-t border-[#D6D3CD] bg-[#ECE8DF] py-4 px-4 sm:px-8 transition-all animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="SEARCH VINTAGE TEES, 90S HOODIES, BAGGY DENIM, WORKWEAR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 bg-white border-2 border-[#151515] text-[#151515] px-4 py-3 text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                />
                <button
                  type="submit"
                  className="bg-[#151515] text-[#CCFF00] font-bold text-xs uppercase tracking-widest px-6 py-3 border-2 border-[#151515] hover:bg-[#CCFF00] hover:text-[#151515] transition-all ml-2"
                >
                  SEARCH
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 text-[#151515] hover:bg-[#D6D3CD] ml-2"
                  title="Close search"
                >
                  <X size={20} />
                </button>
              </form>
              <div className="flex items-center space-x-2 mt-2 text-[11px] font-mono text-[#787873]">
                <span>TRENDING SEARCHES:</span>
                <button type="button" onClick={() => { setSearchQuery('Nirvana'); navigate('/products?search=Nirvana'); setIsSearchOpen(false); }} className="hover:text-[#151515] underline">Nirvana</button>
                <span>•</span>
                <button type="button" onClick={() => { setSearchQuery('Carpenter'); navigate('/products?search=Carpenter'); setIsSearchOpen(false); }} className="hover:text-[#151515] underline">Carpenter Denim</button>
                <span>•</span>
                <button type="button" onClick={() => { setSearchQuery('Workwear'); navigate('/products?search=Workwear'); setIsSearchOpen(false); }} className="hover:text-[#151515] underline">Canvas Chore</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[115px] z-50 bg-[#151515]/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
            <div className="bg-[#F2EFE8] w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#D6D3CD]">
                  <span className="font-display font-black text-lg uppercase tracking-tight text-[#151515]">
                    NAVIGATION
                  </span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-1 text-[#151515]">
                    <X size={20} />
                  </button>
                </div>

                <div className="py-4 space-y-1">
                  {navCategories.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-2 font-display text-sm font-bold tracking-wider text-[#151515] hover:bg-[#CCFF00] hover:text-[#151515] transition-colors border-b border-[#E5E1D8]"
                    >
                      <span>{item.name}</span>
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#D6D3CD] space-y-3">
                {user ? (
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-[#787873]">LOGGED IN AS {user.email}</p>
                    <Link
                      to="/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-xs font-bold uppercase tracking-wider text-[#151515] py-2"
                    >
                      MY ORDERS
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full text-left text-xs font-bold uppercase tracking-wider text-red-600 py-2"
                    >
                      SIGN OUT
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-secondary text-center text-xs py-2.5"
                    >
                      LOG IN
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn-primary text-center text-xs py-2.5"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
                <div className="text-[10px] font-mono text-[#787873] pt-2">
                  RAO'S THRIFT • AUTHENTIC STREETWEAR CULTURE
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
