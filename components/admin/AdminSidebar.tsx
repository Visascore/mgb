'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-charcoal min-h-screen sticky top-0 hidden lg:flex flex-col">
      <div className="px-6 py-7 border-b border-white/10">
        <p className="font-display text-xl text-cream">Magic Body</p>
        <p className="font-body text-[10px] tracking-widest uppercase text-goldlight mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`block font-body text-sm px-3 py-2.5 rounded-lg transition-colors ${
              pathname === s.href ? 'bg-gold/20 text-goldlight' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-5 border-t border-white/10">
        <a href="/api/signout" className="block font-body text-sm px-3 py-2.5 rounded-lg text-cream/50 hover:text-cream hover:bg-white/5">
          Sign Out
        </a>
      </div>
    </aside>
  );
}
