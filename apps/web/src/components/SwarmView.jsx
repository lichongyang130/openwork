import React, { useEffect, useState } from 'react';
import { IcSpark, IcCheck, IcBolt, IcGem } from '../icons.jsx';

/**
 * 蜂群可视化 — 三栏布局参考 EvoX
 * 左：工蜂列表+状态+置信度+GDI
 * 中：花粉板PollenDB证据流
 * 右：蜂蜜报告+交付物
 */

const ROLE_META = {
  search: { icon: '🔍', color: '#6aa7ff', name: '搜索蜂', bg: '#1a2744' },
  analysis: { icon: '📊', color: '#35d49a', name: '分析蜂', bg: '#1a332a' },
  verifier: { icon: '✅', color: '#f0b45c', name: '验证蜂', bg: '#332a1a' },
  case: { icon: '🎨', color: '#b48ef0', name: '案例蜂', bg: '#2a1a3a' },
};

export default function SwarmView({ task }) {
  const swarm = task?.swarm;
  if (!swarm) return null;

  const subtasks = swarm.subtasks || [];
  const pollen = swarm.pollen || [];
  const avgConf = pollen.length ? (pollen.reduce((s, p) => s + (p.confidence || 0), 0) / pollen.length * 100).toFixed(0) : 0;
  const creditsUsed = swarm.creditsUsed || 0;
  const totalCredits = 1500;

  return (
    <div className="swarm-view">
      {/* 顶部蜂巢状态栏 */}
      <div className="swarm-top">
        <div className="swarm-hive">
          <span className="hive-icon">🐝</span>
          <span className="hive-title">蜂群执行中</span>
          <span className="hive-count">{subtasks.length}只工蜂 · {pollen.length}份花粉</span>
          <span className={`hive-status ${swarm.status}`}>{swarm.status === 'done' ? '✅ 已完成' : '⏳ 并行中'}</span>
        </div>
        <div className="swarm-metrics">
          <span className="metric"><IcBolt size={12} /> 平均置信度 {avgConf}%</span>
          <span className="metric"><IcGem size={12} /> 额度 {creditsUsed}/{totalCredits}</span>
          <div className="credit-bar"><div className="fill" style={{ width: `${Math.min(100, creditsUsed / totalCredits * 100)}%` }} /></div>
        </div>
      </div>

      <div className="swarm-grid">
        {/* 左：工蜂 */}
        <div className="swarm-col">
          <div className="col-head">🐝 工蜂队列</div>
          <div className="bee-list">
            {subtasks.map((sub, i) => {
              const meta = ROLE_META[sub.role] || ROLE_META.analysis;
              const isRunning = sub.status === 'running';
              const isDone = sub.status === 'done';
              return (
                <div key={sub.id} className={`bee-card ${sub.status}`} style={{ borderLeftColor: meta.color }}>
                  <div className="bee-head">
                    <span className="bee-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</span>
                    <span className="bee-role">{meta.name}</span>
                    <span className="bee-status">{isRunning ? <span className="spin" style={{ width: 12, height: 12 }} /> : isDone ? '✅' : '⏳'}</span>
                  </div>
                  <div className="bee-title">{sub.title}</div>
                  <div className="bee-prompt">{sub.prompt?.slice(0, 60)}</div>
                  {isDone && (
                    <div className="bee-meta">
                      <span className="conf">置信 {(sub.confidence * 100).toFixed(0)}%</span>
                      <span className="gdi">GDI {sub.gdi || 70}</span>
                    </div>
                  )}
                  {/* 蜂巢SVG连线 */}
                  <div className="bee-conn" style={{ background: meta.color, opacity: isDone ? 0.8 : 0.2 }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 中：花粉板 */}
        <div className="swarm-col">
          <div className="col-head">🧬 花粉板 PollenDB · {pollen.length}</div>
          <div className="pollen-list">
            {pollen.map((p) => (
              <div key={p.id} className="pollen-card">
                <div className="pol-head">
                  <span className="pol-source">{p.source}</span>
                  <span className={`pol-conf ${p.confidence > 0.8 ? 'high' : p.confidence > 0.6 ? 'mid' : 'low'}`}>{(p.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="pol-claim">{p.claim}</div>
                <div className="pol-evi">
                  {(p.evidence || []).slice(0, 2).map((e, j) => <div key={j} className="evi">📎 {e.slice(0, 60)}</div>)}
                </div>
                <div className="pol-foot">
                  <span>GDI {p.gdi}</span>
                  {p.deliverable && <span>📄 {p.deliverable.split('/').pop()}</span>}
                </div>
              </div>
            ))}
            {pollen.length === 0 && <div className="empty">工蜂采集中…花粉将实时流入</div>}
          </div>
          {/* 摇摆舞可视化 */}
          <div className="waggle">
            <div className="waggle-title">💃 摇摆舞通信</div>
            <div className="waggle-svg">
              {subtasks.filter(s => s.status === 'done').map((s, i) => (
                <div key={s.id} className="waggle-dot" style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 20}%`, background: ROLE_META[s.role]?.color }} title={s.title} />
              ))}
              <svg viewBox="0 0 100 100" className="waggle-lines">
                {subtasks.slice(0, -1).map((_, i) => (
                  <line key={i} x1={15 + i * 18} y1={30} x2={15 + (i + 1) * 18} y2={50} stroke="#333" strokeDasharray="2 2" />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* 右：蜂蜜报告 */}
        <div className="swarm-col">
          <div className="col-head">🍯 蜂蜜报告</div>
          {swarm.finalConfidence != null && (
            <div className="honey-card">
              <div className="honey-conf">
                <div className="big">{(swarm.finalConfidence * 100).toFixed(1)}%</div>
                <div className="label">最终置信度</div>
                <div className={`badge ${swarm.finalConfidence > 0.8 ? 'ok' : swarm.finalConfidence > 0.6 ? 'warn' : 'fail'}`}>
                  {swarm.finalConfidence > 0.8 ? '✅ 可直接交付' : swarm.finalConfidence > 0.6 ? '⚠️ 需复核' : '❌ 需返工'}
                </div>
              </div>
              {swarm.conflicts > 0 && <div className="conflict">⚠️ 发现 {swarm.conflicts} 处冲突，已标黄需人工确认</div>}
            </div>
          )}
          <div className="honey-deliver">
            <div className="d-head">📦 交付物 · 单文件可直接发</div>
            {(task.artifacts || []).slice(-4).map((a) => (
              <div key={a.id} className="d-item">
                <span className="d-icon">📄</span>
                <span className="d-name">{a.name}</span>
                <span className="d-size">{(a.size / 1024).toFixed(1)}KB</span>
              </div>
            ))}
          </div>
          {/* Gene沉淀提示 */}
          <div className="gene-hint">
            <div className="gh-head">🧬 Gene自进化</div>
            <div className="gh-text">高置信度花粉已沉淀为Gene，下次同类型任务快50%，越用越聪明</div>
            <div className="gh-list">
              {pollen.filter(p => p.confidence > 0.8).slice(0, 2).map(p => (
                <div key={p.id} className="gh-item">✨ {p.claim.slice(0, 30)}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部省心提示 */}
      <div className="swarm-footer">
        <span>💡 真干活非吐文字 · 右边执行面板可见每步 · 报错自改 · 单HTML可直接发同事 · 1500额度内白嫖</span>
      </div>
    </div>
  );
}
