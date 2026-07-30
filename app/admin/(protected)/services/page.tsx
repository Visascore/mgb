'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CURRENCIES } from '@/lib/currency';
import { Service } from '@/lib/types';

const EMPTY_FORM = {
  name: '',
  category: '',
  description: '',
  price: '',
  currency: 'GBP',
  deposit_percentage: '10',
  duration_minutes: '60',
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    setServices((data as Service[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: (s as any).category ?? '',
      description: s.description ?? '',
      price: String(s.price),
      currency: s.currency,
      deposit_percentage: String(s.deposit_percentage),
      duration_minutes: String(s.duration_minutes),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name,
      category: form.category || null,
      description: form.description || null,
      price: Number(form.price),
      currency: form.currency,
      deposit_percentage: Number(form.deposit_percentage),
      duration_minutes: Number(form.duration_minutes),
    };

    if (editingId) {
      await supabase.from('services').update(payload).eq('id', editingId);
    } else {
      await supabase.from('services').insert(payload);
    }

    setSaving(false);
    resetForm();
    load();
  };

  const toggleArchive = async (s: Service) => {
    const supabase = createClient();
    await supabase.from('services').update({ is_archived: !s.is_archived }).eq('id', s.id);
    load();
  };

  const toggleActive = async (s: Service) => {
    const supabase = createClient();
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this service permanently? This cannot be undone.')) return;
    const supabase = createClient();
    await supabase.from('services').delete().eq('id', id);
    load();
  };

  const visible = services.filter((s) => showArchived || !s.is_archived);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Services</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-3 h-fit">
          <h2 className="font-display text-lg text-charcoal mb-2">{editingId ? 'Edit Service' : 'Add Service'}</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          <input placeholder="Category (e.g. Body Contouring)" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input min-h-[80px]" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" />
            <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs text-charcoal2/60">Deposit %</label>
              <input required type="number" step="1" value={form.deposit_percentage} onChange={(e) => setForm((f) => ({ ...f, deposit_percentage: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="font-body text-xs text-charcoal2/60">Duration (mins)</label>
              <input required type="number" step="5" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : editingId ? 'Update Service' : 'Add Service'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary !py-2.5 !px-5 text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-3">
          <label className="flex items-center gap-2 font-body text-sm text-charcoal2 mb-4">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Show archived
          </label>

          {loading ? (
            <p className="font-body text-sm text-charcoal2/70">Loading…</p>
          ) : (
            <div className="space-y-3">
              {visible.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-base text-charcoal">
                      {s.name} {s.is_archived && <span className="text-xs text-charcoal2/50">(archived)</span>}
                      {!s.is_active && <span className="text-xs text-red-600 ml-2">(inactive)</span>}
                    </p>
                    <p className="font-body text-xs text-charcoal2/60 mt-1">
                      {s.currency} {s.price} · {s.deposit_percentage}% deposit · {s.duration_minutes} mins
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(s)} className="font-body text-xs text-golddeep hover:underline">
                      Edit
                    </button>
                    <button onClick={() => toggleActive(s)} className="font-body text-xs text-charcoal2/70 hover:underline">
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => toggleArchive(s)} className="font-body text-xs text-charcoal2/70 hover:underline">
                      {s.is_archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={() => remove(s.id)} className="font-body text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {visible.length === 0 && <p className="font-body text-sm text-charcoal2/70">No services yet.</p>}
            </div>
          )}
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
