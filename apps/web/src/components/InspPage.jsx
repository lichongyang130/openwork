import React, { useMemo, useState } from 'react';
import { api } from '../api.js';
import { IcSearch, IcStar } from '../icons.jsx';

const CATS = ['全部', '精选', '个人工作台', '办公协同', '投资理财', '内容创作', '数据分析', '效率工具', '开发工具', '知识与学习', '信息与资讯', '商业运营', '旅行出行', '智能体能力'];

const ITEMS = [
  { t: '打工人小账本', d: '把工资、工时、支出和自由目标装进一个在线手账', cat: '投资理财', cov: 'ledger', p: '帮我做一个打工人小账本：记录工资、工时、支出与自由目标，生成可视化页面' },
  { t: '学习目标管理台', d: '把有终点、有总量的学习目标拆成每天可完成的进度', cat: '知识与学习', cov: 'study', p: '帮我搭一个学习目标管理台：把总目标拆成每日进度并跟踪完成率' },
  { t: '生活全能工作台', d: '把记录、习惯、健康、日程与精神生活装进一个在线工作台', cat: '效率工具', cov: 'daily', tall: true, p: '帮我搭一个生活全能工作台：记账、习惯、健康、日程与书影音一站式管理' },
  { t: '装修工作台', d: '施工进度、预算超支、灵感收藏一页管理，手机电脑都能用', cat: '个人工作台', cov: 'reno', p: '帮我做一个装修工作台：管理施工进度、预算与灵感收藏' },
  { t: '首富的记账本', d: '一个月花光十个亿的记账工作台，轮盘抽花样，越花越有钱', cat: '投资理财', cov: 'rich', p: '帮我做一个趣味记账工作台：「一个月花光十个亿」挑战，含轮盘抽消费花样' },
  { t: '轻盈计划', d: '体重、体脂、饮食与目标进度，全部本地离线记录，一眼看明白', cat: '效率工具', cov: 'phone', p: '帮我做一个减脂追踪页：体重体脂趋势、饮食记录与目标进度一目了然' },
  { t: '今日 AI 圈发生了什么', d: '聚合 OpenAI、Anthropic、Google 等动态，每天 8:00 自动汇总', cat: '信息与资讯', cov: 'ainews', p: '帮我汇总今日 AI 圈大事：模型发布、融资、开源与论文，输出早报' },
  { t: '深夜数据驾驶舱', d: '深色大屏可视化：转化率、留存、异常告警一屏掌握', cat: '数据分析', cov: 'dark', p: '帮我生成一个深色数据驾驶舱页面：核心指标、趋势图与告警列表' },
  { t: '旅行行程助手', d: '输入目的地与天数，自动排出每日行程、预算与清单', cat: '旅行出行', cov: 'travel', p: '帮我规划一次 5 天旅行：每日行程、预算分配与行李清单' },
  { t: 'MCP 能力雷达', d: '扫描已接入的 MCP 连接器，生成能力地图与推荐组合', cat: '智能体能力', cov: 'mcp', p: '扫描我已接入的连接器，生成能力地图与 3 个推荐自动化组合' },
  { t: '周报一键生成器', d: '读取本周工作记录，按 完成/数据/计划 三段输出周报', cat: '办公协同', cov: 'weekly', p: '读取工作记录，生成本周周报：完成 / 数据 / 计划 三段结构' },
  { t: '小红书爆款拆解', d: '输入笔记链接，拆出标题钩子、结构与可复用模板', cat: '内容创作', cov: 'xhs', p: '拆解一篇小红书爆款笔记：标题钩子、正文结构与可复用模板' },
];

