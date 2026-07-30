'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import ImageFrame from '@/components/ui/ImageFrame';
import { GalleryItem } from '@/lib/types';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [caption, setCaption] = useState('');
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
    setItems((data as GalleryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setCategory('');
    setCaption('');
    setBeforeUrl(null);
    setAfterUrl(null);
  };

  const handleSaveEntry = async () => {
    if (!beforeUrl && !afterUrl) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('gallery_items').insert({
      before_image_url: beforeUrl,
      after_image_url: afterUrl,
      category: category || null,
      caption: caption || null,
    });
    setSaving(false);
    resetForm();
    load();
  };

  const remove = async (item: GalleryItem) => {
    if (!confirm('Delete this before/after entry?')) return;
    const supabase = createClient();
    await supabase.from('gallery_items').delete().eq('id', item.id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Results Gallery</h1>

      <div className="card p-6 mb-8 max-w-xl space-y-4">
        <h2 className="font-display text-lg text-charcoal mb-1">Add Before / After Entry</h2>
        <p className="font-body text-xs text-charcoal2/60 -mt-2">
          Upload the "before" and "after" photos separately — they'll be grouped and displayed together as one
          result on the public gallery.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-body text-xs text-charcoal2/60 mb-2">Before Image</p>
            {beforeUrl ? (
              <div className="mb-2">
                <ImageFrame ratio="aspect-square" src={beforeUrl} />
              </div>
            ) : null}
            <ImageUploader bucket="gallery-images" onUploaded={setBeforeUrl} />
          </div>
          <div>
            <p className="font-body text-xs text-charcoal2/60 mb-2">After Image</p>
            {afterUrl ? (
              <div className="mb-2">
                <ImageFrame ratio="aspect-square" src={afterUrl} />
              </div>
            ) : null}
            <ImageUploader bucket="gallery-images" onUploaded={setAfterUrl} />
          </div>
        </div>

        <input placeholder="Category (e.g. Body Contouring)" value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
        <input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="input" />

        <button
          type="button"
          onClick={handleSaveEntry}
          disabled={saving || (!beforeUrl && !afterUrl)}
          className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Entry'}
        </button>
      </div>

      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-line">
                <div className="relative">
                  <ImageFrame ratio="aspect-square" src={item.before_image_url} />
                  <span className="absolute top-1.5 left-1.5 font-body text-[9px] tracking-widest uppercase bg-charcoal/80 text-cream px-1.5 py-0.5 rounded-full">
                    Before
                  </span>
                </div>
                <div className="relative">
                  <ImageFrame ratio="aspect-square" src={item.after_image_url} />
                  <span className="absolute top-1.5 left-1.5 font-body text-[9px] tracking-widest uppercase bg-gold/90 text-offwhite px-1.5 py-0.5 rounded-full">
                    After
                  </span>
                </div>
              </div>
              <div className="p-3">
                {item.category && <p className="font-body text-xs text-golddeep">{item.category}</p>}
                {item.caption && <p className="font-body text-xs text-charcoal2/70 mt-1">{item.caption}</p>}
                <div className="flex justify-end mt-2">
                  <button onClick={() => remove(item)} className="font-body text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="font-body text-sm text-charcoal2/70 col-span-full">No gallery entries yet.</p>}
        </div>
      )}

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
