'use client';

import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import Price from '@/components/ui/Price';
import PageHeader from '@/components/PageHeader';
import ImageFrame from '@/components/ui/ImageFrame';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalGbp } = useCart();

  return (
    <div>
      <PageHeader eyebrow="Your Bag" title="Shopping Cart" />

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-20">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-charcoal2/70 mb-6">Your cart is empty.</p>
            <Link href="/shop" className="btn-gold">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-line border-t border-b border-line">
              {items.map((item) => (
                <div key={item.productId} className="py-6 flex items-center gap-5">
                  <div className="w-20 shrink-0">
                    <ImageFrame ratio="aspect-square" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/shop/${item.slug}`} className="font-display text-lg text-charcoal hover:text-golddeep">
                      {item.name}
                    </Link>
                    <Price amountGbp={item.priceGbp} className="block font-body text-sm text-charcoal2/70 mt-1" />
                  </div>
                  <div className="flex items-center border border-line rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 font-body text-charcoal hover:bg-beige"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 font-body text-charcoal hover:bg-beige"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <Price amountGbp={item.priceGbp * item.quantity} className="font-body text-charcoal w-20 text-right" />
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="text-charcoal2/50 hover:text-charcoal"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Link href="/shop" className="font-body text-sm text-golddeep hover:text-charcoal">
                ← Continue Shopping
              </Link>
              <div className="text-right">
                <p className="font-body text-sm text-charcoal2/70">Subtotal</p>
                <Price amountGbp={subtotalGbp} className="font-display text-2xl text-charcoal" />
              </div>
            </div>

            <div className="mt-8 text-center md:text-right">
              <Link href="/checkout" className="btn-gold">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
