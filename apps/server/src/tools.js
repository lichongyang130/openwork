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
  // binary check
  if (buf.slice(0, 512).includes(0)) {
    return { binary: true, size: st.size, text: `（二进制文件 ${fmtBytes(st.size)}）` };
  }
  const text = buf.toString('utf8');
  return { binary: false, size: st.size, text: text.slice(0, maxChars), truncated: text.length > maxChars };
}

export function writeFile(root, rel, content) {
  const abs = guardPath(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  return { path: rel, size: Buffer.byteLength(content) };
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
