import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { IcBolt, IcUsers, IcPlug, IcClock, IcPlus, IcTrash, IcRefresh, IcFolder, IcFile, IcRobot, IcX } from '../icons.jsx';
import { fmtBytes } from '../util.js';

export { default as EskPage } from './EskPage.jsx';

/* ---------------- 连接流程（助理/资料库共用） ---------------- */
const CONN_KEY = 'ow-connections';
const getConns = () => JSON.parse(localStorage.getItem(CONN_KEY) || '[]');
function ConnectCard({ icon, name, desc, onConnected }) {
  const [linked, setLinked] = useState(() => getConns().includes(name));
  const [open, setOpen] = useState(false);
  const confirm = () => {
    const list = getConns();
    if (!list.includes(name)) localStorage.setItem(CONN_KEY, JSON.stringify([...list, name]));
    setLinked(true); setOpen(false); onConnected?.(name);
  };
  return (
    <div className="skill-card" key={name}>
      <div className="h"><span className="ic" style={linked ? {} : { color: 'var(--muted)' }}>{icon}</span>{name}
        <span className={linked ? 'badge ready' : 'badge soon'}>{linked ? '已连接' : '待连接'}</span></div>
      <div className="d">{desc}</div>
      <div className="f"><button className="btn ghost" onClick={() => setOpen(true)}>{linked ? '重新连接' : '扫码连接'}</button></div>
      {open && (
        <div className="am-mask" onClick={() => setOpen(false)}>
          <div className="am-dlg" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>连接{name}</h3><button className="iconbtn" onClick={() => setOpen(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px', textAlign: 'center' }}>
              <div className="qr-box" style={{ margin: '6px auto 12px', width: 156, height: 156 }}><QrSvg seed={'OW-' + name} /></div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>使用{name}扫码完成授权，或在{name}机器人回调地址中填入本机服务地址。</div>
              <button className="btn primary" style={{ width: '100%' }} onClick={confirm}>我已完成授权</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

/* ---------------- 助理（远程遥控） ---------------- */
export function AssistantPage({ S, setView }) {
  const remoteTasks = (S?.tasks || []).filter((t) => t.automationId);
  return (
    <div className="page">
      <h2>助理</h2>
      <div className="sub">手机 IM 下指令，远程调度电脑上的 OpenWork 干活——通勤路上也能处理工作。</div>
      <div className="card-grid">
        {[{ n: '企业微信', d: '扫码连接后，在企微给助理发消息即下达任务' }, { n: '飞书', d: '机器人回调接入' }, { n: '钉钉', d: '机器人回调接入' }, { n: 'QQ', d: '云端虾连接' }].map((c) => (
          <ConnectCard key={c.n} icon={<IcRobot size={15} />} name={c.n} desc={c.d} />
        ))}
      </div>
      <h3 className="sec">远程任务</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {remoteTasks.length === 0 && <div className="empty">手机端发送的任务会出现在这里</div>}
        {remoteTasks.map((t) => (
          <button className="auto-row" key={t.id} style={{ textAlign: 'left' }} onClick={() => setView({ type: 'task', id: t.id })}>
            <span className={`dot ${t.status}`} style={{ marginTop: 0 }} />
            <div><div className="nm">{t.title}</div><div className="meta">{new Date(t.createdAt).toLocaleString()}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 项目（工作空间） ---------------- */
export function ProjectsPage({ S, refresh, view }) {
  const [sel, setSel] = useState(view?.ws || S?.workspaces?.[0]?.id);
  const [files, setFiles] = useState(null);
  const [form, setForm] = useState({ name: '', root: '' });
  useEffect(() => { if (sel) api.wsFiles(sel).then(setFiles).catch(() => setFiles([])); }, [sel]);
  const ws = (S?.workspaces || []).find((w) => w.id === sel);

  return (
    <div className="page">
      <h2>项目</h2>
      <div className="sub">工作空间 = 授权给 AI 的文件夹；任务产物默认落在 openwork-output 目录。</div>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: 260 }}>
          {(S?.workspaces || []).map((w) => (
            <button key={w.id} className="sb-ws" style={sel === w.id ? { background: 'var(--sel)', fontWeight: 600 } : {}} onClick={() => setSel(w.id)}>
              <IcFolder size={15} /> {w.name}
            </button>
          ))}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="文件夹绝对路径" value={form.root} onChange={(e) => setForm({ ...form, root: e.target.value })} />
            <button className="btn primary" onClick={async () => { if (!form.name || !form.root) return; await api.addWorkspace(form); setForm({ name: '', root: '' }); refresh(); }}><IcPlus size={13} /> 添加工作空间</button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 300, background: '#fff', border: '1px solid var(--border)', borderRadius: 14, padding: 16, maxHeight: '62vh', overflowY: 'auto' }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>📁 {ws?.name} <span style={{ color: 'var(--muted2)', fontWeight: 400, fontSize: 12 }}>{ws?.root}</span></div>
          {(files || []).map((f, i) => (
            <div className={`file-row ${f.isDir ? 'dir' : ''}`} key={i} style={{ paddingLeft: 8 + f.path.split('/').length * 12 }}>
              {f.isDir ? <IcFolder size={13} /> : <IcFile size={13} />} {f.name}
              {!f.isDir && <span style={{ marginLeft: 'auto', fontSize: 11 }}>{fmtBytes(f.size)}</span>}
            </div>
          ))}
          {files === null && <div className="empty">加载中…</div>}
          {files && files.length === 0 && <div className="empty">空工作空间</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 资料库 ---------------- */
export function LibraryPage({ S, setView }) {
  const [counts, setCounts] = useState({});
  useEffect(() => {
    (S?.workspaces || []).forEach((w) => api.wsFiles(w.id).then((f) => setCounts((c) => ({ ...c, [w.id]: f.filter((x) => !x.isDir).length })).catch(() => {})));
  }, [S?.workspaces?.length]);
  return (
    <div className="page">
      <h2>资料库</h2>
      <div className="sub">让 AI 读懂你的资料：授权本地文件夹作为知识源，任务中自动检索引用。</div>
      <div className="card-grid">
        {(S?.workspaces || []).map((w) => (
          <div className="skill-card" key={w.id}>
            <div className="h"><span className="ic"><IcFolder size={15} /></span>{w.name}<span className="tag">{counts[w.id] ?? '…'} 个文件</span></div>
            <div className="d" style={{ fontSize: 11.5 }}>{w.root}</div>
            <div className="f"><button className="btn primary" onClick={() => setView({ type: 'projects', ws: w.id })}>查看文件</button></div>
          </div>
        ))}
        {[{ n: '腾讯文档', d: '连接后自动匹配云端文档' }, { n: '乐享知识库', d: '企业知识一键检索' }, { n: 'Notion', d: '页面与数据库接入' }].map((c) => (
          <ConnectCard key={c.n} icon={<IcPlug size={15} />} name={c.n} desc={c.d} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- 灵感 ---------------- */
const IDEAS = [
  { t: '周一晨会简报', p: '汇总工作空间里的最新记录，生成一份周一晨会简报，含待办与风险' },
  { t: '竞品价格对比', p: '整理一份竞品价格对比表，覆盖功能、价格、用户评价三个维度' },
  { t: '报销单整理', p: '读取发票文件，提取金额与日期，生成可报销的表格' },
  { t: '季度复盘 PPT 大纲', p: '根据工作记录生成季度复盘 PPT 的分页大纲，10 页以内' },
  { t: '文件夹大扫除', p: '把工作空间文件按类型分类归档，重名自动加前缀' },
  { t: '客户邮件摘要', p: '把最近的沟通记录整理成客户纪要，标出承诺事项与截止日期' },
  { t: '销售趋势分析', p: '分析销售数据.csv，输出趋势结论与三条行动建议' },
  { t: '活动方案脑暴', p: '为下月的用户增长活动写 5 个创意方案，每个含一句话亮点' },
];

export { default as InspirationPage } from './InspPage.jsx';

/* ---------------- 自动化 ---------------- */
export function AutomationPage({ S, refresh, setView }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', prompt: '', workspaceId: S?.workspaces?.[0]?.id, type: 'daily', day: 1, time: '08:00' });
  const runs = (S?.tasks || []).filter((t) => t.automationId);

  return (
    <div className="page">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        自动化 <button className="btn primary" style={{ marginLeft: 'auto' }} onClick={() => setOpen(true)}><IcPlus size={13} /> 添加定时任务</button>
      </h2>
      <div className="sub">每天 / 每周自动执行提示词，成果落在指定工作空间，像有人按时给你送早报。</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(S?.automations || []).length === 0 && <div className="empty">还没有定时任务</div>}
        {(S?.automations || []).map((a) => (
          <div className="auto-row" key={a.id}>
            <IcClock size={16} />
            <div>
              <div className="nm">{a.name}</div>
              <div className="meta">{a.schedule.type === 'daily' ? '每天' : `每周${'日一二三四五六'[a.schedule.day]}`} {a.schedule.time} · {a.prompt.slice(0, 34)}…</div>
            </div>
            <div className="ops">
              <button className={`switch ${a.enabled ? 'on' : ''}`} onClick={async () => { await api.toggleAutomation(a.id); refresh(); }} />
              <button className="btn ghost" onClick={async () => { const t = await api.runAutomation(a.id); refresh(); setView({ type: 'task', id: t.id }); }}><IcRefresh size={13} /> 立即运行</button>
              <button className="iconbtn" onClick={async () => { if (confirm('删除？')) { await api.deleteAutomation(a.id); refresh(); } }}><IcTrash size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="sec">运行记录</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {runs.length === 0 && <div className="empty">暂无运行记录</div>}
        {runs.map((t) => (
          <button className="auto-row" key={t.id} style={{ textAlign: 'left' }} onClick={() => setView({ type: 'task', id: t.id })}>
            <span className={`dot ${t.status}`} style={{ marginTop: 0 }} />
            <div><div className="nm">{t.title}</div><div className="meta">{new Date(t.createdAt).toLocaleString()}</div></div>
          </button>
        ))}
      </div>

      {open && (
        <div className="modal-mask" onClick={() => setOpen(false)}>
          <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="mh">添加定时任务 <button className="iconbtn x" onClick={() => setOpen(false)}>✕</button></div>
            <div className="mb">
              <div className="form-row"><span>任务名称</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="每日 AI 新闻推送" /></div>
              <div className="form-row"><span>提示词</span><textarea rows={3} style={{ width: '100%' }} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="调研今天的 AI 行业动态，整理成一份简报" /></div>
              <div className="form-row"><span>工作空间</span>
                <select value={form.workspaceId} onChange={(e) => setForm({ ...form, workspaceId: e.target.value })}>
                  {(S?.workspaces || []).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-row"><span>定时规则</span>
                <span style={{ display: 'flex', gap: 8 }}>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="daily">每天</option><option value="weekly">每周</option>
                  </select>
                  {form.type === 'weekly' && (
                    <select value={form.day} onChange={(e) => setForm({ ...form, day: +e.target.value })}>
                      {[1, 2, 3, 4, 5, 6, 0].map((d) => <option key={d} value={d}>周{'日一二三四五六'[d]}</option>)}
                    </select>
                  )}
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </span>
              </div>
            </div>
            <div className="mf">
              <button className="btn ghost" onClick={() => setOpen(false)}>取消</button>
              <button className="btn primary" onClick={async () => { if (!form.name || !form.prompt) return alert('名称和提示词必填'); await api.addAutomation({ name: form.name, prompt: form.prompt, workspaceId: form.workspaceId, schedule: { type: form.type, day: form.day, time: form.time } }); setOpen(false); refresh(); }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
