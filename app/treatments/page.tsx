import Link from 'next/link';
import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Price from '@/components/ui/Price';
import { createClient } from '@/lib/supabase/server';
import { getSiteContentServer } from '@/lib/get-content-server';
import { Service } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Treatments & Pricing',
  description: 'Explore Magic Body\u2019s non-invasive body contouring and skincare treatments, with transparent pricing and deposit terms.',
};

export const revalidate = 60;

export default async function TreatmentsPage() {
  const supabase = createClient();
  const [{ data: services }, content] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('is_archived', false)
      .order('price', { ascending: true }),
    getSiteContentServer(),
  ]);
  const h = content.pageHeaders.treatments;

  return (
    <div>
      <PageHeader eyebrow={h.eyebrow} title={h.title} description={h.description} />

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <div className="divide-y divide-line border-t border-b border-line">
          {(services as Service[] | null)?.map((service) => {
            const deposit = (service.price * service.deposit_percentage) / 100;
            return (
              <div key={service.id} className="py-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-display text-xl text-charcoal">{service.name}</h2>
                  <p className="font-body text-sm text-charcoal2/75 mt-2 leading-relaxed max-w-xl">
                    {service.description}
                  </p>
                  <p className="font-body text-xs text-charcoal2/60 mt-3">
                    {service.duration_minutes} minutes &middot; {service.deposit_percentage}% deposit
                    (<Price amountGbp={deposit} />) to book
                  </p>
                </div>
                <div className="md:text-right shrink-0">
                  <Price amountGbp={service.price} className="font-display text-2xl text-charcoal" />
                </div>
              </div>
            );
          })}
          {(!services || services.length === 0) && (
            <p className="py-10 font-body text-charcoal2/70">
              Treatments are being updated — please check back shortly.
            </p>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/book" className="btn-gold">
            Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
