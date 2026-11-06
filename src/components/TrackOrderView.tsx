import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Banknote,
  Calendar,
} from 'lucide-react';
import { OrderStatus } from '../types';

interface TrackOrderViewProps {
  initialOrderNumber?: string;
  initialPhone?: string;
}

const STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Out for Delivery',
  'Delivered',
];

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTracking = async (num: string, ph: string) => {
    if (!num.trim() || !ph.trim()) {
      setErrorMessage('Please provide both Order Number and registered 10-digit phone.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: num.trim(),
          phone: ph.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to find matching order.');
      }

      setOrder(data.order);
    } catch (err: any) {
      setOrder(null);
      setErrorMessage(err.message || 'Error tracking order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      fetchTracking(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, phone);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIdx = order ? getStepIndex(order.current_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#881337] tracking-tight">
          Track Your Spice Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2">
          Enter your Order ID (from receipt or SMS/WhatsApp) and your 10-digit mobile number.
        </p>
      </div>

      {/* Query Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200/80 shadow-sm max-w-2xl mx-auto space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Order ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MMB-261106-1234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] outline-none font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Registered Phone *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full p-3 text-sm rounded-lg border border-stone-300 focus:border-[#881337] outline-none font-mono"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d97706] hover:bg-[#b45309] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow transition active:scale-[0.99]"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Verifying with Beldanga counter...' : 'Track Delivery Status'}</span>
        </button>
      </form>

      {/* Order Tracking Result View */}
      {order && (
        <div className="mt-10 bg-white rounded-2xl border border-amber-200 shadow-md p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-stone-100 gap-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Order Tracking Record
              </span>
              <h2 className="font-mono text-xl sm:text-2xl font-black text-[#881337]">
                {order.order_number}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Placed on {new Date(order.created_at).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Current Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mt-0.5 ${
                  order.current_status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : order.current_status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {order.current_status}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar (if not cancelled) */}
          {order.current_status !== 'Cancelled' ? (
            <div>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">
                Delivery Progress:
              </h3>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step} className="text-center">
                      <div
                        className={`h-2 rounded-full mb-2 transition-all ${
                          isCompleted ? 'bg-[#881337]' : 'bg-stone-200'
                        }`}
                      />
                      <span
                        className={`block text-[10px] sm:text-xs font-semibold ${
                          isCurrent
                            ? 'text-[#881337] font-black'
                            : isCompleted
                            ? 'text-stone-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-800">
              This order has been marked as <strong>Cancelled</strong>. Deducted inventory units have
              been safely returned to store stock.
            </div>
          )}

          {/* Delivery & Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs text-stone-700">
            {/* Delivery Details */}
            <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Destination & Payment
              </h4>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                <div>
                  <strong>{order.customer_name}</strong>
                  <p className="text-stone-600 mt-0.5">
                    {order.delivery_locality}, Beldanga (PIN {order.delivery_pincode})
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Cash on Delivery (COD)</strong>
                  <p className="text-stone-600 mt-0.5">Total due at doorstep: ₹{order.total_amount}</p>
                </div>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Ordered Products
              </h4>
              <div className="space-y-2">
                {order.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-stone-800 font-medium">
                      {it.product_name} ({it.pack_size}) × {it.quantity}
                    </span>
                    <span className="font-mono font-bold text-stone-900">₹{it.item_total}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-100 pt-2 flex justify-between font-bold text-sm text-[#881337]">
                <span>Total Amount</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Timestamped Status History Audit */}
          {order.history && order.history.length > 0 && (
            <div className="pt-4 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                Status History Log
              </h4>
              <div className="space-y-3">
                {order.history.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#d97706] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900">{h.status}</span>
                      <span className="text-stone-400 mx-1.5">·</span>
                      <span className="text-stone-500">
                        {new Date(h.created_at).toLocaleString('en-IN')}
                      </span>
                      <p className="text-stone-600 mt-0.5">{h.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