/* ---------------- covers ---------------- */
function Cov({ v }) {
  if (v === 'ledger') return (
    <div className="cv" style={{ background: '#f6f5ef', height: 210 }}>
      <div className="cv-side"><i className="on" /><i /><i /><i /><i /></div>
      <div className="cv-main">
        <div className="cv-banner">🐷 今天也要算清楚</div>
        <div className="cv-stats">
          <span style={{ background: '#dcefdc', color: '#2c6e49' }}>¥54.96/时</span>
          <span style={{ background: '#fde3e0', color: '#b4544c' }}>¥32</span>
          <span style={{ background: '#fdf3cf', color: '#8a6d1f' }}>30.7%</span>
        </div>
        <div className="cv-line" style={{ width: '82%' }} /><div className="cv-line" style={{ width: '64%' }} />
      </div>
    </div>
  );
  if (v === 'study') return (
    <div className="cv" style={{ background: '#fff', height: 230 }}>
      <div className="cv-side" style={{ background: '#7c3aed' }}><i className="on" /><i /><i /><i /><i /><i /></div>
      <div className="cv-main">
        <div className="cv-stats"><span style={{ background: '#f3e8ff', color: '#6d28d9' }}>4/5</span><span style={{ background: '#f3e8ff', color: '#6d28d9' }}>80%</span><span style={{ background: '#f3e8ff', color: '#6d28d9' }}>12 天</span></div>
        <div className="cv-line" style={{ width: '90%' }} /><div className="cv-line" style={{ width: '70%' }} /><div className="cv-line" style={{ width: '80%' }} /><div className="cv-line" style={{ width: '55%' }} />
      </div>
    </div>
  );
  if (v === 'daily') return (
    <div className="cv" style={{ background: '#ece5dc', height: 560, flexDirection: 'column', gap: 12, padding: 18 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 30, height: 30, borderRadius: 8, background: '#4a2b4f', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14 }}>日</span><b style={{ fontSize: 13 }}>日常集</b></div>
      <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.4, color: '#2b2320' }}>把生活的每一面<br />安放在一个地方</div>
      <div style={{ background: '#4a2b4f', borderRadius: 12, padding: 16, color: '#fff' }}>
        <div style={{ fontSize: 10, opacity: .7 }}>今日生活指数</div>
        <div style={{ fontSize: 30, fontWeight: 800, margin: '6px 0' }}>82</div>
        <div style={{ fontSize: 10, opacity: .7 }}>稳稳推进，也留一点空白</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[['记账理财', '#e7dfd2'], ['习惯健康', '#e7dfd2'], ['减脂健身', '#e7dfd2'], ['书影音', '#e7dfd2']].map(([t, bg]) => (
          <div key={t} style={{ background: bg, borderRadius: 10, padding: '12px 10px', fontSize: 11, fontWeight: 600, color: '#4a3f35' }}>{t}</div>
        ))}
      </div>
    </div>
  );
  if (v === 'reno') return (
    <div className="cv" style={{ background: '#f4efe6', height: 220 }}>
      <div className="cv-main" style={{ padding: 12 }}>
        <div className="cv-stats"><span style={{ background: '#eadfc8', color: '#7a5b3a' }}>65%</span><span style={{ background: '#eadfc8', color: '#7a5b3a' }}>13.8万</span><span style={{ background: '#eadfc8', color: '#7a5b3a' }}>82</span></div>
        <div style={{ background: '#4a3f35', borderRadius: 10, padding: 12, color: '#e8ddca', fontSize: 10, marginTop: 8 }}>📦 今天要做的事<br /><i style={{ display: 'block', height: 5, borderRadius: 3, background: '#6b5d4c', margin: '6px 0' }} /><i style={{ display: 'block', height: 5, borderRadius: 3, background: '#6b5d4c', width: '70%' }} /></div>
      </div>
    </div>
  );
  if (v === 'rich') return (
    <div className="cv" style={{ background: '#fdf1f0', height: 230 }}>
      <div className="cv-side" style={{ background: '#fff' }}><i className="on" /><i /><i /><i /></div>
      <div className="cv-main">
        <div className="cv-banner" style={{ background: '#fde3e0', color: '#b4544c' }}>💸 今日支出 ¥10.01 亿</div>
        <div className="cv-stats"><span style={{ background: '#fff', color: '#b4544c' }}>¥812.0万</span><span style={{ background: '#fff', color: '#b4544c' }}>¥9.95亿</span></div>
        <div className="donut" />
      </div>
    </div>
  );
  if (v === 'phone') return (
    <div className="cv" style={{ background: '#f6ece4', height: 300, justifyContent: 'center' }}>
      <div style={{ width: 120, margin: '14px auto', background: '#fff', borderRadius: 16, padding: 10, boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
        <div style={{ background: '#2f5d46', borderRadius: 10, padding: 10, color: '#eaf4ec', fontSize: 9, lineHeight: 1.5 }}>Leah，今天也按自己的节奏来。</div>
        <div style={{ height: 5, borderRadius: 3, background: '#eee7df', margin: '8px 0' }} />
        <div style={{ height: 5, borderRadius: 3, background: '#eee7df', width: '70%' }} />
        <div style={{ background: '#f0824f', borderRadius: 999, height: 16, margin: '10px 6px 2px' }} />
      </div>
    </div>
  );
  if (v === 'ainews') return (
    <div className="cv" style={{ background: '#fff', height: 260, flexDirection: 'column', padding: 0 }}>
      <div style={{ background: 'linear-gradient(120deg,#fbd3a2,#f7b26b)', padding: '16px 14px', fontSize: 13, fontWeight: 800, color: '#5b3a12' }}>今日 AI 圈发生了什么</div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ border: '1px solid #f0e8dd', borderRadius: 8, padding: 8 }}><div className="cv-line" style={{ width: '80%', margin: 0 }} /><div className="cv-line" style={{ width: '55%', margin: '6px 0 0' }} /></div>)}
      </div>
    </div>
  );
  if (v === 'dark') return (
    <div className="cv" style={{ background: '#10141c', height: 210 }}>
      <div className="cv-main" style={{ padding: 14 }}>
        <div className="cv-stats"><span style={{ background: '#1b2432', color: '#4ade80' }}>97.2%</span><span style={{ background: '#1b2432', color: '#60a5fa' }}>1.2s</span></div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60, marginTop: 12 }}>{[30, 52, 40, 66, 48, 72, 58].map((h, i) => <i key={i} style={{ width: 12, height: h * .8, background: i % 2 ? '#22d3ee' : '#4ade80', borderRadius: 3, opacity: .85 }} />)}</div>
      </div>
    </div>
  );
  if (v === 'travel') return (
    <div className="cv" style={{ background: 'linear-gradient(160deg,#dceffc,#bcd9f2)', height: 200, flexDirection: 'column', padding: 14, gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#1d4e79' }}>✈️ 5 天行程 · 大理</div>
      {['D1 古城漫步', 'D2 洱海骑行', 'D3 苍山徒步'].map((t) => <div key={t} style={{ background: '#ffffffcc', borderRadius: 8, padding: '7px 10px', fontSize: 10.5, color: '#2b5d86' }}>{t}</div>)}
    </div>
  );
  if (v === 'mcp') return (
    <div className="cv" style={{ background: '#eef2f7', height: 190, justifyContent: 'center', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 34px)', gap: 8, margin: '0 auto' }}>
        {['📄', '📊', '', '', '🗓️', '', '', ''].map((e, i) => <span key={i} style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'grid', placeItems: 'center', fontSize: 15, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>{e}</span>)}
      </div>
    </div>
  );
  if (v === 'weekly') return (
    <div className="cv" style={{ background: '#f4f6fb', height: 200 }}>
      <div className="cv-main" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#273354' }}>📝 本周周报</div>
        {['完成 8 项', '数据 +12%', '计划 5 项'].map((t, i) => <div key={t} style={{ background: '#fff', borderRadius: 8, padding: '7px 10px', fontSize: 10.5, color: '#4a5878', marginTop: 8, borderLeft: `3px solid ${['#4ade80', '#60a5fa', '#f59e0b'][i]}` }}>{t}</div>)}
      </div>
    </div>
  );
  return (
    <div className="cv" style={{ background: '#fff0f2', height: 200 }}>
      <div className="cv-main" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9f1239' }}>📕 爆款拆解</div>
        <div className="cv-line" style={{ width: '85%', background: '#fbcfd8' }} /><div className="cv-line" style={{ width: '60%', background: '#fbcfd8' }} />
        <div className="cv-stats"><span style={{ background: '#ffe4e6', color: '#9f1239' }}>钩子 ×3</span><span style={{ background: '#ffe4e6', color: '#9f1239' }}>模板 ×1</span></div>
      </div>
    </div>
  );
}

export default function InspirationPage({ S, setView, refresh }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState(() => { try { return JSON.parse(localStorage.getItem('ow-favs') || '[]'); } catch { return []; } });
  const toggleFav = (t) => setFavs((v) => { const nv = v.includes(t) ? v.filter((x) => x !== t) : [...v, t]; localStorage.setItem('ow-favs', JSON.stringify(nv)); return nv; });

  const items = useMemo(() => ITEMS.filter((i) =>
    (cat === '全部' || i.cat === cat || (cat === '精选' && i.tall)) &&
    (!onlyFav || favs.includes(i.t)) &&
    (!q || i.t.includes(q) || i.d.includes(q))
  ), [cat, q, onlyFav, favs]);

  const run = async (i) => {
    const t = await api.createTask({ prompt: i.p, mode: 'craft', workspaceId: S.workspaces[0]?.id, skillIds: [] });
    refresh();
    setView({ type: 'task', id: t.id });
  };

  return (
    <div className="esc-wrap">
      <div className="esc-top">
        <span style={{ fontSize: 20, fontWeight: 800 }}>灵感</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 6 }}>常见工作流沉淀成可复用的任务起点</span>
        <div className="esc-search">
          <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--muted2)' }}><IcSearch size={14} /></span>
          <input placeholder="搜索灵感" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className={`btn-outline ${onlyFav ? 'hl' : ''}`} onClick={() => setOnlyFav(!onlyFav)}><IcStar size={14} /> 我的收藏</button>
      </div>

      <div className="chips-row" style={{ margin: '16px 0 18px' }}>
        {CATS.map((c) => (
          <button key={c} className="chip-card" style={{ padding: '6px 13px', borderRadius: 8, background: cat === c ? '#e3e1dd' : 'transparent', border: '1px solid transparent', boxShadow: 'none' }} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="ins-grid">
        {items.map((i) => (
          <div key={i.t} className="ins-card">
            <button className="ins-covbtn" onClick={() => run(i)} title="使用该灵感发起任务"><Cov v={i.cov} /></button>
            <div className="ins-body">
              <div className="ins-trow"><b>{i.t}</b><span className="html-b">HTML</span></div>
              <div className="ins-d">{i.d}</div>
              <div className="ins-foot">
                <span className="ins-auth"><i></i> OpenWork 官方</span>
                <button className={`ins-fav ${favs.includes(i.t) ? 'on' : ''}`} onClick={() => toggleFav(i.t)} title="收藏"><IcStar size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty" style={{ padding: 40 }}>没有匹配的灵感，换个分类或清空搜索试试</div>}
      </div>
    </div>
  );
}
