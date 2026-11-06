import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { TrackOrderView } from './components/TrackOrderView';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutAndPolicies } from './components/AboutAndPolicies';
import { Product, Category, DeliveryZone } from './types';
import {
  ShieldCheck,
  Truck,
  Banknote,
  Sparkles,
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Heart,
  Search,
} from 'lucide-react';

export const MainStore: React.FC = () => {
  const { setIsOpen } = useCart();

  const [currentPage, setCurrentPage] = useState<
    'home' | 'products' | 'checkout' | 'confirmation' | 'track' | 'admin' | 'about'
  >('home');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');

  // Modals & Details
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [detailedVariantId, setDetailedVariantId] = useState<string | undefined>();
  const [placedOrderData, setPlacedOrderData] = useState<any>(null);
  const [trackParams, setTrackParams] = useState<{ num: string; phone: string }>({
    num: '',
    phone: '',
  });

  const loadStoreData = async () => {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setDeliveryZones(data.delivery_zones || []);
    } catch (err) {
      console.error('Failed to load store catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const handleNavigate = (page: string, categoryFilter?: string) => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
      setCurrentPage('products');
    } else {
      setCurrentPage(page as any);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Products
  const filteredProducts = products
    .filter((p) => {
      const matchesCat =
        selectedCategory === 'All' ||
        p.category_name?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf7] text-stone-900 selection:bg-[#881337] selection:text-white">
      {/* Navbar adhering to 3-zone contract */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {/* PAGE 1: HOME */}
        {currentPage === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#881337] via-[#78122f] to-[#78350f] text-white py-12 sm:py-20 border-b-4 border-[#d97706]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Headlines & Action */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-1.5 bg-[#ea580c] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Authentic Beldanga Spice Heritage</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#fef3c7] leading-tight">
                      Pure Hand-Ground Spices & Royal Dry Fruits
                    </h1>

                    <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                      Cold-ground turmeric, shahi jeera, and custom aromatic blends prepared fresh near Kalitala, Beldanga. Zero artificial colors, zero fillers, and 100% Cash on Delivery at your doorstep.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                      <button
                        onClick={() => handleNavigate('products')}
                        className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
                      >
                        <span>Explore Full Catalog</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleNavigate('track')}
                        className="bg-black/30 hover:bg-black/40 text-amber-200 border border-amber-300/40 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition"
                      >
                        Track Existing Order
                      </button>
                    </div>

                    {/* Trust Kicker */}
                    <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-amber-200/90">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span>Cash on Delivery Only</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#fbbf24]" />
                        <span>Beldanga Doorstep Handover</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>100% Natural Aroma</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hero Visual Photo */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-300/40 aspect-[4/3] bg-stone-900">
                      <img
                        src="/src/assets/images/hero_spices_beldanga_1793989694819.jpg"
                        alt="Mandal Masala Bhandar artisanal spice collection in Beldanga"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <p className="text-white text-xs font-serif italic">
                          "Reviving centuries of Bengali & Mughlai culinary spice wisdom."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Category Showcases */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#881337] tracking-tight">
                    Shop by Traditional Categories
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Select a category to filter authentic varieties
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('products')}
                  className="text-xs font-bold text-[#d97706] hover:underline"
                >
                  View All ({products.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleNavigate('products', cat.name)}
                    className="bg-white rounded-xl border border-amber-200/80 p-3 sm:p-4 text-center hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-amber-50 mb-3">
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#881337] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Bestsellers */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-amber-200/60">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#78350f] tracking-tight">
                    Kitchen Essentials & Bestsellers
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Most requested everyday masalas by Beldanga households
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('products')}
                  className="text-xs font-bold text-[#881337] hover:underline"
                >
                  Explore All →
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-stone-400 text-sm font-medium">
                  Loading fresh spices...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p) => p.is_featured)
                    .slice(0, 4)
                    .map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onViewDetails={(p, vId) => {
                          setDetailedProduct(p);
                          setDetailedVariantId(vId);
                        }}
                      />
                    ))}
                </div>
              )}
            </section>

            {/* Local Story & Beldanga Craftsmanship */}
            <section className="bg-amber-100/60 border-y border-amber-200 py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-xs">
                    <span className="text-2xl mb-2 block">🌿</span>
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Cold-Milled at Sub-Ambient Heat
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      We crush our Salem turmeric, roasted cumin, and coriander seeds without overheating. This ensures every grain locks in its medicinal curcumin and aromatic essential oils.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-xs">
                    <span className="text-2xl mb-2 block">📦</span>
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Custom Pack Sizes for Every Home
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      Whether you need 50g of royal cardamom for festive payesh or 1kg of pure haldi for the monthly kitchen pantry, select your exact pack size with transparent, live pricing.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-xs">
                    <span className="text-2xl mb-2 block">🤝</span>
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Zero Risk Cash on Delivery
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      Shop with total peace of mind. We deliver straight to your door in Beldanga, Rejinagar, or Sargachi. Inspect the sealed package and pay cash only upon satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: ALL PRODUCTS */}
        {currentPage === 'products' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#881337] tracking-tight">
                  All Spices & Dry Fruits
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Showing {filteredProducts.length} authentic products with independent pack sizes
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jeera, haldi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 pl-8 text-xs rounded-lg border border-amber-300 bg-white outline-none focus:ring-1 focus:ring-[#881337] w-36 sm:w-48"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-stone-800 outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium text-stone-800 outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-stone-400 text-sm">
                Fetching catalog from server...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-amber-200 p-8 max-w-md mx-auto">
                <span className="text-3xl mb-2 block">🔍</span>
                <h3 className="font-serif font-bold text-stone-800 text-base">No products found</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Try clearing your search query or choosing another category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 text-xs font-bold text-[#881337] underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onViewDetails={(p, vId) => {
                      setDetailedProduct(p);
                      setDetailedVariantId(vId);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAGE 3: CHECKOUT */}
        {currentPage === 'checkout' && (
          <CheckoutView
            deliveryZones={deliveryZones}
            onOrderSuccess={(res) => {
              setPlacedOrderData(res);
              setCurrentPage('confirmation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToShopping={() => setCurrentPage('products')}
          />
        )}

        {/* PAGE 4: ORDER CONFIRMATION */}
        {currentPage === 'confirmation' && placedOrderData && (
          <OrderConfirmationModal
            orderData={placedOrderData}
            onTrackOrder={(num, phone) => {
              setTrackParams({ num, phone });
              setCurrentPage('track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContinueShopping={() => setCurrentPage('home')}
          />
        )}

        {/* PAGE 5: ORDER TRACKING */}
        {currentPage === 'track' && (
          <TrackOrderView
            initialOrderNumber={trackParams.num}
            initialPhone={trackParams.phone}
          />
        )}

        {/* PAGE 6: ADMIN DASHBOARD */}
        {currentPage === 'admin' && (
          <AdminDashboard onBackToStore={() => setCurrentPage('home')} />
        )}

        {/* PAGE 7: ABOUT & POLICIES */}
        {currentPage === 'about' && <AboutAndPolicies />}
      </main>

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        deliveryZones={deliveryZones}
        onProceedToCheckout={() => {
          setCurrentPage('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={detailedProduct}
        initialVariantId={detailedVariantId}
        onClose={() => setDetailedProduct(null)}
      />

      {/* Footer conforming to domain rules */}
      <footer className="bg-[#78350f] text-amber-100/90 pt-12 pb-8 border-t-4 border-[#d97706] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
            {/* Store Information */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#d97706] text-white flex items-center justify-center font-serif font-black text-base">
                  M
                </div>
                <span className="font-serif font-bold text-lg text-white">
                  Mandal Masala Bhandar
                </span>
              </div>
              <p className="text-amber-200/80 leading-relaxed max-w-sm">
                Authentic, unadulterated whole spices, stone-ground powders, royal blends, and premium dry fruits. Served fresh from Kalitala, Beldanga to families across Murshidabad.
              </p>
              <div className="space-y-1 text-stone-300">
                <p>
                  📍 <strong>Address:</strong> Kalitala, Beldanga, Murshidabad, West Bengal 742175, India.
                </p>
                <p>
                  📞 <strong>Customer Hotline:</strong> +91 97335 12345 (8 AM – 8:30 PM)
                </p>
                <p>
                  💵 <strong>Payment:</strong> Cash on Delivery (COD) Only
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
                Store Navigation
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="hover:text-white transition"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('products')}
                    className="hover:text-white transition"
                  >
                    All Products & Pack Sizes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('products', 'Whole Spices')}
                    className="hover:text-white transition"
                  >
                    Whole Sabut Spices
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('products', 'Ground Spices')}
                    className="hover:text-white transition"
                  >
                    Ground Masalas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('products', 'Dry Fruits')}
                    className="hover:text-white transition"
                  >
                    Premium Dry Fruits
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('track')}
                    className="hover:text-white transition"
                  >
                    Track Existing Order
                  </button>
                </li>
              </ul>
            </div>

            {/* Policies & Owner */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider mb-3">
                Policies & Portal
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="hover:text-white transition"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="hover:text-white transition"
                  >
                    Delivery & Cancellation Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="hover:text-white transition"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="hover:text-white transition"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li className="pt-2">
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="text-amber-300 hover:text-white font-bold underline"
                  >
                    🔐 Owner Dashboard Login
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-300/70 gap-2">
            <div>
              © {new Date().getFullYear()} Mandal Masala Bhandar. All rights reserved.
            </div>
            <div>
              Crafted for Beldanga & Murshidabad with genuine spice passion.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <MainStore />
    </CartProvider>
  );
}
