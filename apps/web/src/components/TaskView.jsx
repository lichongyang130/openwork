import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import EventCard from './EventCard.jsx';
import RightPanel, { PreviewInner } from './RightPanel.jsx';
import InputCard from './InputCard.jsx';
import { STATUS } from './Sidebar.jsx';
import { IcPanel, IcTrash } from '../icons.jsx';

const MODE_NAME = { ask: 'Ask 问一问', plan: 'Plan 想一想', craft: 'Craft 做一做' };

/** 服务端出站受限时，由浏览器代调模型接口并把结果回传 */
function relayLLM({ relayId, url, apiKey, payload }) {
  (async () => {
    let body;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey || ''}` },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => null);
      body = r.ok ? { ok: true, data } : { ok: false, error: `接口返回 HTTP ${r.status}` };
    } catch (e) {
      body = { ok: false, error: '浏览器无法访问该模型接口（网络或 CORS 限制）' };
    }
    fetch(`/api/relay/${relayId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {});
  })();
}

function applyEvent(list, ev) {
  if (ev.kind === 'tool') {
    const i = list.findIndex((e) => e.kind === 'tool' && e.payload.id === ev.payload.id);
    if (i >= 0) { const cp = [...list]; cp[i] = ev; return cp; }
    return [...list, ev];
  }
  if (ev.kind === 'approval_update') {
    return list.map((e) => (e.kind === 'approval' && e.payload.approvalId === ev.payload.approvalId ? { ...e, payload: { ...e.payload, status: ev.payload.status } } : e));
  }
  if (ev.kind === 'status' || ev.kind === 'done') return list;
  return [...list, ev];
}

export default function TaskView({ S, id, setView, refresh }) {
  const [task, setTask] = useState(null);
  const [panel, setPanel] = useState(true);
  const [preview, setPreview] = useState(null);
  const [distilled, setDistilled] = useState(false);
  const [dToast, setDToast] = useState('');
  const scrollRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => { setDistilled(false); }, [id]);

  useEffect(() => {
    let alive = true;
    setTask(null);
    api.getTask(id).then((t) => {
      if (!alive) return;
      if (!t || t.error || !t.events) { setTask({ id, title: '任务不存在', mode: 'craft', status: 'done', events: [], artifacts: [] }); return; }
      setTask(t);
      const es = api.events(id, t.events.at(-1)?.seq || 0);
      esRef.current = es;
      es.onmessage = (m) => {
        const ev = JSON.parse(m.data);
        if (ev.kind === 'llm_relay') { relayLLM(ev.payload); return; }
        setTask((cur) => {
          if (!cur) return cur;
          const next = { ...cur, events: applyEvent(cur.events, ev) };
          if (ev.kind === 'status') next.status = ev.payload.status;
          if (ev.kind === 'artifact') next.artifacts = [...(cur.artifacts || []), ev.payload];
          return next;
        });
      };
    });
    return () => { alive = false; esRef.current?.close(); };
  }, [id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [task?.events.length]);

  if (!task) return <div className="page"><div className="empty">加载中…</div></div>;
  const ws = (S?.workspaces || []).find((w) => w.id === task.workspaceId);
  const busy = ['running', 'planning', 'waiting'].includes(task.status);

  return (
    <>
      <div className="topbar">
        <span className="title">{task.title}</span>
        {task.mode === 'spec' && <span className="badge-green" style={{ marginLeft: 8, fontSize: 11 }}>规范驱动</span>}
        <span className="sp" />
        {task.status === 'done' && task.mode !== 'ask' && (
          <button className="btn-outline" style={{ fontSize: 12.5, padding: '6px 12px', marginRight: 8 }} disabled={distilled} onClick={async () => {
            const s = await api.skillFromTask(id);
            if (s?.id) { setDistilled(true); setDToast(`已沉淀为技能「${s.name}」，可在技能库复用`); setTimeout(() => setDToast(''), 2400); refresh(); }
          }}>{distilled ? '✓ 已沉淀为技能' : '沉淀为技能'}</button>
        )}
        <button className={`iconbtn ${panel ? 'on' : ''}`} title="结果区" onClick={() => setPanel(!panel)}><IcPanel size={16} /></button>
        <button className="iconbtn" title="删除任务" onClick={async () => { if (confirm('删除该任务？')) { await api.deleteTask(id); refresh(); setView({ type: 'home' }); } }}><IcTrash size={15} /></button>
      </div>
      {dToast && <div className="toast-pill">{dToast}</div>}

      <div className="taskwrap">
        <div className="conv">
          <div className="conv-scroll" ref={scrollRef}>
            {task.events.map((ev) => (
              <EventCard key={ev.id} ev={ev} task={task} onPreview={setPreview} />
            ))}
          </div>
          <div className="conv-input">
            <InputCard
              S={S}
              busy={busy}
              onStop={async () => { await fetch(`/api/tasks/${id}/stop`, { method: 'POST' }); }}
              placeholder={busy ? '任务执行中，可点击 ■ 中断…' : '继续追问，例如：把报告改成 PPT 大纲 / 再补充竞品价格对比'}
              onSubmit={async ({ prompt }) => { await api.message(id, prompt); }}
            />
          </div>
        </div>
        {panel && <RightPanel task={{ ...task, _ws: ws }} />}
      </div>
      {preview && <PreviewInner task={task} artifact={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
