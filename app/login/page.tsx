'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError('Incorrect email or password. Please try again.');
      return;
    }
    router.push('/account');
    router.refresh();
  };

  return (
    <div>
      <PageHeader eyebrow="Welcome Back" title="Sign in to your account" />
      <div className="max-w-md mx-auto px-5 md:px-8 py-14 md:py-20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          {error && <p className="font-body text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
        <p className="font-body text-sm text-charcoal2/70 mt-6 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-golddeep">
            Create one
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
