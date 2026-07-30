'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lead } from '@/lib/types';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      setLeads((data as Lead[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">Leads &amp; Enquiries</h1>
      {loading ? (
        <p className="font-body text-sm text-charcoal2/70">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="font-body text-sm text-charcoal2/70">No enquiries yet.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display text-base text-charcoal">{lead.name}</p>
                <p className="font-body text-xs text-charcoal2/50">
                  {new Date(lead.created_at).toLocaleString('en-GB')}
                </p>
              </div>
              <p className="font-body text-sm text-charcoal2/70">
                {lead.email} {lead.phone && `· ${lead.phone}`}
              </p>
              {lead.message && <p className="font-body text-sm text-charcoal2 mt-2">{lead.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
