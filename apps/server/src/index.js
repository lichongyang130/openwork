import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, save, getDB, getTask, addTask, removeTask, appendEvent, updateTask, subscribe, DATA_DIR } from './store.js';
import { runTask, followUp, resolveApproval, audit } from './agent.js';
import { resolveRelay, getPendingRelays } from './llm.js';
import { chatCompletion } from './llm.js';
import { listTree, readFile, writeFile, guardPath } from './tools.js';
import { uid, now, mimeOf } from './util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIST = path.resolve(__dirname, '../../web/dist');

load();

// recover tasks stuck from previous process life
for (const t of getDB().tasks) {
  if (['running', 'planning', 'waiting'].includes(t.status)) {
    updateTask(t.id, { status: 'failed' });
    appendEvent(t.id, 'error', { message: '服务重启，任务已中断，可追问继续' });
  }
}

const app = express();
app.use(express.json({ limit: '4mb' }));

/* ---------------- api ---------------- */

app.get('/api/health', (req, res) => res.json({ ok: true, ts: now() }));

app.get('/api/state', (req, res) => {
  const db = getDB();
  res.json({
    tasks: db.tasks.map(({ events, ...t }) => t),
    workspaces: db.workspaces,
    skills: db.skills,
    experts: db.experts,
    connectors: db.connectors,
    automations: db.automations,
    settings: { ...db.settings, models: db.settings.models.map(({ apiKey, ...m }) => ({ ...m, hasKey: !!apiKey })) },
  });
});

app.post('/api/tasks', (req, res) => {
  const { prompt, mode = 'craft', workspaceId, skillIds = [], modelId, refFiles = [] } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: '任务描述不能为空' });
  const db = getDB();
  const ws = db.workspaces.find((w) => w.id === workspaceId) || db.workspaces[0];
  // @file 上下文：把编辑器打开过的文件内容附进任务
  let userContent = prompt.trim();
  const refs = [];
  for (const rel of (refFiles || []).slice(0, 3)) {
    try {
      const f = readFile(ws.root, rel);
      if (!f.binary) refs.push(`【@${rel}】\n${f.text.slice(0, 4000)}`);
    } catch { /* 读不到就跳过 */ }
  }
  if (refs.length) userContent += '\n\n以下是用户 @ 引用的工作区文件，请优先基于它们工作：\n' + refs.join('\n\n');
  audit('task', `新建任务：${prompt.trim().slice(0, 60)}`);
  const task = {
    id: uid('task-'),
    title: prompt.trim().slice(0, 26) + (prompt.trim().length > 26 ? '…' : ''),
    prompt: prompt.trim(),
    mode,
    workspaceId: ws.id,
    skillIds,
    modelId: modelId || null,
    status: 'planning',
    createdAt: now(),
    updatedAt: now(),
    events: [],
    artifacts: [],
    stopped: false,
    history: [{ role: 'user', content: userContent }],
  };
  addTask(task);
  appendEvent(task.id, 'user_message', { text: task.prompt });
  res.json(task);
  runTask(task.id);
});

app.get('/api/tasks/:id', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  res.json(t);
});

app.delete('/api/tasks/:id', (req, res) => {
  removeTask(req.params.id);
  res.json({ ok: true });
});

app.post('/api/tasks/:id/pin', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  t.pinned = !t.pinned;
  save();
  res.json({ ok: true, pinned: t.pinned });
});

app.post('/api/tasks/:id/archive', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  t.archived = !t.archived;
  save();
  res.json({ ok: true, archived: t.archived });
});

app.post('/api/tasks/:id/rename', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const title = String(req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: '名称不能为空' });
  t.title = title.slice(0, 60);
  save();
  res.json({ ok: true });
});

app.post('/api/tasks/:id/messages', (req, res) => {
  const { text } = req.body;
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  if (['running', 'planning', 'waiting'].includes(t.status)) return res.status(409).json({ error: '任务进行中，请先停止' });
  appendEvent(t.id, 'user_message', { text });
  res.json({ ok: true });
  followUp(t.id, text);
});

app.post('/api/tasks/:id/stop', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  updateTask(t.id, { stopped: true });
  for (const ev of t.events) {
    if (ev.kind === 'approval' && ev.payload.status === 'pending') resolveApproval(t.id, ev.payload.approvalId, false);
  }
  if (!['running', 'planning', 'waiting'].includes(t.status)) updateTask(t.id, { stopped: false });
  res.json({ ok: true });
});

