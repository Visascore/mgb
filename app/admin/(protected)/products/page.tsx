'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import ImageUploader from '@/components/admin/ImageUploader';
import ImageFrame from '@/components/ui/ImageFrame';

const EMPTY = {
  name: '', description: '', benefits: '', ingredients: '', usage_instructions: '',
  price: '', currency: 'NGN', stock_quantity: '0', is_featured: false, is_active: true,
  images: [] as string[],
};

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      benefits: p.benefits ?? '',
      ingredients: p.ingredients ?? '',
      usage_instructions: p.usage_instructions ?? '',
      price: String(p.price),
      currency: 'NGN',
      stock_quantity: String(p.stock_quantity),
      is_featured: p.is_featured,
      is_active: p.is_active,
      images: p.images ?? [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name,
      slug: slugify(form.name) + (editingId ? '' : `-${Date.now().toString(36)}`),
      description: form.description || null,
      benefits: form.benefits || null,
      ingredients: form.ingredients || null,
      usage_instructions: form.usage_instructions || null,
      price: Number(form.price),
      currency: form.currency,
      stock_quantity: Number(form.stock_quantity),
      is_featured: form.is_featured,
      is_active: form.is_active,
      images: form.images,
    };

    if (editingId) {
      const { slug, ...updatePayload } = payload;
      await supabase.from('products').update(updatePayload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }
    setSaving(false);
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-3 h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="font-display text-lg text-charcoal mb-2">{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-[70px]" />
          <textarea placeholder="Benefits" value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} className="input min-h-[60px]" />
          <textarea placeholder="Ingredients (optional)" value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} className="input min-h-[60px]" />
          <textarea placeholder="Usage Instructions" value={form.usage_instructions} onChange={(e) => setForm((f) => ({ ...f, usage_instructions: e.target.value }))} className="input min-h-[60px]" />
          <div>
            <label className="font-body text-xs text-charcoal2/60 mb-1 block">Price (₦ Naira)</label>
            <input required type="number" step="0.01" placeholder="e.g. 15000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" />
          </div>
          <input required type="number" placeholder="Stock Quantity" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} className="input" />

          <div>
            <label className="font-body text-xs text-charcoal2/60 mb-1 block">Product Images</label>
            {form.images.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={url} className="relative w-16 h-16">
                    <ImageFrame ratio="aspect-square" src={url} />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                      className="absolute -top-1.5 -right-1.5 bg-charcoal text-offwhite w-5 h-5 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader bucket="product-images" onUploaded={(url) => setForm((f) => ({ ...f, images: [...f.images, url] }))} />
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-charcoal2">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-charcoal2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            Active / visible in shop
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="btn-secondary !py-2.5 !px-5 text-sm">Cancel</button>}
          </div>
        </form>

        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            <p className="font-body text-sm text-charcoal2/70">Loading…</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-base text-charcoal">
                    {p.name} {p.is_featured && <span className="text-xs text-golddeep ml-1">★ featured</span>}
                    {!p.is_active && <span className="text-xs text-red-600 ml-2">inactive</span>}
                  </p>
                  <p className="font-body text-xs text-charcoal2/60 mt-1">
                    ₦{Number(p.price).toLocaleString('en-GB')} · {p.stock_quantity} in stock
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(p)} className="font-body text-xs text-golddeep hover:underline">Edit</button>
                  <button onClick={() => remove(p.id)} className="font-body text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
          {!loading && products.length === 0 && <p className="font-body text-sm text-charcoal2/70">No products yet.</p>}
        </div>
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
