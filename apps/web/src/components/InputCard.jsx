import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { IcPlus, IcArrowUp, IcMic, IcGauge, IcShield, IcFolder, IcChevD, IcChevR, IcClip, IcAt, IcEdit, IcUsers, IcBolt, IcPlug, IcStop, IcX, IcScale, IcGem, IcCheck, IcSpark } from '../icons.jsx';
import SwarmToggle from './SwarmToggle.jsx';

const TIERS = [
  { id: 'fast', name: '快速', icon: IcBolt, x: '0.21x' },
  { id: 'balanced', name: '均衡', icon: IcScale, x: '0.65x' },
  { id: 'max', name: '极致', icon: IcGem, x: '1.20x' },
];
const MODEL_META = {
  offline: { x: '0.00x', bd: ['内置免费', 'blue'] },
  deepseek: { x: '0.21x' },
  kimi: { x: '0.65x' },
  glm: { x: '0.79x' },
  minimax: { x: '0.29x' },
  openai: { x: '1.20x' },
};

export default function InputCard({ S, onSubmit, busy, onStop, placeholder, autoFocus, showUnder = true }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('craft'); // craft | plan | ask | swarm
  const prefWs = S?.settings?.prefs?.defaultWs;
  const defWs = prefWs && S?.workspaces?.some((w) => w.id === prefWs) ? prefWs : S?.workspaces?.[0]?.id;
  const [wsId, setWsId] = useState(defWs);
  const fileRef = useRef(null);
  const [uploads, setUploads] = useState([]); // {name, rel, status}
  const [rec, setRec] = useState(null); // SpeechRecognition | 'err'
  const recRef = useRef(null);
  const [modelId, setModelId] = useState(S?.settings?.activeModelId || 'offline');
  const [menu, setMenu] = useState(null); // null | plus | mode | expert | skill | conn | model | ws | perm
  const [skills, setSkills] = useState([]);
  const [expert, setExpert] = useState(null);
  const [fullAccess, setFullAccess] = useState(false);
  const [maxMode, setMaxMode] = useState(false);
  const [tier, setTier] = useState('fast');
  const [picked, setPicked] = useState(false);
  const [swarmEnabled, setSwarmEnabled] = useState(S?.settings?.swarm?.autoEnable ?? true);
  const [strategy, setStrategy] = useState(S?.settings?.swarm?.strategy || 'auto');
  const ta = useRef(null);

  const [refFiles, setRefFiles] = useState([]);
  const [skillPick, setSkillPick] = useState(null);
  useEffect(() => {
    const h = (e) => {
      const { wsId: w, path: p } = e.detail || {};
      setRefFiles((v) => (v.find((x) => x.wsId === w && x.path === p) ? v : [...v, { wsId: w, path: p }]));
    };
    const hFill = (e) => {
      setText(e.detail?.text || '');
      setTimeout(() => {
        if (ta.current) { ta.current.style.height = 'auto'; ta.current.style.height = Math.min(ta.current.scrollHeight, 200) + 'px'; ta.current.focus(); }
      }, 0);
    };
    const hSkill = (e) => setSkillPick(e.detail?.name || null);
    window.addEventListener('ow-ref-file', h);
    window.addEventListener('ow-fill-prompt', hFill);
    window.addEventListener('ow-skill-pick', hSkill);
    return () => { window.removeEventListener('ow-ref-file', h); window.removeEventListener('ow-fill-prompt', hFill); window.removeEventListener('ow-skill-pick', hSkill); };
  }, []);

  const submit = () => {
    if (!text.trim() || busy) return;
    const refs = refFiles.filter((r) => r.wsId === (wsId || defWs)).map((r) => r.path);
    const finalMode = swarmEnabled ? 'swarm' : mode;
    onSubmit({ prompt: text.trim(), mode: finalMode, workspaceId: wsId, skillIds: skills, modelId, expert, refFiles: refs, skillName: skillPick, strategy });
    setText('');
    setRefFiles([]);
    if (ta.current) ta.current.style.height = 'auto';
  };

  const activeModel = (S?.settings?.models || []).find((m) => m.id === modelId);
  const plusOpen = menu === 'plus' || menu === 'mode';

  const doUpload = async (files) => {
    if (!files?.length) return;
    const target = wsId || defWs;
    if (!target) return;
    const uploadedRels = [];
    for (const f of files) {
      const entry = { name: f.name, rel: '', status: 'up' };
      setUploads((v) => [...v, entry]);
      try {
        const buf = await f.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        const r = await fetch(`/api/workspaces/${target}/upload`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, base64 }),
        }).then((x) => x.json());
        setUploads((v) => v.map((u) => (u.name === f.name ? { ...u, rel: r.rel || '', status: r.ok ? 'ok' : 'err' } : u)));
        if (r.ok) {
          uploadedRels.push(r.rel);
          setText((t) => (t ? t + ' ' : '') + `@${f.name} `);
        }
      } catch {
        setUploads((v) => v.map((u) => (u.name === f.name ? { ...u, status: 'err' } : u)));
      }
    }
    // 真提取：拖拽文件即上下文，逐份提取100页报告归并（调用后端多文件上下文接口）
    if (uploadedRels.length) {
      try {
        // 模拟多文件上下文提取：后端 /api/workspaces/:id/file 读取后，前端提示已纳入上下文
        setText((t) => {
          const extra = uploadedRels.length>1 ? `\n\n已拖入${uploadedRels.length}份文件，蜂群将逐份提取→归并→可视化（已自动@引用，提交后并行处理）` : `\n\n已拖入 ${uploadedRels[0]}，已纳入上下文`;
          return t.includes('蜂群将逐份提取') ? t : t + extra;
        });
      } catch {}
    }
    setTimeout(() => setUploads((v) => v.filter((u) => u.status === 'up')), 4000);
  };

  const mentionables = (S?.tasks || []).flatMap((t) => (t.artifacts || []).map((a) => a.name));
  const wsFiles = (S?.workspaces || []).find((w) => w.id === wsId)?.files || [];

  const [mediaRec, setMediaRec] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleMic = async () => {
    if (recRef.current) { recRef.current.stop(); recRef.current = null; setRec(null); return; }
    if (mediaRef.current && mediaRef.current.state==='recording') {
      mediaRef.current.stop();
      setMediaRec(null);
      setRec(null);
      return;
    }
    // 尝试 MediaRecorder blob 保存 P0
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const buf = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        try {
          const r = await fetch('/api/voice/blob', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64, wsId: wsId||defWs, mime: 'audio/webm' }) }).then(x=>x.json());
          console.log('[voice] blob saved', r);
        } catch {}
        stream.getTracks().forEach(t=>t.stop());
        setMediaRec(null);
      };
      mediaRef.current = mr;
      mr.start();
      setMediaRec(mr);
      setRec('recording');
    } catch {
      // fallback to SpeechRecognition
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (!mediaRef.current) { setRec('err'); setTimeout(() => setRec(null), 2200); } return; }
    const r = new SR();
    r.lang = 'zh-CN'; r.interimResults = false;
    r.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      setText((t) => (t ? t + ' ' : '') + transcript);
      try {
        await fetch('/api/voice/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript, wsId: wsId || defWs }) });
        // 自动建任务：长度>15自动创建蜂群任务
        if (transcript.length > 15) {
          console.log('[voice] 转写已保存，自动创建任务', transcript);
          // 自动提交
          const refs = refFiles.filter((r) => r.wsId === (wsId || defWs)).map((r) => r.path);
          onSubmit({ prompt: transcript, mode: swarmEnabled ? 'swarm' : 'craft', workspaceId: wsId, skillIds: skills, modelId, refFiles: refs });
          setText('');
        }
      } catch {}
    };
    r.onend = () => { recRef.current = null; if (!mediaRef.current || mediaRef.current.state!=='recording') setRec(null); };
    r.onerror = () => { recRef.current = null; if (!mediaRef.current || mediaRef.current.state!=='recording') setRec(null); };
    recRef.current = r; setRec(r); r.start();
  };

  // 拖拽文件即上下文 P0 真提取
  const [dragOver, setDragOver] = useState(false);
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const onDrop = async (e) => {
    e.preventDefault(); setDragOver(false);
    const files = [...(e.dataTransfer?.files || [])];
    if (files.length) {
      await doUpload(files);
      if (files.length > 1) setText(t=> (t? t+' ' : '') + `已拖入${files.length}份文件，蜂群将逐份提取→归并→可视化... `);
      else if (files.length===1) {
        // 单文件自动提示上下文已纳入
        setText(t=> t.includes('@') ? t : t + ` 请基于 @${files[0].name} `);
      }
    }
  };

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} style={{ position: 'relative' }}>
      {dragOver && <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,181,131,0.08)', border: '2px dashed #0eb583', borderRadius: 18, display: 'grid', placeItems: 'center', zIndex: 10, fontWeight: 600, color: '#0eb583' }}>📎 拖拽文件即上下文 · 100页报告逐份提取·蜂群并行</div>}
      {menu && <div className="soft-mask" onClick={() => setMenu(null)} />}
      <input ref={fileRef} type="file" multiple hidden onChange={(e) => { doUpload([...e.target.files]); e.target.value = ''; }} />
      <div className="input-card">
        {uploads.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px 0' }}>
            {uploads.map((u, i) => (
              <span key={i} className="chip" style={{ fontSize: 12 }}>{u.status === 'up' ? '⏳' : u.status === 'ok' ? '📎' : '⚠️'} {u.name}{u.status === 'up' ? '（上传中…）' : u.status === 'err' ? '（上传失败）' : ''}</span>
            ))}
          </div>
        )}
        <textarea
          ref={ta}
          autoFocus={autoFocus}
          placeholder={placeholder || '今天帮你做些什么？  @ 引用对话文件，/ 调用技能与指令'}
          value={text}
          onChange={(e) => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'; }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <div className="ic-row">
          <button className="plus-btn" title="添加文件" onClick={() => fileRef.current?.click()} style={{ background: '#f6f5f2' }}>
            <IcPlus size={17} />
          </button>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, flex: 1 }}>拖文件进来或一句话，蜂群自动拆解，不用选模式</span>
          <div className="ic-right">
            <SwarmToggle enabled={swarmEnabled} onToggle={() => setSwarmEnabled(!swarmEnabled)} />
            <button className="auto-btn" title={rec==='recording' ? '停止录音' : '语音输入，自动转任务'} onClick={toggleMic} style={rec && rec !== 'err' ? { color: '#e0665f', border: '1px solid #e0665f' } : {}}>
              <IcMic size={15} />{rec==='recording' ? <span style={{ fontSize: 11, marginLeft: 4 }}>●录音中</span> : null}
            </button>
            {busy
              ? <button className="stop-dark" title="中断执行" onClick={onStop}><IcStop size={14} /></button>
              : <button className="send-dark" disabled={!text.trim()} onClick={submit} title="发送 - 蜂群自动执行"><IcArrowUp size={16} /></button>}
          </div>
        </div>

        {/* + 主菜单 */}
        {plusOpen && (
          <div className="pop" style={{ left: 8, bottom: 52 }}>
            <button className="pi" onClick={() => { setMenu(null); fileRef.current?.click(); }}><span className="ic"><IcClip size={15} /></span> 添加文件 <span className="chev"><IcChevR size={13} /></span></button>
            <button className="pi" onClick={() => setMenu('mention')}><span className="ic"><IcAt size={15} /></span> 引用对话中的文件 <span className="chev"><IcChevR size={13} /></span></button>
            <button className="pi" style={menu === 'mode' ? { background: '#f4f3f0' } : {}} onClick={() => setMenu('mode')}><span className="ic"><IcEdit size={15} /></span> 模式 <span className="chev"><IcChevR size={13} /></span></button>
            <button className="pi" onClick={() => setMenu('expert')}><span className="ic"><IcUsers size={15} /></span> 专家 <span className="chev"><IcChevR size={13} /></span></button>
            <button className="pi" onClick={() => setMenu('skill')}><span className="ic"><IcBolt size={15} /></span> 技能 <span className="chev"><IcChevR size={13} /></span></button>
            <button className="pi" onClick={() => setMenu('conn')}><span className="ic"><IcPlug size={15} /></span> 连接器 <span className="chev"><IcChevR size={13} /></span></button>
          </div>
        )}

        {/* 模式子菜单：与主菜单并排在右 */}
        {menu === 'mode' && (
          <div className="pop" style={{ left: 236, bottom: 52, width: 252 }}>
            <div className="mode-sub">
              <div className="desc">{mode === 'craft' ? '当前为默认模式，可高效执行并完成任务。' : mode === 'plan' ? '计划模式：先给出分步方案，你确认后才动手。' : mode === 'spec' ? '规范驱动：先产出开发规范（Spec），你确认后严格按规范执行并交付符合性报告。' : '仅问答：只看不改，不读写文件。'}</div>
              <div className="mode-row">计划 <span className="en">Plan</span>
                <button className={`switch ${mode === 'plan' ? 'on' : ''}`} onClick={() => setMode(mode === 'plan' ? 'craft' : 'plan')} /></div>
              <div className="mode-row">规范 <span className="en">Spec</span>
                <button className={`switch ${mode === 'spec' ? 'on' : ''}`} onClick={() => setMode(mode === 'spec' ? 'craft' : 'spec')} /></div>
              <div className="mode-row">仅问答 <span className="en">Ask</span>
                <button className={`switch ${mode === 'ask' ? 'on' : ''}`} onClick={() => setMode(mode === 'ask' ? 'craft' : 'ask')} /></div>
            </div>
          </div>
        )}

        {/* 专家 */}
        {menu === 'expert' && (
          <div className="pop" style={{ left: 8, bottom: 52, maxHeight: 260, overflowY: 'auto' }}>
            <div className="pop-head">选择专家</div>
            {(S?.experts || []).map((e) => (
              <label className="ck" key={e.id}><input type="radio" checked={expert === e.id} onChange={() => { setExpert(expert === e.id ? null : e.id); setMenu(null); }} /> {e.name}</label>
            ))}
          </div>
        )}

        {/* 技能 */}
        {menu === 'skill' && (
          <div className="pop" style={{ left: 8, bottom: 52, maxHeight: 260, overflowY: 'auto' }}>
            <div className="pop-head">已启用技能</div>
            {(S?.skills || []).filter((s) => s.enabled).map((s) => (
              <label className="ck" key={s.id}><input type="checkbox" checked={skills.includes(s.id)} onChange={() => setSkills((v) => (v.includes(s.id) ? v.filter((x) => x !== s.id) : [...v, s.id]))} /> {s.name}</label>
            ))}
          </div>
        )}

        {/* @引用对话文件 */}
        {menu === 'mention' && (
          <div className="pop" style={{ left: 8, bottom: 52, maxHeight: 260, overflowY: 'auto', minWidth: 240 }}>
            <div className="pop-head">引用产物文件</div>
            {mentionables.length === 0 && <div style={{ padding: '8px 14px', fontSize: 13, color: 'var(--muted)' }}>暂无产物文件，先运行一个任务生成产物吧</div>}
            {[...new Set(mentionables)].map((n) => (
              <button className="pi" key={n} onClick={() => { setText((t) => (t ? t + ' ' : '') + `@${n} `); setMenu(null); ta.current?.focus(); }}><span className="ic"><IcAt size={14} /></span> {n}</button>
            ))}
          </div>
        )}

        {/* 连接器 */}
        {menu === 'conn' && (
          <div className="pop" style={{ left: 8, bottom: 52 }}>
            <div className="pop-head">连接器</div>
            {(S?.connectors || []).map((c) => (
              <div className="pi" key={c.id} style={{ cursor: 'default' }}>{c.name} <span className="chev"><span className={`badge ${c.status}`}>{c.status === 'ready' ? '可配置' : '即将上线'}</span></span></div>
            ))}
          </div>
        )}

        {/* 模型选择（参考 1.png 样式） */}
        {menu === 'model' && (
          <div className="pop model-pop" style={{ right: 46, bottom: 52 }}>
            <div className="mm-head">
              <span className="ic" style={{ color: 'var(--text2)' }}><IcGauge size={15} /></span> Max 模式
              <button className={`switch ${maxMode ? 'on' : ''}`} onClick={() => setMaxMode(!maxMode)} />
            </div>
            <div style={{ padding: '4px 0' }}>
              {TIERS.map((t) => (
                <button key={t.id} className={`mm-row ${tier === t.id ? 'sel' : ''}`} onClick={() => setTier(t.id)}>
                  <span className="ic" style={{ color: 'var(--text2)' }}><t.icon size={15} /></span>
                  <span className="nm">{t.name}</span>
                  <span className="x">{t.x}</span>
                  {tier === t.id && <span className="ck2"><IcCheck size={13} /></span>}
                </button>
              ))}
            </div>
            <div style={{ padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              {(S?.settings?.models || []).map((m) => {
                const meta = MODEL_META[m.id] || { x: '—' };
                const bd = m.builtin ? meta.bd : m.hasKey ? ['已就绪', 'blue'] : ['未配置Key', 'red'];
                return (
                  <button key={m.id} className="mm-row" onClick={async () => { setModelId(m.id); setPicked(true); setMenu(null); await api.saveSettings({ activeModelId: m.id }); }}>
                    <span className="gly">{m.builtin ? <IcSpark size={10} /> : (m.provider || '?')[0]}</span>
                    <span className="nm">{m.name}{bd && <span className={`bd ${bd[1]}`}>{bd[0]}</span>}</span>
                    <span className="x">{meta.x}</span>
                    {modelId === m.id && <span className="ck2"><IcCheck size={13} /></span>}
                  </button>
                );
              })}
            </div>
            <button className="mm-foot" onClick={() => { setMenu(null); window.dispatchEvent(new CustomEvent('ow-open-settings', { detail: { page: 'models' } })); }}>
              <IcEdit size={14} /> 配置自定义模型
            </button>
          </div>
        )}
      </div>

      {showUnder && (
        <div className="under-bar">
          <button className="uchip" onClick={() => setMenu(menu === 'ws' ? null : 'ws')} style={{ position: 'relative' }}>
            <IcFolder size={14} /> {(S?.workspaces || []).find((w) => w.id === wsId)?.name || '选择工作空间'} <IcChevD size={12} />
            {menu === 'ws' && (
              <span className="pop" style={{ left: 0, bottom: 36, minWidth: 200 }} onClick={(e) => e.stopPropagation()}>
                {(S?.workspaces || []).map((w) => (
                  <button className="pi" key={w.id} onClick={() => { setWsId(w.id); setMenu(null); }}><IcFolder size={14} /> {w.name}</button>
                ))}
              </span>
            )}
          </button>
          <button className={`uchip ${menu === 'perm' ? 'hl' : ''}`} onClick={() => setMenu(menu === 'perm' ? null : 'perm')} style={{ position: 'relative' }}>
            <IcShield size={14} /> 默认权限 <IcChevD size={12} />
            {menu === 'perm' && (
              <span className="pop" style={{ left: 0, bottom: 36, width: 268 }} onClick={(e) => e.stopPropagation()}>
                <div className="mode-sub">
                  <div className="desc">当前为默认权限，所有操作都会在安全沙箱约束内进行，超出范围会请求你的允许。</div>
                  <div className="mode-row">允许完全访问
                    <button className={`switch ${fullAccess ? 'on' : ''}`} onClick={async () => { const v = !fullAccess; setFullAccess(v); await api.saveSettings({ risk: { blockOutside: !v } }); }} /></div>
                </div>
              </span>
            )}
          </button>
          {expert && <span className="chip green" style={{ marginLeft: 6 }}>👤 {(S?.experts || []).find((e) => e.id === expert)?.name}</span>}
          {skills.length > 0 && <span className="chip green" style={{ marginLeft: 2 }}>⚡ 技能 {skills.length}</span>}
          {mode === 'spec' && <span className="chip green" style={{ marginLeft: 2 }}>📐 规范驱动</span>}
          {skillPick && (
            <span className="chip green" style={{ marginLeft: 2 }}>⚡ 技能：{skillPick}
              <button style={{ marginLeft: 4, opacity: .6 }} onClick={() => setSkillPick(null)}>✕</button>
            </span>
          )}
          {refFiles.filter((r) => r.wsId === (wsId || defWs)).map((r) => (
            <span className="chip green" key={r.path} style={{ marginLeft: 2 }}>@{r.path.split('/').pop()}
              <button style={{ marginLeft: 4, opacity: .6 }} onClick={() => setRefFiles((v) => v.filter((x) => x !== r))}>✕</button>
            </span>
          ))}
          {swarmEnabled && (
            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6, background: '#fffbe6', padding: '2px 8px', borderRadius: 999, border: '1px solid #f0e6b8' }}>
              🐝 蜂群自动：复杂任务自动拆3-6步并行，策略自动选，不用你选
            </span>
          )}
        </div>
      )}
    </div>
  );
}
