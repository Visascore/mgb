'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginForm() {
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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setSubmitting(false);
      setError('Incorrect email or password.');
      return;
    }

    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setSubmitting(false);

    if (roleError) {
      setError('Something went wrong checking your access. Please try again or contact support.');
      await supabase.auth.signOut();
      return;
    }

    if (!roleRow) {
      setError('This account does not have administrator access.');
      await supabase.auth.signOut();
      return;
    }

    router.push('/admin/overview');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl text-cream">Magic Body</p>
          <p className="font-body text-xs tracking-widest uppercase text-goldlight mt-2">Administrator Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-body text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-body text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
          />
          {error && <p className="font-body text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
            {submitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
