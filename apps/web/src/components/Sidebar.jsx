import React, { useMemo, useState } from 'react';
import UserModal from './UserModal.jsx';
import { api } from '../api.js';
import { IcPlusC, IcRobot, IcSpeaker, IcUsers, IcClock, IcGrid, IcSearch, IcFilter, IcCollapse, IcBell, IcChevD, IcChevR, IcFolder, IcSpark, IcMoreH, IcArchive, IcPin, IcPhone, IcCheck, IcWarn, IcX, IcDo, IcRemote, IcWs, IcMarket, IcTimer, IcLib, IcIdea } from '../icons.jsx';

const NAV = [
  { id: 'home', name: '做一做', icon: IcDo },
  { id: 'brain', name: '🧠 第二大脑', icon: IcSpark },
  { id: 'dashboard', name: '📊 数据看板', icon: IcGrid },
  { id: 'gene-market', name: '🧬 Gene记忆', icon: IcSpark },
  { id: 'assistant', name: '远程指令', icon: IcRemote },
  { id: 'projects', name: '工作区', icon: IcWs },
  { id: 'esk', name: '能力市场', icon: IcMarket },
  { id: 'automation', name: '定时任务', icon: IcTimer },
  { id: 'library', name: '资料库', icon: IcLib },
  { id: 'inspiration', name: '灵感', icon: IcIdea },
];

