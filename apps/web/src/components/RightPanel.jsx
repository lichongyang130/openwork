import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { FileBadge } from './EventCard.jsx';
import EditorModal from './EditorModal.jsx';
import { fmtBytes } from '../util.js';
import { IcFolder, IcFile, IcEye, IcDown, IcCheck, IcRefresh, IcEdit } from '../icons.jsx';

const TEXT_EXT = new Set(['md', 'txt', 'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss', 'html', 'py', 'java', 'go', 'sh', 'sql', 'yml', 'yaml', 'xml', 'csv', 'vue', 'svelte', 'c', 'cpp', 'h']);
const isText = (name) => TEXT_EXT.has((name.split('.').pop() || '').toLowerCase());

const ROLE_META = {
  search: { icon: '🔍', color: '#6aa7ff', name: '搜索蜂' },
  analysis: { icon: '📊', color: '#35d49a', name: '分析蜂' },
  verifier: { icon: '✅', color: '#f0b45c', name: '验证蜂' },
  case: { icon: '🎨', color: '#b48ef0', name: '案例蜂' },
};

export default function RightPanel({ task }) {
  const [tab, setTab] = useState('artifacts');
  const [files, setFiles] = useState(null);
  const [onPreview, setOnPreview] = useState(null);
  const [editPath, setEditPath] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [credits, setCredits] = useState(null);
  const [editingSub, setEditingSub] = useState({});

  const ws = task._ws;
  useEffect(() => {
    if (tab === 'files' && ws) api.wsFiles(ws.id).then(setFiles).catch(() => setFiles([]));
    if (tab === 'snapshots' && ws) fetch(`/api/workspaces/${ws.id}/snapshots`).then(r=>r.json()).then(setSnapshots).catch(()=>setSnapshots([]));
    if (tab === 'bees') api.swarmCredits().then(setCredits).catch(()=>{});
  }, [tab, ws?.id, task.events.length]);

  const changes = (task.events || []).filter((e) => e.kind === 'tool' && e.payload.status !== 'running' && /移动|删除|创建|写入|删除文件/.test(e.payload.label || ''));

  const isSwarm = task.swarm;
  const subtasks = task.swarm?.subtasks || [];
  const pollen = task.swarm?.pollen || [];
  const conflicts = (task.swarm?.conflicts||0) > 0;
  const metrics = task.swarm?.metrics;

  const saveSubtask = async (subId) => {
    const patch = editingSub[subId];
    if (!patch) return;
    const newSubs = subtasks.map(s=> s.id===subId ? { ...s, ...patch } : s);
    await api.swarmUpdateSubtasks(task.id, newSubs);
    setEditingSub(prev=>{ const n={...prev}; delete n[subId]; return n; });
  };

  return (
    <aside className="panel">
      <div className="panel-tabs">
        <button className={tab === 'artifacts' ? 'on' : ''} onClick={() => setTab('artifacts')}>✅ 最终结果 {task.artifacts?.length || ''}</button>
        {isSwarm && <button className={tab === 'bees' ? 'on' : ''} onClick={() => setTab('bees')}>执行过程 {subtasks.length}</button>}
        <button className={tab === 'more' ? 'on' : ''} onClick={() => setTab('more')} style={{ fontSize: 11, color: 'var(--muted)' }}>更多</button>
      </div>
      <div className="panel-body">
        {tab === 'artifacts' && (
          <>
            {isSwarm && (
              <div style={{ background: '#fffbe6', border: '1px solid #f0e6b8', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>🐝 蜂群真干活 · {task.swarm?.strategy||'自动'}</span>
                  {task.swarm?.finalConfidence && <span style={{ background: task.swarm.finalConfidence>0.8?'#e2f5ea':'#fff3c0', color: task.swarm.finalConfidence>0.8?'#27a35f':'#b89600', padding: '1px 6px', borderRadius: 999, fontSize: 11 }}>置信度 {(task.swarm.finalConfidence*100).toFixed(0)}%</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{subtasks.length}工蜂并行 · {pollen.length}花粉 · 额度 {task.swarm?.creditsUsed||0}/{credits?.total||1500} · {conflicts ? <span style={{ color: '#d44', fontWeight: 700 }}>⚠️ {task.swarm.conflicts}冲突标红</span> : '✅ 无冲突'}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {subtasks.map(s=><span key={s.id} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: s.status==='done'?'#e2f5ea': s.status==='failed'?'#fde8e8':'#f1f0ed', color: s.status==='done'?'#27a35f': s.status==='failed'?'#d44':'var(--muted)' }}>{s.title} {s.status==='done'?`✅ ${(s.confidence*100).toFixed(0)}%` : s.status==='failed'?'❌自修复':'⏳'}</span>)}
                </div>
                {metrics && (
                  <div style={{ marginTop: 8, fontSize: 11, background: '#fff', borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontWeight: 600 }}>📊 前后对比</div>
                    <div>文件 {metrics.before.files}→{metrics.after.files} (+{metrics.filesAdded}) · 产物 {metrics.artifacts} · 额度 {metrics.creditsUsed}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn-outline" style={{ fontSize: 11, flex: 1 }} onClick={async()=>{
                    const r=await api.channelPush({ channel: 'telegram', taskId: task.id });
                    alert(`已推送到 ${r.to}：${r.message}`);
                  }}>📤 推送Telegram/Slack</button>
                </div>
              </div>
            )}
            {(task.artifacts || []).length === 0 && <div className="empty">暂无产物<br />任务完成后交付文件会出现在这里</div>}
            {(task.artifacts || []).map((a) => (
              <div className="art-card" key={a.id}>
                <FileBadge name={a.name} />
                <div style={{ minWidth: 0 }}>
                  <div className="nm">{a.name} {a.name.endsWith('.html') && <span style={{ fontSize: 10, background: '#f6f0ff', padding: '1px 5px', borderRadius: 4, color: '#6b4bd0' }}>单文件可发</span>}</div>
                  <div className="sz">{fmtBytes(a.size)}</div>
                </div>
                <div className="ops">
                  <button className="iconbtn" onClick={() => setOnPreview(a)}><IcEye size={14} /></button>
                  {ws && isText(a.name) && <button className="iconbtn" title="在编辑器中打开" onClick={() => setEditPath(a.rel)}><IcEdit size={14} /></button>}
                  <a className="iconbtn" href={api.artRaw(task.id, a.id)} target="_blank" rel="noreferrer"><IcDown size={14} /></a>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'bees' && isSwarm && (
          <>
            {task.swarm?.status==='waiting_human' && (
              <div style={{ background: '#fff3c0', border: '1px solid #f0d060', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>⏸️ 人机协作暂停：可编辑子任务后继续</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>侦查蜂分解完成，30秒内可编辑，下方直接改标题/指令，改完点“确认继续”</div>
                <button className="btn-black" style={{ width: '100%', marginTop: 8, fontSize: 12 }} onClick={async()=>{
                  const updated = subtasks.map(s=> editingSub[s.id] ? { ...s, ...editingSub[s.id] } : s);
                  await fetch(`/api/swarm/tasks/${task.id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: updated }) });
                  alert('已确认，蜂群继续执行');
                }}>✅ 确认编辑并继续执行</button>
              </div>
            )}
            {credits && <div style={{ fontSize: 11, background: '#f6f5f2', padding: '6px 8px', borderRadius: 8, marginBottom: 8 }}>💳 额度：已用 {credits.used} / {credits.total} · 剩余 {credits.remain} · 本任务 {task.swarm?.creditsUsed||0} · 模型切换可见</div>}
            {subtasks.map(sub=>{
              const meta = ROLE_META[sub.role]||ROLE_META.analysis;
              const pol = pollen.find(p=>p.source.includes(sub.title));
              const isEditing = !!editingSub[sub.id];
              return (
                <div key={sub.id} className="art-card" style={{ borderLeft: `3px solid ${meta.color}`, flexDirection: 'column', alignItems: 'flex-start', background: sub.status==='failed'?'#fff5f5':'' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                    <span style={{ background: '#f1f0ed', borderRadius: 6, padding: '2px 6px', fontSize: 11 }}>{meta.icon} {meta.name}</span>
                    {isEditing ? (
                      <input value={editingSub[sub.id].title ?? sub.title} onChange={e=>setEditingSub(prev=>({ ...prev, [sub.id]: { ...prev[sub.id], title: e.target.value } }))} style={{ flex: 1, fontSize: 12, borderRadius: 6, border: '1px solid #ddd', padding: '2px 6px' }} />
                    ) : (
                      <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{sub.title} <span style={{ fontWeight: 400, fontSize: 10, color: 'var(--muted)' }}>{sub.strategy||''}</span></span>
                    )}
                    <span style={{ fontSize: 11 }}>{sub.status==='done'?`✅ ${(sub.confidence*100).toFixed(0)}% GDI ${sub.gdi||70}`: sub.status==='failed'?'❌ 报错自改': sub.status==='running'?<span className="spin" style={{ width: 12, height: 12 }} />:'⏳'}</span>
                  </div>
                  <div style={{ width: '100%' }}>
                    {isEditing ? (
                      <textarea value={editingSub[sub.id].prompt ?? sub.prompt} onChange={e=>setEditingSub(prev=>({ ...prev, [sub.id]: { ...prev[sub.id], prompt: e.target.value } }))} rows={2} style={{ width: '100%', fontSize: 11, borderRadius: 6, marginTop: 4 }} />
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub.prompt?.slice(0, 100)}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {!isEditing ? (
                      <button className="btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={()=>setEditingSub(prev=>({ ...prev, [sub.id]: { title: sub.title, prompt: sub.prompt } }))}>✏️ 编辑子任务</button>
                    ) : (
                      <>
                        <button className="btn-black" style={{ fontSize: 10, padding: '2px 6px' }} onClick={()=>saveSubtask(sub.id)}>保存</button>
                        <button className="btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={()=>setEditingSub(prev=>{ const n={...prev}; delete n[sub.id]; return n; })}>取消</button>
                      </>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{sub.deliverable}</span>
                  </div>
                  {pol && (
                    <div style={{ fontSize: 11, background: '#f6f5f2', borderRadius: 6, padding: '6px 8px', marginTop: 6, width: '100%', border: pol.confidence<0.6 ? '1px solid #f0b0b0' : '' }}>
                      <div style={{ fontWeight: 600 }}>🧬 {pol.claim.slice(0, 80)} {pol.confidence<0.6 && <span style={{ color: '#d44' }}>⚠️ 低置信标红</span>}</div>
                      <div style={{ color: 'var(--muted)', marginTop: 2 }}>{(pol.evidence||[]).slice(0,1).join('').slice(0,80)}</div>
                      {pol.deliverable && <div style={{ marginTop: 4, color: '#6aa7ff' }}>📄 {pol.deliverable.split('/').pop()} · 置信度 {(pol.confidence*100).toFixed(0)}% · GDI {pol.gdi}</div>}
                    </div>
                  )}
                </div>
              );
            })}
            {subtasks.length===0 && <div className="empty">工蜂采集中… 3策略分解后每只工蜂独立卡片</div>}
          </>
        )}

        {(tab === 'files' || tab === 'more') && (
          <>
            {files === null && <div className="empty">加载中…</div>}
            {files && files.length === 0 && <div className="empty">空工作空间</div>}
            {(files || []).map((f, i) => (
              <div
                className={`file-row ${f.isDir ? 'dir' : ''}`} key={i}
                style={{ paddingLeft: 8 + f.path.split('/').length * 10, cursor: !f.isDir && ws ? 'pointer' : undefined }}
                onClick={() => { if (!f.isDir && ws) setEditPath(f.path); }}
                title={!f.isDir ? '点击在编辑器中打开' : undefined}
              >
                {f.isDir ? <IcFolder size={13} /> : <IcFile size={13} />} {f.name}
                {!f.isDir && <span style={{ marginLeft: 'auto', fontSize: 11 }}>{fmtBytes(f.size)}</span>}
              </div>
            ))}
          </>
        )}

        {tab === 'changes' && (
          <>
            {changes.length === 0 && <div className="empty">暂无文件变更记录</div>}
            {changes.map((e) => (
              <div className="file-row" key={e.id}>
                {e.payload.status === 'done' ? <span className="st-ok"><IcCheck size={13} /></span> : <span className="st-fail">✕</span>}
                <span style={{ color: 'var(--text)' }}>{e.payload.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11 }}>{e.payload.argsText}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'snapshots' && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button className="btn-outline" style={{ fontSize: 12, flex: 1 }} onClick={async()=>{
                if(!ws) return;
                const r=await fetch(`/api/workspaces/${ws.id}/snapshots`,{method:'POST'}).then(r=>r.json());
                setSnapshots([r, ...snapshots]);
              }}>📸 创建快照（回滚用·最多200文件）</button>
            </div>
            {snapshots.length===0 && <div className="empty">暂无快照<br/>整理文件前自动创建，错了可回滚，省心 · 8流程闭环保障</div>}
            {snapshots.map(s=>(
              <div key={s.id} className="art-card" style={{ fontSize: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>快照 {s.id} · {s.files?.length||s.count||0}文件</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(s.ts).toLocaleString()}</div>
                </div>
                <button className="btn ghost" style={{ fontSize: 11 }} onClick={async()=>{
                  if(!confirm('回滚到该快照？当前文件会被覆盖')) return;
                  const r=await fetch(`/api/workspaces/${ws.id}/snapshots/${s.id}/rollback`,{method:'POST'}).then(r=>r.json());
                  alert(`已回滚 ${r.restored} 文件`);
                }}>回滚</button>
              </div>
            ))}
          </>
        )}
      </div>
      {onPreview && <PreviewInner task={task} artifact={onPreview} onClose={() => setOnPreview(null)} />}
      {editPath && ws && <EditorModal ws={ws} path={editPath} onClose={() => setEditPath(null)} onSaved={() => tab === 'files' && setFiles(null)} />}
    </aside>
  );
}

export function PreviewInner({ task, artifact, onClose }) {
  const [data, setData] = useState(null);
  const [html, setHtml] = useState(null);
  useEffect(() => {
    const ext = (artifact.name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) setData({ img: true });
    else if (ext === 'html') {
      api.artText(task.id, artifact.id).then(d=>{ setHtml(d.text); setData(d); }).catch(e=>setData({ error: e.message }));
    } else api.artText(task.id, artifact.id).then(setData).catch((e) => setData({ error: e.message }));
  }, [artifact.id]);

  const isHTML = (artifact.name.split('.').pop()||'').toLowerCase()==='html';

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: isHTML?'min(900px,96vw)':'min(760px, 94vw)', maxHeight: isHTML?'90vh':'86vh' }}>
        <div className="mh">
          <FileBadge name={artifact.name} /> <span style={{ marginLeft: 10 }}>{artifact.name} {isHTML && <span style={{ fontSize: 11, background: '#f6f0ff', padding: '2px 6px', borderRadius: 4, color: '#6b4bd0' }}>单文件可直接发同事</span>}</span>
          <button className="iconbtn x" onClick={onClose}>✕</button>
        </div>
        <div className="mb" style={isHTML?{ padding: 0, overflow: 'hidden' }:{}}>
          {data?.img ? (
            <img src={api.artRaw(task.id, artifact.id)} alt={artifact.name} style={{ maxWidth: '100%', borderRadius: 10 }} />
          ) : isHTML && html ? (
            <iframe srcDoc={html} style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '0 0 12px 12px' }} sandbox="allow-scripts allow-same-origin" />
          ) : data?.binary ? (
            <div className="empty">二进制文件，请下载后用本地应用打开</div>
          ) : (
            <div className="preview-body">{data?.text ?? '加载中…'}</div>
          )}
        </div>
        <div className="mf">
          <a className="btn ghost" href={api.artRaw(task.id, artifact.id)} target="_blank" rel="noreferrer">下载 / 用本地应用打开</a>
          <button className="btn primary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
