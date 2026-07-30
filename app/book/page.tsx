'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Price from '@/components/ui/Price';
import PaystackButton from '@/components/PaystackButton';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { formatMoney, convert } from '@/lib/currency';
import { buildWhatsAppLink, WhatsAppNumber } from '@/lib/whatsapp';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { trackEvent } from '@/components/AnalyticsTracker';
import { createClient } from '@/lib/supabase/client';
import { useSiteContent } from '@/lib/use-site-content';
import { AvailabilitySlot, Service } from '@/lib/types';

const STEPS = ['Treatment', 'Date', 'Time', 'Your Details'];

type PaymentMethods = { whatsapp: boolean; paystack: boolean; stripe: boolean };

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function BookPage() {
  const supabase = useMemo(() => createClient(), []);
  const { currency } = useCurrency();
  const content = useSiteContent();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({ whatsapp: true, paystack: false, stripe: false });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [chosenMethod, setChosenMethod] = useState<'whatsapp' | 'paystack' | 'stripe' | null>(null);
  const [paystackConfirmed, setPaystackConfirmed] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: svc }, { data: slt }, { data: waRow }, { data: paymentsRow }] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).eq('is_archived', false).order('price'),
        supabase
          .from('availability_slots')
          .select('*')
          .eq('status', 'available')
          .gte('slot_date', new Date().toISOString().slice(0, 10))
          .order('slot_date')
          .order('start_time'),
        supabase.from('site_settings').select('value').eq('key', 'whatsapp_numbers').maybeSingle(),
        supabase.from('site_settings').select('value').eq('key', 'payment_methods').maybeSingle(),
      ]);
      setServices((svc as Service[]) ?? []);
      setSlots((slt as AvailabilitySlot[]) ?? []);

      const numbers = (waRow?.value as WhatsAppNumber[] | null) ?? [];
      const defaultNumber = numbers.find((n) => n.isDefault) ?? numbers[0];
      setWhatsappNumber(defaultNumber?.number ?? null);

      if (paymentsRow?.value) {
        setPaymentMethods({ whatsapp: true, paystack: false, stripe: false, ...paymentsRow.value });
      }

      setLoading(false);
    })();
  }, [supabase]);

  const availableDates = useMemo(
    () => Array.from(new Set(slots.map((s) => s.slot_date))).sort(),
    [slots]
  );

  const slotsForDate = useMemo(
    () => slots.filter((s) => s.slot_date === selectedDate),
    [slots, selectedDate]
  );

  const deposit = selectedService ? (selectedService.price * selectedService.deposit_percentage) / 100 : 0;
  const balance = selectedService ? selectedService.price - deposit : 0;

  const enabledMethods = (Object.keys(paymentMethods) as (keyof PaymentMethods)[]).filter((k) => paymentMethods[k]);

  useEffect(() => {
    if (confirmedBookingId && !chosenMethod && enabledMethods.length === 1) {
      setChosenMethod(enabledMethods[0]);
    }
  }, [confirmedBookingId, chosenMethod, enabledMethods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedService || !selectedSlot) return;
    if (!form.fullName || !form.email || !form.phone) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: userResult } = await supabase.auth.getUser();
      const bookingId = crypto.randomUUID();

      const { error: insertError } = await supabase.from('bookings').insert({
        id: bookingId,
        user_id: userResult?.user?.id ?? null,
        service_id: selectedService.id,
        slot_id: selectedSlot.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        notes: form.notes || null,
        total_price: selectedService.price,
        deposit_amount: deposit,
        balance_amount: balance,
        currency: 'GBP',
      });

      if (insertError) {
        if (insertError.message.toLowerCase().includes('already been booked')) {
          setError('Sorry — that time was just booked by someone else. Please choose another time.');
          setSlots((prev) => prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: 'booked' } : s)));
          setSelectedSlot(null);
          setStep(2);
        } else {
          setError(insertError.message);
        }
        setSubmitting(false);
        return;
      }

      setConfirmedBookingId(bookingId);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startStripeCheckout = async () => {
    if (!confirmedBookingId || !selectedService) return;
    setStripeError(null);
    setStripeLoading(true);
    const origin = window.location.origin;
    const result = await createStripeCheckoutSession({
      type: 'booking',
      id: confirmedBookingId,
      amount: convert(deposit, currency),
      currency,
      description: `Deposit — ${selectedService.name}`,
      email: form.email,
      successUrl: `${origin}/book/stripe-return?bookingId=${confirmedBookingId}`,
      cancelUrl: `${origin}/book`,
    });
    setStripeLoading(false);
    if (result.error || !result.url) {
      setStripeError(result.error ?? 'Could not start Stripe checkout.');
      return;
    }
    window.location.href = result.url;
  };

  if (confirmedBookingId && selectedService && selectedSlot) {
    // More than one method enabled and none chosen yet — let the customer pick.
    if (!chosenMethod && enabledMethods.length > 1) {
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-20 text-center">
          <p className="eyebrow mb-2">Booking Reserved</p>
          <h1 className="font-display text-2xl text-charcoal mb-6">{content.whatsappBooking.chooserHeading}</h1>
          <div className="space-y-3">
            {enabledMethods.includes('whatsapp') && (
              <button onClick={() => setChosenMethod('whatsapp')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Finalise on WhatsApp
              </button>
            )}
            {enabledMethods.includes('paystack') && (
              <button onClick={() => setChosenMethod('paystack')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Pay Deposit with Paystack
              </button>
            )}
            {enabledMethods.includes('stripe') && (
              <button onClick={() => setChosenMethod('stripe')} className="w-full card p-4 hover:border-gold font-body text-sm text-charcoal">
                Pay Deposit with Card (Stripe)
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
            <h1 className="font-display text-2xl text-charcoal mb-3">Deposit paid — you're confirmed!</h1>
            <p className="font-body text-charcoal2/80 mb-8">
              {selectedService.name} on {selectedDate && formatDate(selectedDate)} at {selectedSlot.start_time.slice(0, 5)}
            </p>
            <a href="/account" className="btn-gold">View My Appointments</a>
          </div>
        );
      }
      const depositNgn = convert(deposit, 'NGN');
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
          <h1 className="font-display text-2xl text-charcoal mb-4">Secure your appointment</h1>
          <p className="font-body text-charcoal2/80 mb-8">
            Pay your deposit of <strong>₦{Math.round(depositNgn).toLocaleString('en-GB')}</strong> via Paystack to
            confirm this booking.
          </p>
          <PaystackButton
            email={form.email}
            amountNgn={depositNgn}
            recordType="booking"
            recordId={confirmedBookingId}
            label="Pay Deposit with Paystack"
            onVerified={() => {
              trackEvent('conversion', '/book');
              setPaystackConfirmed(true);
            }}
          />
        </div>
      );
    }

    if (chosenMethod === 'stripe') {
      return (
        <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
          <h1 className="font-display text-2xl text-charcoal mb-4">Pay your deposit securely</h1>
          <p className="font-body text-charcoal2/80 mb-8">
            You'll be redirected to Stripe to pay <strong>{formatMoney(deposit, currency)}</strong>.
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
      'Hi Magic Body! I\u2019d like to finalise my booking.',
      '',
      `Reference: ${confirmedBookingId.slice(0, 8)}`,
      `Name: ${form.fullName}`,
      `Treatment: ${selectedService.name}`,
      `Date: ${selectedDate && formatDate(selectedDate)}`,
      `Time: ${selectedSlot.start_time.slice(0, 5)}`,
      `Total: ${formatMoney(selectedService.price, currency)}`,
      `Deposit: ${formatMoney(deposit, currency)}`,
      `Balance at appointment: ${formatMoney(balance, currency)}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      form.notes ? `Notes: ${form.notes}` : '',
    ].filter(Boolean);

    const whatsappLink = whatsappNumber ? buildWhatsAppLink(whatsappNumber, receiptLines.join('\n')) : null;

    return (
      <div className="max-w-lg mx-auto px-5 md:px-8 py-20 text-center">
        <svg className="mx-auto mb-6" width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="27" stroke="#B08D4F" strokeWidth="2" />
          <path d="M17 29l7 7 15-16" stroke="#B08D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p className="eyebrow mb-2">Booking Reserved</p>
        <h1 className="font-display text-3xl text-charcoal mb-4">{content.whatsappBooking.heading}</h1>
        <p className="font-body text-charcoal2/80 leading-relaxed mb-6">
          {content.whatsappBooking.body}
        </p>

        <div className="card p-5 text-left mb-7">
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Reference</span>
            <span className="text-charcoal">{confirmedBookingId.slice(0, 8)}</span>
          </p>
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Treatment</span>
            <span className="text-charcoal">{selectedService.name}</span>
          </p>
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Date</span>
            <span className="text-charcoal">{selectedDate && formatDate(selectedDate)}</span>
          </p>
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Time</span>
            <span className="text-charcoal">{selectedSlot.start_time.slice(0, 5)}</span>
          </p>
          <p className="font-body text-sm py-1 flex justify-between border-t border-line mt-2 pt-2">
            <span className="text-charcoal2">Total</span>
            <Price amountGbp={selectedService.price} />
          </p>
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Deposit</span>
            <Price amountGbp={deposit} className="text-golddeep font-medium" />
          </p>
          <p className="font-body text-sm py-1 flex justify-between">
            <span className="text-charcoal2">Balance at appointment</span>
            <Price amountGbp={balance} />
          </p>
        </div>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('conversion', '/book')}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-body text-sm px-7 py-3.5 rounded-full hover:bg-[#1ebe57] transition-colors"
          >
            {content.whatsappBooking.buttonLabel}
          </a>
        ) : (
          <p className="font-body text-sm text-charcoal2/60">
            {content.whatsappBooking.noNumberMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow={content.pageHeaders.book.eyebrow} title={content.pageHeaders.book.title} />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-16">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-body text-xs ${
                    i <= step ? 'bg-gold text-offwhite' : 'bg-beige text-charcoal2/50'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`mt-2 font-body text-xs text-center ${i === step ? 'text-charcoal' : 'text-charcoal2/50'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 -mt-5 ${i < step ? 'bg-gold' : 'bg-line'}`} />}
            </div>
          ))}
        </div>

        {loading && <p className="font-body text-charcoal2/70 text-center">Loading availability…</p>}

        {!loading && step === 0 && (
          <div className="space-y-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep(1);
                }}
                className={`w-full text-left card p-6 hover:border-gold transition-colors ${
                  selectedService?.id === service.id ? 'border-gold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-charcoal">{service.name}</h3>
                    <p className="font-body text-sm text-charcoal2/70 mt-1">{service.duration_minutes} mins</p>
                  </div>
                  <Price amountGbp={service.price} className="font-display text-lg text-charcoal" />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && step === 1 && (
          <div>
            <button onClick={() => setStep(0)} className="font-body text-sm text-golddeep mb-6">
              ← Change treatment
            </button>
            {availableDates.length === 0 ? (
              <p className="font-body text-charcoal2/70">No availability has been published yet — please check back soon.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep(2);
                    }}
                    className={`card p-4 text-left hover:border-gold transition-colors ${
                      selectedDate === date ? 'border-gold' : ''
                    }`}
                  >
                    <span className="font-body text-sm text-charcoal">{formatDate(date)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="font-body text-sm text-golddeep mb-6">
              ← Change date
            </button>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {slotsForDate.map((slot) => (
                <button
                  key={slot.id}
                  disabled={slot.status === 'booked'}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep(3);
                  }}
                  className={`card p-3 font-body text-sm transition-colors ${
                    slot.status === 'booked'
                      ? 'opacity-40 cursor-not-allowed'
                      : selectedSlot?.id === slot.id
                      ? 'border-gold text-golddeep'
                      : 'hover:border-gold'
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && step === 3 && selectedService && selectedSlot && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
              <button type="button" onClick={() => setStep(2)} className="font-body text-sm text-golddeep">
                ← Change time
              </button>
              <input
                required
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="input"
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input"
              />
              <input
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input"
              />
              <textarea
                placeholder="Optional Notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="input min-h-[100px]"
              />
              {error && <p className="font-body text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
                {submitting ? 'Reserving…' : 'Reserve'}
              </button>
            </form>

            <div className="md:col-span-2">
              <div className="card p-6">
                <h2 className="font-display text-lg text-charcoal mb-4">Booking Summary</h2>
                <dl className="space-y-3 font-body text-sm">
                  <div className="flex justify-between">
                    <dt className="text-charcoal2">Treatment</dt>
                    <dd className="text-charcoal text-right">{selectedService.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal2">Date</dt>
                    <dd className="text-charcoal text-right">{selectedDate && formatDate(selectedDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal2">Time</dt>
                    <dd className="text-charcoal">{selectedSlot.start_time.slice(0, 5)}</dd>
                  </div>
                  <div className="border-t border-line pt-3 flex justify-between">
                    <dt className="text-charcoal2">Total Price</dt>
                    <dd className="text-charcoal"><Price amountGbp={selectedService.price} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal2">Deposit</dt>
                    <dd className="text-golddeep font-medium"><Price amountGbp={deposit} /></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-charcoal2">Balance at Appointment</dt>
                    <dd className="text-charcoal"><Price amountGbp={balance} /></dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
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
