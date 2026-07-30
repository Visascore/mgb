'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyStripeSession } from '@/lib/stripe';
import { trackEvent } from '@/components/AnalyticsTracker';

function BookingStripeReturnInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const sessionId = params.get('session_id');
    const bookingId = params.get('bookingId');

    if (!sessionId || !bookingId) {
      setStatus('error');
      setError('Missing payment reference.');
      return;
    }

    verifyStripeSession({ sessionId, type: 'booking', id: bookingId }).then((result) => {
      if (result.verified) {
        trackEvent('conversion', '/book');
        setSummary(result.summary);
        setStatus('success');
      } else {
        setStatus('error');
        setError(result.error ?? 'We could not confirm this payment.');
      }
    });
  }, [params]);

  if (status === 'checking') {
    return (
      <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
        <p className="font-body text-charcoal2/70">Confirming your payment…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
        <h1 className="font-display text-2xl text-charcoal mb-4">We couldn't confirm this payment</h1>
        <p className="font-body text-charcoal2/80 mb-6">{error}</p>
        <a href="/contact" className="btn-gold">Contact Us</a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center">
      <svg className="mx-auto mb-6" width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#B08D4F" strokeWidth="2" />
        <path d="M17 29l7 7 15-16" stroke="#B08D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <h1 className="font-display text-2xl text-charcoal mb-3">Deposit paid — you're confirmed!</h1>
      {summary?.services?.name && (
        <p className="font-body text-charcoal2/80 mb-8">
          {summary.services.name}
          {summary.availability_slots?.slot_date && ` on ${summary.availability_slots.slot_date} at ${summary.availability_slots.start_time?.slice(0, 5)}`}
        </p>
      )}
      <a href="/account" className="btn-gold">View My Appointments</a>
    </div>
  );
}

export default function BookingStripeReturnPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center font-body text-charcoal2/70">Loading…</div>}>
      <BookingStripeReturnInner />
    </Suspense>
  );
}
