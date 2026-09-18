import React from 'react';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

/** 轻量 Markdown 渲染（标题 / 列表 / 粗体 / 代码 / 引用） */
export function Md({ text = '' }) {
  const lines = text.split('\n');
  const out = [];
  let list = null; // 'ul' | 'ol'
  let code = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const ln of lines) {
    if (code != null) {
      if (ln.trim().startsWith('```')) { out.push(`</code></pre>`); code = null; }
      else code.push(esc(ln));
      continue;
    }
    if (ln.trim().startsWith('```')) { closeList(); code = []; out.push('<pre><code>'); continue; }
    const h = ln.match(/^(#{1,3})\s+(.*)/);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    if (/^>\s?/.test(ln)) { closeList(); out.push(`<blockquote>${inline(ln.replace(/^>\s?/, ''))}</blockquote>`); continue; }
    const ul = ln.match(/^\s*[-*]\s+(.*)/);
    if (ul) { if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(ul[1])}</li>`); continue; }
    const ol = ln.match(/^\s*\d+[.、]\s*(.*)/);
    if (ol) { if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(ol[1])}</li>`); continue; }
    if (!ln.trim()) { closeList(); continue; }
    closeList();
    out.push(`<p>${inline(ln)}</p>`);
  }
  closeList();
  if (code != null) out.push('</code></pre>');
  return <div className="md" dangerouslySetInnerHTML={{ __html: out.join('') }} />;
}
