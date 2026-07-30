'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_CONTENT, mergeContent, SiteContent, FaqItem } from '@/lib/content';

function setPath(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return { ...obj, [head]: setPath(obj[head] ?? {}, rest, value) };
}

function getPath(obj: any, path: string[]): any {
  return path.reduce((acc, key) => acc?.[key], obj);
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="font-body text-xs text-charcoal2/60 mb-1 block">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="input min-h-[80px]" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="card p-6 mb-4" open={false}>
      <summary className="font-display text-lg text-charcoal cursor-pointer">{title}</summary>
      <div className="mt-5 space-y-4">{children}</div>
    </details>
  );
}

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'site_content').maybeSingle();
      setContent(mergeContent(data?.value));
      setLoading(false);
    })();
  }, []);

  const update = (path: string) => (value: string) => {
    setContent((prev) => setPath(prev, path.split('.'), value) as SiteContent);
  };

  const field = (path: string, label: string, multiline = false) => (
    <Field label={label} value={getPath(content, path.split('.')) ?? ''} onChange={update(path)} multiline={multiline} />
  );

  const updateFaqItem = (index: number, key: keyof FaqItem, value: string) => {
    setContent((prev) => {
      const items = [...prev.faq.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, faq: { ...prev.faq, items } };
    });
  };

  const addFaqItem = () => {
    setContent((prev) => ({ ...prev, faq: { ...prev.faq, items: [...prev.faq.items, { q: '', a: '' }] } }));
  };

  const removeFaqItem = (index: number) => {
    setContent((prev) => ({ ...prev, faq: { ...prev.faq, items: prev.faq.items.filter((_, i) => i !== index) } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('site_settings').upsert({
      key: 'site_content',
      value: content,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <p className="font-body text-sm text-charcoal2/70">Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3 sticky top-0 bg-offwhite/95 backdrop-blur py-3 z-10">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Content</h1>
          <p className="font-body text-xs text-charcoal2/50 mt-1">
            Edit any text shown on the public site. Click a section to expand it.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save All Changes'}
        </button>
      </div>

      <Section title="Homepage — Hero">
        {field('home.hero.eyebrow', 'Eyebrow')}
        {field('home.hero.headline1', 'Headline (line 1)')}
        {field('home.hero.headline2Italic', 'Headline (line 2, italic gold)')}
        {field('home.hero.description', 'Description', true)}
        {field('home.hero.ctaPrimary', 'Primary Button Label')}
        {field('home.hero.ctaSecondary', 'Secondary Button Label')}
        <div className="grid grid-cols-2 gap-4">
          {field('home.hero.stat1Value', 'Stat 1 Value')}
          {field('home.hero.stat1Label', 'Stat 1 Label')}
          {field('home.hero.stat2Value', 'Stat 2 Value')}
          {field('home.hero.stat2Label', 'Stat 2 Label')}
          {field('home.hero.stat3Value', 'Stat 3 Value')}
          {field('home.hero.stat3Label', 'Stat 3 Label')}
        </div>
      </Section>

      <Section title="Homepage — Feature Strip">
        {field('home.features.feature1Title', 'Feature 1 Title')}
        {field('home.features.feature1Desc', 'Feature 1 Description')}
        {field('home.features.feature2Title', 'Feature 2 Title')}
        {field('home.features.feature2Desc', 'Feature 2 Description')}
        {field('home.features.feature3Title', 'Feature 3 Title')}
        {field('home.features.feature3Desc', 'Feature 3 Description')}
      </Section>

      <Section title="Homepage — Section Headings">
        {field('home.treatmentsEyebrow', 'Treatments Section Eyebrow')}
        {field('home.treatmentsHeading', 'Treatments Section Heading')}
        {field('home.shopEyebrow', 'Shop Section Eyebrow')}
        {field('home.shopHeading', 'Shop Section Heading')}
      </Section>

      <Section title="Homepage — Our Promise">
        {field('home.promise.eyebrow', 'Eyebrow')}
        {field('home.promise.heading', 'Heading')}
        {field('home.promise.body', 'Body Text', true)}
        {field('home.promise.linkLabel', 'Link Label')}
      </Section>

      <Section title="Homepage — Testimonials">
        {field('home.testimonials.eyebrow', 'Eyebrow')}
        {field('home.testimonials.heading', 'Heading')}
      </Section>

      <Section title="Homepage — Bottom CTA Banner">
        {field('home.cta.heading', 'Heading')}
        {field('home.cta.body', 'Body Text', true)}
        {field('home.cta.buttonLabel', 'Button Label')}
      </Section>

      <Section title="About Page">
        {field('about.eyebrow', 'Eyebrow')}
        {field('about.title', 'Title')}
        {field('about.paragraph1', 'Paragraph 1', true)}
        {field('about.paragraph2', 'Paragraph 2', true)}
        {field('about.paragraph3', 'Paragraph 3', true)}
        <div className="grid grid-cols-2 gap-4">
          {field('about.stat1Value', 'Stat 1 Value')}
          {field('about.stat1Label', 'Stat 1 Label')}
          {field('about.stat2Value', 'Stat 2 Value')}
          {field('about.stat2Label', 'Stat 2 Label')}
          {field('about.stat3Value', 'Stat 3 Value')}
          {field('about.stat3Label', 'Stat 3 Label')}
        </div>
      </Section>

      <Section title="FAQ Page">
        {field('faq.eyebrow', 'Eyebrow')}
        {field('faq.title', 'Title')}
        <div className="space-y-4 pt-2 border-t border-line">
          {content.faq.items.map((item, i) => (
            <div key={i} className="border border-line rounded-lg p-3 space-y-2">
              <input
                placeholder="Question"
                value={item.q}
                onChange={(e) => updateFaqItem(i, 'q', e.target.value)}
                className="input"
              />
              <textarea
                placeholder="Answer"
                value={item.a}
                onChange={(e) => updateFaqItem(i, 'a', e.target.value)}
                className="input min-h-[60px]"
              />
              <button onClick={() => removeFaqItem(i)} className="font-body text-xs text-red-600 hover:underline">
                Remove Question
              </button>
            </div>
          ))}
          <button onClick={addFaqItem} className="btn-secondary !py-2 !px-4 text-xs">
            + Add Question
          </button>
        </div>
      </Section>

      <Section title="Contact Page">
        {field('contact.eyebrow', 'Eyebrow')}
        {field('contact.title', 'Title')}
        {field('contact.description', 'Description', true)}
        {field('contact.successTitle', 'Success Message Title')}
        {field('contact.successBody', 'Success Message Body', true)}
      </Section>

      <Section title="Page Headers (Treatments, Shop, Gallery, Book)">
        <p className="font-body text-xs text-charcoal2/50">Treatments &amp; Pricing page</p>
        {field('pageHeaders.treatments.eyebrow', 'Eyebrow')}
        {field('pageHeaders.treatments.title', 'Title')}
        {field('pageHeaders.treatments.description', 'Description', true)}
        <p className="font-body text-xs text-charcoal2/50 pt-3 border-t border-line">Shop page</p>
        {field('pageHeaders.shop.eyebrow', 'Eyebrow')}
        {field('pageHeaders.shop.title', 'Title')}
        {field('pageHeaders.shop.description', 'Description', true)}
        <p className="font-body text-xs text-charcoal2/50 pt-3 border-t border-line">Results Gallery page</p>
        {field('pageHeaders.gallery.eyebrow', 'Eyebrow')}
        {field('pageHeaders.gallery.title', 'Title')}
        {field('pageHeaders.gallery.description', 'Description', true)}
        <p className="font-body text-xs text-charcoal2/50 pt-3 border-t border-line">Book an Appointment page</p>
        {field('pageHeaders.book.eyebrow', 'Eyebrow')}
        {field('pageHeaders.book.title', 'Title')}
      </Section>

      <Section title="WhatsApp Finalization — Booking Screen">
        {field('whatsappBooking.chooserHeading', 'Chooser Heading (shown when multiple payment methods are on)')}
        {field('whatsappBooking.heading', 'Screen Heading')}
        {field('whatsappBooking.body', 'Screen Body Text', true)}
        {field('whatsappBooking.buttonLabel', 'Button Label')}
        {field('whatsappBooking.noNumberMessage', 'Message shown if no WhatsApp number is set', true)}
      </Section>

      <Section title="WhatsApp Finalization — Checkout Screen">
        {field('whatsappCheckout.chooserHeading', 'Chooser Heading (shown when multiple payment methods are on)')}
        {field('whatsappCheckout.heading', 'Screen Heading')}
        {field('whatsappCheckout.body', 'Screen Body Text', true)}
        {field('whatsappCheckout.buttonLabel', 'Button Label')}
        {field('whatsappCheckout.noNumberMessage', 'Message shown if no WhatsApp number is set', true)}
      </Section>

      <Section title="Footer">
        {field('footer.tagline', 'Tagline', true)}
      </Section>

      <div className="mt-6 mb-16">
        <button onClick={handleSave} disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save All Changes'}
        </button>
      </div>

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
