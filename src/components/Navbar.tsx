import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, Menu, X, ShieldCheck, MapPin } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, categoryFilter?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { totalCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <>
      {/* Top Local Beldanga Announcement Bar */}
      <div className="bg-[#78350f] text-[#fef3c7] text-xs py-1.5 px-4 font-medium flex items-center justify-between border-b border-[#d97706]/40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
            <span className="truncate">Kalitala, Beldanga, Murshidabad · Local Cash on Delivery (COD)</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 text-amber-200">
            <span>Daily Delivery: 8:00 AM – 8:30 PM</span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-amber-300 hover:text-white underline font-semibold transition-colors"
            >
              Shop Owner Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Header conforming to 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#881337] text-white shadow-md border-b border-[#d97706]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-18">
            {/* Zone 1: Brand Wordmark */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-lg bg-[#d97706] text-white flex items-center justify-center font-serif font-black text-xl shadow-inner border border-amber-300/60">
                <span>M</span>
              </div>
              <div className="leading-tight">
                <span className="font-serif font-bold text-lg sm:text-xl text-[#fef3c7] tracking-tight whitespace-nowrap block">
                  Mandal Masala Bhandar
                </span>
                <span className="text-[11px] text-amber-200/90 font-medium block">
                  Pure Spices & Dry Fruits · Beldanga
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation Links (single line, whitespace-nowrap) */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-amber-100">
              <button
                onClick={() => onNavigate('home')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                  currentPage === 'home' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('products')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                  currentPage === 'products' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => onNavigate('products', 'Whole Spices')}
                className="transition-colors whitespace-nowrap shrink-0 hover:text-white"
              >
                Whole Spices
              </button>
              <button
                onClick={() => onNavigate('products', 'Dry Fruits')}
                className="transition-colors whitespace-nowrap shrink-0 hover:text-white"
              >
                Dry Fruits
              </button>
              <button
                onClick={() => onNavigate('track')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                  currentPage === 'track' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
                }`}
              >
                Track Order
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                  currentPage === 'about' ? 'text-amber-300 font-bold underline underline-offset-4' : ''
                }`}
              >
                About Us
              </button>
            </nav>

            {/* Zone 3: Primary Action & Search */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Quick Search Toggle */}
              <div className="relative">
                {showSearchInput ? (
                  <div className="flex items-center bg-[#700f2d] rounded-lg px-2.5 py-1.5 border border-amber-400/40">
                    <Search className="w-4 h-4 text-amber-300 mr-2 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search jeera, haldi, kaju..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onBlur={() => {
                        if (!searchQuery) setShowSearchInput(false);
                      }}
                      className="bg-transparent text-xs text-white placeholder-amber-200/60 outline-none w-32 sm:w-48"
                    />
                    <button
                      onClick={() => {
                        onSearchChange('');
                        setShowSearchInput(false);
                      }}
                      className="text-amber-200 hover:text-white text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowSearchInput(true);
                      if (currentPage !== 'products') onNavigate('products');
                    }}
                    className="p-2 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Search spices"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Primary Action: Shopping Cart Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap shrink-0 border border-amber-300/40"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-[#881337] text-white font-mono text-xs px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                  {totalCount}
                </span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-amber-200 hover:text-white"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#700f2d] border-t border-rose-900 px-4 py-4 space-y-2 text-sm text-amber-100">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 font-medium"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('products');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 font-medium"
            >
              All Products
            </button>
            <button
              onClick={() => {
                onNavigate('products', 'Whole Spices');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 text-xs text-amber-200 pl-6"
            >
              ↳ Whole Spices (Sabut Masala)
            </button>
            <button
              onClick={() => {
                onNavigate('products', 'Ground Spices');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 text-xs text-amber-200 pl-6"
            >
              ↳ Ground Spices (Puri Haldi, Mirch)
            </button>
            <button
              onClick={() => {
                onNavigate('products', 'Masala Blends');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 text-xs text-amber-200 pl-6"
            >
              ↳ Masala Blends (Garam Masala, Biryani)
            </button>
            <button
              onClick={() => {
                onNavigate('products', 'Dry Fruits');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 text-xs text-amber-200 pl-6"
            >
              ↳ Dry Fruits (Kaju, Badam, Kishmish)
            </button>
            <button
              onClick={() => {
                onNavigate('track');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 font-medium"
            >
              Track Order Status
            </button>
            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-3 rounded hover:bg-rose-950 font-medium"
            >
              About & Beldanga Store Info
            </button>
            <div className="pt-2 border-t border-rose-900 mt-2">
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-3 rounded bg-amber-800/50 text-amber-300 font-bold text-xs"
              >
                🔐 Shop Owner Portal Login
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
