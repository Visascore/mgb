'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import SuccessScreen from '@/components/SuccessScreen';
import { createClient } from '@/lib/supabase/client';
import { useSiteContent } from '@/lib/use-site-content';

export default function ContactPage() {
  const content = useSiteContent();
  const c = content.contact;
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email) {
      setError('Please share your name and email so we can get back to you.');
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (insertError) {
      setError('Something went wrong sending your message. Please try again.');
      return;
    }
    setSent(true);
  };

  return (
    <div>
      <PageHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="max-w-2xl mx-auto px-5 md:px-8 py-14 md:py-20">
        {sent ? (
          <SuccessScreen
            eyebrow="Message Sent"
            title={c.successTitle}
            primaryHref="/"
            primaryLabel="Back to Home"
            secondaryHref="/treatments"
            secondaryLabel="View Treatments"
          >
            {c.successBody}
          </SuccessScreen>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
              placeholder="Phone Number (Optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input"
            />
            <textarea
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="input min-h-[140px]"
            />
            {error && <p className="font-body text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
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
