/**
 * SQLite 真实库封装 + JSON fallback
 * 优先使用 better-sqlite3，若未安装则用 JSON 文件模拟，保证零配置可用
 */
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './store.js';

const DB_PATH = path.join(DATA_DIR, 'openwork.db');
const JSON_PATH = path.join(DATA_DIR, 'db.json');

let sqlite = null;
let useSqlite = false;

try {
  const { default: Database } = await import('better-sqlite3');
  sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  useSqlite = true;
  console.log('[sqlite] better-sqlite3 已启用', DB_PATH);
} catch (e) {
  console.log('[sqlite] better-sqlite3 未安装，使用 JSON 存储（可 npm i better-sqlite3 升级）');
}

export function isSqlite() { return useSqlite; }

export function migrateFromJson() {
  if (!useSqlite) return { ok: false, reason: 'sqlite not available' };
  if (!fs.existsSync(JSON_PATH)) return { ok: false, reason: 'json not found' };
  try {
    const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS genes (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
    `);
    const insTask = sqlite.prepare('INSERT OR REPLACE INTO tasks (id, data) VALUES (?, ?)');
    for (const t of json.tasks || []) insTask.run(t.id, JSON.stringify(t));
    const insGene = sqlite.prepare('INSERT OR REPLACE INTO genes (id, data) VALUES (?, ?)');
    for (const g of json.genes || []) insGene.run(g.id, JSON.stringify(g));
    return { ok: true, tasks: json.tasks?.length||0, genes: json.genes?.length||0 };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function sqliteStats() {
  if (!useSqlite) {
    try { return { mode: 'json', size: fs.statSync(JSON_PATH).size, path: JSON_PATH }; } catch { return { mode: 'json', size: 0 }; }
  }
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS genes (id TEXT PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
    `);
    const size = fs.statSync(DB_PATH).size;
    const tasks = sqlite.prepare('SELECT COUNT(*) as c FROM tasks').get()?.c||0;
    const genes = sqlite.prepare('SELECT COUNT(*) as c FROM genes').get()?.c||0;
    return { mode: 'sqlite', size, path: DB_PATH, tasks, genes };
  } catch (e) { return { mode: 'sqlite', error: e.message }; }
}
