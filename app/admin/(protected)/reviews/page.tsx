'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Review } from '@/lib/types';

const EMPTY = { customer_name: '', rating: '5', review_text: '', customer_photo_url: '', review_date: new Date().toISOString().slice(0, 10) };

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-beige text-charcoal2',
  approved: 'bg-green-100 text-green-800',
  hidden: 'bg-gray-200 text-gray-500',
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const startEdit = (r: Review) => {
    setEditingId(r.id);
    setForm({
      customer_name: r.customer_name,
      rating: String(r.rating),
      review_text: r.review_text,
      customer_photo_url: r.customer_photo_url ?? '',
      review_date: r.review_date,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      customer_name: form.customer_name,
      rating: Number(form.rating),
      review_text: form.review_text,
      customer_photo_url: form.customer_photo_url || null,
      review_date: form.review_date,
    };
    if (editingId) {
      await supabase.from('reviews').update(payload).eq('id', editingId);
    } else {
      await supabase.from('reviews').insert({ ...payload, status: 'pending' });
    }
    setSaving(false);
    resetForm();
    load();
  };

  const setStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('reviews').update({ status }).eq('id', id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const supabase = createClient();
    await supabase.from('reviews').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Reviews</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-3 h-fit">
          <h2 className="font-display text-lg text-charcoal mb-2">{editingId ? 'Edit Review' : 'Add Review'}</h2>
          <input required placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} className="input" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} className="input">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} Stars</option>
              ))}
            </select>
            <input type="date" value={form.review_date} onChange={(e) => setForm((f) => ({ ...f, review_date: e.target.value }))} className="input" />
          </div>
          <textarea required placeholder="Review Text" value={form.review_text} onChange={(e) => setForm((f) => ({ ...f, review_text: e.target.value }))} className="input min-h-[100px]" />
          <input placeholder="Customer Photo URL (optional)" value={form.customer_photo_url} onChange={(e) => setForm((f) => ({ ...f, customer_photo_url: e.target.value }))} className="input" />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Review'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary !py-2.5 !px-5 text-sm">Cancel</button>
            )}
          </div>
        </form>

        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            <p className="font-body text-sm text-charcoal2/70">Loading…</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-base text-charcoal">{r.customer_name} · {r.rating}★</p>
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </div>
                <p className="font-body text-sm text-charcoal2/80 mb-3">{r.review_text}</p>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => startEdit(r)} className="font-body text-xs text-golddeep hover:underline">Edit</button>
                  {r.status !== 'approved' && (
                    <button onClick={() => setStatus(r.id, 'approved')} className="font-body text-xs text-green-700 hover:underline">Approve</button>
                  )}
                  {r.status !== 'hidden' && (
                    <button onClick={() => setStatus(r.id, 'hidden')} className="font-body text-xs text-charcoal2/70 hover:underline">Hide</button>
                  )}
                  {r.status === 'hidden' && (
                    <button onClick={() => setStatus(r.id, 'approved')} className="font-body text-xs text-green-700 hover:underline">Publish</button>
                  )}
                  <button onClick={() => remove(r.id)} className="font-body text-xs text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
          {!loading && reviews.length === 0 && <p className="font-body text-sm text-charcoal2/70">No reviews yet.</p>}
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
