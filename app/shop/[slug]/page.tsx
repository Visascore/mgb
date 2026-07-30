import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ImageFrame from '@/components/ui/ImageFrame';
import Price from '@/components/ui/Price';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import { Product } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase.from('products').select('*').eq('slug', params.slug).single();
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(3);

  const p = product as Product;
  const inStock = p.stock_quantity > 0;

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ImageFrame ratio="aspect-square" label={p.name} src={p.images?.[0]} alt={p.name} />

        <div>
          <h1 className="font-display text-3xl md:text-4xl text-charcoal">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Price amountGbp={p.price} className="font-display text-2xl text-charcoal" />
            <span className={`font-body text-xs px-2.5 py-1 rounded-full ${inStock ? 'bg-gold/15 text-golddeep' : 'bg-charcoal/10 text-charcoal2/60'}`}>
              {inStock ? `In stock (${p.stock_quantity})` : 'Out of stock'}
            </span>
          </div>

          <p className="font-body text-charcoal2/80 leading-relaxed mt-6">{p.description}</p>

          {p.benefits && (
            <div className="mt-6">
              <h2 className="eyebrow mb-2">Benefits</h2>
              <p className="font-body text-sm text-charcoal2/80 leading-relaxed">{p.benefits}</p>
            </div>
          )}

          {p.ingredients && (
            <div className="mt-5">
              <h2 className="eyebrow mb-2">Ingredients</h2>
              <p className="font-body text-sm text-charcoal2/80 leading-relaxed">{p.ingredients}</p>
            </div>
          )}

          {p.usage_instructions && (
            <div className="mt-5">
              <h2 className="eyebrow mb-2">How to Use</h2>
              <p className="font-body text-sm text-charcoal2/80 leading-relaxed">{p.usage_instructions}</p>
            </div>
          )}

          <ProductActions product={p} />
        </div>
      </div>

      {related && related.length > 0 && (
        <div className="mt-20">
          <h2 className="section-heading mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(related as Product[]).map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
