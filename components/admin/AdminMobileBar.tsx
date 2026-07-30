'use client';

import { useRouter, usePathname } from 'next/navigation';

const SECTIONS = [
  { href: '/admin/overview', label: 'Overview' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/availability', label: 'Availability' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/services', label: 'Services' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/settings', label: 'Website Settings' },
];

export default function AdminMobileBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="lg:hidden bg-charcoal px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <span className="font-display text-lg text-cream">Magic Body Admin</span>
      <select
        value={pathname ?? ''}
        onChange={(e) => router.push(e.target.value)}
        className="bg-white/10 text-cream text-sm font-body rounded-lg px-3 py-1.5 border border-white/20"
      >
        {SECTIONS.map((s) => (
          <option key={s.href} value={s.href}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
