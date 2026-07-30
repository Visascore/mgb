import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ImageFrame from '@/components/ui/ImageFrame';
import { createClient } from '@/lib/supabase/server';
import { getSiteContentServer } from '@/lib/get-content-server';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Magic Body\u2019s approach to non-invasive body contouring and skincare, and the team behind it.',
};

export const revalidate = 60;

export default async function AboutPage() {
  const supabase = createClient();
  const [{ data }, content] = await Promise.all([
    supabase.from('site_settings').select('value').eq('key', 'about_image').maybeSingle(),
    getSiteContentServer(),
  ]);
  const aboutImageUrl = (data?.value as { url?: string } | null)?.url ?? null;
  const c = content.about;

  return (
    <div>
      <PageHeader eyebrow={c.eyebrow} title={c.title} />

      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="font-body text-charcoal2/80 leading-relaxed mb-5">{c.paragraph1}</p>
          <p className="font-body text-charcoal2/80 leading-relaxed mb-5">{c.paragraph2}</p>
          <p className="font-body text-charcoal2/80 leading-relaxed">{c.paragraph3}</p>
        </div>
        <ImageFrame ratio="aspect-[4/5]" label="Our Studio" src={aboutImageUrl} alt="Our Studio" />
      </div>

      <div className="bg-beige/40 border-t border-line py-16">
        <div className="max-w-4xl mx-auto px-5 md:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-display text-3xl text-charcoal mb-2">{c.stat1Value}</div>
            <p className="font-body text-sm text-charcoal2/70">{c.stat1Label}</p>
          </div>
          <div>
            <div className="font-display text-3xl text-charcoal mb-2">{c.stat2Value}</div>
            <p className="font-body text-sm text-charcoal2/70">{c.stat2Label}</p>
          </div>
          <div>
            <div className="font-display text-3xl text-charcoal mb-2">{c.stat3Value}</div>
            <p className="font-body text-sm text-charcoal2/70">{c.stat3Label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
