'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyStripeSession } from '@/lib/stripe';
import { trackEvent } from '@/components/AnalyticsTracker';

function CheckoutStripeReturnInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = params.get('session_id');
    const orderId = params.get('orderId');

    if (!sessionId || !orderId) {
      setStatus('error');
      setError('Missing payment reference.');
      return;
    }

    verifyStripeSession({ sessionId, type: 'order', id: orderId }).then((result) => {
      if (result.verified) {
        trackEvent('conversion', '/checkout');
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
      <h1 className="font-display text-2xl text-charcoal mb-3">Payment received — order confirmed!</h1>
      <a href="/shop" className="btn-gold">Continue Shopping</a>
    </div>
  );
}

export default function CheckoutStripeReturnPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-5 md:px-8 py-24 text-center font-body text-charcoal2/70">Loading…</div>}>
      <CheckoutStripeReturnInner />
    </Suspense>
  );
}
