import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase/config';

// Set this to your live/test Paystack public key. Safe to expose client-side.
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

const VERIFY_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/paystack-verify`;

export async function verifyPaystackPayment(params: {
  reference: string;
  type: 'order' | 'booking';
  id: string;
}): Promise<{ verified: boolean; error?: string }> {
  const res = await fetch(VERIFY_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(params),
  });

  try {
    return await res.json();
  } catch {
    return { verified: false, error: 'Unexpected response from verification service.' };
  }
}
