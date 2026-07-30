'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './providers/CartProvider';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/treatments', label: 'Treatments' },
  { href: '/shop', label: 'Shop' },
  { href: '/gallery', label: 'Results' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setIsSignedIn(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-charcoal">
          Magic <span className="italic text-gold">Body</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-body text-sm transition-colors ${
                pathname === link.href ? 'text-golddeep' : 'text-charcoal2/80 hover:text-golddeep'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/cart" aria-label="Cart" className="relative text-charcoal2/80 hover:text-golddeep">
            <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
              <path
                d="M5.5 6.5V5a4.5 4.5 0 019 0v1.5M3 6.5h14l-1 11a1 1 0 01-1 .9H5a1 1 0 01-1-.9L3 6.5z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-offwhite text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <Link href={isSignedIn ? '/account' : '/login'} className="hidden md:inline-block font-body text-sm text-charcoal2/80 hover:text-golddeep">
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>

          <Link href="/book" className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-xs">
            Book now
          </Link>

          <button aria-label="Open menu" onClick={() => setOpen(!open)} className="lg:hidden p-2 text-charcoal">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M2 6h18M2 11h18M2 16h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-line bg-cream px-5 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="font-body text-charcoal">
              {link.label}
            </Link>
          ))}
          <Link href={isSignedIn ? '/account' : '/login'} onClick={() => setOpen(false)} className="font-body text-charcoal">
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>
          <Link href="/book" onClick={() => setOpen(false)} className="btn-primary justify-center">
            Book now
          </Link>
        </div>
      )}
    </header>
  );
}
