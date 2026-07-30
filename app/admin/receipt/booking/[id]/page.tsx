import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/supabase/admin-check';
import { createClient } from '@/lib/supabase/server';
import PrintButton from '@/components/admin/PrintButton';

export const metadata = { robots: { index: false, follow: false } };

export default async function BookingReceiptPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin');

  const supabase = createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(name, duration_minutes), availability_slots(slot_date, start_time)')
    .eq('id', params.id)
    .single();

  if (!booking) notFound();

  return (
    <div className="min-h-screen bg-offwhite py-10 px-5">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/admin/bookings" className="font-body text-sm text-golddeep hover:text-charcoal">
            ← Back to Bookings
          </Link>
          <PrintButton />
        </div>

        <div className="bg-white border border-line rounded-xl2 p-10 shadow-soft print:shadow-none print:border-0">
          <div className="flex justify-between items-start mb-8 border-b border-line pb-6">
            <div>
              <p className="font-display text-2xl text-charcoal">
                Magic <span className="italic text-gold">Body</span>
              </p>
              <p className="font-body text-xs text-charcoal2/60 mt-1">Booking Receipt</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs text-charcoal2/60">Reference</p>
              <p className="font-body text-sm text-charcoal">{booking.id.slice(0, 8)}</p>
              <p className="font-body text-xs text-charcoal2/60 mt-1">
                {new Date(booking.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="eyebrow mb-1 !text-[10px]">Customer</p>
              <p className="font-body text-sm text-charcoal">{booking.full_name}</p>
              <p className="font-body text-sm text-charcoal2/70">{booking.email}</p>
              <p className="font-body text-sm text-charcoal2/70">{booking.phone}</p>
            </div>
            <div className="text-right">
              <p className="eyebrow mb-1 !text-[10px]">Status</p>
              <p className="font-body text-sm text-charcoal capitalize">{booking.status.replace('_', ' ')}</p>
              {booking.payment_provider && (
                <p className="font-body text-xs text-charcoal2/60 mt-1 capitalize">via {booking.payment_provider}</p>
              )}
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="font-body text-xs text-charcoal2/60 uppercase border-b border-line">
                <th className="text-left py-2">Treatment</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Time</th>
                <th className="text-right py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="font-body text-sm border-b border-line">
                <td className="py-3 text-charcoal">{booking.services?.name}</td>
                <td className="py-3 text-charcoal2">{booking.availability_slots?.slot_date}</td>
                <td className="py-3 text-charcoal2">{booking.availability_slots?.start_time?.slice(0, 5)}</td>
                <td className="py-3 text-right text-charcoal">
                  {booking.currency} {Number(booking.total_price).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-charcoal2">Total Price</span>
                <span className="text-charcoal">{booking.currency} {Number(booking.total_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-charcoal2">Deposit</span>
                <span className="text-charcoal">{booking.currency} {Number(booking.deposit_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-display text-base text-charcoal pt-2 border-t border-line">
                <span>Balance Due</span>
                <span>{booking.currency} {Number(booking.balance_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-8 pt-6 border-t border-line">
              <p className="eyebrow mb-1 !text-[10px]">Notes</p>
              <p className="font-body text-sm text-charcoal2/80">{booking.notes}</p>
            </div>
          )}

          <p className="font-body text-xs text-charcoal2/40 mt-10 text-center">
            Thank you for choosing Magic Body Studio.
          </p>
        </div>
      </div>
    </div>
  );
}
