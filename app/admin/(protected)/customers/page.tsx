'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createUserAsAdmin } from '@/lib/supabase/admin-functions';

type CustomerRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  roles: string[];
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'client' as 'client' | 'staff' | 'admin' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
    ]);

    const rows: CustomerRow[] = (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      created_at: p.created_at,
      roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
    }));
    setCustomers(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStaffRole = async (customer: CustomerRow) => {
    const supabase = createClient();
    if (customer.roles.includes('staff')) {
      await supabase.from('user_roles').delete().eq('user_id', customer.id).eq('role', 'staff');
    } else {
      await supabase.from('user_roles').insert({ user_id: customer.id, role: 'staff' });
    }
    load();
  };

  const toggleAdminRole = async (customer: CustomerRow) => {
    const supabase = createClient();
    if (customer.roles.includes('admin')) {
      if (!confirm(`Remove administrator access from ${customer.email}?`)) return;
      await supabase.from('user_roles').delete().eq('user_id', customer.id).eq('role', 'admin');
    } else {
      if (!confirm(`Grant administrator access to ${customer.email}? They will be able to manage the entire site.`)) return;
      await supabase.from('user_roles').insert({ user_id: customer.id, role: 'admin' });
    }
    load();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createForm.email || !createForm.password) {
      setCreateError('Email and password are required.');
      return;
    }

    setCreating(true);
    const result = await createUserAsAdmin({
      email: createForm.email,
      password: createForm.password,
      fullName: createForm.fullName || undefined,
      phone: createForm.phone || undefined,
      role: createForm.role,
    });
    setCreating(false);

    if (!result.success) {
      setCreateError(result.error ?? 'Something went wrong.');
      return;
    }

    setCreateSuccess(true);
    setCreateForm({ fullName: '', email: '', phone: '', password: '', role: 'client' });
    load();
    setTimeout(() => setCreateSuccess(false), 3000);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.email.toLowerCase().includes(q) || (c.full_name ?? '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-charcoal">Customers</h1>
        <button onClick={() => setShowCreateForm((v) => !v)} className="btn-gold !py-2.5 !px-5 text-sm">
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateUser} className="card p-6 max-w-lg space-y-3 mb-8">
          <h2 className="font-display text-lg text-charcoal mb-2">Create User Account</h2>
          <input
            required
            placeholder="Full Name"
            value={createForm.fullName}
            onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))}
            className="input"
          />
          <input
            required
            type="email"
            placeholder="Email Address"
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Phone Number (optional)"
            value={createForm.phone}
            onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
            className="input"
          />
          <input
            required
            type="password"
            placeholder="Password (min. 8 characters)"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
            className="input"
          />
          <div>
            <label className="font-body text-xs text-charcoal2/60 mb-1 block">Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as any }))}
              className="input"
            >
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {createError && <p className="font-body text-sm text-red-700">{createError}</p>}
          {createSuccess && <p className="font-body text-sm text-green-700">User created successfully ✓</p>}
          <button type="submit" disabled={creating} className="btn-gold !py-2.5 !px-5 text-sm disabled:opacity-60">
            {creating ? 'Creating…' : 'Create User'}
          </button>
          <p className="font-body text-xs text-charcoal2/50">
            The account is created with the email already confirmed, so this person can sign in immediately with
            the password you set.
          </p>
        </form>
      )}

      <input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-xs mb-6" />

      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-body text-xs text-charcoal2/60 uppercase border-b border-line">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((c) => (
                <tr key={c.id} className="font-body text-sm">
                  <td className="py-3 pr-4 text-charcoal">{c.full_name || '—'}</td>
                  <td className="py-3 pr-4 text-charcoal2">{c.email}</td>
                  <td className="py-3 pr-4 text-charcoal2">{c.phone || '—'}</td>
                  <td className="py-3 pr-4 text-charcoal2 capitalize">{c.roles.join(', ') || 'client'}</td>
                  <td className="py-3 pr-4 text-charcoal2">{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 pr-4 space-x-3">
                    <button onClick={() => toggleStaffRole(c)} className="font-body text-xs text-golddeep hover:underline">
                      {c.roles.includes('staff') ? 'Remove Staff' : 'Make Staff'}
                    </button>
                    <button onClick={() => toggleAdminRole(c)} className="font-body text-xs text-charcoal2/70 hover:underline">
                      {c.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="font-body text-sm text-charcoal2/70 py-6">No customers found.</p>}
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
