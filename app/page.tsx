import Link from 'next/link';
import Hero from '@/components/Hero';
import FeatureStrip from '@/components/FeatureStrip';
import CtaBanner from '@/components/CtaBanner';
import ReviewCard from '@/components/ReviewCard';
import ImageFrame from '@/components/ui/ImageFrame';
import Price from '@/components/ui/Price';
import { createClient } from '@/lib/supabase/server';
import { getSiteContentServer } from '@/lib/get-content-server';
import { Review, Service } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: services }, { data: reviews }, { data: settingsRows }, content] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('is_archived', false)
      .order('price', { ascending: true })
      .limit(4),
    supabase.from('reviews').select('*').eq('status', 'approved').order('review_date', { ascending: false }).limit(3),
    supabase.from('site_settings').select('key, value').in('key', ['hero_image', 'cta_image', 'promise_image']),
    getSiteContentServer(),
  ]);

  const heroImageUrl = (settingsRows?.find((r) => r.key === 'hero_image')?.value as { url?: string } | null)?.url ?? null;
  const ctaImageUrl = (settingsRows?.find((r) => r.key === 'cta_image')?.value as { url?: string } | null)?.url ?? null;
  const promiseImageUrl = (settingsRows?.find((r) => r.key === 'promise_image')?.value as { url?: string } | null)?.url ?? null;

  return (
    <div>
      <Hero heroImageUrl={heroImageUrl} content={content.home.hero} />
      <FeatureStrip content={content.home.features} />

      {/* Signature treatments */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-4 md:py-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-3">{content.home.treatmentsEyebrow}</p>
            <h2 className="section-heading">{content.home.treatmentsHeading}</h2>
          </div>
          <Link href="/treatments" className="font-body text-sm text-golddeep hover:text-charcoal">
            View all
          </Link>
        </div>

        <div className="border border-line rounded-xl2 overflow-hidden bg-offwhite">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-line">
            {(services as Service[] | null)?.map((service, i) => (
              <div
                key={service.id}
                className={`p-7 ${i % 2 === 0 ? 'sm:border-r border-line' : ''} ${i >= 2 ? 'border-t border-line' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-body text-[11px] tracking-widest uppercase text-charcoal2/50">
                    {service.category ?? 'Treatment'}
                  </p>
                  <Price amount={service.price} className="font-display text-lg text-charcoal shrink-0" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl text-charcoal mb-1.5">{service.name}</h3>
                    <p className="font-body text-sm text-charcoal2/70 leading-relaxed max-w-sm">
                      {service.description}
                    </p>
                    <p className="font-body text-xs text-charcoal2/50 mt-3">
                      Deposit <Price amount={(service.price * service.deposit_percentage) / 100} /> · {service.duration_minutes} min
                    </p>
                  </div>
                  <Link href="/book" className="btn-primary !py-2 !px-4 text-xs shrink-0">
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our promise */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ImageFrame ratio="aspect-[4/5]" label="Our Studio" src={promiseImageUrl} alt="Our Studio" />
          <div>
            <p className="eyebrow mb-3">{content.home.promise.eyebrow}</p>
            <h2 className="section-heading mb-5">{content.home.promise.heading}</h2>
            <p className="font-body text-charcoal2/80 leading-relaxed max-w-md mb-6">
              {content.home.promise.body}
            </p>
            <Link href="/about" className="font-body text-sm text-golddeep hover:text-charcoal">
              {content.home.promise.linkLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        <p className="eyebrow mb-3">{content.home.testimonials.eyebrow}</p>
        <h2 className="section-heading mb-10">{content.home.testimonials.heading}</h2>
        {reviews && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews as Review[]).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <CtaBanner ctaImageUrl={ctaImageUrl} content={content.home.cta} />
    </div>
  );
}
