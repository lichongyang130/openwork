import { useEffect, useRef } from "react";

/* 简单 SVG 折线趋势图，无外部依赖 */
const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const series = [
  { name: "访问量", color: "#38bdf8", data: [42, 58, 51, 70, 85, 92, 104] },
  { name: "转化量", color: "#a78bfa", data: [12, 18, 15, 24, 30, 35, 41] },
];

export function TrendChart() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const W = 640, H = 260, pad = 36;
    const all = series.flatMap((s) => s.data);
    const maxV = Math.max(...all) * 1.15;
    const minV = 0;

    const xFor = (i: number) =>
      pad + (i * (W - pad * 2)) / (labels.length - 1);
    const yFor = (v: number) =>
      H - pad - ((v - minV) / (maxV - minV)) * (H - pad * 2);

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    // 横向网格线
    const gridLines: string[] = [];
    for (let g = 0; g <= 4; g++) {
      const y = pad + (g * (H - pad * 2)) / 4;
      gridLines.push(
        `<line x1="${pad}" y1="${y}" x2="${W - pad}" y2="${y}" stroke="#334155" stroke-dasharray="4 4" />`
      );
    }

    const paths = series
      .map((s) => {
        const d = s.data
          .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`)
          .join(" ");
        const area = `${d} L ${xFor(s.data.length - 1)} ${H - pad} L ${xFor(0)} ${H - pad} Z`;
        return `<path d="${area}" fill="${s.color}" opacity="0.08" />
          <path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" />
          ${s.data.map((v, i) => `<circle cx="${xFor(i)}" cy="${yFor(v)}" r="3.5" fill="${s.color}" />`).join("")}`;
      })
      .join("");

    const xLabels = labels
      .map(
        (l, i) =>
          `<text x="${xFor(i)}" y="${H - 10}" text-anchor="middle" fill="#64748b" font-size="12">${l}</text>`
      )
      .join("");

    svg.innerHTML = gridLines.join("") + paths + xLabels;
  }, []);

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">核心趋势</h3>
        <div className="flex gap-4">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-400 text-sm">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <svg
        ref={ref}
        className="w-full"
        style={{ maxHeight: 280 }}
      />
    </div>
  );
}
