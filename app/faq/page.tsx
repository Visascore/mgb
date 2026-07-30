import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import { getSiteContentServer } from '@/lib/get-content-server';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Magic Body\u2019s treatments, bookings, and policies.',
};

export const revalidate = 60;

export default async function FaqPage() {
  const content = await getSiteContentServer();
  const c = content.faq;

  return (
    <div>
      <PageHeader eyebrow={c.eyebrow} title={c.title} />
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-20 divide-y divide-line border-t border-b border-line">
        {c.items.map((item) => (
          <details key={item.q} className="py-5 group">
            <summary className="font-display text-lg text-charcoal cursor-pointer list-none flex justify-between items-center">
              {item.q}
              <span className="font-body text-gold text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="font-body text-sm text-charcoal2/80 leading-relaxed mt-3">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
