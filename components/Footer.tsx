'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurrency } from './providers/CurrencyProvider';
import { CURRENCIES } from '@/lib/currency';
import { createClient } from '@/lib/supabase/client';
import { useSiteContent } from '@/lib/use-site-content';

type SocialLinks = { instagram?: string; facebook?: string; tiktok?: string; twitter?: string; youtube?: string };

const SOCIAL_ICONS: Record<keyof SocialLinks, React.ReactNode> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 8.5h2.5V5H14c-2.2 0-4 1.8-4 4v2H8v3.5h2V21h3.5v-6.5H16l.7-3.5h-3.2V9c0-.3.3-.5.5-.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.5 3v10.8a2.7 2.7 0 11-2.2-2.65M14.5 3c.3 2 1.7 3.6 3.5 4.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4l7.5 9.5L4.5 20H7l5.2-5.1L16.5 20H20l-8-10.1L18.8 4h-2.5l-4.7 4.6L7.5 4H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" />
    </svg>
  ),
};

export default function Footer() {
  const { currency, setCurrency } = useCurrency();
  const [social, setSocial] = useState<SocialLinks>({});
  const content = useSiteContent();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'social_links').maybeSingle();
      if (data?.value) setSocial(data.value);
    })();
  }, []);

  const activeSocials = (Object.keys(SOCIAL_ICONS) as (keyof SocialLinks)[]).filter((k) => social[k]);

  return (
    <footer className="bg-beige/40 border-t border-line mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-xl text-charcoal mb-3">
            Magic <span className="italic text-gold">Body</span>
          </div>
          <p className="font-body text-sm text-charcoal2/70 leading-relaxed max-w-[220px] mb-4">
            {content.footer.tagline}
          </p>
          {activeSocials.length > 0 && (
            <div className="flex items-center gap-3">
              {activeSocials.map((key) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="text-charcoal2/60 hover:text-golddeep transition-colors"
                >
                  {SOCIAL_ICONS[key]}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow mb-4">Visit</div>
          <ul className="space-y-2 font-body text-sm text-charcoal2/80">
            <li><Link href="/treatments" className="hover:text-golddeep">Treatments</Link></li>
            <li><Link href="/shop" className="hover:text-golddeep">Shop</Link></li>
            <li><Link href="/gallery" className="hover:text-golddeep">Results</Link></li>
            <li><Link href="/about" className="hover:text-golddeep">About</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Studio</div>
          <ul className="space-y-2 font-body text-sm text-charcoal2/80">
            <li><Link href="/contact" className="hover:text-golddeep">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-golddeep">FAQ</Link></li>
            <li><Link href="/book" className="hover:text-golddeep">Book a session</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Account</div>
          <ul className="space-y-2 font-body text-sm text-charcoal2/80">
            <li><Link href="/login" className="hover:text-golddeep">Sign in</Link></li>
            <li><Link href="/account" className="hover:text-golddeep">Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 font-body text-xs text-charcoal2/50">
          <span>© {new Date().getFullYear()} Magic Body Studio. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              Currency
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent border border-line rounded-full px-2.5 py-1 text-xs text-charcoal2/70 focus:outline-none focus:border-gold"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </label>
            <span>Made with care.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
