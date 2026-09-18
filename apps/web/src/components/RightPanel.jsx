import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { FileBadge } from './EventCard.jsx';
import EditorModal from './EditorModal.jsx';
import { fmtBytes } from '../util.js';
import { IcFolder, IcFile, IcEye, IcDown, IcCheck, IcRefresh, IcEdit } from '../icons.jsx';

const TEXT_EXT = new Set(['md', 'txt', 'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss', 'html', 'py', 'java', 'go', 'sh', 'sql', 'yml', 'yaml', 'xml', 'csv', 'vue', 'svelte', 'c', 'cpp', 'h']);
const isText = (name) => TEXT_EXT.has((name.split('.').pop() || '').toLowerCase());

export default function RightPanel({ task }) {
  const [tab, setTab] = useState('artifacts');
  const [files, setFiles] = useState(null);
  const [onPreview, setOnPreview] = useState(null);
  const [editPath, setEditPath] = useState(null);

  const ws = task._ws;
  useEffect(() => {
    if (tab === 'files' && ws) api.wsFiles(ws.id).then(setFiles).catch(() => setFiles([]));
  }, [tab, ws?.id, task.events.length]);

  const changes = (task.events || []).filter((e) => e.kind === 'tool' && e.payload.status !== 'running' && /移动|删除|创建|写入|删除文件/.test(e.payload.label || ''));

  return (
    <aside className="panel">
      <div className="panel-tabs">
        <button className={tab === 'artifacts' ? 'on' : ''} onClick={() => setTab('artifacts')}>产物 {task.artifacts?.length || ''}</button>
        <button className={tab === 'files' ? 'on' : ''} onClick={() => setTab('files')}>工作空间文件</button>
        <button className={tab === 'changes' ? 'on' : ''} onClick={() => setTab('changes')}>变更记录</button>
      </div>
      <div className="panel-body">
        {tab === 'artifacts' && (
          <>
            {(task.artifacts || []).length === 0 && <div className="empty">暂无产物<br />任务完成后交付文件会出现在这里</div>}
            {(task.artifacts || []).map((a) => (
              <div className="art-card" key={a.id}>
                <FileBadge name={a.name} />
                <div style={{ minWidth: 0 }}>
                  <div className="nm">{a.name}</div>
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

        {tab === 'files' && (
          <>
            {files === null && <div className="empty">加载中…</div>}
            {files && files.length === 0 && <div className="empty">空工作区</div>}
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
      </div>
      {onPreview && <PreviewInner task={task} artifact={onPreview} onClose={() => setOnPreview(null)} />}
      {editPath && ws && <EditorModal ws={ws} path={editPath} onClose={() => setEditPath(null)} onSaved={() => tab === 'files' && setFiles(null)} />}
    </aside>
  );
}

export function PreviewInner({ task, artifact, onClose }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const ext = (artifact.name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) setData({ img: true });
    else api.artText(task.id, artifact.id).then(setData).catch((e) => setData({ error: e.message }));
  }, [artifact.id]);

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(760px, 94vw)' }}>
        <div className="mh">
          <FileBadge name={artifact.name} /> <span style={{ marginLeft: 10 }}>{artifact.name}</span>
          <button className="iconbtn x" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          {data?.img ? (
            <img src={api.artRaw(task.id, artifact.id)} alt={artifact.name} style={{ maxWidth: '100%', borderRadius: 10 }} />
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
