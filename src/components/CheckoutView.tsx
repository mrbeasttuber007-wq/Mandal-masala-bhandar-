import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { DeliveryZone } from '../types';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  Banknote,
  AlertCircle,
  Clock,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutViewProps {
  deliveryZones: DeliveryZone[];
  onOrderSuccess: (orderResult: any) => void;
  onBackToShopping: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  deliveryZones,
  onOrderSuccess,
  onBackToShopping,
}) => {
  const { cart, subtotal, clearCart, updateQuantity, removeFromCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    locality: 'Kalitala Area',
    city: 'Beldanga',
    state: 'West Bengal',
    pincode: deliveryZones[0]?.pincode || '742175',
    instructions: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeZone =
    deliveryZones.find((z) => z.pincode === formData.pincode) || deliveryZones[0];

  const deliveryCharge =
    activeZone && activeZone.free_delivery_above > 0 && subtotal >= activeZone.free_delivery_above
      ? 0
      : activeZone?.delivery_charge || 0;

  const totalPayable = subtotal + deliveryCharge;
  const isBelowMin = activeZone ? subtotal < activeZone.min_order_amount : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage('Please enter your complete doorstep delivery address.');
      return;
    }

    if (isBelowMin) {
      setErrorMessage(
        `Minimum order for ${activeZone.zone_name} is ₹${activeZone.min_order_amount}. Please add ₹${
          activeZone.min_order_amount - subtotal
        } more to proceed.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name.trim(),
            phone: cleanPhone,
            email: formData.email.trim(),
            address: formData.address.trim(),
            locality: formData.locality,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            instructions: formData.instructions.trim(),
          },
          items: cart.map((c) => ({
            variant_id: c.variantId,
            quantity: c.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      clearCart();
      onOrderSuccess({
        order_id: data.order_id,
        order_number: data.order_number,
        total_amount: data.total_amount,
        subtotal: data.subtotal,
        delivery_charge: data.delivery_charge,
        manualWhatsAppLink: data.manualWhatsAppLink,
        customer: formData,
        items: cart,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-[#881337] flex items-center justify-center text-3xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-serif font-black text-stone-900">Your Cart is Empty</h2>
        <p className="text-stone-600 text-sm mt-2 max-w-md mx-auto">
          Please add spices or dry fruits to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShopping}
          className="mt-6 inline-flex items-center gap-2 bg-[#881337] text-white px-6 py-3 rounded-xl font-bold text-sm shadow hover:bg-[#700f2d] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Spices</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackToShopping}
          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-amber-100/50 transition"
          aria-label="Back to store"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#881337] tracking-tight">
            Checkout — Cash on Delivery (COD)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Deliveries made directly to your doorstep in Beldanga, Murshidabad
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Delivery Details */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-amber-200/80 shadow-sm space-y-6"
        >
          <div className="border-b border-amber-100 pb-4">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              1. Customer & Delivery Address
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter where you would like our Beldanga packaging team to deliver.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Subrata Mandal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] focus:ring-1 focus:ring-[#881337] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs text-stone-400 font-bold">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    className="w-full pl-11 p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] focus:ring-1 focus:ring-[#881337] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] focus:ring-1 focus:ring-[#881337] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Local Delivery Zone / PIN Code *
              </label>
              <select
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full p-3 text-sm rounded-lg border border-amber-300 bg-amber-50/50 font-medium text-stone-900 focus:border-[#881337] outline-none"
              >
                {deliveryZones.map((z) => (
                  <option key={z.id} value={z.pincode}>
                    PIN {z.pincode} — {z.zone_name} (Delivery: ₹{z.delivery_charge}, Free above ₹
                    {z.free_delivery_above})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Complete House / Shop Address & Landmark *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Holding No., Para/Road, landmark (e.g. Opposite Beldanga Kalitala Mandir, near High School)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] focus:ring-1 focus:ring-[#881337] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Please call 10 minutes before arrival, leave with shopkeeper"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] focus:ring-1 focus:ring-[#881337] outline-none"
              />
            </div>
          </div>

          {/* Payment Terms Callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#881337] font-bold text-sm">
              <Banknote className="w-5 h-5 text-emerald-700" />
              <span>Payment Mode: Cash on Delivery (COD) Only</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              No online prepayments required. Hand over cash directly to our delivery executive when
              your fresh spices arrive. Please check the sealed packaging upon delivery.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || isBelowMin}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              loading || isBelowMin
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-[#881337] hover:bg-[#700f2d] text-white active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span>Placing Order Securely...</span>
            ) : isBelowMin ? (
              <span>Minimum Order Amount Not Reached (₹{activeZone?.min_order_amount})</span>
            ) : (
              <span>Confirm Order (Pay ₹{totalPayable} COD at Handover)</span>
            )}
          </button>
        </form>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm">
            <h3 className="font-serif font-bold text-base text-stone-900 pb-3 border-b border-stone-100 flex items-center justify-between">
              <span>Order Summary ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
              <button
                onClick={onBackToShopping}
                className="text-xs text-[#d97706] font-sans font-bold hover:underline"
              >
                + Edit Cart
              </button>
            </h3>

            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto my-3 pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="py-3 first:pt-1 flex gap-3 items-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-amber-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-xs text-stone-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Pack: <span className="font-semibold text-amber-900">{item.packSize}</span> · Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xs text-stone-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Delivery ({activeZone?.zone_name})</span>
                <span className="font-semibold text-emerald-800">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              {activeZone && activeZone.free_delivery_above > 0 && subtotal < activeZone.free_delivery_above && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded">
                  💡 Free delivery available when you spend ₹{activeZone.free_delivery_above}!
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-[#78350f] border-t border-amber-200 pt-2.5">
                <span>Total Payable (COD)</span>
                <span className="font-mono text-lg font-black text-[#881337]">
                  ₹{totalPayable}
                </span>
              </div>
            </div>
          </div>

          {/* Local Service Promises */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 text-xs text-stone-700 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Packaged fresh upon order placement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d97706] shrink-0" />
              <span>Same-day or next-day local handover in Beldanga</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#881337] shrink-0" />
              <span>Direct shop hotline for order updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
