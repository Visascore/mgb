import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import { getSiteContentServer } from '@/lib/get-content-server';
import { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Shop Magic Body\u2019s curated skincare and body care collection, designed to extend your in-studio results.',
};

export const revalidate = 60;

export default async function ShopPage() {
  const supabase = createClient();
  const [{ data: products }, content] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    getSiteContentServer(),
  ]);
  const h = content.pageHeaders.shop;

  return (
    <div>
      <PageHeader eyebrow={h.eyebrow} title={h.title} description={h.description} />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(products as Product[] | null)?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {(!products || products.length === 0) && (
          <p className="font-body text-charcoal2/70">Our shop is being restocked — please check back shortly.</p>
        )}
      </div>
    </div>
  );
}