const FILTERS = [['', '全部任务'], ['running', '进行中'], ['planning', '规划中'], ['waiting', '待确认'], ['done', '已完成'], ['failed', '失败']];
export default function Sidebar({ S, view, setView, openSettings }) {
  const [showTasks, setShowTasks] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [rail, setRail] = useState(() => localStorage.getItem('ow-rail') === '1');
  const [fltOpen, setFltOpen] = useState(false);
  const [flt, setFlt] = useState('');
  const toggleRail = () => { setRail((v) => { localStorage.setItem('ow-rail', v ? '0' : '1'); return !v; }); };
  const [userOpen, setUserOpen] = useState(false);
  const [q, setQ] = useState('');
  const [menuFor, setMenuFor] = useState(null);
  const [showArch, setShowArch] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [connOpen, setConnOpen] = useState(false);
  const [seen, setSeen] = useState(() => Number(localStorage.getItem('ow-noti-seen') || 0));
  const [connCode, setConnCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  const notis = useMemo(() => (S?.tasks || [])
    .filter((t) => ['done', 'failed', 'waiting'].includes(t.status))
    .map((t) => ({
      id: t.id, ts: new Date(t.updatedAt).getTime(), title: t.title,
      kind: t.status,
      text: t.status === 'done' ? '任务已完成' : t.status === 'failed' ? '任务执行失败' : '任务等待你确认',
    }))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 20), [S]);
  const unread = notis.filter((n) => n.ts > seen).length;
  const markRead = () => { const now = Date.now(); setSeen(now); localStorage.setItem('ow-noti-seen', String(now)); };

  const all = useMemo(() => (S?.tasks || []).filter((t) => (!q || t.title.includes(q) || t.prompt.includes(q)) && (!flt || t.status === flt)), [S, q, flt]);
  const tasks = useMemo(() => all.filter((t) => !t.archived).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)), [all]);
  const archived = useMemo(() => all.filter((t) => t.archived), [all]);

  const doPin = async (t) => { await api.pinTask(t.id); };
  const doArch = async (t) => { await api.archiveTask(t.id); if (view.type === 'task' && view.id === t.id && !t.archived) {} };
  const doRename = async (t) => { const name = prompt('重命名任务', t.title); if (name && name !== t.title) await api.renameTask(t.id, name); };
  const doDelete = async (t) => { await api.deleteTask(t.id); if (view.type === 'task' && view.id === t.id) setView({ type: 'home' }); };

  const RowOps = ({ t }) => (
    <span className="row-ops" onClick={(e) => e.stopPropagation()}>
      <span style={{ position: 'relative' }}>
        <button title="更多" onClick={() => setMenuFor(menuFor === t.id ? null : t.id)}><IcMoreH size={14} /></button>
        {menuFor === t.id && (
          <span className="pop" style={{ right: 0, top: 26, minWidth: 132 }} onClick={(e) => e.stopPropagation()}>
            <button className="pi" onClick={async () => { setMenuFor(null); await doRename(t); }}>重命名</button>
            <button className="pi danger" onClick={async () => { setMenuFor(null); await doDelete(t); }}>删除</button>
          </span>
        )}
      </span>
      <button title={t.archived ? '取消归档' : '归档'} onClick={() => doArch(t)}><IcArchive size={14} /></button>
      <button title={t.pinned ? '取消置顶' : '置顶'} className={t.pinned ? 'pin-on' : ''} onClick={() => doPin(t)}><IcPin size={14} /></button>
    </span>
  );

  return (
    <aside className={`sidebar ${rail ? 'rail' : ''}`}>
      {(notiOpen || connOpen || !!menuFor || fltOpen) && (
        <div className="soft-mask" onClick={() => { setNotiOpen(false); setConnOpen(false); setMenuFor(null); setFltOpen(false); }} />
      )}
      <div className="sb-top">
        <div className="dots"><i /><i /><i /></div>
        <div className="sb-icos">
          <button title={rail ? '展开侧栏' : '收起侧栏'} onClick={toggleRail}><IcCollapse size={15} /></button>
          <button title="搜索" onClick={() => setShowSearch(!showSearch)}><IcSearch size={15} /></button>
          <span style={{ position: 'relative' }}>
            <button title="按状态筛选" className={flt ? 'on' : ''} onClick={() => setFltOpen(!fltOpen)}><IcFilter size={15} /></button>
            {fltOpen && (
              <span className="pop" style={{ left: 0, top: 30, minWidth: 150 }} onClick={(e) => e.stopPropagation()}>
                <div className="pop-head">按状态筛选</div>
                {FILTERS.map(([v, n]) => (
                  <button key={v} className={`pi ${flt === v ? 'on' : ''}`} style={flt === v ? { color: 'var(--accent)', fontWeight: 600 } : {}} onClick={() => { setFlt(v); setFltOpen(false); }}>{n}</button>
                ))}
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="sb-ver">OpenWork <span style={{ fontSize: 11 }}>v0.2.0</span></div>

      <nav className="sb-nav">
        {NAV.map((n) => (
          <button key={n.id} className={`sb-item ${view.type === n.id ? 'on' : ''}`} onClick={() => setView({ type: n.id })}>
            <span className="ic"><n.icon size={16} /></span> {n.name}
          </button>
        ))}
      </nav>

      {showSearch && (
        <div style={{ padding: '8px 14px 0' }}>
          <input autoFocus placeholder="搜索任务…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', fontSize: 12.5 }} />
        </div>
      )}

      <button className="sb-sec" onClick={() => setShowTasks(!showTasks)}>
        任务 ({tasks.length}){flt && <span style={{ color: 'var(--accent)', fontSize: 11, marginLeft: 6 }}>· {FILTERS.find(([v]) => v === flt)?.[1]} <span onClick={(e) => { e.stopPropagation(); setFlt(''); }}>✕</span></span>} {showTasks ? <IcChevD size={12} /> : <IcChevR size={12} />}
      </button>
      <div className="sb-list" style={{ flex: showTasks ? 1 : 'none', maxHeight: showTasks ? undefined : 0, overflow: 'hidden' }}>
        {tasks.length === 0 && <div className="empty" style={{ padding: '14px 0' }}>暂无任务</div>}
        {tasks.map((t) => (
          <div key={t.id} role="button" className={`sb-task ${view.type === 'task' && view.id === t.id ? 'on' : ''}`} onClick={() => setView({ type: 'task', id: t.id })}>
            <span className={`dot ${t.status}`} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <div className="t">{t.pinned && <span className="pin-mark"><IcPin size={11} /></span>}{t.title}</div>
              <div className="tm">{fmt(t.updatedAt)} · {STATUS[t.status]}</div>
            </span>
            <RowOps t={t} />
          </div>
        ))}
        {archived.length > 0 && (
          <>
            <button className="sb-sec" style={{ marginTop: 6 }} onClick={() => setShowArch(!showArch)}>已归档 ({archived.length}) {showArch ? <IcChevD size={12} /> : <IcChevR size={12} />}</button>
            {showArch && archived.map((t) => (
              <div key={t.id} role="button" className={`sb-task arch ${view.type === 'task' && view.id === t.id ? 'on' : ''}`} onClick={() => setView({ type: 'task', id: t.id })}>
                <span className={`dot ${t.status}`} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <div className="t">{t.title}</div>
                  <div className="tm">{fmt(t.updatedAt)} · 已归档</div>
                </span>
                <RowOps t={t} />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="sb-foot">
        <button className="who" onClick={() => setUserOpen(true)} title="账户">
          <div className="avatar">L</div>
          <span className="nm">lichongyang</span>
        </button>
        <span className="ib">
          <span style={{ position: 'relative' }}>
            <button title="通知" className={notiOpen ? 'on' : ''} onClick={() => { setNotiOpen(!notiOpen); setConnOpen(false); }}>
              <IcBell size={16} />
              {unread > 0 && <i className="bell-dot">{unread > 9 ? '9+' : unread}</i>}
            </button>
            {notiOpen && (
              <>
                <div className="nc-mask" onClick={() => setNotiOpen(false)} />
                <div className="nc-draw" onClick={(e) => e.stopPropagation()}>
                  <div className="nc-head">
                    <span className="nc-bell"><IcBell size={16} /></span>
                    <div style={{ flex: 1 }}>
                      <div className="nc-t">通知中心</div>
                      <div className="nc-s">{unread > 0 ? `${unread} 条未读` : '全部已读 · 实时同步任务动态'}</div>
                    </div>
                    <button className="nc-act" onClick={markRead}>全部已读</button>
                    <button className="nc-act" onClick={() => setNotiOpen(false)} title="关闭"><IcX size={15} /></button>
                  </div>
                  <div className="nc-body">
                    {notis.length === 0 && (
                      <div className="np-empty">
                        <span className="np-empty-ic"><IcBell size={20} /></span>
                        <div className="t1">暂无通知</div>
                        <div className="t2">任务完成、失败或需要确认时会在这里提醒你</div>
                      </div>
                    )}
                    {['今天', '昨天', '更早'].map((g) => {
                      const list = notis.filter((n) => dayGroup(n.ts) === g);
                      if (!list.length) return null;
                      return (
                        <div key={g}>
                          <div className="nc-g">{g}</div>
                          {list.map((n) => (
                            <button key={n.id} className={`np-item ${n.ts > seen ? 'un' : ''}`} onClick={() => { setNotiOpen(false); markRead(); setView({ type: 'task', id: n.id }); }}>
                              <span className={`np-ic ${n.kind}`}>
                                {n.kind === 'done' ? <IcCheck size={14} /> : n.kind === 'failed' ? <IcWarn size={14} /> : <IcClock size={14} />}
                              </span>
                              <span style={{ minWidth: 0, flex: 1 }}>
                                <div className="np-t">{n.title}</div>
                                <div className="np-m">{n.text} · {rel(n.ts)}</div>
                              </span>
                              {n.ts > seen ? <i className="np-dot" /> : <span className="nc-go">查看 ›</span>}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </span>
          <span style={{ position: 'relative' }}>
            <button title="连接移动端" className={connOpen ? 'on' : ''} onClick={() => { setConnOpen(!connOpen); setNotiOpen(false); }}>
              <IcPhone size={16} />
            </button>
            {connOpen && (
              <span className="pop conn-pop" onClick={(e) => e.stopPropagation()}>
                <div className="pop-head">连接移动端</div>
                <div className="qr-box"><QrSvg seed={'OW-' + connCode} /></div>
                <div className="conn-tip">使用 OpenWork 移动端扫码，即可远程发起任务、接收通知</div>
                <div className="conn-row">
                  连接码 <b>{connCode}</b>
                  <button className="link-gray" style={{ fontSize: 12 }} onClick={() => { navigator.clipboard?.writeText(connCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? '已复制' : '复制'}</button>
                  <button className="link-gray" style={{ fontSize: 12 }} onClick={() => setConnCode(Math.random().toString(36).slice(2, 8).toUpperCase())}>刷新</button>
                </div>
                <div className="conn-dev">本设备：OpenWork 桌面端 · v0.2.0 · 在线</div>
              </span>
            )}
          </span>
        </span>
        {userOpen && <UserModal onClose={() => setUserOpen(false)} openSettings={openSettings} />}
      </div>
    </aside>
  );
}

export const STATUS = { planning: '规划中', running: '进行中', waiting: '待确认', done: '已完成', failed: '失败' };

function QrSvg({ seed }) {
  const n = 21;
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inFinder = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
    if (!inFinder && rnd() > 0.52) cells.push([x, y]);
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width="148" height="148" shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="#1c1b18" />)}
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="7" height="7" fill="#1c1b18" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1c1b18" />
        </g>
      ))}
    </svg>
  );
}

const dayGroup = (ts) => {
  const d = new Date(ts); const now = new Date();
  const day = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const yest = new Date(now.getTime() - 86400e3);
  if (day(d) === day(now)) return '今天';
  if (day(d) === day(yest)) return '昨天';
  return '更早';
};

const rel = (ts) => {
  const d = Date.now() - ts;
  if (d < 60e3) return '刚刚';
  if (d < 3600e3) return `${Math.floor(d / 60e3)} 分钟前`;
  if (d < 86400e3) return `${Math.floor(d / 3600e3)} 小时前`;
  return `${Math.floor(d / 86400e3)} 天前`;
};

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
