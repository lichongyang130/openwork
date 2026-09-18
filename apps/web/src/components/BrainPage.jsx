import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { IcSpark, IcGrid, IcFolder, IcCheck, IcClock, IcWarn, IcTrash, IcRefresh } from '../icons.jsx';

const TYPE_META = {
  decision: { label: '决策', color: '#6aa7ff', icon: '📌', desc: '技术选型、架构决定' },
  project: { label: '项目', color: '#35d49a', icon: '📁', desc: '项目目标、进度、TODO' },
  user: { label: '偏好', color: '#b48ef0', icon: '👤', desc: '你的工作方式、喜好' },
  experience: { label: '经验', color: '#f0b45c', icon: '💡', desc: '成功经验、越用越聪明' },
  failure: { label: '失败', color: '#e85d5d', icon: '❌', desc: '失败教训、避坑' },
  semantic: { label: '知识', color: '#5ec6d1', icon: '🧠', desc: '事实、概念、定义' },
  episodic: { label: '情景', color: '#9aa0a6', icon: '📝', desc: '发生过的事' },
  relationship: { label: '关系', color: '#ff8fab', icon: '🔗', desc: '知识图谱关系' },
};

const FILTERS = [['','全部'],['decision','决策'],['project','项目'],['user','偏好'],['experience','经验'],['failure','失败'],['semantic','知识'],['episodic','情景']];

