'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-beige text-charcoal2',
  paid: 'bg-gold/15 text-golddeep',
  processing: 'bg-gold/15 text-golddeep',
  shipped: 'bg-charcoal/10 text-charcoal',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('orders').update({ status }).eq('id', id);
    load();
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || o.full_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input placeholder="Search by name, email, or order ID" value={search} onChange={(e) => setSearch(e.target.value)} className="input sm:max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:max-w-[180px]">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div>
                  <p className="font-body text-sm text-charcoal">{o.full_name} · {o.email}</p>
                  <p className="font-body text-xs text-charcoal2/60 mt-1">
                    #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString('en-GB')} · £{Number(o.total_amount).toFixed(2)}
                  </p>
                </div>
                <select
                  value={o.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className={`font-body text-xs px-2 py-1.5 rounded-full capitalize border-0 shrink-0 ${STATUS_COLORS[o.status] ?? ''}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <a
                  href={`/admin/receipt/order/${o.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-body text-xs text-golddeep hover:underline shrink-0"
                >
                  Receipt
                </a>
              </div>

              {expanded === o.id && (
                <div className="mt-4 pt-4 border-t border-line grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-xs text-charcoal2/60 uppercase mb-1">Delivery Address</p>
                    <p className="font-body text-sm text-charcoal2">
                      {o.address_line1}{o.address_line2 ? `, ${o.address_line2}` : ''}<br />
                      {o.city}{o.county_state ? `, ${o.county_state}` : ''}<br />
                      {o.postcode}, {o.country}<br />
                      {o.phone}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-charcoal2/60 uppercase mb-1">Items</p>
                    {o.order_items?.map((item: any) => (
                      <p key={item.id} className="font-body text-sm text-charcoal2">
                        {item.product_name} × {item.quantity} — £{(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                    <p className="font-body text-sm text-charcoal mt-2">Delivery: £{Number(o.delivery_cost).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="font-body text-sm text-charcoal2/70">No orders match your filters.</p>}
        </div>
      )}

      <style>{`
        .input {
          background: #FCFAF5; border: 1px solid #E1D3B8; border-radius: 0.6rem;
          padding: 0.6rem 0.85rem; font-family: var(--font-inter); font-size: 0.875rem;
          color: #2A241C; width: 100%;
        }
        .input:focus { outline: 2px solid #B08D4F; outline-offset: 1px; }
      `}</style>
    </div>
  );
}
