import React from 'react';
import {
  CheckCircle2,
  MessageCircle,
  Truck,
  ArrowRight,
  MapPin,
  Banknote,
  Receipt,
} from 'lucide-react';

interface OrderConfirmationModalProps {
  orderData: any;
  onTrackOrder: (orderNumber: string, phone: string) => void;
  onContinueShopping: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderData,
  onTrackOrder,
  onContinueShopping,
}) => {
  if (!orderData) return null;

  const {
    order_number,
    total_amount,
    subtotal,
    delivery_charge,
    manualWhatsAppLink,
    customer,
    items,
  } = orderData;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl border border-amber-200 shadow-xl overflow-hidden text-center p-6 sm:p-10">
        {/* Celebration Badge */}
        <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#881337] tracking-tight">
          Dhanyabad! Order Placed Successfully
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
          Your order has been recorded at our Kalitala, Beldanga packaging counter. Our team will pack your
          spices and dry fruits fresh.
        </p>

        {/* Order Details Receipt Box */}
        <div className="mt-8 bg-amber-50/70 rounded-2xl p-6 border border-amber-200 text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-200 gap-2">
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Official Order ID
              </span>
              <span className="font-mono text-lg sm:text-xl font-black text-[#78350f] tracking-wide">
                {order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Payment Due (COD)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-[#881337]">
                ₹{total_amount}
              </span>
            </div>
          </div>

          {/* Delivery Address & Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 pt-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">{customer?.name} ({customer?.phone})</strong>
                <span>{customer?.address}, Beldanga, PIN {customer?.pincode}</span>
                {customer?.instructions && (
                  <p className="text-[11px] text-stone-500 mt-1 italic">
                    Note: "{customer.instructions}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Banknote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Cash On Delivery (COD)</strong>
                <span>Please keep exact cash ready at the time of doorstep handover.</span>
              </div>
            </div>
          </div>

          {/* Items Summary list */}
          {items && items.length > 0 && (
            <div className="border-t border-amber-200/80 pt-3">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Order Items:
              </span>
              <div className="space-y-1.5 text-xs">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-stone-800">
                    <span>
                      {it.name} ({it.packSize}) × {it.quantity}
                    </span>
                    <span className="font-mono font-bold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action 1: Instant WhatsApp Notification Link */}
        {manualWhatsAppLink && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold mb-3">
              Want instant priority packaging? Send a 1-tap WhatsApp message directly to the shop owner:
            </p>
            <a
              href={manualWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all text-xs sm:text-sm active:scale-[0.98] w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order Confirmation on WhatsApp</span>
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onTrackOrder(order_number, customer?.phone || '')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow transition"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
