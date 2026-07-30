'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import SuccessScreen from '@/components/SuccessScreen';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError('Please choose a password with at least 8 characters.');
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div>
        <PageHeader eyebrow="Almost there" title="Check your inbox" />
        <SuccessScreen
          eyebrow="Confirmation Sent"
          title="Check your inbox"
          primaryHref="/login"
          primaryLabel="Go to Sign In"
          secondaryHref="/"
          secondaryLabel="Back to Home"
        >
          We've sent a confirmation link to <strong>{form.email}</strong>. Confirm your email to finish setting up
          your account.
        </SuccessScreen>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Join Magic Body" title="Create your account" />
      <div className="max-w-md mx-auto px-5 md:px-8 py-14 md:py-20">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="input"
          />
          {error && <p className="font-body text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
        <p className="font-body text-sm text-charcoal2/70 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-golddeep">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        .input {
          background: #FCFAF5; border: 1px solid #E1D3B8; border-radius: 0.75rem;
          padding: 0.85rem 1rem; font-family: var(--font-inter); font-size: 0.925rem;
          color: #2A241C; width: 100%;
        }
        .input:focus { outline: 2px solid #B08D4F; outline-offset: 1px; }
      `}</style>
    </div>
  );
}
