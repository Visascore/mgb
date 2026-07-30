import { createClient } from '@/lib/supabase/server';
import Price from '@/components/ui/Price';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-beige text-charcoal2',
  paid: 'bg-gold/15 text-golddeep',
  processing: 'bg-gold/15 text-golddeep',
  shipped: 'bg-charcoal/10 text-charcoal',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default async function AccountOrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="font-body text-sm text-charcoal2/70">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-body text-xs text-charcoal2/60">
                    Order #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
                  {order.status}
                </span>
              </div>
              <div className="divide-y divide-line border-t border-line">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between font-body text-sm">
                    <span className="text-charcoal2">
                      {item.product_name} × {item.quantity}
                    </span>
                    <Price amountGbp={item.unit_price * item.quantity} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-body text-sm mt-3 pt-3 border-t border-line">
                <span className="text-charcoal2">Total</span>
                <Price amountGbp={order.total_amount} className="font-medium text-charcoal" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
