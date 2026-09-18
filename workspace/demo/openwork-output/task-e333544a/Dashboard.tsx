import { MetricCard } from "./components/MetricCard";
import { TrendChart } from "./components/TrendChart";
import { AlertList } from "./components/AlertList";

const metrics = [
  { label: "活跃用户", value: "24,832", delta: 12.4, icon: "👥", accent: "#38bdf8" },
  { label: "营收 (万)", value: "¥ 186", delta: 8.1, icon: "💰", accent: "#34d399" },
  { label: "订单量", value: "9,410", delta: -3.2, icon: "📦", accent: "#a78bfa" },
  { label: "错误率", value: "0.42%", delta: -55.0, icon: "⚠️", accent: "#fb7185" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* 顶栏 */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            运营数据驾驶舱
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            实时监控 · 更新于 2026-06-15 09:42
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          ● 系统正常
        </span>
      </header>

      {/* 核心指标 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </section>

      {/* 趋势 + 告警 */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <TrendChart />
        </div>
        <div className="lg:col-span-2">
          <AlertList />
        </div>
      </section>

      <footer className="text-center text-slate-600 text-xs pt-4">
        深色数据驾驶舱 · 组件：MetricCard / TrendChart / AlertList
      </footer>
    </div>
  );
}