app.get('/api/tasks/:id/events', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).end();
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  const after = Number(req.query.after || 0);
  for (const ev of t.events.filter((e) => e.seq > after)) res.write(`data: ${JSON.stringify(ev)}\n\n`);
  for (const r of getPendingRelays(t.id)) res.write(`data: ${JSON.stringify({ id: 'live-' + r.relayId, seq: 0, ts: Date.now(), kind: 'llm_relay', payload: r })}\n\n`);
  const off = subscribe(t.id, res);
  const hb = setInterval(() => res.write(': hb\n\n'), 15000);
  req.on('close', () => { clearInterval(hb); off(); });
});

app.post('/api/tasks/:id/approvals/:aid', (req, res) => {
  res.json(resolveApproval(req.params.id, req.params.aid, !!req.body.approve));
});

app.get('/api/workspaces/:id/files', (req, res) => {
  const ws = getDB().workspaces.find((w) => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: 'not found' });
  res.json(listTree(ws.root));
});

app.post('/api/workspaces', (req, res) => {
  const { name, root } = req.body;
  if (!name || !root) return res.status(400).json({ error: 'name / root required' });
  const abs = path.resolve(root);
  fs.mkdirSync(abs, { recursive: true });
  const ws = { id: uid('ws-'), name, root: abs, createdAt: now() };
  getDB().workspaces.push(ws);
  save();
  res.json(ws);
});

app.get('/api/artifacts/:taskId/:artId/raw', (req, res) => {
  const t = getTask(req.params.taskId);
  const a = t?.artifacts?.find((x) => x.id === req.params.artId);
  if (!a) return res.status(404).json({ error: 'not found' });
  const ws = getDB().workspaces.find((w) => w.id === t.workspaceId);
  const abs = guardPath(ws.root, a.rel);
  res.setHeader('Content-Type', mimeOf(a.name));
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(a.name)}`);
  fs.createReadStream(abs).pipe(res);
});

app.get('/api/artifacts/:taskId/:artId/text', (req, res) => {
  const t = getTask(req.params.taskId);
  const a = t?.artifacts?.find((x) => x.id === req.params.artId);
  if (!a) return res.status(404).json({ error: 'not found' });
  const ws = getDB().workspaces.find((w) => w.id === t.workspaceId);
  try {
    const r = readFile(ws.root, a.rel, 20000);
    res.json(r);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/settings', (req, res) => {
  const db = getDB();
  const { models, activeModelId, risk, prefs } = req.body;
  if (Array.isArray(models)) {
    for (const m of models) {
      const cur = db.settings.models.find((x) => x.id === m.id);
      if (cur) Object.assign(cur, { apiKey: m.apiKey ?? cur.apiKey, baseUrl: m.baseUrl ?? cur.baseUrl, modelName: m.modelName ?? cur.modelName });
      else db.settings.models.push({ id: m.id, provider: m.provider || 'Custom', name: m.name || m.id, baseUrl: m.baseUrl || '', apiKey: m.apiKey || '' });
    }
  }
  if (activeModelId) db.settings.activeModelId = activeModelId;
  if (risk) db.settings.risk = { ...db.settings.risk, ...risk };
  if (prefs) db.settings.prefs = { ...db.settings.prefs, ...prefs };
  save();
  res.json({ ok: true });
});

app.post('/api/models/test', async (req, res) => {
  const { baseUrl, apiKey } = req.body || {};
  if (!baseUrl) return res.json({ ok: false, error: '请填写接口地址' });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${String(baseUrl).replace(/\/$/, '')}/models`, {
      headers: { Authorization: `Bearer ${apiKey || ''}` },
      signal: ctrl.signal,
    });
    if (!r.ok) return res.json({ ok: false, error: `接口返回 HTTP ${r.status}` });
    const data = await r.json().catch(() => ({}));
    const list = Array.isArray(data?.data) ? data.data.map((m) => m && m.id).filter(Boolean) : [];
    res.json({ ok: true, models: list });
  } catch (e) {
    res.json({ ok: false, error: '网络错误或接口地址不可达' });
  } finally { clearTimeout(t); }
});

