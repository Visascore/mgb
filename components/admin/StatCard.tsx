export default function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="font-body text-xs text-charcoal2/60 uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl text-charcoal mt-2">{value}</p>
      {sub && <p className="font-body text-xs text-charcoal2/50 mt-1">{sub}</p>}
    </div>
  );
}
