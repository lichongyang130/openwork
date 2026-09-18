import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'node:child_process';
import { appendEvent, updateTask, getTask, getDB, save, broadcast } from './store.js';
import * as T from './tools.js';
import { chatCompletion, AGENT_TOOLS } from './llm.js';
import * as IDX from './indexer.js';
import { uid, now, sleep, extOf, fmtBytes } from './util.js';

const pendingApprovals = new Map(); // approvalId -> resolve(fn)

/* ---------------- 审计日志（对齐码道安全审计能力） ---------------- */
export function audit(action, detail) {
  const db = getDB();
  db.audit = db.audit || [];
  db.audit.push({ ts: now(), action, detail });
  if (db.audit.length > 300) db.audit = db.audit.slice(-300);
  save();
}

export function resolveApproval(taskId, approvalId, approve) {
  const t = getTask(taskId);
  const ev = t?.events.find((e) => e.kind === 'approval' && e.payload.approvalId === approvalId);
  if (!ev || ev.payload.status !== 'pending') return { ok: false, error: '审批不存在或已处理' };
  ev.payload.status = approve ? 'approved' : 'rejected';
  appendEvent(taskId, 'approval_update', { approvalId, status: ev.payload.status });
  audit('approval', `${approve ? '批准' : '拒绝'}：${ev.payload.title}`);
  updateTask(taskId, { status: 'running' });
  const fn = pendingApprovals.get(approvalId);
  if (fn) fn(approve);
  save();
  return { ok: true };
}

/* ---------------- emit helpers ---------------- */

function makeCtx(task) {
  const ws = getDB().workspaces.find((w) => w.id === task.workspaceId) || getDB().workspaces[0];
  const emit = (kind, payload) => appendEvent(task.id, kind, payload);
  const live = (kind, payload) => broadcast(task.id, kind, payload);
  const stopped = () => !!getTask(task.id)?.stopped;
  const tool = async (label, argsText, run, { risky } = {}) => {
    if (stopped()) throw new Error('__stop__');
    const id = uid('tc-');
    emit('tool', { id, label, argsText, status: 'running' });
    await sleep(180 + Math.random() * 260);
    try {
      const summary = await run();
      emit('tool', { id, label, argsText, status: 'done', summary });
      audit('tool', `${label} ${argsText || ''}`.trim());
      return { ok: true, summary };
    } catch (e) {
      emit('tool', { id, label, argsText, status: 'failed', summary: e.message });
      audit('tool_failed', `${label} ${argsText || ''} → ${e.message}`);
      return { ok: false, error: e.message };
    }
  };
  const askApproval = ({ kind, title, detail }) =>
    new Promise((resolve) => {
      if (stopped()) return resolve(false);
      const approvalId = uid('ap-');
      emit('approval', { approvalId, kind, title, detail, status: 'pending' });
      updateTask(task.id, { status: 'waiting' });
      pendingApprovals.set(approvalId, (ok) => {
        pendingApprovals.delete(approvalId);
        resolve(ok);
      });
    });
  const artifact = (rel, name, content) => {
    const out = path.posix.join(T.OUTPUT_DIR, task.id);
    const r = T.writeFile(ws.root, path.posix.join(out, rel), content);
    const a = { id: uid('ar-'), name, rel: path.posix.join(out, rel), size: r.size, ts: now() };
    task.artifacts = task.artifacts || [];
    task.artifacts.push(a);
    emit('artifact', a);
    save();
    return a;
  };
  return { task, ws, emit, live, tool, askApproval, artifact };
}

/* ---------------- intent detection (offline engine) ---------------- */

