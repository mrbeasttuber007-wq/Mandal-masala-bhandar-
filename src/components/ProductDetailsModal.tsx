import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  initialVariantId?: string;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  initialVariantId,
  onClose,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialVariantId || product.variants?.[0]?.id || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant: ProductVariant | undefined =
    product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];

  const isOutOfStock = !activeVariant || activeVariant.stock_quantity <= 0;
  const discountAmount =
    activeVariant && activeVariant.mrp > activeVariant.price
      ? activeVariant.mrp - activeVariant.price
      : 0;

  const handleAdd = () => {
    if (!activeVariant || isOutOfStock) return;

    addToCart({
      variantId: activeVariant.id,
      productId: product.id,
      name: product.name,
      packSize: activeVariant.pack_size,
      price: activeVariant.price,
      mrp: activeVariant.mrp,
      quantity,
      imageUrl: product.image_url,
      maxStock: activeVariant.stock_quantity,
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-200 relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-stone-700 hover:text-black shadow-md hover:bg-white transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Media */}
          <div className="relative aspect-square md:aspect-auto bg-amber-50">
            <img
              src={product.image_url}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {discountAmount > 0 && (
              <span className="absolute top-4 left-4 bg-[#881337] text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                Save ₹{discountAmount}
              </span>
            )}
          </div>

          {/* Details & Purchase Module */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
                <span>{product.category_name}</span>
                <span aria-hidden="true" className="text-amber-400">·</span>
                <span>Mandal Masala Heritage</span>
              </div>

              <h2 className="text-2xl font-serif font-black text-stone-900 leading-tight">
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 mt-2.5 leading-relaxed">
                {product.description}
              </p>

              {/* Pack Size Selector */}
              <div className="mt-4">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Choose Pack Size:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedVariantId === v.id
                          ? 'border-[#881337] bg-rose-50/60 ring-1 ring-[#881337]'
                          : 'border-amber-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-stone-900">{v.pack_size}</div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono font-bold text-[#78350f]">₹{v.price}</span>
                        {v.mrp > v.price && (
                          <span className="text-[10px] text-stone-400 line-through">₹{v.mrp}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center justify-between border-t border-amber-100 pt-3">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-amber-300 rounded-lg bg-amber-50/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-amber-100 rounded-l font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(activeVariant?.stock_quantity || 1, quantity + 1))
                    }
                    disabled={quantity >= (activeVariant?.stock_quantity || 1)}
                    className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-amber-100 rounded-r font-bold text-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-4 bg-amber-50/60 rounded-lg p-3 text-[11px] text-stone-700 space-y-1.5 border border-amber-200/50">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>100% pure & unadulterated spice grade</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span>Handed over directly in Beldanga & surroundings</span>
                </div>
              </div>
            </div>

            {/* Total & Action */}
            <div className="mt-6 pt-4 border-t border-stone-200">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs text-stone-500 font-medium">Subtotal for {quantity} pack(s):</span>
                <span className="text-xl font-bold font-mono text-[#78350f]">
                  ₹{(activeVariant?.price || 0) * quantity}
                </span>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#881337] hover:bg-[#700f2d] text-white active:scale-[0.98]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart (₹{(activeVariant?.price || 0) * quantity})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
