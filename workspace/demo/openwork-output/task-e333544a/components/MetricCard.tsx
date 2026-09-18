interface MetricCardProps {
  label: string;
  value: string;
  delta: number;
  icon: string;
  accent: string;
}

export function MetricCard({ label, value, delta, icon, accent }: MetricCardProps) {
  const isPositive = delta >= 0;
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-5 flex flex-col gap-2 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
      <div className="flex items-center gap-1 text-sm">
        <span
          className={`font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-slate-500 text-xs">vs 上周</span>
      </div>
    </div>
  );
}
