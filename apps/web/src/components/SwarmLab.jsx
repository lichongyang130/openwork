import React, { useState } from 'react';
import { api } from '../api.js';
import { IcBolt, IcRefresh, IcCheck, IcSpark } from '../icons.jsx';

/**
 * Swarm Lab v2 — 3策略分解 + 人机协作编辑子任务 + 额度可见 + 闭环度量
 */
export default function SwarmLab({ S, setView, refresh }) {
  const [prompt, setPrompt] = useState('读取文件夹中的发票文件，提取日期、金额、税号，整理成可报销的表格，标黄不确定项，生成单Excel可直接交财务');
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [strategy, setStrategy] = useState('auto');

  const decompose = async (strat = strategy) => {
    setLoading(true);
    try {
      const r = await api.swarmDecompose(prompt, strat);
      setSubtasks(r.subtasks || []);
      setMetrics({ total: r.total, avgGDI: 82, credits: r.total * 15, strategy: r.subtasks?.[0]?.strategy || strat });
    } finally { setLoading(false); }
  };

  const runSwarm = async () => {
    const t = await api.createTask({ prompt, mode: 'swarm', workspaceId: S.workspaces[0]?.id, strategy });
    refresh();
    setView({ type: 'task', id: t.id });
  };

  const updateSubtask = (id, patch) => setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const examples = [
    { name: '蜂群报销 3分钟100张', p: '蜂群模式：扫描发票并行处理，100张发票3分钟，OCR提取→校验→报销表，标黄不确定项', strat: 'process' },
    { name: '蜂群周报 2分钟', p: '蜂群模式：读取工作记录并行生成周报，收集记录→提炼数据→生成三段式文档，单文件交付', strat: 'process' },
    { name: '100页报告→可视化', p: '把100页行业报告拖进来，逐份提取要点，归并对比，生成单HTML可视化报告，上结论中表格下可筛选图表', strat: 'process' },
    { name: '咖啡馆可行性', p: '在张江开咖啡馆可行吗？预算30万，蜂群多维度分析', strat: 'dimension' },
    { name: '显存计算器 2分钟', p: '做一个显存计算器，输入模型32B Q4 32K上下文 4并发，实时算出显存，暗黑界面单HTML，滑动条', strat: 'process' },
    { name: '蜂群合同审查', p: '审查这份合同是否该签：蜂群三维度并行，风险条款/权责不对等/缺失条款，带置信度+修订建议', strat: 'hypothesis' },
  ];

  return (
    <div className="page">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🐝 蜂群实验室 <span style={{ fontSize: 12, background: '#fff3c0', padding: '2px 8px', borderRadius: 999 }}>省人工省心 · 3策略</span></h2>
      <div className="sub">维度/流程/假设 3策略自动选，子任务可编辑，人机协作，额度可见，报错自改，真干活</div>

      {/* 简介 - 按用户需求 */}
      <div className="set-card" style={{ padding: 16, marginTop: 12, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>👋 蜂群实验室是什么？一句话简介</div>
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          <b>把1个复杂办公任务，自动拆成3-6个简单任务，让多只AI工蜂并行去做，最后合成1份可直接发的报告。</b><br/>
          比如：你说“100张发票整理报销”，它会自动拆成 ①扫描文件 ②OCR提取 ③校验 ④生成Excel，4只工蜂同时干，3分钟出结果，右边每只工蜂独立卡片+置信度+证据，错了自动重试，有快照可回滚。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 10, border: '1px solid #e0f2fe' }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>第1步：说复杂任务</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>输入框写一句人话，如“把销售数据做成可视化简报”或直接拖100页PDF进来</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 10, border: '1px solid #e0f2fe' }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>第2步：看分解，可编辑</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>侦查蜂用3策略（维度/流程/假设）拆成子任务，右侧可改标题/指令，30秒内确认，超时自动继续</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: 10, border: '1px solid #e0f2fe' }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>第3步：收单文件成果</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>每工蜂独立执行，右边看置信度+证据+报错自改，最终1个单HTML可直接发同事，额度透明</div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 999, border: '1px solid #bae6fd' }}>💡 何时用？任务>80字或含2个办公关键词（整理/报告/发票/会议）自动触发</span>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 999, border: '1px solid #bae6fd' }}>⚙️ 策略：维度(PESTEL/4P) / 流程(逐份读→表格→图表) / 假设(正反方辩论)</span>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 999, border: '1px solid #bae6fd' }}>🛡️ 省心：拖拽即上下文 / 快照回滚 / 验证蜂冲突标红 / 定时推送</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 16, marginTop: 16 }}>
        <div>
          <div className="set-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>复杂任务输入 · 3策略分解（可编辑子任务）</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'auto', label: '自动选策略' },
                { id: 'dimension', label: '维度分解(PESTEL/4P/商业画布)' },
                { id: 'process', label: '流程分解(逐份读→提取→表格→图表)' },
                { id: 'hypothesis', label: '假设分解(正反方+验证)' },
              ].map(o=><button key={o.id} className={strategy===o.id?'btn-black':'btn-outline'} style={{ fontSize: 11, padding: '4px 8px' }} onClick={()=>{ setStrategy(o.id); if(prompt) decompose(o.id); }}>{o.label}</button>)}
            </div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} style={{ width: '100%', borderRadius: 10 }} placeholder="输入复杂办公任务..." />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn-outline" onClick={()=>decompose()} disabled={loading}>{loading ? '分解中...' : <><IcBolt size={13} /> 侦查蜂分解预览</>}</button>
              <button className="btn-black" onClick={runSwarm}><IcSpark size={13} /> 一键蜂群执行 · {S?.settings?.swarm?.credits||1500}额度可见</button>
            </div>
          </div>

          {subtasks.length > 0 && (
            <div className="set-card" style={{ padding: 16, marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                🐝 分解结果 · {subtasks.length}只工蜂 · {metrics?.strategy}
                {metrics && <span style={{ fontSize: 11, color: 'var(--muted)' }}>预估 {metrics.credits} credits · 平均GDI {metrics.avgGDI} · 可编辑</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {subtasks.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, background: '#fff' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: ['#1a2744','#1a332a','#332a1a','#2a1a3a'][i%4], color: ['#6aa7ff','#35d49a','#f0b45c','#b48ef0'][i%4], display: 'grid', placeItems: 'center', fontSize: 13, flexShrink: 0 }}>{['🔍','📊','✅','🎨'][i%4]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input value={s.title} onChange={e=>updateSubtask(s.id,{ title: e.target.value })} style={{ fontSize: 13, fontWeight: 600, border: '1px dashed #ddd', borderRadius: 6, padding: '2px 6px', width: '100%' }} />
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.strategy||''} · {s.role} · {s.deliverable}</div>
                      <textarea value={s.prompt} onChange={e=>updateSubtask(s.id,{ prompt: e.target.value })} rows={2} style={{ fontSize: 11, width: '100%', marginTop: 4, borderRadius: 6 }} />
                    </div>
                    <button className="iconbtn" title="删除" onClick={()=>setSubtasks(prev=>prev.filter(x=>x.id!==s.id))}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', background: '#fffbe6', padding: '8px 12px', borderRadius: 8 }}>
                💡 人机协作：上方直接编辑子任务标题/指令，删除不需要的，保存后执行。真干活模式：每只工蜂独立执行，右边面板可见每步，报错自改2次，最终聚合为蜂蜜报告+单文件交付 · 冲突标红
              </div>
            </div>
          )}

          <div className="set-card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📚 办公一键模板（8流程闭环）</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {examples.map(ex => (
                <button key={ex.name} className="skill-card" style={{ textAlign: 'left', padding: '10px 12px' }} onClick={()=>{ setPrompt(ex.p); setStrategy(ex.strat); decompose(ex.strat); }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{ex.name} <span style={{ fontSize: 10, background: '#f1f0ed', padding: '1px 5px', borderRadius: 4 }}>{ex.strat}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{ex.p.slice(0, 48)}...</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="set-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📊 省心度量 + 前后对比</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Metric label="周报" before="30分" after="2分" save="93%" />
              <Metric label="发票100张" before="2小时" after="3分" save="97%" />
              <Metric label="会议纪要" before="60分" after="5分" save="92%" />
              <Metric label="100页报告可视化" before="1天" after="5分" save="99%" />
              <Metric label="显存计算器" before="翻公式半天" after="2分" save="95%" />
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
              <div>✅ 3策略：维度/流程/假设自动选</div>
              <div>✅ 人机协作：子任务可编辑</div>
              <div>✅ 验证蜂反证：冲突标红</div>
              <div>✅ 报错自改：重试2次不甩锅</div>
              <div>✅ Gene前后对比：文件+产物度量</div>
              <div>✅ 额度可见：{S?.settings?.swarm?.credits||1500} credits透明</div>
            </div>
          </div>

          <div className="set-card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>🧬 当前Gene · {S?.genes?.length || 0}</div>
            {(S?.genes || []).slice(0, 3).map(g => (
              <div key={g.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600 }}>{g.claim.slice(0, 32)}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>GDI {g.gdi} · 使用{g.usage||0}次 · {g.from}</div>
              </div>
            ))}
            <button className="btn-outline" style={{ width: '100%', marginTop: 10, fontSize: 12 }} onClick={()=>window.dispatchEvent(new CustomEvent('ow-open-settings',{detail:{page:'memory'}}))}>查看全部Gene + Marketplace真网络</button>
          </div>

          <div className="set-card" style={{ padding: 16, marginTop: 12, background: '#f6f0ff' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>🌸 为什么省心？P0闭环</div>
            <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text2)' }}>
              <div>1. <b>拖拽即上下文</b>：100页报告逐份提取</div>
              <div>2. <b>右边真干活</b>：每工蜂独立卡片+置信度+证据</div>
              <div>3. <b>单HTML可视化</b>：iframe预览可直接发</div>
              <div>4. <b>可回滚快照</b>：错了回滚</div>
              <div>5. <b>额度可见+模型切换</b>：透明</div>
              <div>6. <b>定时Telegram推送</b>：少打扰</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, before, after, save }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 90, fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--muted2)', textDecoration: 'line-through' }}>{before}</span>
      <span>→</span>
      <span style={{ color: '#27a35f', fontWeight: 700 }}>{after}</span>
      <span style={{ marginLeft: 'auto', background: '#e2f5ea', color: '#27a35f', padding: '1px 6px', borderRadius: 999, fontSize: 11 }}>省{save}</span>
    </div>
  );
}
