'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setForm({
        fullName: profile?.full_name ?? '',
        email: profile?.email ?? user.email ?? '',
        phone: profile?.phone ?? '',
      });
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: form.fullName, phone: form.phone, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    setSaving(false);
    if (updateError) {
      setError('Something went wrong saving your profile. Please try again.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <p className="font-body text-sm text-charcoal2/70">Loading…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Email Address</label>
          <input value={form.email} disabled className="input opacity-60" />
        </div>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input"
          />
        </div>
        {error && <p className="font-body text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="btn-gold disabled:opacity-60">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </form>

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
