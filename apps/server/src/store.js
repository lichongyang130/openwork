import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uid, now } from './util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../../..');
export const DATA_DIR = path.join(REPO_ROOT, 'data');
export const DEMO_WORKSPACE = path.join(REPO_ROOT, 'workspace', 'demo');

const DB_FILE = path.join(DATA_DIR, 'db.json');

/* ---------------- seeds ---------------- */

function seedDemoWorkspace() {
  const w = DEMO_WORKSPACE;
  fs.mkdirSync(w, { recursive: true });
  const put = (name, content = '') => {
    const p = path.join(w, name);
    if (!fs.existsSync(p)) fs.writeFileSync(p, content);
  };
  put('会议纪要 0901.md', '# 会议纪要 0901\n\n- 时间：2026-09-01 10:00\n- 主题：Q3 市场投放复盘\n- 结论：\n  1. 搜索渠道 ROI 最高，追加 20% 预算\n  2. 内容团队本周产出 6 篇稿件\n  3. 下周启动竞品价格调研\n');
  put('产品规划草稿.md', '# 产品规划草稿\n\n目标：桌面智能体工作台 MVP。\n\n- 任务下达：自然语言一句话\n- 执行：本地文件读写、批处理\n- 交付：文档 / 表格 / 报告\n- 安全：授权文件夹 + 高危拦截\n');
  put('工作记录.md', '# 本周工作记录\n\n- 完成客户 A 合同初稿\n- 整理 8 月销售数据，输出趋势分析\n- 修复报销流程卡单问题 3 个\n- 参与 2 场产品评审会\n');
  put('销售数据.csv', '月份,销售额,订单数,客单价\n1月,128000,320,400\n2月,143500,351,409\n3月,167200,402,416\n4月,158900,388,409\n5月,182300,441,413\n6月,201400,476,423\n');
  put('summary.md', '# summary\n\n旧版季度小结，待归档。\n');
  put('团队合影.png');
  put('发票-01.jpg');
  put('发票-02.jpg');
  put('合同扫描件.pdf');
  put('报价单.xlsx');
  put('temp-cache.tmp');
  put('old-draft.tmp');
}

const BUILTIN_SKILLS = [
  { id: 'organize', name: '文件夹智能整理', desc: '按类型自动分类归档文件，重名自动加前缀，输出变更清单', tag: '自动化', builtin: true, enabled: true },
  { id: 'weekly', name: '周报生成', desc: '读取工作区中的工作记录，生成结构化周报 Markdown', tag: '写作', builtin: true, enabled: true },
  { id: 'invoice', name: '发票信息提取', desc: '批量读取发票文件，提取日期 / 金额 / 税号，整理成表格', tag: '数据', builtin: true, enabled: true },
  { id: 'research', name: '行业调研报告', desc: '汇总工作区资料，产出结构化调研报告', tag: '研究', builtin: true, enabled: true },
  { id: 'xlsx', name: '表格处理 xlsx', desc: '生成 / 清洗表格数据，输出 CSV / Excel 结构', tag: '数据', builtin: true, enabled: true },
  { id: 'docx', name: '文档生成 docx', desc: '按大纲生成排版整齐的 Word 结构文档', tag: '写作', builtin: true, enabled: true },
  { id: 'pptx', name: 'PPT 大纲 pptx', desc: '把主题 / 素材转成可直接做 PPT 的分页大纲', tag: '创作', builtin: true, enabled: true },
  // 蜂群新增 — 省人工省心办公
  { id: 'swarm-weekly', name: '🐝 蜂群周报', desc: '蜂群并行：收集记录→提炼数据→生成三段式周报，单文件交付', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-invoice', name: '🐝 蜂群报销', desc: '蜂群并行：扫描发票→OCR提取→校验→报销表，3分钟100张', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-meeting', name: '🐝 蜂群纪要', desc: '蜂群并行：语音转文字→结论先行→待办入日程，闭环', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-report', name: '🐝 蜂群报告', desc: '蜂群并行：逐份提取→归并对比→单HTML可视化，上结论中表格下图表', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-contract', name: '🐝 蜂群合同审查', desc: '蜂群并行：风险/权责/缺失三维度，带置信度+修订建议', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-vram', name: '🐝 蜂群显存计算器', desc: '蜂群并行：公式研究→单HTML计算器→边界测试→配色优化，2分钟交付', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-sales', name: '🐝 蜂群销售简报', desc: '蜂群并行：读CSV→趋势分析→可视化简报，上结论中表格下图表', tag: '蜂群', builtin: true, enabled: true, swarm: true },
  { id: 'swarm-ppt', name: '🐝 蜂群PPT大纲', desc: '蜂群并行：收集素材→提炼大纲→分页文档，可直接导入', tag: '蜂群', builtin: true, enabled: true, swarm: true },
];

