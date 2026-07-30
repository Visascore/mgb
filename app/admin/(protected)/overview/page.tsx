import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/admin/StatCard';
import Price from '@/components/ui/Price';

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [
    { count: totalBookings },
    { count: upcomingCount },
    { data: paidOrders },
    { count: pendingOrders },
    { count: productsCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed'])
      .gte('created_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()),
    supabase.from('orders').select('total_amount').in('status', ['paid', 'processing', 'shipped', 'delivered']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const revenue = (paidOrders ?? []).reduce((sum, o: any) => sum + Number(o.total_amount), 0);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Bookings" value={String(totalBookings ?? 0)} />
        <StatCard label="Upcoming Appointments" value={String(upcomingCount ?? 0)} />
        <StatCard label="Revenue (Products)" value={`£${revenue.toFixed(2)}`} />
        <StatCard label="Pending Orders" value={String(pendingOrders ?? 0)} />
        <StatCard label="Active Products" value={String(productsCount ?? 0)} />
        <StatCard label="Reviews Awaiting Approval" value={String(reviewsCount ?? 0)} />
      </div>

      <p className="font-body text-sm text-charcoal2/60 mt-10">
        Use the sidebar to manage bookings, availability, services, products, orders, reviews, gallery, and
        customer enquiries.
      </p>
    </div>
  );
}
