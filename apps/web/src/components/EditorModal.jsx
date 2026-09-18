import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, WidgetType, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { IcX, IcCheck } from '../icons.jsx';

/* ---------- Tab 幽灵补全（Cursor 风格） ---------- */
const ghostSet = StateEffect.define();
const ghostClear = StateEffect.define();
class GhostWidget extends WidgetType {
  constructor(text) { super(); this.text = text; }
  toDOM() {
    const s = document.createElement('span');
    s.className = 'cm-ghost';
    s.textContent = this.text.length > 240 ? this.text.slice(0, 240) + '…' : this.text;
    return s;
  }
  ignoreEvent() { return false; }
}
const ghostField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(ghostSet)) {
        const pos = Math.min(e.value.pos, tr.state.doc.length);
        return Decoration.set([Decoration.widget({ widget: new GhostWidget(e.value.text), side: 1 }).range(pos)]);
      }
      if (e.is(ghostClear)) return Decoration.none;
    }
    if (tr.docChanged || tr.selection) return Decoration.none;
    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

const langOf = (name) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(ext)) return javascript({ jsx: true, typescript: ['ts', 'tsx'].includes(ext) });
  if (ext === 'json') return json();
  if (['css', 'scss', 'less'].includes(ext)) return css();
  if (['html', 'htm', 'vue', 'svelte'].includes(ext)) return html();
  if (['md', 'markdown'].includes(ext)) return markdown();
  return [];
};

