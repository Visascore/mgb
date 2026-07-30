'use client';

import { useState } from 'react';
import { PAYSTACK_PUBLIC_KEY, verifyPaystackPayment } from '@/lib/paystack';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack. Please check your connection and try again.'));
    document.body.appendChild(script);
  });
}

export default function PaystackButton({
  email,
  amountNgn,
  recordType,
  recordId,
  label = 'Pay with Paystack',
  onVerified,
  disabled,
}: {
  email: string;
  amountNgn: number;
  recordType: 'order' | 'booking';
  recordId: string;
  label?: string;
  onVerified: () => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setError(null);

    if (!PAYSTACK_PUBLIC_KEY) {
      setError('Paystack is not configured yet — set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.');
      return;
    }

    setLoading(true);
    try {
      await loadPaystackScript();

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(amountNgn * 100), // Paystack expects kobo
        currency: 'NGN',
        ref: `${recordType}_${recordId}_${Date.now()}`,
        callback: (response: { reference: string }) => {
          (async () => {
            const result = await verifyPaystackPayment({
              reference: response.reference,
              type: recordType,
              id: recordId,
            });
            setLoading(false);
            if (result.verified) {
              onVerified();
            } else {
              setError(result.error ?? 'We could not confirm this payment. Please contact us with your reference: ' + response.reference);
            }
          })();
        },
        onClose: () => setLoading(false),
      });
      handler.openIframe();
    } catch (err: any) {
      setLoading(false);
      setError(err.message ?? 'Something went wrong opening Paystack.');
    }
  };

  return (
    <div>
      <button type="button" onClick={handlePay} disabled={disabled || loading} className="btn-gold w-full disabled:opacity-60">
        {loading ? 'Opening Paystack…' : label}
      </button>
      {error && <p className="font-body text-sm text-red-700 mt-2">{error}</p>}
    </div>
  );
}
