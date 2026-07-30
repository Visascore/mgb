'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AvailabilitySlot } from '@/lib/types';

type Mode = 'single' | 'bulk' | 'recurring';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function addMinutesToTime(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export default function AdminAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('recurring');
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Single slot
  const [singleDate, setSingleDate] = useState('');
  const [singleStart, setSingleStart] = useState('09:00');
  const [singleDuration, setSingleDuration] = useState('60');

  // Bulk (multiple explicit dates, same time list)
  const [bulkDates, setBulkDates] = useState('');
  const [bulkTimes, setBulkTimes] = useState('09:00, 10:00, 11:00');
  const [bulkDuration, setBulkDuration] = useState('60');

  // Recurring
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurStart, setRecurStart] = useState('');
  const [recurEnd, setRecurEnd] = useState('');
  const [recurTimes, setRecurTimes] = useState('09:00, 10:00, 11:00');
  const [recurDuration, setRecurDuration] = useState('60');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('availability_slots')
      .select('*')
      .gte('slot_date', new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().slice(0, 10))
      .order('slot_date')
      .order('start_time');
    setSlots((data as AvailabilitySlot[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const parseTimes = (raw: string) =>
    raw.split(',').map((t) => t.trim()).filter(Boolean);

  const insertSlots = async (rows: { slot_date: string; start_time: string; end_time: string }[]) => {
    if (rows.length === 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('availability_slots')
      .upsert(
        rows.map((r) => ({ ...r, status: 'available' })),
        { onConflict: 'slot_date,start_time', ignoreDuplicates: true }
      );
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`${rows.length} slot(s) processed.`);
      load();
    }
  };

  const handleSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    await insertSlots([
      {
        slot_date: singleDate,
        start_time: singleStart,
        end_time: addMinutesToTime(singleStart, Number(singleDuration)),
      },
    ]);
    setGenerating(false);
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const dates = bulkDates.split(',').map((d) => d.trim()).filter(Boolean);
    const times = parseTimes(bulkTimes);
    const rows = dates.flatMap((date) =>
      times.map((t) => ({ slot_date: date, start_time: t, end_time: addMinutesToTime(t, Number(bulkDuration)) }))
    );
    await insertSlots(rows);
    setGenerating(false);
  };

  const handleRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurStart || !recurEnd) return;
    setGenerating(true);

    const times = parseTimes(recurTimes);
    const start = new Date(recurStart + 'T00:00:00');
    const end = new Date(recurEnd + 'T00:00:00');
    const dates: string[] = [];

    if (repeatType === 'daily') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (weekdaysOnly && (d.getDay() === 0 || d.getDay() === 6)) continue;
        dates.push(d.toISOString().slice(0, 10));
      }
    } else if (repeatType === 'weekly') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (selectedWeekdays.includes(d.getDay())) dates.push(d.toISOString().slice(0, 10));
      }
    } else if (repeatType === 'monthly') {
      const dayOfMonth = start.getDate();
      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const monthDate = new Date(d.getFullYear(), d.getMonth(), dayOfMonth);
        if (monthDate >= start && monthDate <= end) dates.push(monthDate.toISOString().slice(0, 10));
      }
    }

    const rows = dates.flatMap((date) =>
      times.map((t) => ({ slot_date: date, start_time: t, end_time: addMinutesToTime(t, Number(recurDuration)) }))
    );
    await insertSlots(rows);
    setGenerating(false);
  };

  const deleteSlot = async (slot: AvailabilitySlot) => {
    if (slot.status === 'booked') {
      alert('This slot is booked. Cancel the booking from the Bookings page to release it.');
      return;
    }
    const supabase = createClient();
    await supabase.from('availability_slots').delete().eq('id', slot.id);
    load();
  };

  const slotsByDate = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    slots.forEach((s) => {
      const arr = map.get(s.slot_date) ?? [];
      arr.push(s);
      map.set(s.slot_date, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [slots]);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-6">Availability</h1>

      {/* Legend — always visible */}
      <div className="flex items-center gap-6 mb-8 card px-5 py-3 w-fit">
        <span className="font-body text-sm flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Available
        </span>
        <span className="font-body text-sm flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Booked / Unavailable
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-4">
            {(['recurring', 'bulk', 'single'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`font-body text-xs px-3 py-2 rounded-full capitalize ${
                  mode === m ? 'bg-charcoal text-offwhite' : 'bg-beige text-charcoal2'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === 'single' && (
            <form onSubmit={handleSingle} className="card p-6 space-y-3">
              <input required type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="input" />
              <input required type="time" value={singleStart} onChange={(e) => setSingleStart(e.target.value)} className="input" />
              <input required type="number" step="5" placeholder="Duration (mins)" value={singleDuration} onChange={(e) => setSingleDuration(e.target.value)} className="input" />
              <button type="submit" disabled={generating} className="btn-gold !py-2.5 !px-5 text-sm w-full disabled:opacity-60">
                {generating ? 'Creating…' : 'Create Slot'}
              </button>
            </form>
          )}

          {mode === 'bulk' && (
            <form onSubmit={handleBulk} className="card p-6 space-y-3">
              <label className="font-body text-xs text-charcoal2/60">Dates (comma-separated, YYYY-MM-DD)</label>
              <textarea required value={bulkDates} onChange={(e) => setBulkDates(e.target.value)} placeholder="2026-08-01, 2026-08-02" className="input min-h-[70px]" />
              <label className="font-body text-xs text-charcoal2/60">Times (comma-separated)</label>
              <input required value={bulkTimes} onChange={(e) => setBulkTimes(e.target.value)} className="input" />
              <input required type="number" step="5" placeholder="Duration (mins)" value={bulkDuration} onChange={(e) => setBulkDuration(e.target.value)} className="input" />
              <button type="submit" disabled={generating} className="btn-gold !py-2.5 !px-5 text-sm w-full disabled:opacity-60">
                {generating ? 'Creating…' : 'Create Slots'}
              </button>
            </form>
          )}

          {mode === 'recurring' && (
            <form onSubmit={handleRecurring} className="card p-6 space-y-3">
              <div>
                <label className="font-body text-xs text-charcoal2/60">Repeat</label>
                <select value={repeatType} onChange={(e) => setRepeatType(e.target.value as any)} className="input">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {repeatType === 'daily' && (
                <label className="flex items-center gap-2 font-body text-sm text-charcoal2">
                  <input type="checkbox" checked={weekdaysOnly} onChange={(e) => setWeekdaysOnly(e.target.checked)} />
                  Weekdays only
                </label>
              )}

              {repeatType === 'weekly' && (
                <div>
                  <label className="font-body text-xs text-charcoal2/60 mb-1 block">On these days</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {WEEKDAYS.map((day, i) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() =>
                          setSelectedWeekdays((prev) =>
                            prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
                          )
                        }
                        className={`font-body text-xs w-10 h-9 rounded-lg ${
                          selectedWeekdays.includes(i) ? 'bg-gold text-offwhite' : 'bg-beige text-charcoal2'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-charcoal2/60">From</label>
                  <input required type="date" value={recurStart} onChange={(e) => setRecurStart(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="font-body text-xs text-charcoal2/60">To</label>
                  <input required type="date" value={recurEnd} onChange={(e) => setRecurEnd(e.target.value)} className="input" />
                </div>
              </div>

              <label className="font-body text-xs text-charcoal2/60">Times (comma-separated)</label>
              <input required value={recurTimes} onChange={(e) => setRecurTimes(e.target.value)} className="input" />
              <input required type="number" step="5" placeholder="Duration (mins)" value={recurDuration} onChange={(e) => setRecurDuration(e.target.value)} className="input" />

              <button type="submit" disabled={generating} className="btn-gold !py-2.5 !px-5 text-sm w-full disabled:opacity-60">
                {generating ? 'Generating…' : 'Generate Availability'}
              </button>
              <p className="font-body text-xs text-charcoal2/50">
                Example: every Monday–Friday, 09:00 &amp; 11:00, for the next three months.
              </p>
            </form>
          )}

          {message && <p className="font-body text-sm text-golddeep mt-3">{message}</p>}
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <p className="font-body text-sm text-charcoal2/70">Loading…</p>
          ) : slotsByDate.length === 0 ? (
            <p className="font-body text-sm text-charcoal2/70">No availability published yet.</p>
          ) : (
            <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2">
              {slotsByDate.map(([date, daySlots]) => (
                <div key={date} className="card p-4">
                  <p className="font-body text-sm font-medium text-charcoal mb-2">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => deleteSlot(s)}
                        title={s.status === 'booked' ? 'Booked' : 'Click to remove'}
                        className={`font-body text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 ${
                          s.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {s.start_time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
