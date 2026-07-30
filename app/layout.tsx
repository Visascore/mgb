import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import SiteChrome from '@/components/SiteChrome';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://magicbody.studio'),
  title: {
    default: 'Magic Body — Premium Non-Invasive Body Contouring & Skincare',
    template: '%s | Magic Body',
  },
  description:
    'Magic Body is a luxury body contouring and skincare studio offering non-invasive treatments, curated skincare, and personalised care from booking through to results.',
  openGraph: {
    title: 'Magic Body — Premium Non-Invasive Body Contouring & Skincare',
    description:
      'Luxury, non-invasive body contouring and skincare treatments tailored to you.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body">
        <CurrencyProvider>
          <CartProvider>
            <AnalyticsTracker />
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
