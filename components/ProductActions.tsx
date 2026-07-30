'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './providers/CartProvider';
import { Product } from '@/lib/types';

export default function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const inStock = product.stock_quantity > 0;

  const buildItem = () => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    priceGbp: product.price,
    image: product.images?.[0] ?? null,
  });

  const handleAddToCart = () => {
    addItem(buildItem(), quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(buildItem(), quantity);
    router.push('/checkout');
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <label htmlFor="qty" className="font-body text-sm text-charcoal2">
          Quantity
        </label>
        <div className="flex items-center border border-line rounded-full overflow-hidden">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 font-body text-charcoal hover:bg-beige"
          >
            −
          </button>
          <span id="qty" className="w-10 text-center font-body text-charcoal">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-9 h-9 font-body text-charcoal hover:bg-beige"
          >
            +
          </button>
        </div>
      </div>

      {!inStock ? (
        <p className="font-body text-sm text-charcoal2/60 mb-4">Currently out of stock.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          <button onClick={handleAddToCart} className="btn-secondary">
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button onClick={handleBuyNow} className="btn-gold">
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}
