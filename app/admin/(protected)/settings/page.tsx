'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import ImageFrame from '@/components/ui/ImageFrame';
import { WhatsAppNumber } from '@/lib/whatsapp';

export default function AdminSettingsPage() {
  const [contact, setContact] = useState({ address: '', email: '', phone: '' });
  const [defaultDeposit, setDefaultDeposit] = useState('10');
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [ctaImageUrl, setCtaImageUrl] = useState<string | null>(null);
  const [promiseImageUrl, setPromiseImageUrl] = useState<string | null>(null);
  const [aboutImageUrl, setAboutImageUrl] = useState<string | null>(null);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumber[]>([]);
  const [newWaLabel, setNewWaLabel] = useState('');
  const [newWaNumber, setNewWaNumber] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({ whatsapp: true, paystack: false, stripe: false });
  const [socialLinks, setSocialLinks] = useState({ instagram: '', facebook: '', tiktok: '', twitter: '', youtube: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('*');
      const contactRow = data?.find((r) => r.key === 'contact_info');
      const depositRow = data?.find((r) => r.key === 'booking_defaults');
      const heroRow = data?.find((r) => r.key === 'hero_image');
      const ctaRow = data?.find((r) => r.key === 'cta_image');
      const promiseRow = data?.find((r) => r.key === 'promise_image');
      const aboutRow = data?.find((r) => r.key === 'about_image');
      const waRow = data?.find((r) => r.key === 'whatsapp_numbers');
      const paymentRow = data?.find((r) => r.key === 'payment_methods');
      const socialRow = data?.find((r) => r.key === 'social_links');
      if (contactRow) setContact(contactRow.value);
      if (depositRow) setDefaultDeposit(String(depositRow.value.default_deposit_percentage));
      if (heroRow) setHeroImageUrl(heroRow.value?.url ?? null);
      if (ctaRow) setCtaImageUrl(ctaRow.value?.url ?? null);
      if (promiseRow) setPromiseImageUrl(promiseRow.value?.url ?? null);
      if (aboutRow) setAboutImageUrl(aboutRow.value?.url ?? null);
      if (waRow) setWhatsappNumbers(Array.isArray(waRow.value) ? waRow.value : []);
      if (paymentRow) setPaymentMethods({ whatsapp: true, paystack: false, stripe: false, ...paymentRow.value });
      if (socialRow) setSocialLinks({ instagram: '', facebook: '', tiktok: '', twitter: '', youtube: '', ...socialRow.value });
      setLoading(false);
    })();
  }, []);

  const saveHeroImage = async (url: string) => {
    setHeroImageUrl(url);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'hero_image',
      value: { url },
      updated_at: new Date().toISOString(),
    });
  };

  const saveCtaImage = async (url: string) => {
    setCtaImageUrl(url);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'cta_image',
      value: { url },
      updated_at: new Date().toISOString(),
    });
  };

  const savePromiseImage = async (url: string) => {
    setPromiseImageUrl(url);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'promise_image',
      value: { url },
      updated_at: new Date().toISOString(),
    });
  };

  const saveAboutImage = async (url: string) => {
    setAboutImageUrl(url);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'about_image',
      value: { url },
      updated_at: new Date().toISOString(),
    });
  };

  const togglePaymentMethod = async (method: 'whatsapp' | 'paystack' | 'stripe') => {
    const next = { ...paymentMethods, [method]: !paymentMethods[method] };
    setPaymentMethods(next);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'payment_methods',
      value: next,
      updated_at: new Date().toISOString(),
    });
  };

  const persistWhatsappNumbers = async (numbers: WhatsAppNumber[]) => {
    setWhatsappNumbers(numbers);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'whatsapp_numbers',
      value: numbers,
      updated_at: new Date().toISOString(),
    });
  };

  const addWhatsappNumber = async () => {
    if (!newWaLabel || !newWaNumber) return;
    const isFirst = whatsappNumbers.length === 0;
    const next: WhatsAppNumber[] = [
      ...whatsappNumbers,
      { id: crypto.randomUUID(), label: newWaLabel, number: newWaNumber, isDefault: isFirst },
    ];
    await persistWhatsappNumbers(next);
    setNewWaLabel('');
    setNewWaNumber('');
  };

  const removeWhatsappNumber = async (id: string) => {
    const remaining = whatsappNumbers.filter((n) => n.id !== id);
    if (remaining.length > 0 && !remaining.some((n) => n.isDefault)) {
      remaining[0].isDefault = true;
    }
    await persistWhatsappNumbers(remaining);
  };

  const setDefaultWhatsappNumber = async (id: string) => {
    const next = whatsappNumbers.map((n) => ({ ...n, isDefault: n.id === id }));
    await persistWhatsappNumbers(next);
  };

  const updateWhatsappField = (id: string, field: 'label' | 'number', value: string) => {
    setWhatsappNumbers((prev) => prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'contact_info', value: contact, updated_at: new Date().toISOString() }),
      supabase.from('site_settings').upsert({
        key: 'booking_defaults',
        value: { default_deposit_percentage: Number(defaultDeposit) },
        updated_at: new Date().toISOString(),
      }),
      supabase.from('site_settings').upsert({ key: 'social_links', value: socialLinks, updated_at: new Date().toISOString() }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <p className="font-body text-sm text-charcoal2/70">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Website Settings</h1>
      <form onSubmit={handleSave} className="card p-6 max-w-lg space-y-4">
        <h2 className="font-display text-lg text-charcoal">Payment Methods</h2>
        <p className="font-body text-xs text-charcoal2/50 -mt-2">
          Turn on the ways customers can complete a booking or order. If more than one is on, customers choose at
          checkout. WhatsApp needs no setup; Paystack and Stripe need their API keys added first (see README).
        </p>

        {([
          { key: 'whatsapp' as const, label: 'WhatsApp Receipt', desc: 'Finalise manually via WhatsApp — no payment collected online.' },
          { key: 'paystack' as const, label: 'Paystack', desc: 'Card & bank payments, popular for Nigerian customers.' },
          { key: 'stripe' as const, label: 'Stripe', desc: 'International card payments via Stripe Checkout.' },
        ]).map((m) => (
          <div key={m.key} className="flex items-center justify-between border border-line rounded-lg p-3">
            <div>
              <p className="font-body text-sm text-charcoal">{m.label}</p>
              <p className="font-body text-xs text-charcoal2/50">{m.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => togglePaymentMethod(m.key)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                paymentMethods[m.key] ? 'bg-gold' : 'bg-beige'
              }`}
              aria-pressed={paymentMethods[m.key]}
              aria-label={`Toggle ${m.label}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  paymentMethods[m.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <h2 className="font-display text-lg text-charcoal pt-2">Homepage Hero Image</h2>
        {heroImageUrl && (
          <div className="w-40">
            <ImageFrame ratio="aspect-[4/5]" src={heroImageUrl} />
          </div>
        )}
        <ImageUploader bucket="site-images" onUploaded={saveHeroImage} />
        <p className="font-body text-xs text-charcoal2/50">
          This image appears on the right side of the homepage hero. Uploading a new one replaces it immediately.
        </p>

        <h2 className="font-display text-lg text-charcoal pt-2">"Appointment Waiting" Banner Image</h2>
        {ctaImageUrl && (
          <div className="w-40">
            <ImageFrame ratio="aspect-[4/5]" src={ctaImageUrl} />
          </div>
        )}
        <ImageUploader bucket="site-images" onUploaded={saveCtaImage} />
        <p className="font-body text-xs text-charcoal2/50">
          This image appears in the dark call-to-action banner near the bottom of the homepage.
        </p>

        <h2 className="font-display text-lg text-charcoal pt-2">"Our Promise" Section Image</h2>
        {promiseImageUrl && (
          <div className="w-40">
            <ImageFrame ratio="aspect-[4/5]" src={promiseImageUrl} />
          </div>
        )}
        <ImageUploader bucket="site-images" onUploaded={savePromiseImage} />
        <p className="font-body text-xs text-charcoal2/50">
          This image appears next to "Results without disappearing acts." on the homepage.
        </p>

        <h2 className="font-display text-lg text-charcoal pt-2">About Page Image</h2>
        {aboutImageUrl && (
          <div className="w-40">
            <ImageFrame ratio="aspect-[4/5]" src={aboutImageUrl} />
          </div>
        )}
        <ImageUploader bucket="site-images" onUploaded={saveAboutImage} />
        <p className="font-body text-xs text-charcoal2/50">
          This image appears on the public About page.
        </p>

        <h2 className="font-display text-lg text-charcoal pt-2">WhatsApp Numbers</h2>
        <p className="font-body text-xs text-charcoal2/50 -mt-2">
          Customers finalise bookings by sending their receipt to your default WhatsApp number below.
        </p>

        {whatsappNumbers.length > 0 && (
          <div className="space-y-3">
            {whatsappNumbers.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-2 border border-line rounded-lg p-3">
                <input
                  value={n.label}
                  onChange={(e) => updateWhatsappField(n.id, 'label', e.target.value)}
                  placeholder="Label (e.g. Bookings)"
                  className="input !w-auto flex-1 min-w-[120px]"
                />
                <input
                  value={n.number}
                  onChange={(e) => updateWhatsappField(n.id, 'number', e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="input !w-auto flex-1 min-w-[150px]"
                />
                {n.isDefault ? (
                  <span className="font-body text-xs px-2.5 py-1 rounded-full bg-gold/15 text-golddeep shrink-0">Default</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDefaultWhatsappNumber(n.id)}
                    className="font-body text-xs text-golddeep hover:underline shrink-0"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => persistWhatsappNumbers(whatsappNumbers)}
                  className="font-body text-xs text-charcoal2/70 hover:underline shrink-0"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => removeWhatsappNumber(n.id)}
                  className="font-body text-xs text-red-600 hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Label (e.g. Bookings)"
            value={newWaLabel}
            onChange={(e) => setNewWaLabel(e.target.value)}
            className="input !w-auto flex-1 min-w-[120px]"
          />
          <input
            placeholder="+234 800 000 0000"
            value={newWaNumber}
            onChange={(e) => setNewWaNumber(e.target.value)}
            className="input !w-auto flex-1 min-w-[150px]"
          />
          <button
            type="button"
            onClick={addWhatsappNumber}
            className="btn-secondary !py-2 !px-4 text-xs shrink-0"
          >
            + Add Number
          </button>
        </div>

        <h2 className="font-display text-lg text-charcoal pt-2">Social Media Links</h2>
        <p className="font-body text-xs text-charcoal2/50 -mt-2">
          Leave blank to hide that icon from the footer.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <input
            placeholder="Instagram URL"
            value={socialLinks.instagram}
            onChange={(e) => setSocialLinks((s) => ({ ...s, instagram: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Facebook URL"
            value={socialLinks.facebook}
            onChange={(e) => setSocialLinks((s) => ({ ...s, facebook: e.target.value }))}
            className="input"
          />
          <input
            placeholder="TikTok URL"
            value={socialLinks.tiktok}
            onChange={(e) => setSocialLinks((s) => ({ ...s, tiktok: e.target.value }))}
            className="input"
          />
          <input
            placeholder="X / Twitter URL"
            value={socialLinks.twitter}
            onChange={(e) => setSocialLinks((s) => ({ ...s, twitter: e.target.value }))}
            className="input"
          />
          <input
            placeholder="YouTube URL"
            value={socialLinks.youtube}
            onChange={(e) => setSocialLinks((s) => ({ ...s, youtube: e.target.value }))}
            className="input"
          />
        </div>

        <h2 className="font-display text-lg text-charcoal pt-2">Studio Contact Details</h2>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Address</label>
          <input value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Email</label>
          <input value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} className="input" />
        </div>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Phone</label>
          <input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} className="input" />
        </div>

        <h2 className="font-display text-lg text-charcoal pt-2">Booking Defaults</h2>
        <div>
          <label className="font-body text-xs text-charcoal2/60 mb-1 block">Default Deposit Percentage (new services)</label>
          <input type="number" value={defaultDeposit} onChange={(e) => setDefaultDeposit(e.target.value)} className="input" />
        </div>

        <button type="submit" disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Settings'}
        </button>
      </form>

      <style>{`
        .input {
          background: #FCFAF5; border: 1px solid #E1D3B8; border-radius: 0.6rem;
          padding: 0.6rem 0.85rem; font-family: var(--font-inter); font-size: 0.875rem;
          color: #2A241C; width: 100%;
        }
        .input:focus { outline: 2px solid #B08D4F; outline-offset: 1px; }
      `}</style>
    </div>
  );
}
