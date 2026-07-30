'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-beige text-charcoal2',
  confirmed: 'bg-gold/15 text-golddeep',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-red-100 text-red-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, services(name), availability_slots(slot_date, start_time, status, id)')
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (booking: any, status: string) => {
    const supabase = createClient();
    await supabase.from('bookings').update({ status }).eq('id', booking.id);
    load();
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q || b.full_name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.services?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-6">Bookings</h1>

      <div className="flex items-center gap-6 mb-6 card px-5 py-3 w-fit">
        <span className="font-body text-sm flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Available
        </span>
        <span className="font-body text-sm flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Booked / Unavailable
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          placeholder="Search by name, email, or treatment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input sm:max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:max-w-[180px]">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-body text-xs text-charcoal2/60 uppercase border-b border-line">
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Treatment</th>
                <th className="py-3 pr-4">Date &amp; Time</th>
                <th className="py-3 pr-4">Deposit</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((b) => (
                <tr key={b.id} className="font-body text-sm">
                  <td className="py-3 pr-4">
                    <p className="text-charcoal">{b.full_name}</p>
                    <p className="text-xs text-charcoal2/60">{b.email} · {b.phone}</p>
                  </td>
                  <td className="py-3 pr-4 text-charcoal2">{b.services?.name}</td>
                  <td className="py-3 pr-4 text-charcoal2">
                    {b.availability_slots?.slot_date} at {b.availability_slots?.start_time?.slice(0, 5)}
                  </td>
                  <td className="py-3 pr-4 text-charcoal2">£{Number(b.deposit_amount).toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b, e.target.value)}
                      className={`font-body text-xs px-2 py-1.5 rounded-full capitalize border-0 ${STATUS_COLORS[b.status] ?? ''}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <a
                      href={`/admin/receipt/booking/${b.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-xs text-golddeep hover:underline"
                    >
                      View / Print
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="font-body text-sm text-charcoal2/70 py-6">No bookings match your filters.</p>}
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
