'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import Price from '@/components/ui/Price';
import PageHeader from '@/components/PageHeader';
import PaystackButton from '@/components/PaystackButton';
import { createClient } from '@/lib/supabase/client';
import { formatMoney, convert } from '@/lib/currency';
import { buildWhatsAppLink, WhatsAppNumber } from '@/lib/whatsapp';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { trackEvent } from '@/components/AnalyticsTracker';
import { useSiteContent } from '@/lib/use-site-content';

const FREE_DELIVERY_THRESHOLD_GBP = 75;
const DELIVERY_COST_GBP = 4.95;

type PaymentMethods = { whatsapp: boolean; paystack: boolean; stripe: boolean };

export default function CheckoutPage() {
  const { items, subtotalGbp, clear } = useCart();
  const { currency } = useCurrency();
  const content = useSiteContent();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; items: typeof items; total: number; deliveryCost: number } | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({ whatsapp: true, paystack: false, stripe: false });
  const [chosenMethod, setChosenMethod] = useState<'whatsapp' | 'paystack' | 'stripe' | null>(null);
  const [paystackConfirmed, setPaystackConfirmed] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    countyState: '',
    postcode: '',
    country: '',
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: waRow }, { data: paymentsRow }] = await Promise.all([
        supabase.from('site_settings').select('value').eq('key', 'whatsapp_numbers').maybeSingle(),
        supabase.from('site_settings').select('value').eq('key', 'payment_methods').maybeSingle(),
      ]);
      const numbers = (waRow?.value as WhatsAppNumber[] | null) ?? [];
      const defaultNumber = numbers.find((n) => n.isDefault) ?? numbers[0];
      setWhatsappNumber(defaultNumber?.number ?? null);
      if (paymentsRow?.value) {
        setPaymentMethods({ whatsapp: true, paystack: false, stripe: false, ...paymentsRow.value });
      }
    })();
  }, []);

  const deliveryCost = items.length === 0 || subtotalGbp >= FREE_DELIVERY_THRESHOLD_GBP ? 0 : DELIVERY_COST_GBP;
  const total = subtotalGbp + deliveryCost;

  const enabledMethods = (Object.keys(paymentMethods) as (keyof PaymentMethods)[]).filter((k) => paymentMethods[k]);

  useEffect(() => {
    if (confirmedOrder && !chosenMethod && enabledMethods.length === 1) {
      setChosenMethod(enabledMethods[0]);
    }
  }, [confirmedOrder, chosenMethod, enabledMethods]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) return;
    if (!form.fullName || !form.email || !form.phone || !form.addressLine1 || !form.city || !form.postcode || !form.country) {
      setError('Please fill in all required fields, including your delivery address.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const { data: userResult } = await supabase.auth.getUser();
      const orderId = crypto.randomUUID();

      const { error: orderError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: userResult?.user?.id ?? null,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        address_line1: form.addressLine1,
        address_line2: form.addressLine2 || null,
        city: form.city,
        county_state: form.countyState || null,
        postcode: form.postcode,
        country: form.country,
        delivery_cost: deliveryCost,
        total_amount: total,
        currency: 'GBP',
      });

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.priceGbp,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setConfirmedOrder({ id: orderId, items, total, deliveryCost });
      clear();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startStripeCheckout = async () => {
    if (!confirmedOrder) return;
    setStripeError(null);
    setStripeLoading(true);
    const origin = window.location.origin;
    const result = await createStripeCheckoutSession({
      type: 'order',
      id: confirmedOrder.id,
      amount: convert(confirmedOrder.total, currency),
      currency,
      description: 'Magic Body order',
      email: form.email,
      successUrl: `${origin}/checkout/stripe-return?orderId=${confirmedOrder.id}`,
      cancelUrl: `${origin}/checkout`,
    });
    setStripeLoading(false);
    if (result.error || !result.url) {
      setStripeError(result.error ?? 'Could not start Stripe checkout.');
      return;
    }
    window.location.href = result.url;
  };

  if (confirmedOrder) {
    if (!chosenMethod && enabledMethods.length > 1) {
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-20 text-center">
          <p className="eyebrow mb-2">Order Reserved</p>
          <h1 className="font-display text-2xl text-charcoal mb-6">{content.whatsappCheckout.chooserHeading}</h1>
          <div className="space-y-3">
            {enabledMethods.includes('whatsapp') && (
              <button onClick={() => setChosenMethod('whatsapp')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Finalise on WhatsApp
              </button>
            )}
            {enabledMethods.includes('paystack') && (
              <button onClick={() => setChosenMethod('paystack')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Pay with Paystack
              </button>
            )}
            {enabledMethods.includes('stripe') && (
              <button onClick={() => setChosenMethod('stripe')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Pay with Card (Stripe)
              </button>
            )}
          </div>
        </div>
      );
    }

    if (chosenMethod === 'paystack') {
      if (paystackConfirmed) {
        return (
          <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
            <svg className="mx-auto mb-6" width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="27" stroke="#B08D4F" strokeWidth="2" />
              <path d="M17 29l7 7 15-16" stroke="#B08D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h1 className="font-display text-2xl text-charcoal mb-3">Payment received — order confirmed!</h1>
            <a href="/shop" className="btn-gold">Continue Shopping</a>
          </div>
        );
      }
      const totalNgn = convert(confirmedOrder.total, 'NGN');
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
          <h1 className="font-display text-2xl text-charcoal mb-4">Complete your payment</h1>
          <p className="font-body text-charcoal2/80 mb-8">
            Pay <strong>₦{Math.round(totalNgn).toLocaleString('en-GB')}</strong> via Paystack to confirm your order.
          </p>
          <PaystackButton
            email={form.email}
            amountNgn={totalNgn}
            recordType="order"
            recordId={confirmedOrder.id}
            label="Pay with Paystack"
            onVerified={() => {
              trackEvent('conversion', '/checkout');
              setPaystackConfirmed(true);
            }}
          />
        </div>
      );
    }

    if (chosenMethod === 'stripe') {
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
          <h1 className="font-display text-2xl text-charcoal mb-4">Pay securely with card</h1>
          <p className="font-body text-charcoal2/80 mb-8">
            You'll be redirected to Stripe to pay <strong>{formatMoney(confirmedOrder.total, currency)}</strong>.
          </p>
          {stripeError && <p className="font-body text-sm text-red-700 mb-4">{stripeError}</p>}
          <button onClick={startStripeCheckout} disabled={stripeLoading} className="btn-gold disabled:opacity-60">
            {stripeLoading ? 'Redirecting…' : 'Continue to Stripe'}
          </button>
        </div>
      );
    }

    // WhatsApp (default / chosen)
    const receiptLines = [
      'Hi Magic Body! I\u2019d like to finalise my order.',
      '',
      `Order reference: ${confirmedOrder.id.slice(0, 8)}`,
      `Name: ${form.fullName}`,
      '',
      ...confirmedOrder.items.map(
        (item) => `${item.name} × ${item.quantity} — ${formatMoney(item.priceGbp * item.quantity, currency)}`
      ),
      '',
      `Delivery: ${confirmedOrder.deliveryCost === 0 ? 'Free' : formatMoney(confirmedOrder.deliveryCost, currency)}`,
      `Total: ${formatMoney(confirmedOrder.total, currency)}`,
      '',
      `Delivery address: ${form.addressLine1}${form.addressLine2 ? ', ' + form.addressLine2 : ''}, ${form.city}${form.countyState ? ', ' + form.countyState : ''}, ${form.postcode}, ${form.country}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
    ];

    const whatsappLink = whatsappNumber ? buildWhatsAppLink(whatsappNumber, receiptLines.join('\n')) : null;

    return (
      <div className="max-w-lg mx-auto px-5 md:px-8 py-20 text-center">
        <svg className="mx-auto mb-6" width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="27" stroke="#B08D4F" strokeWidth="2" />
          <path d="M17 29l7 7 15-16" stroke="#B08D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p className="eyebrow mb-2">Order Reserved</p>
        <h1 className="font-display text-3xl text-charcoal mb-4">{content.whatsappCheckout.heading}</h1>
        <p className="font-body text-charcoal2/80 leading-relaxed mb-6">
          {content.whatsappCheckout.body}
        </p>

        <div className="card p-5 text-left mb-7">
          <p className="font-body text-sm py-1 flex justify-between border-b border-line pb-2 mb-1">
            <span className="text-charcoal2">Reference</span>
            <span className="text-charcoal">{confirmedOrder.id.slice(0, 8)}</span>
          </p>
          {confirmedOrder.items.map((item) => (
            <div key={item.productId} className="flex justify-between font-body text-sm py-1">
              <span className="text-charcoal2">{item.name} × {item.quantity}</span>
              <Price amountGbp={item.priceGbp * item.quantity} className="text-charcoal" />
            </div>
          ))}
          <div className="flex justify-between font-body text-sm py-1 border-t border-line mt-2 pt-2">
            <span className="text-charcoal2">Delivery</span>
            {confirmedOrder.deliveryCost === 0 ? <span className="text-charcoal">Free</span> : <Price amountGbp={confirmedOrder.deliveryCost} />}
          </div>
          <div className="flex justify-between font-display text-base text-charcoal pt-2">
            <span>Total</span>
            <Price amountGbp={confirmedOrder.total} />
          </div>
        </div>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('conversion', '/checkout')}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-body text-sm px-7 py-3.5 rounded-full hover:bg-[#1ebe57] transition-colors"
          >
            {content.whatsappCheckout.buttonLabel}
          </a>
        ) : (
          <p className="font-body text-sm text-charcoal2/60">
            {content.whatsappCheckout.noNumberMessage}
          </p>
        )}

        <div className="mt-6">
          <Link href="/shop" className="font-body text-sm text-golddeep hover:text-charcoal">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 md:px-8 py-24 text-center">
        <p className="font-body text-charcoal2/70 mb-6">Your cart is empty.</p>
        <Link href="/shop" className="btn-gold">
          Visit the Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Checkout" title="Complete your order" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="font-display text-xl text-charcoal mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Full Name" value={form.fullName} onChange={update('fullName')} className="input" />
              <input required type="email" placeholder="Email Address" value={form.email} onChange={update('email')} className="input" />
              <input required placeholder="Phone Number" value={form.phone} onChange={update('phone')} className="input sm:col-span-2" />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <input required placeholder="Address Line 1" value={form.addressLine1} onChange={update('addressLine1')} className="input" />
              <input placeholder="Address Line 2 (Optional)" value={form.addressLine2} onChange={update('addressLine2')} className="input" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Town / City" value={form.city} onChange={update('city')} className="input" />
                <input placeholder="County / State" value={form.countyState} onChange={update('countyState')} className="input" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Postcode / ZIP Code" value={form.postcode} onChange={update('postcode')} className="input" />
                <input required placeholder="Country" value={form.country} onChange={update('country')} className="input" />
              </div>
            </div>
          </div>

          {error && <p className="font-body text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto disabled:opacity-60">
            {submitting ? 'Reserving…' : 'Reserve'}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-lg text-charcoal mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between font-body text-sm">
                  <span className="text-charcoal2">
                    {item.name} × {item.quantity}
                  </span>
                  <Price amountGbp={item.priceGbp * item.quantity} className="text-charcoal" />
                </div>
              ))}
            </div>
            <div className="border-t border-line mt-4 pt-4 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-charcoal2">Subtotal</span>
                <Price amountGbp={subtotalGbp} />
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-charcoal2">Delivery</span>
                {deliveryCost === 0 ? <span>Free</span> : <Price amountGbp={deliveryCost} />}
              </div>
              <div className="flex justify-between font-display text-lg text-charcoal pt-2">
                <span>Total</span>
                <Price amountGbp={total} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          background: #FCFAF5;
          border: 1px solid #E1D3B8;
          border-radius: 0.75rem;
          padding: 0.85rem 1rem;
          font-family: var(--font-inter);
          font-size: 0.925rem;
          color: #2A241C;
          width: 100%;
        }
        .input:focus { outline: 2px solid #B08D4F; outline-offset: 1px; }
      `}</style>
    </div>
  );
}
