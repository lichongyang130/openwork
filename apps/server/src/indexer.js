import fs from 'node:fs';
import path from 'node:path';
import * as T from './tools.js';

/**
 * 代码库索引（对齐码道 Codebase 能力）：
 * - 文件分块 + BM25 关键词索引，持久化到 data/index-<wsKey>.json
 * - mtime 增量更新，无需向量库
 * - 提供 search(query) 与 structureSummary() 两个入口
 */
const DATA_DIR = path.resolve(new URL('.', import.meta.url).pathname, '../../../data');
const MAX_FILE = 512 * 1024;
const CHUNK_LINES = 60;
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.venv', '__pycache__']);
const TEXT_EXT = new Set(['.md', '.txt', '.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json', '.py', '.java', '.go', '.sh', '.sql', '.yml', '.yaml', '.xml', '.csv', '.toml', '.c', '.cpp', '.h', '.rs', '.php', '.rb', '.vue', '.svelte']);

const indexes = new Map(); // wsKey -> { docs:[{path,start,end,terms}], df:{}, N, files:{path:mtime}, builtAt }

const tokenize = (s) => {
  const out = [];
  const runs = String(s).toLowerCase().match(/[a-z0-9_$]+|[\u4e00-\u9fa5]+/g) || [];
  for (const t of runs) {
    if (/^[\u4e00-\u9fa5]+$/.test(t)) {
      // 中文二元分词，保证「规范」能命中「开发规范」
      if (t.length === 1) out.push(t);
      else {
        for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
        out.push(t);
      }
    } else out.push(t);
  }
  return out;
};

function walk(root, rel = '', depth = 0, out = []) {
  if (depth > 6) return out;
  let entries;
  try { entries = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP_DIR.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(rel, e.name);
    if (e.isDirectory()) walk(root, p, depth + 1, out);
    else {
      try {
        const st = fs.statSync(path.join(root, p));
        if (st.size <= MAX_FILE) out.push({ path: p.replace(/\\/g, '/'), size: st.size, mtimeMs: st.mtimeMs });
      } catch { /* skip */ }
    }
  }
  return out;
}

function buildDoc(root, f) {
  let text;
  try { text = T.readFile(root, f.path, 200000).text; } catch { return null; }
  if (!text || text.startsWith('（二进制文件')) return null;
  const lines = text.split('\n');
  const chunks = [];
  for (let i = 0; i < lines.length; i += CHUNK_LINES) {
    const body = lines.slice(i, i + CHUNK_LINES).join('\n');
    const terms = tokenize(body + ' ' + f.path);
    if (terms.length) chunks.push({ path: f.path, start: i + 1, end: Math.min(lines.length, i + CHUNK_LINES), terms });
  }
  return chunks;
}

export function getIndex(ws) {
  const key = ws.id;
  const idx = indexes.get(key) || { docs: [], df: {}, N: 0, files: {}, builtAt: 0 };
  const files = walk(ws.root);
  const changed = files.filter((f) => idx.files[f.path] !== f.mtimeMs || !TEXT_EXT.has(path.extname(f.path).toLowerCase()));
  const removed = Object.keys(idx.files).filter((p) => !files.find((f) => f.path === p));
  if (!changed.length && !removed.length && idx.N) return idx; // 已最新

  // 增量重建：简单起见，任何变更都整体重建（本地工作区规模下足够快）
  const docs = [];
  const df = {};
  const fileMap = {};
  for (const f of files) {
    if (!TEXT_EXT.has(path.extname(f.path).toLowerCase())) { fileMap[f.path] = f.mtimeMs; continue; }
    const chunks = buildDoc(ws.root, f);
    if (!chunks) { fileMap[f.path] = f.mtimeMs; continue; }
    docs.push(...chunks);
    fileMap[f.path] = f.mtimeMs;
  }
  for (const d of docs) for (const t of new Set(d.terms)) df[t] = (df[t] || 0) + 1;
  const fresh = { docs, df, N: docs.length, files: fileMap, builtAt: Date.now() };
  indexes.set(key, fresh);
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, `index-${key}.json`), JSON.stringify({ builtAt: fresh.builtAt, files: fileMap }));
  } catch { /* 持久化失败不影响运行 */ }
  return fresh;
}

export function search(ws, query, limit = 12) {
  const idx = getIndex(ws);
  if (!idx.N) return [];
  const q = tokenize(query);
  if (!q.length) return [];
  const avgLen = idx.docs.reduce((n, d) => n + d.terms.length, 0) / idx.N;
  const scored = idx.docs.map((d) => {
    let score = 0;
    const tf = {};
    for (const t of d.terms) tf[t] = (tf[t] || 0) + 1;
    for (const qt of q) {
      const f = tf[qt] || 0;
      if (!f) continue;
      const idf = Math.log(1 + (idx.N - (idx.df[qt] || 0) + 0.5) / ((idx.df[qt] || 0) + 0.5));
      score += idf * ((f * 2.2) / (f + 1.2 * (1 - 0.25 + 0.25 * (d.terms.length / avgLen))));
    }
    return { path: d.path, start: d.start, end: d.end, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  // 同文件只保留最高分块
  const seen = new Set();
  const out = [];
  for (const s of scored) {
    if (seen.has(s.path)) continue;
    seen.add(s.path);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

export function structureSummary(ws, maxFiles = 40) {
  const idx = getIndex(ws);
  const files = Object.keys(idx.files);
  if (!files.length) return '（工作区为空）';
  const dirs = new Set();
  files.forEach((f) => { const d = path.posix.dirname(f); if (d !== '.') dirs.add(d); });
  const lines = [`共 ${files.length} 个文件、${[...dirs].length} 个目录`];
  if (dirs.size) lines.push('目录：' + [...dirs].slice(0, 15).join('、'));
  lines.push('文件：' + files.slice(0, maxFiles).join('、'));
  return lines.join('\n');
}
