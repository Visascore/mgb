import Link from 'next/link';
import ImageFrame from './ui/ImageFrame';
import { SiteContent } from '@/lib/content';

export default function CtaBanner({
  ctaImageUrl,
  content,
}: {
  ctaImageUrl?: string | null;
  content: SiteContent['home']['cta'];
}) {
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pb-20 md:pb-28">
      <div className="bg-charcoal rounded-xl2 p-3 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch overflow-hidden">
        <div className="flex flex-col justify-center px-5 py-10 md:pl-10 md:py-0">
          <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight mb-4">
            {content.heading}
          </h2>
          <p className="font-body text-sm text-cream/70 leading-relaxed max-w-xs mb-7">
            {content.body}
          </p>
          <div>
            <Link href="/book" className="inline-flex items-center justify-center bg-offwhite text-charcoal font-body text-sm px-6 py-3 rounded-full hover:bg-cream transition-colors">
              {content.buttonLabel}
            </Link>
          </div>
        </div>
        <ImageFrame ratio="aspect-[4/5] md:aspect-auto md:h-full" src={ctaImageUrl} alt="Magic Body client" />
      </div>
    </section>
  );
}
