import React, { useState } from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Truck, RefreshCw, FileText } from 'lucide-react';

export const AboutAndPolicies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'delivery' | 'terms' | 'privacy'>('about');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#881337] tracking-tight">
          Mandal Masala Bhandar
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2">
          Kalitala, Beldanga, Murshidabad, West Bengal 742175, India
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8 border-b border-amber-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'about'
              ? 'bg-[#881337] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          About Our Store
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'delivery'
              ? 'bg-[#881337] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Delivery & COD Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'terms'
              ? 'bg-[#881337] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'privacy'
              ? 'bg-[#881337] text-white shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-6 sm:p-10 space-y-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#78350f]">
                Heritage of Taste & Uncompromising Purity
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 mt-3 leading-relaxed">
                Located right near the historic Kalitala in Beldanga, <strong>Mandal Masala Bhandar</strong> was founded with a singular conviction: genuine spices should possess intense natural aroma, rich volatile oil content, and absolute zero adulteration.
              </p>
              <p className="text-xs sm:text-sm text-stone-700 mt-2 leading-relaxed">
                Most commercial supermarket spices are heated excessively during mechanical grinding, causing vital essential oils to evaporate. We preserve our spices through slow, low-temperature grinding and sun-sifting. Whether it is our Salem high-curcumin turmeric, shahi jeera, or select California almonds, every pack represents authentic Indian culinary craft.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-100">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <ShieldCheck className="w-6 h-6 text-emerald-700 mb-2" />
                <h3 className="font-bold text-xs text-stone-900">Zero Artificial Colors</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Pure natural shades derived solely from cold-crushed turmeric roots and Kashmiri sun-dried chilies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <Truck className="w-6 h-6 text-[#d97706] mb-2" />
                <h3 className="font-bold text-xs text-stone-900">Fresh Local Beldanga Delivery</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Hand-packed right upon receiving your order and delivered promptly to your doorstep across Murshidabad.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <RefreshCw className="w-6 h-6 text-[#881337] mb-2" />
                <h3 className="font-bold text-xs text-stone-900">Direct Cash on Delivery</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Zero prepayment risk. Inspect your sealed package at the doorstep and pay cash with total confidence.
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="bg-[#78350f] text-[#fef3c7] p-6 rounded-xl space-y-3">
              <h3 className="font-serif font-bold text-base text-white">Visit Our Shop</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <strong>Shop Address:</strong>
                    <p className="text-amber-100/90 mt-0.5">
                      Kalitala, Beldanga, Murshidabad, West Bengal 742175, India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <strong>Customer Hotline & WhatsApp:</strong>
                    <p className="text-amber-100/90 mt-0.5">+91 97335 12345</p>
                    <p className="text-[11px] text-amber-200/70">Open Daily: 8:00 AM – 8:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <h2 className="text-xl font-serif font-black text-[#78350f]">
              Local Beldanga Delivery & Cash on Delivery (COD) Policy
            </h2>
            <p>
              <strong>1. Service Coverage:</strong> Mandal Masala Bhandar operates an exclusive local delivery network covering Beldanga Town, Kalitala Bazar, Beldanga Railway Station area, Rejinagar, Sargachi, and adjacent Murshidabad belts (PIN codes: 742175, 742133, 742189, 742134).
            </p>
            <p>
              <strong>2. Cash on Delivery (COD):</strong> All orders are fulfilled strictly via Cash on Delivery. Customers pay cash directly to our delivery personnel upon physical handover of the parcel.
            </p>
            <p>
              <strong>3. Delivery Charges:</strong> Delivery is FREE for Beldanga Town (742175) on orders of ₹250 or more. For other nearby zones, nominal local delivery charges apply as shown clearly in the cart before placing your order.
            </p>
            <p>
              <strong>4. Cancellation & Quality Check:</strong> You have the right to inspect the outer tamper-evident sealed spice packaging. If the seal is compromised, you may decline the delivery with zero penalty, and our system immediately restores the stock units in the database.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <h2 className="text-xl font-serif font-black text-[#78350f]">
              Terms & Conditions of Service
            </h2>
            <p>
              Welcome to Mandal Masala Bhandar. By ordering products through our platform, you acknowledge that orders are placed for genuine home or business consumption in Beldanga, Murshidabad.
            </p>
            <p>
              <strong>Pricing & Inventory:</strong> All pack sizes (100g, 250g, 500g, 1kg) reflect verified pricing and stock availability directly from our server. We reserve the right to decline orders if inaccurate delivery addresses or unreachable phone numbers are provided.
            </p>
            <p>
              <strong>Governing Law:</strong> All transactions are subject to the jurisdiction of the courts of Murshidabad District, West Bengal.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <h2 className="text-xl font-serif font-black text-[#78350f]">
              Customer Privacy & Data Protection
            </h2>
            <p>
              We respect your privacy. Customer names, mobile numbers, and delivery addresses entered during checkout are utilized strictly for fulfilling local delivery, dispatching WhatsApp order confirmations, and generating delivery receipts.
            </p>
            <p>
              Your contact details are never rented, sold, or shared with third-party advertisers. Order lookups on our tracking portal require matching both the Order ID and the phone number to prevent unauthorized access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
