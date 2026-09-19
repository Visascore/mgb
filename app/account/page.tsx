import { createClient } from '@/lib/supabase/server';
import Price from '@/components/ui/Price';

export default async function AccountDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, services(name, duration_minutes), availability_slots(slot_date, start_time)')
    .order('created_at', { ascending: false });

  const now = new Date();
  const upcoming = (bookings ?? []).filter((b: any) => {
    const slotDate = b.availability_slots ? new Date(`${b.availability_slots.slot_date}T${b.availability_slots.start_time}`) : null;
    return slotDate && slotDate >= now && b.status !== 'cancelled';
  });
  const past = (bookings ?? []).filter((b: any) => !upcoming.includes(b));

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal mb-8">My Appointments</h1>

      <section className="mb-12">
        <h2 className="eyebrow mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="font-body text-sm text-charcoal2/70">No upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b: any) => (
              <div key={b.id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-display text-base text-charcoal">{b.services?.name}</p>
                  <p className="font-body text-xs text-charcoal2/60 mt-1">
                    {b.availability_slots?.slot_date} at {b.availability_slots?.start_time?.slice(0, 5)}
                  </p>
                </div>
                <Price amount={b.balance_amount} className="font-body text-sm text-charcoal2/70" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="eyebrow mb-4">Past Appointments</h2>
        {past.length === 0 ? (
          <p className="font-body text-sm text-charcoal2/70">No past appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {past.map((b: any) => (
              <div key={b.id} className="card p-5 flex items-center justify-between opacity-75">
                <div>
                  <p className="font-display text-base text-charcoal">{b.services?.name}</p>
                  <p className="font-body text-xs text-charcoal2/60 mt-1">
                    {b.availability_slots?.slot_date} · {b.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