app.post('/api/relay/:id', (req, res) => {
  const ok = resolveRelay(req.params.id, req.body || {});
  res.json(ok ? { ok: true } : { ok: false, error: 'relay not found' });
});

app.delete('/api/models/:id', (req, res) => {
  const db = getDB();
  const i = db.settings.models.findIndex((m) => m.id === req.params.id);
  if (i < 0 || db.settings.models[i].builtin) return res.status(404).json({ error: 'not found' });
  const [rm] = db.settings.models.splice(i, 1);
  if (db.settings.activeModelId === req.params.id) db.settings.activeModelId = 'offline';
  save();
  res.json({ ok: true, removed: rm.name });
});

app.post('/api/skills/:id/toggle', (req, res) => {
  const s = getDB().skills.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  s.enabled = !s.enabled;
  save();
  res.json(s);
});

app.post('/api/skills/:id/install', (req, res) => {
  const s = getDB().skills.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  s.enabled = true;
  s.installed = true;
  save();
  res.json(s);
});

app.post('/api/skills', (req, res) => {
  const { name, desc, mcp } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: '请填写技能名称' });
  const s = { id: uid('sk-'), name: name.trim(), desc: desc || '', mcp: mcp || '', enabled: true, custom: true, createdAt: now() };
  getDB().skills.push(s);
  save();
  res.json(s);
});

app.delete('/api/skills/:id', (req, res) => {
  const db = getDB();
  db.skills = db.skills.filter((s) => s.id !== req.params.id);
  save();
  res.json({ ok: true });
});

app.post('/api/automations', (req, res) => {
  const { name, prompt, workspaceId, schedule } = req.body;
  const a = { id: uid('auto-'), name, prompt, workspaceId, schedule, enabled: true, createdAt: now(), lastRun: null };
  getDB().automations.push(a);
  save();
  res.json(a);
});

app.post('/api/automations/:id/toggle', (req, res) => {
  const a = getDB().automations.find((x) => x.id === req.params.id);
  if (a) { a.enabled = !a.enabled; save(); }
  res.json(a);
});

app.delete('/api/automations/:id', (req, res) => {
  const db = getDB();
  db.automations = db.automations.filter((a) => a.id !== req.params.id);
  save();
  res.json({ ok: true });
});

app.post('/api/automations/:id/run', (req, res) => {
  const a = getDB().automations.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'not found' });
  const task = {
    id: uid('task-'), title: `⏰ ${a.name}`, prompt: a.prompt, mode: 'craft',
    workspaceId: a.workspaceId, skillIds: [], status: 'planning', createdAt: now(), updatedAt: now(),
    events: [], artifacts: [], automationId: a.id,
    history: [{ role: 'user', content: a.prompt }],
  };
  addTask(task);
  appendEvent(task.id, 'user_message', { text: `（定时任务 ${a.name}）${a.prompt}` });
  a.lastRun = now();
  save();
  runTask(task.id);
  res.json(task);
});

/* ---------------- cache stats / cleanup ---------------- */

const DB_FILE = path.join(DATA_DIR, 'db.json');
app.get('/api/cache/stats', (req, res) => {
  let bytes = 0;
  try { bytes = fs.statSync(DB_FILE).size; } catch { /* ignore */ }
  const db = getDB();
  const events = db.tasks.reduce((n, t) => n + (t.events?.length || 0), 0);
  res.json({ bytes, events, tasks: db.tasks.length });
});

app.post('/api/cache/clear', (req, res) => {
  const db = getDB();
  let trimmed = 0;
  for (const t of db.tasks) {
    if ((t.status === 'done' || t.status === 'failed') && (t.events?.length || 0) > 30) {
      trimmed += t.events.length - 30;
      t.events = t.events.slice(-30);
    }
  }
  save();
  res.json({ ok: true, trimmed });
});

/* ---------------- upload file into workspace ---------------- */

app.post('/api/workspaces/:id/upload', (req, res) => {
  const ws = getDB().workspaces.find((w) => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: '工作区不存在' });
  const { name, base64, text } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: '缺少文件名' });
  try {
    writeFile(ws.root, path.posix.join('uploads', name), base64 ? Buffer.from(base64, 'base64') : String(text ?? ''));
    res.json({ ok: true, rel: path.posix.join('uploads', name) });
  } catch (e) {
    res.status(500).json({ error: '上传失败：' + e.message });
  }
});