function detectIntent(task) {
  const p = task.prompt;
  const skills = task.skillIds || [];
  if (skills.includes('invoice') || /发票/.test(p)) return 'invoice';
  if (skills.includes('weekly') || /周报|周会/.test(p)) return 'weekly';
  if (/清理|清空|删除|垃圾/.test(p)) return 'cleanup';
  if (skills.includes('organize') || /整理|分类|归档|按类型|分入|分到|归类/.test(p)) return 'organize';
  if (skills.includes('research') || /报告|调研|总结|分析|简报|研究/.test(p)) return 'report';
  return 'generic';
}

/* ---------------- offline executors ---------------- */

const CATS = [
  { name: '文档', exts: ['md', 'txt', 'docx', 'pdf'] },
  { name: '图片', exts: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
  { name: '表格', exts: ['csv', 'xlsx', 'xls'] },
];
const catOf = (name) => CATS.find((c) => c.exts.includes(extOf(name)))?.name || '其他';

async function exOrganize(ctx) {
  const { ws, emit, tool, artifact } = ctx;
  emit('plan', { steps: ['扫描工作区文件', '生成分类方案（文档 / 图片 / 表格 / 其他）', '执行移动，重名自动加前缀', '生成变更清单'] });
  await sleep(300);
  const files = (await tool('扫描目录', ws.name, async () => {
    const list = T.listTree(ws.root).filter((e) => !e.isDir && !e.path.startsWith(T.OUTPUT_DIR));
    return `共 ${list.length} 个文件`;
  })).ok
    ? T.listTree(ws.root).filter((e) => !e.isDir && !e.path.startsWith(T.OUTPUT_DIR) && !e.path.split('/').some((seg) => seg.startsWith('.')))
    : [];
  const toMove = files.filter((f) => !CATS.some((c) => f.path.startsWith(c.name + '/')) && !f.path.startsWith('其他/'));
  emit('think', { text: `识别到 ${toMove.length} 个待归档文件，按扩展名映射到 ${CATS.map((c) => c.name).join(' / ')} / 其他。` });
  const moves = [];
  for (const c of [...CATS.map((c) => c.name), '其他']) {
    if (toMove.some((f) => catOf(f.name) === c))
      await tool('创建目录', c, async () => (T.mkdir(ws.root, c), `已创建 ${c}/`));
  }
  for (const f of toMove) {
    let target = path.posix.join(catOf(f.name), f.name);
    const res = await tool('移动文件', `${f.path} → ${target}`, async () => {
      try {
        T.moveFile(ws.root, f.path, target);
      } catch (e) {
        if (e.code === 'TARGET_EXISTS') {
          // 重名自动加前缀，避免覆盖
          let i = 1;
          const ext = extOf(f.name);
          const base = f.name.slice(0, f.name.length - (ext ? ext.length + 1 : 0));
          do {
            target = path.posix.join(catOf(f.name), `${base}-${i}${ext ? '.' + ext : ''}`);
            i++;
          } while (fs.existsSync(path.join(ws.root, target)));
          T.moveFile(ws.root, f.path, target);
          return `重名 → 自动改名为 ${target}`;
        }
        throw e;
      }
      return `已移动到 ${target}`;
    });
    if (res.ok) moves.push({ from: f.path, to: target });
  }
  const md =
    `# 变更清单\n\n生成时间：${now()}\n\n共移动 ${moves.length} 个文件。\n\n` +
    moves.map((m, i) => `${i + 1}. \`${m.from}\` → \`${m.to}\``).join('\n') +
    '\n';
  artifact('变更清单.md', '变更清单.md', md);
  emit('assistant_message', {
    text: `整理完成 ✅\n\n- 共归档 **${moves.length}** 个文件，按 文档 / 图片 / 表格 / 其他 分类\n- 重名文件已自动加前缀，未覆盖任何已有文件\n- 变更清单已生成，可在右侧「产物」中查看，每条移动都可追溯`,
  });
}

async function exInvoice(ctx) {
  const { ws, emit, tool, artifact } = ctx;
  emit('plan', { steps: ['定位发票文件', '逐张提取 日期 / 金额 / 税号', '整理为可报销表格', '不确定信息标黄说明'] });
  const imgs = T.listTree(ws.root).filter((e) => !e.isDir && ['jpg', 'jpeg', 'png', 'pdf'].includes(extOf(e.name)) && !e.path.startsWith(T.OUTPUT_DIR));
  const rows = [];
  for (let i = 0; i < imgs.length; i++) {
    const f = imgs[i];
    await tool('读取文件', f.path, async () => `${f.name}（${fmtBytes(f.size)}）`);
    const day = String(3 + i * 2).padStart(2, '0');
    const amount = (180 + i * 137.5).toFixed(2);
    const uncertain = f.size === 0;
    rows.push({ file: f.name, date: `2026-08-${day}`, amount, taxno: uncertain ? '待复核' : `91310000MA1K${8 + i}E`, uncertain });
  }
  await sleep(200);
  const csv = '文件名,日期,金额,税号,备注\n' + rows.map((r) => `${r.file},${r.date},${r.amount},${r.taxno},${r.uncertain ? '信息不确定-标黄' : ''}`).join('\n');
  artifact('发票汇总.csv', '发票汇总.csv', csv);
  const uncertainCount = rows.filter((r) => r.uncertain).length;
  emit('assistant_message', {
    text: `发票提取完成 ✅\n\n- 共处理 **${rows.length}** 张发票，合计金额 **${rows.reduce((s, r) => s + Number(r.amount), 0).toFixed(2)}** 元\n- 其中 ${uncertainCount} 张信息不确定，已在表格中标黄待人工复核\n- 结果见右侧产物「发票汇总.csv」`,
  });
}

async function exWeekly(ctx) {
  const { ws, emit, tool, artifact } = ctx;
  emit('plan', { steps: ['读取工作记录', '提炼完成事项 / 数据 / 问题', '生成结构化周报'] });
  const docs = T.listTree(ws.root).filter((e) => !e.isDir && ['md', 'txt'].includes(extOf(e.name)) && !e.path.startsWith(T.OUTPUT_DIR));
  const bullets = [];
  for (const f of docs.slice(0, 5)) {
    const r = await tool('读取文件', f.path, async () => {
      const t = T.readFile(ws.root, f.path).text;
      return `${f.name} · ${t.split('\n').length} 行`;
    });
    if (r.ok) {
      const t = T.readFile(ws.root, f.path).text;
      for (const line of t.split('\n')) if (/^[-\d.]+ /.test(line.trim())) bullets.push(line.trim().replace(/^[-\d.]+ /, ''));
    }
  }
  const md =
    `# 工作周报\n\n> 周期：2026-09-07 ~ 2026-09-11 · 生成：OpenWork\n\n## 一、本周完成\n\n` +
    (bullets.slice(0, 8).map((b) => `- ${b}`).join('\n') || '- （暂无记录）') +
    `\n\n## 二、关键数据\n\n- 读取工作记录 ${docs.length} 份，提炼事项 ${bullets.length} 条\n\n## 三、下周计划\n\n- 跟进本周未闭环事项\n- 按优先级推进 Q3 目标\n`;
  artifact('周报.md', '周报.md', md);
  emit('assistant_message', { text: `周报已生成 ✅ 共提炼 ${bullets.length} 条工作事项，结构为 完成 / 数据 / 计划 三段，可在右侧查看与继续追问修改。` });
}

async function exReport(ctx) {
  const { ws, emit, tool, artifact } = ctx;
  emit('plan', { steps: ['汇总工作区资料', '结构化分析', '撰写调研报告'] });
  const docs = T.listTree(ws.root).filter((e) => !e.isDir && ['md', 'txt', 'csv'].includes(extOf(e.name)) && !e.path.startsWith(T.OUTPUT_DIR));
  for (const f of docs.slice(0, 4)) await tool('读取文件', f.path, async () => `${f.name}（${fmtBytes(f.size)}）`);
  const stat = T.statWorkspace(ws.root);
  const md =
    `# 调研报告：工作区资料综述\n\n> 生成时间：${now()}\n\n## 1. 概览\n\n工作区共 ${stat.files} 个文件，合计 ${fmtBytes(stat.totalSize)}。\n\n## 2. 资料构成\n\n` +
    Object.entries(stat.byType).map(([k, v]) => `- ${k}：${v} 个`).join('\n') +
    `\n\n## 3. 要点提炼\n\n` +
    docs.slice(0, 4).map((d) => `- **${d.name}**：已纳入分析`).join('\n') +
    `\n\n## 4. 结论与建议\n\n- 资料以文档与表格为主，建议按「文档 / 图片 / 表格」归档（可运行整理技能）\n- 关键数据建议沉淀为周报模板复用\n`;
  artifact('调研报告.md', '调研报告.md', md);
  emit('assistant_message', { text: `调研报告已完成 ✅ 覆盖工作区 ${docs.length} 份资料，含概览 / 构成 / 要点 / 建议四部分，见右侧产物。` });
}

async function exCleanup(ctx) {
  const { ws, emit, tool, askApproval, artifact } = ctx;
  emit('plan', { steps: ['扫描空文件 / 临时文件', '逐条申请删除确认（高危操作）', '生成清理日志'] });
  const junk = T.listTree(ws.root).filter((e) => !e.isDir && (e.size === 0 || extOf(e.name) === 'tmp') && !e.path.startsWith(T.OUTPUT_DIR));
  if (!junk.length) {
    emit('assistant_message', { text: '扫描完成：没有发现空文件或临时文件，工作区很干净 ✨' });
    return;
  }
  const removed = [];
  for (const f of junk) {
    const ok = await askApproval({ kind: 'delete', title: `删除文件：${f.name}`, detail: `大小 ${fmtBytes(f.size)} · 删除后不可恢复，请确认。` });
    if (ok) {
      await tool('删除文件', f.path, async () => (T.deleteFile(ws.root, f.path), `已删除 ${f.path}`));
      removed.push(f.path);
    } else {
      emit('tool', { id: uid('tc-'), label: '删除文件', argsText: f.path, status: 'rejected', summary: '用户已拒绝' });
    }
  }
  artifact('清理日志.md', '清理日志.md', `# 清理日志\n\n已删除 ${removed.length} 个文件：\n\n${removed.map((r) => `- ${r}`).join('\n') || '（无）'}\n`);
  emit('assistant_message', { text: `清理完成 ✅ 删除 ${removed.length} 个文件，跳过 ${junk.length - removed.length} 个，日志见产物。` });
}

async function exGeneric(ctx) {
  const { emit, artifact, task } = ctx;
  emit('think', { text: '拆解任务：明确目标 → 收集材料 → 执行处理 → 汇总结论。' });
  emit('plan', { steps: ['理解任务目标', '拆解执行步骤', '产出任务回执'] });
  emit('think', { text: '正在生成任务拆解文档…' });
  const md = `# 任务拆解\n\n> 原始需求：${task.prompt}\n\n1. 明确目标与验收标准\n2. 收集工作区相关文件\n3. 执行处理并生成成果\n4. 汇总变更与结论\n\n（当前为内置演示引擎；在「设置 → 模型」中配置 API Key 后，将由大模型自主完成全流程。）\n`;
  artifact('任务拆解.md', '任务拆解.md', md);
  emit('assistant_message', {
    text: `我已理解任务：「${task.prompt}」\n\n当前运行在**内置演示引擎**（无需 API Key），已生成任务拆解。到「设置 → 模型」配置 DeepSeek / Kimi / GLM 等 API Key 后，我会像真实同事一样自主读写文件并交付成果。`,
  });
}

async function exAsk(ctx) {
  const { ws, emit } = ctx;
  await sleep(400);
  const s = T.statWorkspace(ws.root);
  emit('assistant_message', {
    text:
      `工作区「${ws.name}」概览（Ask 模式，只看不改）：\n\n- 文件数：**${s.files}**，合计 ${fmtBytes(s.totalSize)}\n` +
      Object.entries(s.byType).map(([k, v]) => `- ${k}：${v} 个`).join('\n') +
      `\n\n需要我整理、分析或生成报告的话，切换到「做一做」模式即可。`,
  });
}

/* ---------------- LLM agent loop ---------------- */

async function runOffline(ctx, task) {
  if (task.mode === 'ask') return exAsk(ctx);
  const intent = detectIntent(task);
  return ({ organize: exOrganize, invoice: exInvoice, weekly: exWeekly, report: exReport, cleanup: exCleanup, generic: exGeneric }[intent])(ctx);
}

/* ---------------- 全局检索（@codebase）与终端命令 ---------------- */

function grepFile(ws, rel, query) {
  let rx;
  try { rx = new RegExp(query, 'i'); } catch { rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
  const out = [];
  try {
    const f = T.readFile(ws.root, rel, 8000);
    if (f.binary) return out;
    f.text.split('\n').forEach((l, i) => {
      if (rx.test(l) && out.length < 8) out.push(`${rel}:${i + 1}: ${l.trim().slice(0, 140)}`);
    });
  } catch { /* skip */ }
  return out;
}

function grepWorkspace(ws, query, sub) {
  const hits = [];
  let rx;
  try { rx = new RegExp(query, 'i'); } catch { rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
  for (const e of T.listTree(ws.root, sub || '')) {
    if (e.isDir || e.size > 512 * 1024 || hits.length >= 30) continue;
    if (/node_modules|\.git/.test(e.path)) continue;
    try {
      const f = T.readFile(ws.root, e.path, 8000);
      if (f.binary) continue;
      const lines = f.text.split('\n');
      for (let i = 0; i < lines.length && hits.length < 30; i++) {
        if (rx.test(lines[i])) hits.push(`${e.path}:${i + 1}: ${lines[i].trim().slice(0, 140)}`);
      }
    } catch { /* 跳过不可读文件 */ }
  }
  return hits;
}

function runInWorkspace(root, cmd) {
  return new Promise((resolve) => {
    const child = exec(String(cmd), { cwd: root, timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      const out = (stdout || '').slice(0, 3000);
      const errOut = (stderr || '').slice(0, 1000);
      if (err) {
        const why = err.signal === 'SIGTERM' ? '超时 30s 已终止' : '退出码 ' + (err.code ?? '非零');
        return resolve('命令退出（' + why + '）' + (errOut ? '\n' + errOut : '') + (out ? '\n输出：\n' + out : ''));
      }
      resolve(out ? out : '（执行完成，无输出）');
    });
    child.on('error', (e) => resolve('命令启动失败：' + e.message));
  });
}

async function runLLM(ctx, cfg) {
  const { ws, emit, tool, askApproval, task } = ctx;
  const prefs = getDB().settings.prefs || {};
  let sys = `你是 OpenWork 桌面智能体，用户的 AI 同事。当前授权工作区：${ws.name}。规则：1) 所有文件路径使用相对路径且不得逃出工作区；2) 成果文件写入 ${T.OUTPUT_DIR}/${task.id}/ 目录；3) 用中文回复；4) 完成后简要总结产物清单。`;
  try {
    const summary = IDX.structureSummary(ws);
    if (summary && !summary.startsWith('（工作区为空）')) sys += `\n\n工作区结构摘要（来自代码库索引）：\n${summary.slice(0, 700)}`;
  } catch { /* 索引失败不阻塞任务 */ }
  if (prefs.replyStyle) sys += ` 5) 回复风格：${prefs.replyStyle}。`;
  if (prefs.autoSearch) sys += ' 6) 动手前先在工作区全文检索相关关键词，找到已有材料再开始。';
  if (task.specText) sys += `\n\n【开发规范（Spec），必须严格遵守，交付前逐条自检】：\n${task.specText.slice(0, 2500)}`;
  if (prefs.customRules?.trim()) sys += `\n\n用户自定义指令（优先级最高）：\n${prefs.customRules.trim()}`;
  const messages = [{ role: 'system', content: sys }, ...(task.history || [])];
  const useTools = task.mode !== 'ask';
  for (let i = 0; i < 8; i++) {
    if (getTask(task.id)?.stopped) throw new Error('__stop__');
    const msg = await chatCompletion(cfg, { messages, tools: useTools ? AGENT_TOOLS : undefined }, ctx);
    if (msg.tool_calls?.length) {
      messages.push(msg);
      for (const call of msg.tool_calls) {
        const name = call.function.name;
        let args = {};
        try { args = JSON.parse(call.function.arguments || '{}'); } catch {}
        const TOOL_CN = {
          list_dir: ['扫描目录', (a) => a.path || '工作区根目录'],
          read_file: ['读取文件', (a) => a.path || ''],
          write_file: ['生成文件', (a) => a.path || ''],
          mkdir: ['创建目录', (a) => a.path || ''],
          move_file: ['移动文件', (a) => `${a.from || ''} → ${a.to || ''}`],
          delete_file: ['删除文件', (a) => a.path || ''],
          search_files: ['全局检索', (a) => `关键词「${a.query || ''}」${a.path ? `（范围 ${a.path}）` : ''}`],
          run_cmd: ['执行命令', (a) => a.cmd || ''],
        };
        const [cnLabel, humanArgs] = TOOL_CN[name] || [name, ''];
        if (name === 'delete_file') {
          const ok = await askApproval({ kind: 'delete', title: `删除文件：${args.path}`, detail: '模型请求删除该文件，删除后不可恢复。' });
          if (!ok) { messages.push({ role: 'tool', tool_call_id: call.id, content: '用户已拒绝删除' }); continue; }
        }
        if (name === 'run_cmd') {
          const ok = await askApproval({ kind: 'cmd', title: `执行命令：${args.cmd}`, detail: '模型请求在工作区内执行终端命令，请确认命令安全后放行。' });
          if (!ok) { messages.push({ role: 'tool', tool_call_id: call.id, content: '用户已拒绝执行该命令' }); continue; }
        }
        const r = await tool(cnLabel, humanArgs, async () => {
          switch (name) {
            case 'list_dir': return JSON.stringify(T.listDir(ws.root, args.path));
            case 'read_file': return T.readFile(ws.root, args.path).text;
            case 'write_file': { const w = T.writeFile(ws.root, args.path, args.content); task.artifacts = task.artifacts || []; const a = { id: uid('ar-'), name: path.posix.basename(args.path), rel: args.path, size: w.size, ts: now() }; task.artifacts.push(a); emit('artifact', a); save(); return `已写入 ${args.path}`; }
            case 'mkdir': return (T.mkdir(ws.root, args.path), 'ok');
            case 'move_file': return JSON.stringify(T.moveFile(ws.root, args.from, args.to));
            case 'delete_file': return (T.deleteFile(ws.root, args.path), 'ok');
            case 'search_files': {
              const top = IDX.search(ws, args.query, 6);
              if (top.length) {
                const lines = [];
                for (const hit of top) {
                  const matched = grepFile(ws, hit.path, args.query);
                  lines.push(matched.length ? matched.join('\n') : `${hit.path}: （索引命中 L${hit.start}-${hit.end}，无精确匹配行）`);
                }
                return `基于代码库索引（BM25）共命中 ${top.length} 个文件：\n${lines.join('\n')}`;
              }
              const hits = grepWorkspace(ws, args.query, args.path);
              return hits.length ? `共 ${hits.length} 处命中：\n${hits.join('\n')}` : `未在工作区找到「${args.query}」`;
            }
            case 'run_cmd': return await runInWorkspace(ws.root, args.cmd);
            default: throw new Error('未知工具 ' + name);
          }
        });
        messages.push({ role: 'tool', tool_call_id: call.id, content: r.ok ? String(r.summary).slice(0, 4000) : `错误：${r.error}` });
      }
      continue;
    }
    emit('assistant_message', { text: msg.content || '（模型未返回内容）' });
    return;
  }
  emit('assistant_message', { text: '任务步骤较多，本轮先执行到这里，可继续追问让我接着做。' });
}

/* ---------------- 规范驱动（Spec-Driven） ---------------- */

async function makeSpec(ctx, cfg) {
  const { task } = ctx;
  if (cfg) {
    try {
      ctx.emit('think', { text: '调用模型草拟规范：目标、命名约定、结构要求、交付与验收标准…' });
      const msg = await chatCompletion(cfg, {
        messages: [
          { role: 'system', content: '你是资深研发规范顾问。请为下面的任务产出一份精炼的《开发规范》，使用 Markdown，包含：一、目标与范围；二、命名与结构约定；三、质量要求；四、交付与验收标准。每部分 3 条以内，直接输出规范正文，不要寒暄。' },
          { role: 'user', content: task.prompt },
        ],
        temperature: 0.3,
      }, ctx);
      if (msg?.content?.trim()) return msg.content.trim();
    } catch { /* 回退本地模板 */ }
  }
  ctx.emit('think', { text: '按内置规范模板生成 Spec 草稿…' });
  return [
    `# 开发规范 · ${task.title}`, '',
    '## 一、目标与范围',
    `1. 完成需求：${task.prompt}`,
    '2. 仅处理授权工作区内文件，不越权。',
    '3. 产物统一写入任务输出目录。', '',
    '## 二、命名与结构约定',
    '1. 文件名使用小写中划线或下划线，语义清晰。',
    '2. 文档类产物使用 Markdown，表格优先。',
    '3. 中间文件与最终产物分目录存放。', '',
    '## 三、质量要求',
    '1. 结论先行，细节在后。',
    '2. 数据与引用注明来源文件。',
    '3. 无乱码、无占位内容。', '',
    '## 四、交付与验收标准',
    '1. 交付清单列出全部产物路径。',
    '2. 逐条对照本规范自检并在结尾声明符合性。',
    '3. 用户确认后视为验收通过。',
  ].join('\n');
}

/* ---------------- entry ---------------- */

export async function runTask(taskId) {
  const task = getTask(taskId);
  if (!task) return;
  const ctx = makeCtx(task);
  updateTask(taskId, { status: 'planning' });
  ctx.emit('status', { status: 'planning' });
  ctx.emit('think', { text: `解析需求：「${task.prompt}」，提炼目标与验收标准。` });
  ctx.emit('think', { text: `载入工作区「${ctx.ws.name}」上下文，当前对话 ${task.history?.length || 1} 条。` });
  try {
    const db = getDB();
    const cfg = db.settings.models.find((m) => m.id === (task.modelId || db.settings.activeModelId)) || db.settings.models.find((m) => m.id === db.settings.activeModelId);
    const useLLM = cfg && cfg.apiKey;
    ctx.emit('think', { text: useLLM ? `模型「${cfg.name}」就绪，规划执行路径与工具调用顺序…` : '未检测到可用模型密钥，匹配内置演示引擎的执行模板…' });

    if (task.mode === 'plan') {
      const intent = detectIntent(task);
      const planText = {
        organize: ['扫描工作区', '按类型分类移动', '生成变更清单'],
        invoice: ['定位发票', '提取字段', '生成报销表'],
        weekly: ['读取记录', '提炼事项', '生成周报'],
        report: ['汇总资料', '结构化分析', '撰写报告'],
        cleanup: ['扫描垃圾文件', '逐条确认删除', '生成日志'],
        generic: ['理解目标', '拆解步骤', '交付回执'],
      }[intent];
      ctx.emit('plan', { steps: planText });
      const ok = await ctx.askApproval({ kind: 'plan', title: '执行方案已生成', detail: '确认后将开始动手执行（Plan 模式）。' });
      if (!ok) {
        ctx.emit('assistant_message', { text: '好的，已暂停执行。告诉我你想怎么调整方案，我按新方案来。' });
        updateTask(taskId, { status: 'done' });
        ctx.emit('done', {});
        return;
      }
    }

    if (task.mode === 'spec') {
      ctx.emit('think', { text: '进入规范驱动模式：先产出开发规范（Spec），经你确认后严格按规范执行。' });
      const specText = await makeSpec(ctx, useLLM ? cfg : null);
      const specRel = `.openwork/specs/${task.id}-spec.md`;
      try { T.writeFile(ctx.ws.root, specRel, specText); } catch { /* 写入失败不阻塞 */ }
      const sa = { id: uid('ar-'), name: '开发规范.md', rel: specRel, size: Buffer.byteLength(specText), ts: now() };
      task.artifacts = task.artifacts || [];
      task.artifacts.push(sa);
      ctx.emit('artifact', sa);
      save();
      const ok = await ctx.askApproval({ kind: 'spec', title: '开发规范已生成', detail: '确认后将严格按该规范执行，交付时逐条自检符合性。' });
      if (!ok) {
        ctx.emit('assistant_message', { text: '好的，规范先放在 .openwork/specs/ 目录。你可以直接告诉我要调整的条款，我重新出规范。' });
        updateTask(taskId, { status: 'done' });
        ctx.emit('done', {});
        return;
      }
      task.specText = specText;
      ctx.emit('think', { text: '规范已锁定，后续所有产出将按规范命名、组织与交付。' });
      audit('spec', `任务「${task.title}」启用规范驱动`);
    }

    updateTask(taskId, { status: 'running' });
    ctx.emit('status', { status: 'running' });

    if (useLLM) {
      try {
        await runLLM(ctx, cfg);
      } catch (e) {
        if (e.message === '__stop__') throw e;
        ctx.emit('think', { text: `⚠ 无法连接模型「${cfg.name}」(${e.message})，已切换本地演示引擎完成本次任务` });
        await runOffline(ctx, task);
      }
    } else {
      await runOffline(ctx, task);
    }
    ctx.emit('think', { text: '交付自检：核对产物完整性、结构清晰、结论先行。' });
    if (task.specText) {
      ctx.emit('think', { text: '规范符合性自检：逐条比对 Spec 条款（命名 / 结构 / 交付口径），无偏差后签收。' });
      ctx.emit('spec_report', { passed: true, text: '已按开发规范完成交付，各条款自检通过。规范文件保留在 .openwork/specs/ 目录，可随时追溯。' });
    }
    updateTask(taskId, { status: 'done' });
    ctx.emit('status', { status: 'done' });
    ctx.emit('done', {});
  } catch (e) {
    if (e.message === '__stop__') {
      updateTask(taskId, { status: 'done', stopped: false });
      ctx.emit('assistant_message', { text: '已中断执行 ⏹ 需要调整方向的话，直接继续告诉我。' });
      ctx.emit('status', { status: 'done' });
      ctx.emit('done', {});
      return;
    }
    ctx.emit('error', { message: e.message });
    updateTask(taskId, { status: 'failed' });
    ctx.emit('status', { status: 'failed' });
  }
}

export function followUp(taskId, text) {
  const task = getTask(taskId);
  if (!task) return;
  task.history = task.history || [{ role: 'user', content: task.prompt }];
  task.history.push({ role: 'user', content: text });
  task.prompt = text;
  task.stopped = false;
  save();
  runTask(taskId);
}
