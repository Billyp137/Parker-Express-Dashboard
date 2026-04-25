export default function MetricCard({ label, value, sub, subColor = 'text-zinc-500', accent = false, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 ${className}`}>
      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">{label}</div>
      <div className={`text-3xl font-semibold ${accent ? 'text-gold' : 'text-white'}`}>{value}</div>
      {sub && <div className={`text-xs mt-1.5 ${subColor}`}>{sub}</div>}
    </div>
  )
}