export default function EditorModal({ ws, path, onClose, onSaved }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const ghostRef = useRef(null); // { pos, text }
  const seqRef = useRef(0);
  const timerRef = useRef(null);
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kbar, setKbar] = useState(null); // { from, to, selected, before, after } | null
  const [kinstr, setKinstr] = useState('');
  const [kbusy, setKbusy] = useState(false);
  const [kdiff, setKdiff] = useState(null); // { from, to, oldText, newText }
  const [toast, setToast] = useState('');
  const soon = (m) => { setToast(m); setTimeout(() => setToast(''), 1800); };

  useEffect(() => {
    api.wsFile(ws.id, path).then((r) => {
      if (r.binary) setErr('二进制文件，无法在编辑器中打开');
      else setDoc(r.text ?? '');
    }).catch((e) => setErr(e.error || '打开失败'));
    window.dispatchEvent(new CustomEvent('ow-ref-file', { detail: { wsId: ws.id, path } }));
  }, [ws.id, path]);

  useEffect(() => {
    if (doc == null || !hostRef.current) return;
    let curGhost = null;
    const scheduleComplete = (view) => {
      clearTimeout(timerRef.current);
      view.dispatch({ effects: ghostClear });
      curGhost = null; ghostRef.current = null;
      timerRef.current = setTimeout(async () => {
        const st = view.state;
        const pos = st.selection.main.head;
        if (st.doc.length === 0 || pos === 0) return;
        const ch = st.doc.sliceString(Math.max(0, pos - 1), pos);
        if (!/[\w.)\]}>='"`+\-*\/\s,;:{([]/.test(ch)) return;
        const seq = ++seqRef.current;
        try {
          const r = await fetch('/api/complete', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prefix: st.doc.sliceString(Math.max(0, pos - 2000), pos), suffix: st.doc.sliceString(pos, pos + 800) }),
          }).then((x) => x.json());
          if (seq !== seqRef.current || !r.ok || !r.text) return;
          const after = st.doc.sliceString(pos, Math.min(st.doc.length, pos + r.text.length));
          if (after && r.text.startsWith(after)) return; // 重复已有内容
          curGhost = { pos, text: r.text }; ghostRef.current = curGhost;
          view.dispatch({ effects: ghostSet.of(curGhost) });
        } catch { /* 网络失败静默 */ }
      }, 380);
    };

    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          basicSetup,
          langOf(path),
          EditorView.lineWrapping,
          ghostField,
          EditorView.updateListener.of((u) => { if (u.docChanged) { setDirty(true); scheduleComplete(view); } else if (u.selectionSet) scheduleComplete(view); }),
          keymap.of([
            {
              key: 'Tab',
              run: (v) => {
                const g = ghostRef.current;
                if (!g) return false;
                const pos = v.state.selection.main.head;
                v.dispatch({ changes: { from: pos, insert: g.text }, effects: ghostClear });
                ghostRef.current = null; curGhost = null; seqRef.current++;
                setDirty(true);
                return true;
              },
            },
            {
              key: 'Escape',
              run: (v) => {
                if (ghostRef.current) { v.dispatch({ effects: ghostClear }); ghostRef.current = null; return true; }
                return false;
              },
            },
            {
              key: 'Mod-k',
              run: (v) => {
                const st = v.state;
                const sel = st.selection.main;
                let from = sel.from, to = sel.to;
                if (from === to) { const line = st.doc.lineAt(from); from = line.from; to = line.to; }
                setKbar({ from, to, selected: st.doc.sliceString(from, to), before: st.doc.sliceString(Math.max(0, from - 1500), from), after: st.doc.sliceString(to, to + 800) });
                setKdiff(null); setKinstr('');
                return true;
              },
            },
            { key: 'Mod-s', run: () => { doSave(); return true; }, preventDefault: true },
          ]),
          EditorView.theme({
            '&': { height: '100%', fontSize: '13px' },
            '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', padding: '10px 0' },
            '.cm-ghost': { color: '#b7b4ad', fontStyle: 'italic', opacity: .85 },
          }),
        ],
      }),
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => { clearTimeout(timerRef.current); view.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc != null, path]);

  const doSave = async () => {
    const v = viewRef.current;
    if (!v || saving) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/workspaces/${ws.id}/file`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content: v.state.doc.toString() }),
      }).then((x) => x.json());
      if (r.ok) { setDirty(false); soon('已保存'); onSaved?.(); }
      else soon(r.error || '保存失败');
    } finally { setSaving(false); }
  };

  const runK = async () => {
    if (!kinstr.trim() || kbusy) return;
    setKbusy(true);
    try {
      const r = await fetch('/api/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: kinstr.trim(), prefix: kbar.before, selected: kbar.selected, suffix: kbar.after }),
      }).then((x) => x.json());
      if (!r.ok || !r.text) return soon(r.error || '改写失败');
      setKdiff({ from: kbar.from, to: kbar.to, oldText: kbar.selected, newText: r.text });
    } finally { setKbusy(false); }
  };

  const applyK = () => {
    const v = viewRef.current;
    if (!v || !kdiff) return;
    v.dispatch({ changes: { from: kdiff.from, to: kdiff.to, insert: kdiff.newText } });
    setKbar(null); setKdiff(null); setDirty(true);
    soon('已应用行内编辑');
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(920px, 96vw)', height: '82vh', display: 'flex', flexDirection: 'column' }}>
        <div className="mh">
          <span style={{ marginLeft: 4, fontWeight: 600 }}>{path}</span>
          {dirty && <span className="badge-gray" style={{ marginLeft: 8 }}>未保存</span>}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={doSave} disabled={saving}>{saving ? '保存中…' : '保存 ⌘S'}</button>
            <button className="iconbtn x" onClick={onClose}><IcX size={15} /></button>
          </span>
        </div>

        {kbar && (
          <div className="kbar">
            {!kdiff ? (
              <>
                <input autoFocus placeholder="输入指令改写选中内容，如：加注释 / 改成箭头函数…" value={kinstr} onChange={(e) => setKinstr(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') runK(); if (e.key === 'Escape') setKbar(null); }} />
                <button className="btn primary" disabled={kbusy || !kinstr.trim()} onClick={runK}>{kbusy ? '改写中…' : '改写 ⌘K'}</button>
                <button className="btn ghost" onClick={() => setKbar(null)}>取消</button>
              </>
            ) : (
              <>
                <div className="kdiff">
                  <div className="old">{kdiff.oldText.slice(0, 400)}</div>
                  <div className="new">{kdiff.newText.slice(0, 400)}</div>
                </div>
                <button className="btn primary" onClick={applyK}><IcCheck size={13} /> 接受</button>
                <button className="btn ghost" onClick={() => setKdiff(null)}>重新生成</button>
                <button className="btn ghost" onClick={() => setKbar(null)}>放弃</button>
              </>
            )}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderBottom: '1px solid var(--border)' }} ref={hostRef} />
        <div className="mf" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
          <span>Tab 接受补全 · ⌘K 行内编辑 · ⌘S 保存</span>
          <span>此文件已自动加入任务 @file 上下文</span>
        </div>
        {err && <div className="empty" style={{ padding: 18 }}>{err}</div>}
        {toast && <div className="toast-pill">{toast}</div>}
      </div>
    </div>
  );
}
