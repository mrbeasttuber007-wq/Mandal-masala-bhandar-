import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Check, Info } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product, initialVariantId?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ''
  );
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant: ProductVariant | undefined =
    product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];

  const isOutOfStock = !activeVariant || activeVariant.stock_quantity <= 0;
  const discountAmount =
    activeVariant && activeVariant.mrp > activeVariant.price
      ? activeVariant.mrp - activeVariant.price
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVariant || isOutOfStock) return;

    addToCart({
      variantId: activeVariant.id,
      productId: product.id,
      name: product.name,
      packSize: activeVariant.pack_size,
      price: activeVariant.price,
      mrp: activeVariant.mrp,
      quantity: 1,
      imageUrl: product.image_url,
      maxStock: activeVariant.stock_quantity,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      onClick={() => onViewDetails?.(product, activeVariant?.id)}
      className="bg-white rounded-xl border border-amber-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div>
        {/* Product Image Slot with Fallback Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
          <img
            src={product.image_url}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {discountAmount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-[#881337] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
              SAVE ₹{discountAmount}
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-700 text-white font-bold text-xs px-3 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(product, activeVariant?.id);
            }}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-stone-700 hover:text-[#881337] shadow hover:bg-white transition"
            title="View Details"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Clean unboxed metadata separator */}
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium mb-1">
            <span>{product.category_name || 'Spices'}</span>
            <span aria-hidden="true" className="text-amber-400">·</span>
            <span>Beldanga Fresh</span>
          </div>

          <h3 className="font-serif font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-[#881337] transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Pack Size Variant Selector */}
          <div className="mt-3.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Select Pack Size:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.variants?.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`text-xs px-2.5 py-1 rounded border font-medium transition-all ${
                    selectedVariantId === v.id
                      ? 'bg-[#881337] text-white border-[#881337] shadow-xs'
                      : 'bg-amber-50/60 text-stone-700 border-amber-200 hover:border-amber-400'
                  }`}
                >
                  {v.pack_size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Action */}
      <div className="p-4 pt-0">
        <div className="flex items-baseline justify-between mb-3 border-t border-amber-100 pt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#78350f] font-mono tabular-nums">
              ₹{activeVariant?.price}
            </span>
            {discountAmount > 0 && (
              <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                ₹{activeVariant?.mrp}
              </span>
            )}
          </div>
          <span className={`text-[11px] font-semibold ${isOutOfStock ? 'text-red-600' : 'text-emerald-700'}`}>
            {isOutOfStock ? 'Sold out' : `${activeVariant?.stock_quantity} left`}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
            isOutOfStock
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : justAdded
              ? 'bg-emerald-700 text-white'
              : 'bg-[#d97706] hover:bg-[#b45309] text-white active:scale-[0.98]'
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
              <span>Add {activeVariant?.pack_size} to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
