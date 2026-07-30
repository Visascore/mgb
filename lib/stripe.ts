import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase/config';

async function callFunction(name: string, payload: unknown) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });
  try {
    return { ok: res.ok, data: await res.json() };
  } catch {
    return { ok: false, data: { error: 'Unexpected response from the server.' } };
  }
}

export async function createStripeCheckoutSession(params: {
  type: 'order' | 'booking';
  id: string;
  amount: number;
  currency: string;
  description?: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url?: string; error?: string }> {
  const { ok, data } = await callFunction('stripe-create-checkout-session', params);
  if (!ok) return { error: data?.error ?? 'Could not start Stripe checkout.' };
  return { url: data.url };
}

export async function verifyStripeSession(params: {
  sessionId: string;
  type: 'order' | 'booking';
  id: string;
}): Promise<{ verified: boolean; summary?: any; error?: string }> {
  const { ok, data } = await callFunction('stripe-verify', params);
  if (!ok) return { verified: false, error: data?.error ?? 'Could not verify Stripe payment.' };
  return data;
}