const MARKET_SKILLS = [
  { id: 'poster', name: '海报生成', desc: '一句话生成活动海报文案与版式建议', tag: '创作', builtin: false, enabled: false },
  { id: 'clean', name: '数据清洗', desc: '去重、补空值、统一格式的表格清洗 SOP', tag: '数据', builtin: false, enabled: false },
  { id: 'contract', name: '合同审查助手', desc: '按清单核对合同要素，标出缺失条款', tag: '法务', builtin: false, enabled: false },
  { id: 'minutes', name: '会议纪要整理', desc: '把零散记录整理成结论 / 待办分明的纪要', tag: '写作', builtin: false, enabled: false },
];

const EXPERTS = [
  { id: 'analyst', name: '数据分析师', desc: '表格分析、趋势解读、图表建议' },
  { id: 'writer', name: '文档撰写专家', desc: '周报、公文、方案、纪要' },
  { id: 'researcher', name: '调研专家', desc: '竞品分析、行业简报、资料汇总' },
  { id: 'sheet', name: '表格专家', desc: 'Excel 公式、透视、清洗' },
  { id: 'ppt', name: 'PPT 专家', desc: '汇报结构、分页大纲、表达提炼' },
];

const CONNECTORS = [
  { id: 'wecom', name: '企业微信', desc: '手机下指令，远程调度桌面任务 · webhook真接入', status: 'ready' },
  { id: 'feishu', name: '飞书', desc: '消息触发任务，结果回传群聊 · webhook真接入', status: 'ready' },
  { id: 'dingtalk', name: '钉钉', desc: '机器人回调接入 · webhook真接入', status: 'ready' },
  { id: 'slack', name: 'Slack', desc: '群聊推送任务结果 · webhook真接入', status: 'ready' },
  { id: 'telegram', name: 'Telegram', desc: 'Bot API推送 · 真接入', status: 'ready' },
  { id: 'discord', name: 'Discord', desc: 'Webhook推送 · 真接入', status: 'ready' },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Business API接入', status: 'soon' },
  { id: 'github', name: 'GitHub', desc: '读取仓库文件与 Issue', status: 'ready' },
  { id: 'email', name: '邮箱', desc: '读取邮件生成待办', status: 'ready' },
  { id: 'browser', name: '浏览器自动化', desc: '网页抓取、截图、填表', status: 'ready' },
];

