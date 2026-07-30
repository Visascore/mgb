import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAdmin } from '@/lib/supabase/admin-check';
import { createClient } from '@/lib/supabase/server';
import PrintButton from '@/components/admin/PrintButton';

export const metadata = { robots: { index: false, follow: false } };

export default async function OrderReceiptPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin');

  const supabase = createClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .single();

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-offwhite py-10 px-5">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/admin/orders" className="font-body text-sm text-golddeep hover:text-charcoal">
            ← Back to Orders
          </Link>
          <PrintButton />
        </div>

        <div className="bg-white border border-line rounded-xl2 p-10 shadow-soft print:shadow-none print:border-0">
          <div className="flex justify-between items-start mb-8 border-b border-line pb-6">
            <div>
              <p className="font-display text-2xl text-charcoal">
                Magic <span className="italic text-gold">Body</span>
              </p>
              <p className="font-body text-xs text-charcoal2/60 mt-1">Order Receipt</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs text-charcoal2/60">Reference</p>
              <p className="font-body text-sm text-charcoal">{order.id.slice(0, 8)}</p>
              <p className="font-body text-xs text-charcoal2/60 mt-1">
                {new Date(order.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="eyebrow mb-1 !text-[10px]">Customer</p>
              <p className="font-body text-sm text-charcoal">{order.full_name}</p>
              <p className="font-body text-sm text-charcoal2/70">{order.email}</p>
              <p className="font-body text-sm text-charcoal2/70">{order.phone}</p>
            </div>
            <div className="text-right">
              <p className="eyebrow mb-1 !text-[10px]">Status</p>
              <p className="font-body text-sm text-charcoal capitalize">{order.status}</p>
              {order.payment_provider && (
                <p className="font-body text-xs text-charcoal2/60 mt-1 capitalize">via {order.payment_provider}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <p className="eyebrow mb-1 !text-[10px]">Delivery Address</p>
            <p className="font-body text-sm text-charcoal2/80">
              {order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}<br />
              {order.city}{order.county_state ? `, ${order.county_state}` : ''}<br />
              {order.postcode}, {order.country}
            </p>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="font-body text-xs text-charcoal2/60 uppercase border-b border-line">
                <th className="text-left py-2">Product</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any) => (
                <tr key={item.id} className="font-body text-sm border-b border-line">
                  <td className="py-3 text-charcoal">{item.product_name}</td>
                  <td className="py-3 text-center text-charcoal2">{item.quantity}</td>
                  <td className="py-3 text-right text-charcoal2">
                    {order.currency} {Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-charcoal">
                    {order.currency} {(item.quantity * Number(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-charcoal2">Delivery</span>
                <span className="text-charcoal">{order.currency} {Number(order.delivery_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-display text-base text-charcoal pt-2 border-t border-line">
                <span>Total</span>
                <span>{order.currency} {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="font-body text-xs text-charcoal2/40 mt-10 text-center">
            Thank you for shopping with Magic Body Studio.
          </p>
        </div>
      </div>
    </div>
  );
}
