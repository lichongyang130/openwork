import fs from 'node:fs';
import path from 'node:path';
import { extOf, fmtBytes } from './util.js';

/** PathGuard: resolve any user/tool path inside the authorized workspace root. */
export function guardPath(root, rel) {
  const abs = path.resolve(root, rel || '');
  const real = fs.existsSync(abs) ? fs.realpathSync(abs) : abs;
  const realRoot = fs.realpathSync(root);
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
    throw new Error(`安全拦截：路径越权（${rel} 不在授权工作区内）`);
  }
  return abs;
}

export function listDir(root, rel = '') {
  const abs = guardPath(root, rel);
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  return entries
    .map((e) => {
      const p = path.join(abs, e.name);
      const st = e.isDirectory() ? null : fs.statSync(p);
      return {
        name: e.name,
        isDir: e.isDirectory(),
        size: st ? st.size : 0,
        path: path.relative(root, p),
      };
    })
    .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));
}

export function listTree(root, rel = '', depth = 0, out = []) {
  if (depth > 4) return out;
  for (const e of listDir(root, rel)) {
    out.push(e);
    if (e.isDir && e.name !== 'node_modules') listTree(root, e.path, depth + 1, out);
  }
  return out;
}

export function readFile(root, rel, maxChars = 6000) {
  const abs = guardPath(root, rel);
  const st = fs.statSync(abs);
  if (st.size > 2 * 1024 * 1024) throw new Error('文件过大，已跳过读取');
  const buf = fs.readFileSync(abs);
  const ext = extOf(abs).toLowerCase();
  if (buf.slice(0, 512).includes(0) && ext !== 'pdf') {
    return { binary: true, size: st.size, text: `（二进制文件 ${fmtBytes(st.size)}）` };
  }
  const text = buf.toString('utf8');
  return { binary: false, size: st.size, text: text.slice(0, maxChars), truncated: text.length > maxChars };
}

export async function readFileAsync(root, rel, maxChars = 6000) {
  const abs = guardPath(root, rel);
  const st = fs.statSync(abs);
  const ext = extOf(abs).toLowerCase();
  if (ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(fs.readFileSync(abs));
      const pages = data.numpages;
      const text = data.text.slice(0, maxChars);
      return { binary: false, size: st.size, text, pages, truncated: data.text.length > maxChars, realPdf: true };
    } catch (e) {
      return { binary: true, size: st.size, text: `PDF读取失败: ${e.message}`, realPdf: false };
    }
  }
  return readFile(root, rel, maxChars);
}

export function writeFile(root, rel, content) {
  const abs = guardPath(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (Buffer.isBuffer(content)) fs.writeFileSync(abs, content);
  else fs.writeFileSync(abs, content);
  return { path: rel, size: Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content) };
}

export function mkdir(root, rel) {
  const abs = guardPath(root, rel);
  fs.mkdirSync(abs, { recursive: true });
  return { path: rel };
}

export function moveFile(root, from, to) {
  const a = guardPath(root, from);
  let b = guardPath(root, to);
  if (fs.existsSync(b) && fs.statSync(b).isDirectory()) b = path.join(b, path.basename(a));
  if (fs.existsSync(b)) {
    const err = new Error('TARGET_EXISTS');
    err.code = 'TARGET_EXISTS';
    err.existing = b;
    throw err;
  }
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.renameSync(a, b);
  return { from, to: path.relative(root, b) };
}

export function deleteFile(root, rel) {
  const abs = guardPath(root, rel);
  fs.rmSync(abs, { recursive: false, force: true });
  return { path: rel };
}

export function statWorkspace(root) {
  const entries = listTree(root).filter((e) => !e.isDir && !e.path.startsWith('openwork-output'));
  const byType = {};
  let total = 0;
  for (const e of entries) {
    const k = extOf(e.name) || '(无扩展名)';
    byType[k] = (byType[k] || 0) + 1;
    total += e.size;
  }
  return { files: entries.length, totalSize: total, byType, entries };
}

export const OUTPUT_DIR = 'openwork-output';

/* ---------------- 可回滚快照（P0省心） ---------------- */

export function createSnapshot(root) {
  const entries = listTree(root).filter(e => !e.isDir && !e.path.startsWith(OUTPUT_DIR) && !e.path.startsWith('.openwork/snapshots'));
  const snapId = Date.now().toString(36);
  const snapDir = path.join(root, '.openwork', 'snapshots', snapId);
  fs.mkdirSync(snapDir, { recursive: true });
  const manifest = [];
  for (const e of entries.slice(0, 200)) {
    try {
      const abs = guardPath(root, e.path);
      const rel = e.path;
      const dest = path.join(snapDir, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(abs, dest);
      manifest.push(rel);
    } catch {}
  }
  fs.writeFileSync(path.join(snapDir, 'manifest.json'), JSON.stringify({ id: snapId, files: manifest, ts: new Date().toISOString() }, null, 2));
  return { id: snapId, files: manifest.length };
}

export function listSnapshots(root) {
  const dir = path.join(root, '.openwork', 'snapshots');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map(id => {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(dir, id, 'manifest.json'), 'utf8'));
      return m;
    } catch { return { id, files: [] }; }
  }).sort((a,b)=> b.id.localeCompare(a.id));
}

export function rollbackSnapshot(root, snapId) {
  const snapDir = path.join(root, '.openwork', 'snapshots', snapId);
  if (!fs.existsSync(snapDir)) throw new Error('快照不存在');
  const manifest = JSON.parse(fs.readFileSync(path.join(snapDir, 'manifest.json'), 'utf8'));
  let restored = 0;
  for (const rel of manifest.files) {
    try {
      const src = path.join(snapDir, rel);
      const dest = guardPath(root, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      restored++;
    } catch {}
  }
  return { restored, total: manifest.files.length };
}

/* ---------------- 拖拽文件上下文增强（P0） 100页报告逐份提取 ---------------- */

export function extractFileContext(root, rel) {
  try {
    const f = readFile(root, rel, 4000);
    if (f.binary) return `${rel} (二进制 ${fmtBytes(f.size)})`;
    return `【${rel}】\n${f.text.slice(0, 2000)}`;
  } catch (e) {
    return `${rel} (读取失败: ${e.message})`;
  }
}

export async function extractFileContextAsync(root, rel) {
  try {
    const f = await readFileAsync(root, rel, 4000);
    if (f.binary && !f.realPdf) return `${rel} (二进制 ${fmtBytes(f.size)})`;
    if (f.realPdf) return `【${rel}】(${f.pages}页PDF 真实提取)\n${f.text.slice(0, 2000)}`;
    return `【${rel}】\n${f.text.slice(0, 2000)}`;
  } catch (e) {
    return `${rel} (读取失败: ${e.message})`;
  }
}

export async function extractMultiFileContext(root, rels) {
  const results = [];
  for (const rel of rels.slice(0, 10)) {
    const ctx = await extractFileContextAsync(root, rel);
    results.push(ctx);
  }
  return results.join('\n\n---\n\n');
}
