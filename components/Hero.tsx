'use client';

import Link from 'next/link';
import ImageFrame from './ui/ImageFrame';
import { SiteContent } from '@/lib/content';

export default function Hero({
  heroImageUrl,
  content,
}: {
  heroImageUrl?: string | null;
  content: SiteContent['home']['hero'];
}) {
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="animate-fadeup">
        <p className="eyebrow mb-4">{content.eyebrow}</p>
        <h1 className="font-display text-[2.5rem] leading-[1.12] md:text-5xl md:leading-[1.1] text-charcoal">
          {content.headline1}
          <br />
          <span className="italic text-gold">{content.headline2Italic}</span>
        </h1>

        <p className="mt-6 font-body text-[15px] md:text-base text-charcoal2 max-w-sm leading-relaxed">
          {content.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/book" className="btn-primary">
            {content.ctaPrimary}
          </Link>
          <Link href="/treatments" className="btn-secondary">
            {content.ctaSecondary}
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-7">
          <div>
            <div className="font-display text-xl text-charcoal">{content.stat1Value}</div>
            <div className="font-body text-xs text-charcoal2/60 mt-1">{content.stat1Label}</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <div className="font-display text-xl text-charcoal">{content.stat2Value}</div>
            <div className="font-body text-xs text-charcoal2/60 mt-1">{content.stat2Label}</div>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <div className="font-display text-xl text-charcoal">{content.stat3Value}</div>
            <div className="font-body text-xs text-charcoal2/60 mt-1">{content.stat3Label}</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -bottom-4 -right-4 w-full h-full rounded-xl2 bg-gold/30 hidden sm:block" />
        <ImageFrame ratio="aspect-[4/5]" className="relative w-full" src={heroImageUrl} alt="Magic Body Studio" />
      </div>
    </section>
  );
}
