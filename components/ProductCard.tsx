import Link from 'next/link';
import ImageFrame from './ui/ImageFrame';
import Price from './ui/Price';
import { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <ImageFrame ratio="aspect-square" src={product.images?.[0]} alt={product.name} />
      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="font-body text-sm text-charcoal group-hover:text-golddeep transition-colors">
          {product.name}
        </h3>
        <Price amountGbp={product.price} className="font-body text-sm text-charcoal2/70 shrink-0" />
      </div>
    </Link>
  );
}
