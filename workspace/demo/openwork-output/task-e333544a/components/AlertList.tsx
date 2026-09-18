interface AlertItem {
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
  time: string;
}

const alerts: AlertItem[] = [
  {
    level: "critical",
    title: "CPU 使用率超过 95%",
    detail: "节点 prod-web-03 持续高负载，已触发自动扩容",
    time: "2 分钟前",
  },
  {
    level: "warning",
    title: "API 响应延迟升高",
    detail: "/api/v2/orders 接口 P99 延迟突破 1200ms",
    time: "15 分钟前",
  },
  {
    level: "warning",
    title: "磁盘空间不足",
    detail: "数据卷 /data 使用率达 87%，建议尽快清理",
    time: "1 小时前",
  },
  {
    level: "info",
    title: "新版本发布完成",
    detail: "v3.8.2 灰度 100%，监控指标正常",
    time: "3 小时前",
  },
];

const levelStyle: Record<AlertItem["level"], { dot: string; badge: string; label: string }> = {
  critical: { dot: "bg-rose-500", badge: "bg-rose-500/15 text-rose-400", label: "严重" },
  warning: { dot: "bg-amber-500", badge: "bg-amber-500/15 text-amber-400", label: "警告" },
  info: { dot: "bg-sky-500", badge: "bg-sky-500/15 text-sky-400", label: "信息" },
};

export function AlertList() {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">告警列表</h3>
        <span className="text-xs text-slate-500">实时 · 每 30s 刷新</span>
      </div>
      <ul className="space-y-3">
        {alerts.map((a, i) => {
          const s = levelStyle[a.level];
          return (
            <li
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/40"
            >
              <span className={`mt-1 w-2.5 h-2.5 rounded-full ${s.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium truncate">{a.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{a.detail}</p>
              </div>
              <span className="text-slate-500 text-xs shrink-0">{a.time}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