export default function BrainPage({ S }) {
  const [cockpit, setCockpit] = useState(null);
  const [mems, setMems] = useState([]);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [stats, setStats] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ type: 'user', content: '', projectId: '' });

  const load = async () => {
    try {
      const [cp, ms, st] = await Promise.all([
        api.brainCockpit(),
        api.listMemories({ type: filter || undefined, q: q || undefined, limit: 80 }),
        api.memoryStats(),
      ]);
      setCockpit(cp);
      setMems(ms);
      setStats(st);
    } catch {}
  };

  useEffect(()=>{ load(); }, [filter]);

  const handleSearch = async () => {
    const ms = await api.listMemories({ type: filter||undefined, q: q||undefined, limit: 80 });
    setMems(ms);
  };

  const handleRemember = async () => {
    if (!addForm.content.trim()) return;
    await api.brainRemember(addForm.content, addForm.projectId || S?.workspaces?.[0]?.id);
    setAddForm({ type: 'user', content: '', projectId: '' });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('忘掉这条记忆？')) return;
    await api.deleteMemory(id);
    load();
  };

  const handleConsolidate = async () => {
    await api.consolidate();
    load();
  };

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        🧠 第二大脑
        <span style={{ fontSize: 12, background: '#e8f0ff', color: '#3a6fd8', padding: '2px 8px', borderRadius: 999 }}>HiveMind OS</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={handleConsolidate}><IcRefresh size={13} /> 整理记忆</button>
          <button className="btn primary" style={{ fontSize: 12 }} onClick={()=>setShowAdd(true)}>+ 记住</button>
        </span>
      </h2>
      <div className="sub">不是聊天记录，是真正懂你的记忆：知道你是谁、正在做什么、做过什么决定、积累的经验，越用越聪明。</div>

      {/* Cockpit */}
      {cockpit && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '16px 0' }}>
          <div className="skill-card" style={{ margin: 0 }}>
            <div className="h"><span className="ic"><IcFolder size={15} /></span>进行中项目</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {(cockpit.projects||[]).slice(0,3).map(p=>(
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span>{p.name}</span><span style={{ color: 'var(--muted)', background: '#f0f0f0', padding: '1px 6px', borderRadius: 999 }}>{p.progress||0}%</span>
                </div>
              ))}
              {(!cockpit.projects||cockpit.projects.length===0) && <div className="empty" style={{ padding: '8px 0', fontSize: 12 }}>暂无项目记忆</div>}
            </div>
          </div>
          <div className="skill-card" style={{ margin: 0 }}>
            <div className="h"><span className="ic">🐝</span>蜂群状态</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>{cockpit.swarm?.running||0}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>工作中</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>{cockpit.swarm?.total||0}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>总任务</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>{cockpit.swarm?.doneToday||0}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>今日完成</div></div>
            </div>
          </div>
          <div className="skill-card" style={{ margin: 0 }}>
            <div className="h"><span className="ic"><IcSpark size={15} /></span>记忆统计</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {Object.entries(stats?.byType||cockpit.stats?.byType||{}).slice(0,6).map(([k,v])=>(
                <span key={k} style={{ fontSize: 11, background: TYPE_META[k]?.color ? TYPE_META[k].color+'22' : '#f0f0f0', color: TYPE_META[k]?.color||'#666', padding: '2px 6px', borderRadius: 999 }}>{TYPE_META[k]?.label||k} {v}</span>
              ))}
              <span style={{ fontSize: 11, background: '#f6f0ff', padding: '2px 6px', borderRadius: 999 }}>总 {stats?.total||cockpit.stats?.total||0} 条</span>
            </div>
            {cockpit.discovery && <div style={{ marginTop: 10, fontSize: 11.5, background: '#fff8e1', padding: '6px 8px', borderRadius: 8, lineHeight: 1.5 }}>💡 {cockpit.discovery}</div>}
          </div>
        </div>
      )}

      {/* 最近记忆 */}
      {cockpit?.memories?.length>0 && (
        <div style={{ margin: '12px 0', padding: 12, background: '#fafaf8', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><IcClock size={13} /> 最近记忆 · 第二大脑已准备好</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {cockpit.memories.map(m=>(
              <span key={m.id} style={{ fontSize: 11.5, background: '#fff', border: '1px solid #eee', padding: '4px 8px', borderRadius: 999, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.content}>
                {TYPE_META[m.type]?.icon||'🧠'} {m.summary}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(([v,n])=>(
            <button key={v} className={`chip-card ${filter===v?'on':''}`} style={{ fontSize: 12, padding: '4px 10px' }} onClick={()=>setFilter(v)}>{n}</button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <input placeholder="搜索记忆…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} style={{ fontSize: 12.5, width: 200 }} />
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={handleSearch}>搜索</button>
        </span>
      </div>

      {/* Memory list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {mems.map(m=>{
          const meta = TYPE_META[m.type]||{ label: m.type, color: '#999', icon: '🧠' };
          return (
            <div key={m.id} className="skill-card" style={{ margin: 0, borderLeft: `3px solid ${meta.color}` }}>
              <div className="h" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{meta.icon}</span>{meta.label}
                <span style={{ fontSize: 10, background: meta.color+'22', color: meta.color, padding: '1px 6px', borderRadius: 999 }}>{Math.round((m.importance||0)*100)}%</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                <button className="iconbtn" style={{ marginLeft: 4 }} onClick={()=>handleDelete(m.id)}><IcTrash size={12} /></button>
              </div>
              <div className="d" style={{ fontSize: 12.5, lineHeight: 1.6, margin: '6px 0', color: 'var(--text)' }}>{m.content}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {(m.tags||[]).map(t=><span key={t} style={{ fontSize: 10, background: '#f5f5f5', padding: '1px 6px', borderRadius: 999 }}>{t}</span>)}
                {m.projectId && <span style={{ fontSize: 10, background: '#e8f0ff', padding: '1px 6px', borderRadius: 999 }}>📁 {m.projectId}</span>}
                <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>用过 {m.usage||0} 次 · 置信 {Math.round((m.confidence||0)*100)}%</span>
              </div>
            </div>
          );
        })}
        {mems.length===0 && <div className="empty" style={{ gridColumn: '1/-1', padding: 30 }}>暂无记忆，试试让 AI 记住你的偏好或决策</div>}
      </div>

      {/* Knowledge Graph simple */}
      <div style={{ marginTop: 24, padding: 14, background: '#f6f0ff', borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🧠 记忆可视化 · 你的第二大脑</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          点击记忆卡片查看详情 · 决策记忆永不遗忘 · 临时记忆7天降权30天归档 · 经验越积越多，下次任务自动复用
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 8, border: '1px solid #eee' }}>我 → 创建 → AI Hive</span>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 8, border: '1px solid #eee' }}>AI Hive → 使用 → DAG</span>
          <span style={{ fontSize: 11, background: '#fff', padding: '4px 8px', borderRadius: 8, border: '1px solid #eee' }}>AI Hive → 包含 → Queen/Worker/Memory</span>
        </div>
      </div>

      {showAdd && (
        <div className="modal-mask" onClick={()=>setShowAdd(false)}>
          <div className="modal" style={{ width: 520 }} onClick={e=>e.stopPropagation()}>
            <div className="mh">🧠 记住 · 手动记忆 <button className="iconbtn x" onClick={()=>setShowAdd(false)}>✕</button></div>
            <div className="mb" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="form-row"><span>类型</span>
                <select value={addForm.type} onChange={e=>setAddForm({...addForm, type: e.target.value})}>
                  {Object.entries(TYPE_META).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label} - {v.desc}</option>)}
                </select>
              </div>
              <div className="form-row"><span>内容</span><textarea rows={3} style={{ width: '100%' }} value={addForm.content} onChange={e=>setAddForm({...addForm, content: e.target.value})} placeholder="例如：记住，以后我的项目都优先使用 PostgreSQL" /></div>
              <div className="form-row"><span>项目</span>
                <select value={addForm.projectId} onChange={e=>setAddForm({...addForm, projectId: e.target.value})}>
                  <option value="">全局</option>
                  {(S?.workspaces||[]).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', background: '#fafaf8', padding: 8, borderRadius: 8 }}>
                💡 提示：输入“记住”会自动保存偏好；输入“决定/采用”保存为决策记忆，永不遗忘；任务完成自动记为情景记忆
              </div>
            </div>
            <div className="mf">
              <button className="btn ghost" onClick={()=>setShowAdd(false)}>取消</button>
              <button className="btn primary" onClick={handleRemember}>保存到第二大脑</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