const DEFAULT_SETTINGS = {
  models: [
    { id: 'offline', provider: '内置演示引擎', name: '本地演示（无需 API Key）', baseUrl: '', apiKey: '', builtin: true },
    { id: 'deepseek', provider: 'DeepSeek', name: 'DeepSeek Chat', baseUrl: 'https://api.deepseek.com', apiKey: '' },
    { id: 'kimi', provider: 'Moonshot', name: 'Kimi (Moonshot)', baseUrl: 'https://api.moonshot.cn/v1', apiKey: '' },
    { id: 'glm', provider: 'Zhipu', name: 'GLM-4', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', apiKey: '' },
    { id: 'minimax', provider: 'MiniMax', name: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', apiKey: '' },
    { id: 'openai', provider: 'OpenAI', name: 'GPT-4o', baseUrl: 'https://api.openai.com/v1', apiKey: '' },
  ],
  activeModelId: 'offline',
  risk: { confirmDelete: true, confirmOverwrite: true, blockOutside: true },
  swarm: { autoEnable: true, autoThreshold: 80, concurrency: 3, credits: 1500, creditsUsed: 0, humanInLoop: true, modelSwitch: true, pushChannel: 'telegram' },
  evolution: { enabled: true, autoGene: true },
};

const DEFAULT_GENES = [
  { id: 'gene-seed-1', claim: '周报结构：完成/数据/计划，专业简洁，量化数据', evidence: ['完成事项带数据', '三段式结构'], gdi: 92, from: '内置·周报', createdAt: '2026-09-01T00:00:00Z', usage: 12 },
  { id: 'gene-seed-2', claim: '发票报销：日期/金额/税号三字段提取，金额求和校验', evidence: ['OCR提取', '税号正则'], gdi: 88, from: '内置·财务', createdAt: '2026-09-01T00:00:00Z', usage: 8 },
  { id: 'gene-seed-3', claim: '会议纪要：结论先行，决策/待办/负责人/截止', evidence: ['待办入日程', '冲突检测'], gdi: 90, from: '内置·办公', createdAt: '2026-09-01T00:00:00Z', usage: 15 },
  { id: 'gene-seed-4', claim: '报告可视化：上结论中表格下可筛选图表，单HTML交付', evidence: ['Chart.js', '单文件'], gdi: 93, from: '内置·报告', createdAt: '2026-09-01T00:00:00Z', usage: 6 },
];

/* ---------------- store core ---------------- */

let db = null;
const listeners = new Map(); // taskId -> Set<res>

function defaults() {
  return {
    tasks: [],
    workspaces: [{ id: 'ws-demo', name: '演示工作区', root: DEMO_WORKSPACE, createdAt: now() }],
    skills: [...BUILTIN_SKILLS, ...MARKET_SKILLS],
    experts: EXPERTS,
    connectors: CONNECTORS,
    automations: [],
    genes: [...DEFAULT_GENES],
    settings: structuredClone(DEFAULT_SETTINGS),
  };
}

export function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  seedDemoWorkspace();
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      // merge new builtin skills if db is older
      const base = defaults();
      for (const k of ['experts', 'connectors', 'genes']) if (!db[k]) db[k] = base[k];
      if (!db.settings) db.settings = base.settings;
      else {
        // merge new settings fields
        if (!db.settings.swarm) db.settings.swarm = base.settings.swarm;
        else {
          db.settings.swarm.humanInLoop ??= true;
          db.settings.swarm.modelSwitch ??= true;
          db.settings.swarm.pushChannel ??= 'telegram';
          db.settings.swarm.credits ??= 1500;
        }
        if (!db.settings.evolution) db.settings.evolution = base.settings.evolution;
      }
      // merge new swarm skills
      const existingIds = new Set((db.skills || []).map(s => s.id));
      for (const s of base.skills) if (!existingIds.has(s.id)) db.skills.push(s);
      return db;
    } catch {
      /* fallthrough */
    }
  }
  db = defaults();
  save();
  return db;
}

export async function tryMigrateSqlite() {
  try {
    const { isSqlite, migrateFromJson } = await import('./sqlite.js');
    if (isSqlite && isSqlite()) {
      const r = migrateFromJson();
      if (r?.ok) console.log('[sqlite] 已迁移', r);
    }
  } catch {}
}


export function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const getDB = () => db;

/* ---------------- events ---------------- */

export function getTask(id) {
  return db.tasks.find((t) => t.id === id);
}

export function appendEvent(taskId, kind, payload = {}) {
  const t = getTask(taskId);
  if (!t) return null;
  const ev = { id: uid('ev-'), seq: (t.events.at(-1)?.seq ?? 0) + 1, ts: now(), kind, payload };
  t.events.push(ev);
  t.updatedAt = now();
  save();
  const subs = listeners.get(taskId);
  if (subs) for (const res of subs) res.write(`data: ${JSON.stringify(ev)}\n\n`);
  return ev;
}

export function updateTask(id, patch) {
  const t = getTask(id);
  if (!t) return null;
  Object.assign(t, patch, { updatedAt: now() });
  save();
  return t;
}

export function addTask(task) {
  db.tasks.unshift(task);
  save();
  return task;
}

export function removeTask(id) {
  db.tasks = db.tasks.filter((t) => t.id !== id);
  listeners.delete(id);
  save();
}

export function subscribe(taskId, res) {
  if (!listeners.has(taskId)) listeners.set(taskId, new Set());
  listeners.get(taskId).add(res);
  return () => listeners.get(taskId)?.delete(res);
}

/** 只推送给在线订阅者、不写入事件历史（用于浏览器中继等瞬时指令） */
export function broadcast(taskId, kind, payload = {}) {
  const ev = { id: uid('ev-'), seq: 0, ts: now(), kind, payload };
  const subs = listeners.get(taskId);
  if (subs) for (const res of subs) res.write(`data: ${JSON.stringify(ev)}\n\n`);
  return ev;
}
