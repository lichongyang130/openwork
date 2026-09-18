import React from 'react';
import { Md } from '../md.jsx';
import { api } from '../api.js';
import { IcSpark, IcCheck, IcWarn, IcFile, IcEye, IcDown, IcBolt } from '../icons.jsx';
import { fmtBytes } from '../util.js';

export default function EventCard({ ev, task, onPreview }) {
  const p = ev.payload || {};
  switch (ev.kind) {
    case 'user_message':
      return <div className="msg-user">{p.text}</div>;

    case 'think':
      return (
        <div className="ev ev-think">
          <div className="ic"><IcSpark size={13} /></div>
          <div className="body">{p.text}</div>
        </div>
      );

    case 'plan':
      return (
        <div className="ev-plan">
          <div className="t"><IcBolt size={14} /> 执行方案</div>
          <ol>{(p.steps || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      );

    case 'tool':
      return (
        <div className="ev-tool">
          <span className="lb">{p.label}</span>
          <span className="args">{p.argsText}</span>
          <span className="sum">{p.summary}</span>
          <span className="st">
            {p.status === 'running' ? <span className="spin" /> : p.status === 'done' ? <span className="st-ok"><IcCheck size={13} /></span> : <span className="st-fail"><IcWarn size={13} /></span>}
          </span>
        </div>
      );

    case 'approval':
      return (
        <div className={`ev-approval ${p.status === 'rejected' ? 'rej' : ''}`}>
          <div className="t"><IcWarn size={15} /> {p.kind === 'plan' ? '方案确认' : p.kind === 'spec' ? '规范确认' : '高危操作确认'} · {p.title}</div>
          <div className="d">{p.detail}</div>
          {p.status === 'pending' ? (
            <div className="btns">
              <button className="btn primary" onClick={() => api.approve(task.id, p.approvalId, true)}>{p.kind === 'plan' ? '确认执行' : p.kind === 'spec' ? '确认规范并执行' : '批准'}</button>
              <button className="btn ghost" onClick={() => api.approve(task.id, p.approvalId, false)}>{p.kind === 'plan' ? '先不执行' : p.kind === 'spec' ? '我要修改条款' : '拒绝'}</button>
            </div>
          ) : (
            <div className="done-tag">{p.status === 'approved' ? '✓ 已确认' : '✕ 已拒绝'}</div>
          )}
        </div>
      );

    case 'spec_report':
      return (
        <div className="ev-approval" style={{ borderColor: 'var(--accent)' }}>
          <div className="t">📐 规范符合性报告</div>
          <div className="d">{p.text}</div>
          <div className="done-tag" style={{ color: 'var(--accent)' }}>✓ 各条款自检通过</div>
        </div>
      );

    case 'artifact':
      return (
        <div className="ev-artifact">
          <FileBadge name={p.name} />
          <div style={{ minWidth: 0 }}>
            <div className="nm">{p.name}</div>
            <div className="sz">{fmtBytes(p.size)} · 已交付到产物目录</div>
          </div>
          <div className="ops">
            <button className="iconbtn" title="预览" onClick={() => onPreview(p)}><IcEye size={15} /></button>
            <a className="iconbtn" title="下载" href={api.artRaw(task.id, p.id)} target="_blank" rel="noreferrer"><IcDown size={15} /></a>
          </div>
        </div>
      );

    case 'assistant_message':
      return (
        <div className="ev ev-msg">
          <div className="ic" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><IcSpark size={14} /></div>
          <div className="body" style={{ maxWidth: '100%' }}><Md text={p.text} /></div>
        </div>
      );

    case 'swarm_start':
      return (
        <div className="ev-plan" style={{ borderColor: '#f0e6b8', background: '#fffbe6' }}>
          <div className="t">🐝 蜂群启动 · {p.total}只工蜂并行</div>
          <ol>{(p.subtasks || []).map((s, i) => <li key={i}>{s.title} ({s.role})</li>)}</ol>
        </div>
      );
    case 'swarm_bee_start':
      return (
        <div className="ev ev-think">
          <div className="ic" style={{ background: '#fff3c0' }}>🐝</div>
          <div className="body">工蜂 {p.title || p.subtaskId} 开始执行 · {p.role}</div>
        </div>
      );
    case 'swarm_pollen':
      return (
        <div className="ev ev-think">
          <div className="ic" style={{ background: '#e8f5e9', color: '#27a35f' }}>🧬</div>
          <div className="body">花粉入库：{p.pollen?.claim} · 置信度 {(p.pollen?.confidence * 100).toFixed(0)}% · GDI {p.pollen?.gdi}</div>
        </div>
      );
    case 'swarm_bee_done':
      return (
        <div className="ev ev-think">
          <div className="ic" style={{ background: '#e2f5ea', color: '#27a35f' }}><IcCheck size={13} /></div>
          <div className="body">工蜂完成 · 置信度 {(p.confidence * 100).toFixed(0)}% · GDI {p.gdi}</div>
        </div>
      );
    case 'swarm_gene':
      return (
        <div className="ev-approval" style={{ borderColor: '#d8c8f0', background: '#f6f0ff' }}>
          <div className="t">🧬 Gene自进化 · 沉淀 {p.count} 条</div>
          <div className="d">{(p.genes || []).map(g => g.claim).join('；')}</div>
          <div className="done-tag">越用越聪明，下次同类型快50%</div>
        </div>
      );

    case 'error':
      return <div className="ev-error">⚠ {p.message}</div>;

    default:
      return null;
  }
}

export function FileBadge({ name }) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const color = { md: '#6aa7ff', txt: '#8ba19b', csv: '#35d49a', xlsx: '#35d49a', xls: '#35d49a', docx: '#6aa7ff', doc: '#6aa7ff', pdf: '#ff7a76', png: '#f0b45c', jpg: '#f0b45c', jpeg: '#f0b45c', pptx: '#f0885c', html: '#b48ef0' }[ext] || '#8ba19b';
  return <div className="fic" style={{ background: color, width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 800 }}>{(ext || 'FILE').slice(0, 4).toUpperCase()}</div>;
}
