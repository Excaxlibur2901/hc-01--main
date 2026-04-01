export default function StatsCard({ icon, label, value, color = 'sky', subtitle }) {
  const colorMap = {
    sky: 'from-sky-50 to-blue-50 border-sky-200 text-sky-700',
    emerald: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
    red: 'from-red-50 to-rose-50 border-red-200 text-red-700',
    amber: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-700',
    purple: 'from-purple-50 to-violet-50 border-purple-200 text-purple-700',
    slate: 'from-slate-50 to-gray-50 border-slate-200 text-slate-700',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color] || colorMap.sky} animate-slide-up`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium opacity-70">{label}</p>
      </div>
      <p className="text-3xl font-black">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  );
}