/* ---------------- 编辑器：读取 / 写回工作区任意文件 ---------------- */

app.get('/api/workspaces/:id/file', (req, res) => {
  const ws = getDB().workspaces.find((w) => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: '工作区不存在' });
  try {
    const f = readFile(ws.root, req.query.path || '');
    res.json({ ok: true, ...f });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/workspaces/:id/file', (req, res) => {
  const ws = getDB().workspaces.find((w) => w.id === req.params.id);
  if (!ws) return res.status(404).json({ error: '工作区不存在' });
  const { path: rel, content } = req.body || {};
  if (!rel || typeof content !== 'string') return res.status(400).json({ error: '缺少路径或内容' });
  try {
    const w = writeFile(ws.root, rel, content);
    res.json({ ok: true, size: w.size });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ---------------- Tab 补全 / ⌘K 行内编辑 ---------------- */

app.post('/api/complete', async (req, res) => {
  const { prefix = '', suffix = '', selected = '', instruction } = req.body || {};
  const db = getDB();
  const cfg = db.settings.models.find((m) => m.id === db.settings.activeModelId);
  if (!cfg?.apiKey) return res.status(400).json({ error: '未配置模型，无法补全' });
  try {
    let messages;
    if (instruction) {
      messages = [
        { role: 'system', content: '你是代码编辑器。按指令改写用户选中的代码，只输出改写后的完整代码，不要解释、不要 markdown 围栏。' },
        { role: 'user', content: `指令：${instruction}\n\n选中代码上下文（前）：\n${prefix.slice(-1500)}\n\n选中代码：\n${selected.slice(0, 3000)}\n\n选中代码上下文（后）：\n${suffix.slice(0, 800)}` },
      ];
    } else {
      messages = [
        { role: 'system', content: '你是代码补全引擎。根据前后文续写光标处的代码，只输出要插入的代码片段（通常 1-8 行），不要解释、不要围栏、不要重复已有代码。' },
        { role: 'user', content: `光标前：\n${prefix.slice(-2000)}\n\n光标后：\n${suffix.slice(0, 800)}` },
      ];
    }
    const msg = await chatCompletion(cfg, { messages, temperature: 0.2 }, {});
    let text = (msg?.content || '').trim();
    text = text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- 技能沉淀（任务 → 技能模板） ---------------- */

app.post('/api/skills/from-task/:id', (req, res) => {
  const t = getTask(req.params.id);
  if (!t) return res.status(404).json({ error: '任务不存在' });
  const s = {
    id: uid('sk-'),
    name: t.title?.slice(0, 24) || '沉淀技能',
    desc: (t.prompt || '').slice(0, 120),
    prompt: t.prompt,
    fromTask: t.id,
    enabled: true,
    custom: true,
    createdAt: now(),
  };
  getDB().skills.push(s);
  save();
  res.json(s);
});

/* ---------------- 审计日志 ---------------- */

app.get('/api/audit', (req, res) => res.json(getDB().audit || []));

/* ---------------- static web ---------------- */

app.use(express.static(WEB_DIST));
app.get('*', (req, res) => {
  const f = path.join(WEB_DIST, 'index.html');
  if (fs.existsSync(f)) res.sendFile(f);
  else res.status(503).send('web not built');
});

/* ---------------- scheduler ---------------- */

function dueNext(schedule, from) {
  const [hh, mm] = (schedule.time || '08:00').split(':').map(Number);
  const d = new Date(from);
  d.setHours(hh, mm, 0, 0);
  if (schedule.type === 'weekly') {
    const day = schedule.day ?? 1;
    while (d.getDay() !== day) d.setDate(d.getDate() + 1);
  }
  if (d <= from) d.setDate(d.getDate() + (schedule.type === 'weekly' ? 7 : 1));
  return d;
}

setInterval(() => {
  const db = getDB();
  const nowD = new Date();
  for (const a of db.automations) {
    if (!a.enabled) continue;
    const next = dueNext(a.schedule, a.lastRun ? new Date(a.lastRun) : new Date(0));
    if (nowD >= next) {
      a.lastRun = nowD.toISOString();
      save();
      fetch(`http://127.0.0.1:${PORT}/api/automations/${a.id}/run`, { method: 'POST' }).catch(() => {});
    }
  }
}, 30_000);

/* ---------------- start ---------------- */

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[openwork] server ready on :${PORT}`);
});
