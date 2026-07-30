'use client';

import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { createClient } from '@/lib/supabase/client';
import StatCard from '@/components/admin/StatCard';

type EventRow = {
  session_id: string;
  event_type: string;
  path: string;
  referrer: string | null;
  country: string | null;
  device_type: string | null;
  is_new_visitor: boolean;
  created_at: string;
};

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

function topEntries(counts: Record<string, number>, limit = 8) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default function AdminAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [bizLoading, setBizLoading] = useState(true);
  const [bookingStatusCounts, setBookingStatusCounts] = useState<Record<string, number>>({});
  const [topServices, setTopServices] = useState<{ name: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);
  const [growth, setGrowth] = useState({
    bookingsThisMonth: 0,
    bookingsLastMonth: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
  });
  const [teamCount, setTeamCount] = useState({ admin: 0, staff: 0 });

  useEffect(() => {
    (async () => {
      setBizLoading(true);
      const supabase = createClient();

      const now = new Date();
      const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [{ data: bookings }, { data: orderItems }, { data: paidOrders }, { data: roles }] = await Promise.all([
        supabase.from('bookings').select('status, total_price, created_at, service_id, services(name)'),
        supabase.from('order_items').select('product_name, quantity, unit_price'),
        supabase.from('orders').select('total_amount, created_at, status').in('status', ['paid', 'processing', 'shipped', 'delivered']),
        supabase.from('user_roles').select('role'),
      ]);

      // Booking status breakdown
      const statusCounts: Record<string, number> = {};
      for (const b of bookings ?? []) {
        statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;
      }
      setBookingStatusCounts(statusCounts);

      // Top services by booking volume
      const serviceCounts: Record<string, number> = {};
      for (const b of (bookings as any[]) ?? []) {
        const name = b.services?.name ?? 'Unknown';
        serviceCounts[name] = (serviceCounts[name] ?? 0) + 1;
      }
      setTopServices(
        Object.entries(serviceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      );

      // Top products by units sold
      const productAgg: Record<string, { qty: number; revenue: number }> = {};
      for (const item of orderItems ?? []) {
        const agg = productAgg[item.product_name] ?? { qty: 0, revenue: 0 };
        agg.qty += item.quantity;
        agg.revenue += item.quantity * Number(item.unit_price);
        productAgg[item.product_name] = agg;
      }
      setTopProducts(
        Object.entries(productAgg)
          .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 6)
      );

      // Growth: this month vs last month
      const bookingsThisMonth = (bookings ?? []).filter((b) => b.created_at >= startThisMonth).length;
      const bookingsLastMonth = (bookings ?? []).filter((b) => b.created_at >= startLastMonth && b.created_at < startThisMonth).length;
      const revenueThisMonth = (paidOrders ?? []).filter((o) => o.created_at >= startThisMonth).reduce((s, o) => s + Number(o.total_amount), 0);
      const revenueLastMonth = (paidOrders ?? []).filter((o) => o.created_at >= startLastMonth && o.created_at < startThisMonth).reduce((s, o) => s + Number(o.total_amount), 0);
      setGrowth({ bookingsThisMonth, bookingsLastMonth, revenueThisMonth, revenueLastMonth });

      // Team size
      const adminCount = (roles ?? []).filter((r) => r.role === 'admin').length;
      const staffCount = (roles ?? []).filter((r) => r.role === 'staff').length;
      setTeamCount({ admin: adminCount, staff: staffCount });

      setBizLoading(false);
    })();
  }, []);

  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = createClient();
      const cutoff = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('analytics_events')
        .select('session_id, event_type, path, referrer, country, device_type, is_new_visitor, created_at')
        .gte('created_at', cutoff)
        .order('created_at', { ascending: true });
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    })();
  }, [rangeDays]);

  const stats = useMemo(() => {
    const pageviews = events.filter((e) => e.event_type === 'pageview');
    const conversions = events.filter((e) => e.event_type === 'conversion');

    const sessions = new Map<string, { pageviews: number; isNew: boolean; converted: boolean }>();
    for (const e of pageviews) {
      const s = sessions.get(e.session_id) ?? { pageviews: 0, isNew: e.is_new_visitor, converted: false };
      s.pageviews += 1;
      sessions.set(e.session_id, s);
    }
    for (const e of conversions) {
      const s = sessions.get(e.session_id);
      if (s) s.converted = true;
    }

    const totalVisitors = sessions.size;
    const bounced = Array.from(sessions.values()).filter((s) => s.pageviews === 1).length;
    const converted = Array.from(sessions.values()).filter((s) => s.converted).length;
    const newVisitors = Array.from(sessions.values()).filter((s) => s.isNew).length;

    const bounceRate = totalVisitors ? (bounced / totalVisitors) * 100 : 0;
    const conversionRate = totalVisitors ? (converted / totalVisitors) * 100 : 0;
    const newVisitorRate = totalVisitors ? (newVisitors / totalVisitors) * 100 : 0;
    const avgPagesPerSession = totalVisitors ? pageviews.length / totalVisitors : 0;

    const pathCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};

    for (const e of pageviews) {
      pathCounts[e.path] = (pathCounts[e.path] ?? 0) + 1;
      if (e.country) countryCounts[e.country] = (countryCounts[e.country] ?? 0) + 1;
      if (e.device_type) deviceCounts[e.device_type] = (deviceCounts[e.device_type] ?? 0) + 1;
      if (e.referrer) {
        try {
          const host = new URL(e.referrer).hostname;
          referrerCounts[host] = (referrerCounts[host] ?? 0) + 1;
        } catch {
          // ignore malformed referrers
        }
      } else {
        referrerCounts['Direct / None'] = (referrerCounts['Direct / None'] ?? 0) + 1;
      }
    }

    // Daily series for the chart
    const dayMap: Record<string, number> = {};
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dayMap[d] = 0;
    }
    for (const e of pageviews) {
      const d = e.created_at.slice(0, 10);
      if (d in dayMap) dayMap[d] += 1;
    }
    const series = Object.entries(dayMap).map(([date, count]) => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      pageviews: count,
    }));

    return {
      totalVisitors,
      totalPageviews: pageviews.length,
      bounceRate,
      conversionRate,
      newVisitorRate,
      avgPagesPerSession,
      topPages: topEntries(pathCounts),
      topCountries: topEntries(countryCounts),
      topReferrers: topEntries(referrerCounts, 6),
      deviceCounts,
      series,
    };
  }, [events, rangeDays]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-charcoal">Analytics</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={`font-body text-xs px-3 py-2 rounded-full ${
                rangeDays === r.days ? 'bg-charcoal text-offwhite' : 'bg-beige text-charcoal2'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : events.length === 0 ? (
        <p className="font-body text-sm text-charcoal2/70">
          No visits recorded yet for this period. Tracking begins automatically once the site is live and receiving
          traffic.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard label="Unique Visitors" value={String(stats.totalVisitors)} />
            <StatCard label="Total Pageviews" value={String(stats.totalPageviews)} />
            <StatCard label="Bounce Rate" value={`${stats.bounceRate.toFixed(1)}%`} />
            <StatCard label="Conversion Rate" value={`${stats.conversionRate.toFixed(1)}%`} sub="Orders + bookings" />
            <StatCard label="New Visitors" value={`${stats.newVisitorRate.toFixed(1)}%`} />
            <StatCard label="Pages / Session" value={stats.avgPagesPerSession.toFixed(1)} />
          </div>

          <div className="card p-6 mb-8">
            <h2 className="font-display text-lg text-charcoal mb-4">Pageviews Over Time</h2>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={stats.series ?? []}>
                  <CartesianGrid stroke="#E1D3B8" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#4A4136' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#4A4136' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontFamily: 'var(--font-inter)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="pageviews" stroke="#B08D4F" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-display text-lg text-charcoal mb-4">Top Pages</h2>
              <div className="space-y-2">
                {stats.topPages.map(([path, count]) => (
                  <div key={path} className="flex justify-between font-body text-sm">
                    <span className="text-charcoal2 truncate pr-3">{path}</span>
                    <span className="text-charcoal shrink-0">{count}</span>
                  </div>
                ))}
                {stats.topPages.length === 0 && <p className="font-body text-sm text-charcoal2/60">No data yet.</p>}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg text-charcoal mb-4">Visitors by Location</h2>
              <div className="space-y-2">
                {stats.topCountries.map(([country, count]) => (
                  <div key={country} className="flex justify-between font-body text-sm">
                    <span className="text-charcoal2">{country}</span>
                    <span className="text-charcoal">{count}</span>
                  </div>
                ))}
                {stats.topCountries.length === 0 && (
                  <p className="font-body text-sm text-charcoal2/60">
                    No location data yet — this fills in automatically once deployed on Vercel.
                  </p>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg text-charcoal mb-4">Top Referrers</h2>
              <div className="space-y-2">
                {stats.topReferrers.map(([ref, count]) => (
                  <div key={ref} className="flex justify-between font-body text-sm">
                    <span className="text-charcoal2 truncate pr-3">{ref}</span>
                    <span className="text-charcoal shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg text-charcoal mb-4">Device Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(stats.deviceCounts).map(([device, count]) => (
                  <div key={device} className="flex justify-between font-body text-sm capitalize">
                    <span className="text-charcoal2">{device}</span>
                    <span className="text-charcoal">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.deviceCounts).length === 0 && (
                  <p className="font-body text-sm text-charcoal2/60">No data yet.</p>
                )}
              </div>
            </div>
          </div>

          <p className="font-body text-xs text-charcoal2/40 mt-8">
            Tracking is privacy-friendly: no cookies or personal data are stored, only anonymous session IDs, page
            paths, coarse device type, and (once deployed on Vercel) country/city from Vercel's edge geolocation.
          </p>
        </>
      )}

      {/* Business Performance */}
      <div className="mt-14 pt-10 border-t border-line">
        <h2 className="font-display text-2xl text-charcoal mb-6">Business Performance</h2>

        {bizLoading ? (
          <p className="font-body text-sm text-charcoal2/70">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Bookings This Month"
                value={String(growth.bookingsThisMonth)}
                sub={`${pctChange(growth.bookingsThisMonth, growth.bookingsLastMonth) >= 0 ? '+' : ''}${pctChange(growth.bookingsThisMonth, growth.bookingsLastMonth).toFixed(0)}% vs last month`}
              />
              <StatCard
                label="Revenue This Month"
                value={`£${growth.revenueThisMonth.toFixed(2)}`}
                sub={`${pctChange(growth.revenueThisMonth, growth.revenueLastMonth) >= 0 ? '+' : ''}${pctChange(growth.revenueThisMonth, growth.revenueLastMonth).toFixed(0)}% vs last month`}
              />
              <StatCard label="Confirmed Bookings" value={String(bookingStatusCounts.confirmed ?? 0)} />
              <StatCard label="Cancelled / No-Show" value={String((bookingStatusCounts.cancelled ?? 0) + (bookingStatusCounts.no_show ?? 0))} />
              <StatCard label="Team Members" value={String(teamCount.admin + teamCount.staff)} sub={`${teamCount.admin} admin · ${teamCount.staff} staff`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg text-charcoal mb-4">Booking Status Breakdown</h3>
                <div className="space-y-2">
                  {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((status) => (
                    <div key={status} className="flex justify-between font-body text-sm capitalize">
                      <span className="text-charcoal2">{status.replace('_', ' ')}</span>
                      <span className="text-charcoal">{bookingStatusCounts[status] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg text-charcoal mb-4">Most Booked Treatments</h3>
                <div className="space-y-2">
                  {topServices.map((s) => (
                    <div key={s.name} className="flex justify-between font-body text-sm">
                      <span className="text-charcoal2 truncate pr-3">{s.name}</span>
                      <span className="text-charcoal shrink-0">{s.count} bookings</span>
                    </div>
                  ))}
                  {topServices.length === 0 && <p className="font-body text-sm text-charcoal2/60">No bookings yet.</p>}
                </div>
              </div>

              <div className="card p-6 lg:col-span-2">
                <h3 className="font-display text-lg text-charcoal mb-4">Best-Selling Products</h3>
                <div className="space-y-2">
                  {topProducts.map((p) => (
                    <div key={p.name} className="flex justify-between font-body text-sm">
                      <span className="text-charcoal2 truncate pr-3">{p.name}</span>
                      <span className="text-charcoal shrink-0">{p.qty} units · £{p.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                  {topProducts.length === 0 && <p className="font-body text-sm text-charcoal2/60">No product sales yet.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
