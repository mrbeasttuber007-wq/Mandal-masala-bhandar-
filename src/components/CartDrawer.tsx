import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { DeliveryZone } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface CartDrawerProps {
  deliveryZones: DeliveryZone[];
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  deliveryZones,
  onProceedToCheckout,
}) => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, subtotal, totalCount } =
    useCart();

  if (!isOpen) return null;

  // Primary local zone for quick threshold indicator
  const primaryZone = deliveryZones[0] || {
    min_order_amount: 150,
    free_delivery_above: 250,
    delivery_charge: 0,
  };

  const amountNeededForFree =
    primaryZone.free_delivery_above > 0
      ? Math.max(0, primaryZone.free_delivery_above - subtotal)
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-[#fffdf7] h-full shadow-2xl flex flex-col justify-between border-l border-amber-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#881337] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <h2 className="font-serif font-bold text-lg text-[#fef3c7]">Your Spice Cart</h2>
            <span className="text-xs bg-[#700f2d] px-2 py-0.5 rounded-full font-mono text-amber-200">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free delivery progress strip */}
        <div className="bg-amber-100/70 border-b border-amber-200 px-4 py-2 text-xs text-stone-800">
          {amountNeededForFree > 0 ? (
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
              <span>
                Add <strong className="text-[#881337]">₹{amountNeededForFree}</strong> more for{' '}
                <strong className="text-emerald-800">FREE local Beldanga delivery</strong>!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>You have unlocked FREE local home delivery!</span>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-amber-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#881337] flex items-center justify-center text-2xl mb-3 shadow-inner">
                🌶️
              </div>
              <h3 className="font-serif font-bold text-stone-800 text-lg">Your cart is empty</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore our stone-ground masalas, whole spices, and crunchy dry fruits to get started.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-5 bg-[#d97706] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm hover:bg-[#b45309] transition"
              >
                Browse All Spices
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="pt-3 first:pt-0 flex gap-3 items-start">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg border border-amber-200 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                    <span className="font-medium text-amber-900 bg-amber-100/60 px-1.5 py-0.2 rounded text-[11px]">
                      {item.packSize}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-stone-700 font-semibold">
                      ₹{item.price} each
                    </span>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-amber-200 rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-amber-50 text-xs font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-mono text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-amber-50 text-xs font-bold disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#78350f]">
                        ₹{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-stone-400 hover:text-red-700 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-amber-200 space-y-3 shadow-lg">
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-emerald-800">
                  {subtotal >= primaryZone.free_delivery_above ? 'FREE' : `from ₹${primaryZone.delivery_charge}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Payment Mode</span>
                <span className="font-bold text-amber-900">Cash on Delivery (COD) Only</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#78350f] border-t border-amber-100 pt-1.5">
                <span>Payable at Handover</span>
                <span className="font-mono text-base font-black">
                  ₹{subtotal + (subtotal >= primaryZone.free_delivery_above ? 0 : primaryZone.delivery_charge)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onProceedToCheckout();
              }}
              className="w-full bg-[#881337] hover:bg-[#700f2d] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98]"
            >
              <span>Proceed to Checkout (COD)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
