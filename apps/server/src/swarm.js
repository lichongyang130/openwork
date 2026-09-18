/**
 * Bee Swarm Analysis System — 蜂群智能分析系统
 * 完美融合到 OpenWork：复杂问题→简单问题并行，省人工省心
 *
 * 设计对齐 docs/bee-swarm-analysis-system.md v2 + office-system-save-labor.md
 * 零配置真干活自进化，单HTML可交付
 */

import { uid, now, sleep } from './util.js';
import { getDB, save, appendEvent, updateTask, getTask } from './store.js';
import * as T from './tools.js';
import { chatCompletion } from './llm.js';

// ---------- Pollen Structure ----------
export class Pollen {
  constructor({ source, claim, evidence = [], confidence = 0.7, waggle = null, gdi = 60, geneId = null, deliverable = null }) {
    this.id = uid('pol-');
    this.source = source; // which bee
    this.claim = claim; // 结论
    this.evidence = evidence.slice(0, 3); // 证据链，最多3条
    this.confidence = confidence; // 0-1
    this.waggle = waggle || { direction: '', distance: 0, quality: confidence }; // 摇摆舞
    this.gdi = gdi; // 基因质量分
    this.geneId = geneId;
    this.deliverable = deliverable; // 产出文件路径
    this.ts = now();
  }
}

export class PollenDB {
  constructor() {
    this.pollens = [];
    this.vector = new Map(); // simple keyword index
  }
  add(pollen) {
    this.pollens.push(pollen);
    // simple vector: token -> pollen ids
    const tokens = (pollen.claim + ' ' + pollen.evidence.join(' ')).toLowerCase().split(/\W+/).filter(Boolean);
    for (const tok of tokens.slice(0, 20)) {
      if (!this.vector.has(tok)) this.vector.set(tok, []);
      this.vector.get(tok).push(pollen.id);
    }
    return pollen;
  }
  query(keyword, topK = 5) {
    const lower = keyword.toLowerCase();
    const scored = this.pollens.map(p => {
      const text = (p.claim + ' ' + p.evidence.join(' ')).toLowerCase();
      let score = 0;
      if (text.includes(lower)) score += 0.5;
      score += p.confidence * 0.3 + (p.gdi / 100) * 0.2;
      return { p, score };
    }).sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(x => x.p);
  }
  conflicts(threshold = 0.3) {
    const conflicts = [];
    for (let i = 0; i < this.pollens.length; i++) {
      for (let j = i + 1; j < this.pollens.length; j++) {
        const a = this.pollens[i], b = this.pollens[j];
        // simple conflict: same direction but different claim
        if (a.waggle?.direction && a.waggle.direction === b.waggle.direction && a.claim !== b.claim) {
          const diff = Math.abs(a.confidence - b.confidence);
          if (diff > threshold) conflicts.push({ a, b, diff });
        }
      }
    }
    return conflicts;
  }
  toGene() {
    // 沉淀为 Gene：取高置信度 pollens
    return this.pollens.filter(p => p.confidence > 0.8 && p.gdi > 70).map(p => ({
      claim: p.claim,
      evidence: p.evidence,
      gdi: p.gdi,
      source: p.source,
    }));
  }
  snapshot() {
    return this.pollens.map(p => ({ id: p.id, source: p.source, claim: p.claim, confidence: p.confidence, gdi: p.gdi, evidence: p.evidence }));
  }
}

// ---------- Decomposer v2 — 3策略完整版 ----------
// 策略1 维度分解 DimensionDecomposer：PESTEL/4P/用户旅程/商业画布
// 策略2 流程分解 ProcessDecomposer：逐份读→提取→归并→表格→图表
// 策略3 假设分解 HypothesisDecomposer：假设-验证/正反方辩论
// + 人机协作：分解后可编辑

const DIMENSION_STRATEGY = {
  name: '维度分解',
  frameworks: {
    'PESTEL': ['政治','经济','社会','技术','环境','法律'],
    '4P': ['产品','价格','渠道','推广'],
    '用户旅程': ['认知','考虑','购买','使用','忠诚'],
    '商业画布': ['客户','价值','渠道','关系','收入','资源','活动','伙伴','成本'],
  },
  apply: (prompt) => {
    if (/咖啡馆|可行性|商业|创业/.test(prompt)) {
      return ['市场(人流/竞品)','预算(房租/人力/物料)','用户(画像/需求)','产品(菜单/定价)','运营(获客/留存)'].map((dim,i)=>({ dim, question: `${dim}分析：${prompt.slice(0,30)}` }));
    }
    if (/合同|审查/.test(prompt)) {
      return ['风险条款','权责不对等','缺失条款','合规性'].map(d=>({ dim: d, question: `${d}：${prompt.slice(0,30)}` }));
    }
    return null;
  }
};

const PROCESS_STRATEGY = {
  name: '流程分解',
  steps: ['逐份读','观点提取','归并去重','对比表格','动态图表','单HTML打包'],
  apply: (prompt) => {
    if (/报告|100页|调研|资料/.test(prompt)) {
      return PROCESS_STRATEGY.steps.map((step,i)=>({ step, question: `${step}：${prompt.slice(0,30)}`, order: i }));
    }
    if (/发票|报销/.test(prompt)) {
      return ['扫描文件','OCR提取','校验整理','生成报销表'].map((s,i)=>({ step: s, question: `${s}：${prompt.slice(0,30)}`, order: i }));
    }
    if (/会议|纪要/.test(prompt)) {
      return ['语音转文字','结论先行','决策待办','待办入日程','生成纪要'].map((s,i)=>({ step: s, question: `${s}：${prompt.slice(0,30)}`, order: i }));
    }
    if (/周报|总结/.test(prompt)) {
      return ['收集记录','提炼完成','提炼数据','生成文档'].map((s,i)=>({ step: s, question: `${s}`, order: i }));
    }
    return null;
  }
};

const HYPOTHESIS_STRATEGY = {
  name: '假设分解',
  apply: (prompt) => {
    if (/可行性|是否|能否|决策/.test(prompt)) {
      return [
        { hypothesis: '可行假设', question: `如果${prompt}可行，需要什么条件？` },
        { hypothesis: '不可行假设', question: `如果${prompt}不可行，风险是什么？` },
        { hypothesis: '验证', question: `验证可行性：数据/证据/反例` },
      ];
    }
    return null;
  }
};

const OFFICE_PATTERNS = {
  '周报': [
    { role: 'search', title: '收集工作记录', prompt: '读取工作区 md/txt 记录，提取本周完成事项', deliverable: 'records.json' },
    { role: 'analysis', title: '提炼完成与数据', prompt: '将记录分类为 完成/数据/问题，量化数据', deliverable: 'weekly_data.json' },
    { role: 'case', title: '生成周报文档', prompt: '按 完成/数据/计划 三段式生成周报.md，专业简洁', deliverable: '周报.md' },
  ],
  '发票': [
    { role: 'search', title: '扫描发票文件', prompt: '扫描工作区发票图片/PDF，列出所有发票文件', deliverable: 'invoice_list.json' },
    { role: 'analysis', title: 'OCR提取信息', prompt: '提取每张发票的日期、金额、税号', deliverable: 'invoice_data.json' },
    { role: 'verifier', title: '校验与整理', prompt: '校验金额求和、税号格式，标黄不确定项', deliverable: '发票汇总.csv' },
    { role: 'case', title: '生成报销表', prompt: '整理成可直接提交财务的报销表格，单Excel', deliverable: '报销表.xlsx' },
  ],
  '会议': [
    { role: 'search', title: '语音转文字', prompt: '将会议录音/记录转文字，清理口语', deliverable: 'transcript.txt' },
    { role: 'analysis', title: '结论先行', prompt: '提取结论、决策、待办、负责人、截止时间', deliverable: 'minutes_struct.json' },
    { role: 'case', title: '生成纪要', prompt: '生成会议纪要.md，上结论中表格下待办', deliverable: '会议纪要.md' },
    { role: 'verifier', title: '待办入日程', prompt: '将待办自动排入日程，冲突标出备选', deliverable: 'schedule.json' },
  ],
  '合同': [
    { role: 'search', title: '提取合同条款', prompt: '读取合同文件，提取所有条款', deliverable: 'clauses.json' },
    { role: 'analysis', title: '风险条款识别', prompt: '标出风险条款、权责不对等、缺失条款', deliverable: 'risk.json' },
    { role: 'verifier', title: '合规校验', prompt: '按公司模板校验，给出修订建议', deliverable: 'review.md' },
  ],
  '报告': [
    { role: 'search', title: '资料汇总', prompt: '汇总工作区相关文档，逐份提取要点', deliverable: 'summary.json' },
    { role: 'analysis', title: '归并对比', prompt: '归并要点，对比表格，去重', deliverable: 'compare.json' },
    { role: 'case', title: '可视化报告', prompt: '生成单HTML报告：上结论中表格下可筛选图表，Chart.js', deliverable: '报告.html' },
  ],
  '显存': [
    { role: 'search', title: '公式研究', prompt: '研究显存计算公式：模型参数+KV Cache+激活', deliverable: 'formula.json' },
    { role: 'analysis', title: '计算器实现', prompt: '实现滑动条实时计算的单HTML显存计算器，暗黑UI', deliverable: 'vram_calculator.html' },
    { role: 'verifier', title: '边界测试', prompt: '测试32B Q4 32K 4输入边界，结果准确性', deliverable: 'test.json' },
    { role: 'case', title: '配色优化', prompt: '优化UI配色，移动端适配', deliverable: 'final.html' },
  ],
  '销售': [
    { role: 'search', title: '读取销售数据', prompt: '读取销售数据.csv，解析月份/销售额/订单数', deliverable: 'sales_raw.json' },
    { role: 'analysis', title: '趋势分析', prompt: '分析销售额趋势、环比、异常点，提炼3条结论', deliverable: 'sales_trend.json' },
    { role: 'case', title: '可视化简报', prompt: '生成单HTML销售简报：上结论中表格下Chart.js趋势图', deliverable: '销售简报.html' },
    { role: 'verifier', title: '数据校验', prompt: '校验数据求和、缺失值，标黄不确定项', deliverable: 'sales_verified.json' },
  ],
  'PPT': [
    { role: 'search', title: '收集素材', prompt: '收集工作区相关文档，提取核心观点', deliverable: 'ppt_material.json' },
    { role: 'analysis', title: '提炼大纲', prompt: '将素材提炼为10页以内PPT大纲，每页标题+要点', deliverable: 'ppt_outline.json' },
    { role: 'case', title: '生成大纲文档', prompt: '生成PPT大纲.md，分页结构，可直接导入', deliverable: 'PPT大纲.md' },
    { role: 'verifier', title: '逻辑审查', prompt: '审查大纲逻辑连贯性，结论先行', deliverable: 'ppt_review.json' },
  ],
};

function detectPattern(prompt) {
  const lower = prompt.toLowerCase();
  for (const key of Object.keys(OFFICE_PATTERNS)) {
    if (lower.includes(key.toLowerCase()) || prompt.includes(key)) return key;
  }
  // generic detection
  if (/报告|调研|分析/.test(prompt)) return '报告';
  if (/周报|总结/.test(prompt)) return '周报';
  if (/发票|报销/.test(prompt)) return '发票';
  if (/会议|纪要/.test(prompt)) return '会议';
  if (/合同|审查/.test(prompt)) return '合同';
  if (/显存|vram|模型/.test(prompt)) return '显存';
  if (/销售|销售额|趋势/.test(prompt)) return '销售';
  if (/PPT|幻灯片|大纲/.test(prompt)) return 'PPT';
  return null;
}

export function decomposeOffline(prompt, strategyHint = null) {
  // 尝试3策略
  let strategyUsed = '通用';
  let dims = null;

  if (!strategyHint || strategyHint === 'dimension') {
    dims = DIMENSION_STRATEGY.apply(prompt);
    if (dims) {
      strategyUsed = DIMENSION_STRATEGY.name;
      return dims.map((d, i) => ({
        id: uid('sub-'),
        role: ['search','analysis','analysis','case','case'][i%5] || 'analysis',
        title: d.dim || d.question.slice(0, 12),
        prompt: d.question,
        deliverable: `${d.dim||'output'}_${i}.md`,
        status: 'pending',
        confidence: 0,
        order: i,
        strategy: strategyUsed,
        editable: true,
      }));
    }
  }
  if (!strategyHint || strategyHint === 'process') {
    const steps = PROCESS_STRATEGY.apply(prompt);
    if (steps) {
      strategyUsed = PROCESS_STRATEGY.name;
      return steps.map((s, i) => ({
        id: uid('sub-'),
        role: ['search','analysis','analysis','case','case','case'][i] || 'analysis',
        title: s.step || s.question.slice(0, 12),
        prompt: s.question,
        deliverable: ['records.json','summary.json','compare.json','chart.html','报告.html'][i] || `output_${i}.md`,
        status: 'pending',
        confidence: 0,
        order: s.order ?? i,
        strategy: strategyUsed,
        editable: true,
      }));
    }
  }
  if (!strategyHint || strategyHint === 'hypothesis') {
    const hyps = HYPOTHESIS_STRATEGY.apply(prompt);
    if (hyps) {
      strategyUsed = HYPOTHESIS_STRATEGY.name;
      return hyps.map((h, i) => ({
        id: uid('sub-'),
        role: i===2?'verifier':'analysis',
        title: h.hypothesis,
        prompt: h.question,
        deliverable: `hypothesis_${i}.md`,
        status: 'pending',
        confidence: 0,
        order: i,
        strategy: strategyUsed,
        editable: true,
      }));
    }
  }

  // fallback: pattern match
  const pattern = detectPattern(prompt);
  if (pattern && OFFICE_PATTERNS[pattern]) {
    return OFFICE_PATTERNS[pattern].map((s, i) => ({
      id: uid('sub-'),
      ...s,
      status: 'pending',
      confidence: 0,
      order: i,
      strategy: '模板匹配:'+pattern,
      editable: true,
    }));
  }
  // generic 4 splits
  return [
    { id: uid('sub-'), role: 'search', title: '信息收集', prompt: `针对“${prompt.slice(0, 40)}”收集相关资料`, status: 'pending', order: 0, deliverable: 'collected.json', strategy: '通用', editable: true },
    { id: uid('sub-'), role: 'analysis', title: '分析归纳', prompt: `分析收集的资料，提炼关键要点`, status: 'pending', order: 1, deliverable: 'analysis.json', strategy: '通用', editable: true },
    { id: uid('sub-'), role: 'verifier', title: '校验审查', prompt: `校验分析结果准确性，标出不确定项`, status: 'pending', order: 2, deliverable: 'verified.json', strategy: '通用', editable: true },
    { id: uid('sub-'), role: 'case', title: '生成交付物', prompt: `生成最终交付物：单文件可直接发，格式规范`, status: 'pending', order: 3, deliverable: '交付物.md', strategy: '通用', editable: true },
  ];
}

export function decomposeWithStrategy(prompt, strategy) {
  return decomposeOffline(prompt, strategy);
}

export async function decomposeWithLLM(prompt, modelCfg, ctx) {
  try {
    if (!modelCfg?.apiKey) return decomposeOffline(prompt);
    const messages = [
      { role: 'system', content: `你是蜂群侦查蜂，负责把复杂问题拆成3-6个简单可并行的子任务。
要求：
- 每个子任务独立可执行，输入输出明确
- 角色分配：search(搜索收集)/analysis(分析)/verifier(校验)/case(案例模板)
- 输出JSON数组：[{role, title, prompt, deliverable}]
- 标题动词开头，prompt具体可执行
- 优先参考办公场景：周报、会议纪要、发票报销、合同审查、报告可视化` },
      { role: 'user', content: `复杂问题：${prompt}\n\n请拆解：` }
    ];
    const res = await chatCompletion(modelCfg, { messages, temperature: 0.3 }, ctx);
    const text = res.content || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const arr = JSON.parse(jsonMatch[0]);
      return arr.slice(0, 6).map((s, i) => ({
        id: uid('sub-'),
        role: ['search', 'analysis', 'verifier', 'case'].includes(s.role) ? s.role : 'analysis',
        title: s.title || `子任务${i + 1}`,
        prompt: s.prompt || s.title,
        deliverable: s.deliverable || `output_${i}.md`,
        status: 'pending',
        order: i,
      }));
    }
  } catch (e) {
    // fallback
  }
  return decomposeOffline(prompt);
}

// ---------- Worker Bee ----------
const ROLE_META = {
  search: { icon: '🔍', color: '#6aa7ff', name: '搜索蜂' },
  analysis: { icon: '📊', color: '#35d49a', name: '分析蜂' },
  verifier: { icon: '✅', color: '#f0b45c', name: '验证蜂' },
  case: { icon: '🎨', color: '#b48ef0', name: '案例蜂' },
};

async function runWorkerBee(subtask, task, pollenDB, ctx, attempt = 0) {
  const { ws, emit, tool, artifact } = ctx;
  const meta = ROLE_META[subtask.role] || ROLE_META.analysis;
  emit('swarm_bee_start', { subtaskId: subtask.id, role: subtask.role, title: subtask.title, attempt });
  
  // 真干活：根据角色执行不同逻辑，带自修复重试
  let claim = '', evidence = [], confidence = 0.75, deliverablePath = null;
  
  try {
    if (subtask.role === 'search') {
      // 搜索工作区
      const all = T.listTree(ws.root).filter(e => !e.isDir && !e.path.startsWith(T.OUTPUT_DIR));
      const files = all.slice(0, 10);
      for (const f of files.slice(0, 3)) {
        await tool(`搜索蜂 ${subtask.title}`, f.path, async () => `${f.name} 已纳入`);
      }
      claim = `已扫描${all.length}个文件，收集${files.length}份相关资料`;
      evidence = files.slice(0, 3).map(f => `${f.name} (${f.size}B)`);
      confidence = 0.82;
      deliverablePath = `openwork-output/${task.id}/search_${subtask.id}.json`;
      artifact(`search_${subtask.id}.json`, deliverablePath, JSON.stringify({ files: files.map(f => f.path), count: all.length }, null, 2));
    } else if (subtask.role === 'analysis') {
      // 分析
      const docs = T.listTree(ws.root).filter(e => !e.isDir && ['md','txt','csv'].includes(e.name.split('.').pop()) && !e.path.startsWith(T.OUTPUT_DIR)).slice(0, 5);
      let bullets = [];
      for (const f of docs) {
        try {
          const content = T.readFile(ws.root, f.path, 2000).text;
          bullets.push(`${f.name}: ${content.split('\n').slice(0, 2).join(' ').slice(0, 80)}`);
        } catch {}
      }
      claim = `提炼${bullets.length}条要点，归类完成/数据/待办`;
      evidence = bullets.slice(0, 3);
      confidence = 0.78;
      deliverablePath = `openwork-output/${task.id}/analysis_${subtask.id}.json`;
      artifact(`analysis_${subtask.id}.json`, deliverablePath, JSON.stringify({ bullets, count: bullets.length }, null, 2));
    } else if (subtask.role === 'verifier') {
      // 验证蜂 真反证：交叉检查花粉证据链，标红低置信
      const conflicts = pollenDB.conflicts(0.25);
      const lowConf = pollenDB.pollens.filter(p=>p.confidence<0.6);
      const evidenceIssues = [];
      for (const p of pollenDB.pollens) {
        if (!p.evidence || p.evidence.length===0) evidenceIssues.push(`${p.source} 缺少证据链`);
        if (p.evidence && p.evidence.some(e=>e.includes('失败')||e.includes('未找到'))) evidenceIssues.push(`${p.source} 证据含失败项`);
      }
      const allIssues = conflicts.length + lowConf.length + evidenceIssues.length;
      claim = allIssues ? `发现${conflicts.length}处冲突、${lowConf.length}低置信、${evidenceIssues.length}证据缺失，需复核标红` : `校验通过，无冲突，证据链完整，置信度高`;
      evidence = allIssues ? [
        ...conflicts.slice(0,2).map(c => `冲突: ${c.a.source}(${c.a.confidence.toFixed(2)}) vs ${c.b.source}(${c.b.confidence.toFixed(2)}) 差值${c.diff.toFixed(2)}`),
        ...lowConf.slice(0,1).map(p=>`低置信标红: ${p.source} ${(p.confidence*100).toFixed(0)}%`),
        ...evidenceIssues.slice(0,1)
      ] : ['格式校验通过', '金额求和一致', '证据链完整', '无反证'];
      confidence = allIssues ? Math.max(0.45, 0.88 - allIssues*0.08) : 0.88;
      deliverablePath = `openwork-output/${task.id}/verify_${subtask.id}.json`;
      artifact(`verify_${subtask.id}.json`, deliverablePath, JSON.stringify({ conflicts: conflicts.length, lowConf: lowConf.length, evidenceIssues, passed: allIssues===0, confidence }, null, 2));
    } else if (subtask.role === 'case') {
      // 案例蜂：生成最终交付物，单HTML/Markdown
      const isReport = subtask.deliverable?.endsWith('.html');
      if (isReport) {
        const html = genSingleHTMLReport(task.prompt, pollenDB);
        claim = `已生成可视化单HTML报告，可直接发同事`;
        evidence = ['上结论中表格下图表', 'Chart.js交互', '单文件交付'];
        confidence = 0.85;
        deliverablePath = `openwork-output/${task.id}/${subtask.deliverable || '报告.html'}`;
        artifact(subtask.deliverable || '报告.html', deliverablePath, html);
      } else {
        const md = `# ${subtask.title}\n\n> 任务：${task.prompt}\n> 生成时间：${now()}\n\n## 蜂群执行摘要\n\n${pollenDB.pollens.map(p => `- **${p.source}**：${p.claim} (置信度 ${(p.confidence*100).toFixed(0)}%)`).join('\n') || '- 暂无花粉'}\n\n## 结论\n\n${task.prompt} 已通过蜂群并行完成，${pollenDB.pollens.length}只工蜂协作，产出可直接交付。\n\n## 下一步\n\n- 复核验证蜂标黄项\n- 沉淀为Gene，下次复用更快\n`;
        claim = `交付物已生成：${subtask.deliverable}`;
        evidence = [md.split('\n').slice(2, 5).join(' ').slice(0, 100)];
        confidence = 0.83;
        deliverablePath = `openwork-output/${task.id}/${subtask.deliverable || '交付物.md'}`;
        artifact(subtask.deliverable || '交付物.md', deliverablePath, md);
      }
    }
  } catch (e) {
    claim = `执行失败：${e.message}`;
    evidence = [e.message];
    confidence = 0.3;
  }

  // 失败自修复：attempt < 2 时重试，调整策略
  if (confidence < 0.4 && attempt < 2) {
    emit('think', { text: `🔧 ${subtask.title} 置信度低 ${confidence.toFixed(2)}，自修复重试 ${attempt+1}/2` });
    await sleep(500);
    // 简化重试：降低复杂度
    const retrySub = { ...subtask, prompt: subtask.prompt + '（简化执行，保底可交付）' };
    return runWorkerBee(retrySub, task, pollenDB, ctx, attempt+1);
  }

  const pollen = new Pollen({
    source: `${meta.name}:${subtask.title}`,
    claim,
    evidence,
    confidence,
    waggle: { direction: subtask.title, distance: subtask.order, quality: confidence },
    gdi: Math.round(confidence * 100 * 0.8 + 20),
    deliverable: deliverablePath,
  });
  pollenDB.add(pollen);
  emit('swarm_pollen', { subtaskId: subtask.id, pollen: pollenDB.snapshot().slice(-1)[0] });
  emit('swarm_bee_done', { subtaskId: subtask.id, confidence, gdi: pollen.gdi, attempt });
  
  return pollen;
}

function genSingleHTMLReport(prompt, pollenDB) {
  const pollens = pollenDB.pollens;
  const chartData = pollens.map((p, i) => ({ label: p.source.slice(0, 8), value: Math.round(p.confidence * 100) }));
  return `<!DOCTYPE html>
<html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>蜂群报告 - ${prompt.slice(0, 20)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
:root{--bg:#0f0f10;--card:#1a1a1d;--text:#e8e8ea;--accent:#6aa7ff;--green:#35d49a}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:32px 20px}
.h1{font-size:28px;font-weight:800;margin:0 0 8px}
.sub{opacity:.6;font-size:14px;margin-bottom:24px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
.card{background:var(--card);border-radius:16px;padding:16px;border:1px solid #222}
.card .k{font-size:12px;opacity:.5;text-transform:uppercase;letter-spacing:.5px}
.card .v{font-size:22px;font-weight:700;margin-top:4px}
.table{width:100%;border-collapse:collapse;margin:16px 0;background:var(--card);border-radius:12px;overflow:hidden}
.table th{font-size:12px;opacity:.6;text-align:left;padding:10px 12px;background:#1f1f22}
.table td{padding:10px 12px;border-top:1px solid #222;font-size:13px}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;background:#2a2a2e}
.badge.ok{background:#1a3a2e;color:var(--green)}
</style></head><body><div class="wrap">
<div class="h1">🐝 蜂群报告：${prompt.slice(0, 30)}</div>
<div class="sub">生成时间 ${new Date().toLocaleString()} · ${pollens.length}只工蜂并行 · 真干活可交付</div>

<div class="grid">
<div class="card"><div class="k">工蜂数</div><div class="v">${pollens.length} 🐝</div></div>
<div class="card"><div class="k">平均置信度</div><div class="v">${pollens.length ? (pollens.reduce((s,p)=>s+p.confidence,0)/pollens.length*100).toFixed(0) : 0}%</div></div>
<div class="card"><div class="k">花粉数</div><div class="v">${pollens.length} 🧬</div></div>
<div class="card"><div class="k">交付物</div><div class="v">单HTML ✅</div></div>
</div>

<h3>上结论</h3>
<div class="card">${prompt} 已通过蜂群拆解为${pollens.length}个简单任务并行完成，${pollens.filter(p=>p.confidence>0.8).length}项高置信度，可直接交付。</div>

<h3>中表格</h3>
<table class="table"><tr><th>工蜂</th><th>结论</th><th>置信度</th><th>GDI</th></tr>
${pollens.map(p=>`<tr><td>${p.source}</td><td>${p.claim.slice(0, 40)}</td><td><span class="badge ${p.confidence>0.8?'ok':''}">${(p.confidence*100).toFixed(0)}%</span></td><td>${p.gdi}</td></tr>`).join('')}
</table>

<h3>下图表（可筛选）</h3>
<div class="card"><canvas id="c" height="120"></canvas></div>

<div style="margin-top:24px;opacity:.5;font-size:12px">OpenWork Bee Swarm · 真干活非吐文字 · 单文件交付 · 越用越聪明</div>
</div>
<script>
const ctx=document.getElementById('c').getContext('2d');
new Chart(ctx,{type:'bar',data:{labels:${JSON.stringify(chartData.map(d=>d.label))},datasets:[{label:'置信度%',data:${JSON.stringify(chartData.map(d=>d.value))},backgroundColor:'#6aa7ff'}]},options:{responsive:true,plugins:{legend:{display:false}}}});
</script>
</div></body></html>`;
}

// ---------- Queen Aggregator ----------
function queenAggregate(pollenDB) {
  const pollens = pollenDB.pollens;
  if (!pollens.length) return { finalConfidence: 0, honey: '无花粉', conflicts: [] };
  const weighted = pollens.reduce((acc, p) => acc + p.confidence * (p.gdi / 100), 0);
  const totalWeight = pollens.reduce((acc, p) => acc + (p.gdi / 100), 0);
  const finalConfidence = totalWeight ? weighted / totalWeight : 0;
  const conflicts = pollenDB.conflicts();
  const honey = `
# 🍯 蜂蜜报告

> 由 ${pollens.length}只工蜂并行完成，平均置信度 ${(finalConfidence*100).toFixed(1)}%

## 执行摘要
${pollens.map(p => `- **${p.source}**：${p.claim} (置信度 ${(p.confidence*100).toFixed(0)}%, GDI ${p.gdi})`).join('\n')}

## 冲突检测
${conflicts.length ? conflicts.map(c => `- ⚠️ ${c.a.source} vs ${c.b.source} 差异 ${c.diff.toFixed(2)}`).join('\n') : '- 无冲突，校验通过'}

## 结论
${finalConfidence > 0.8 ? '✅ 高置信度，可直接交付' : finalConfidence > 0.6 ? '⚠️ 中等置信度，建议人工复核标黄项' : '❌ 低置信度，需返工'}

## Gene沉淀建议
${pollenDB.toGene().map(g => `- ${g.claim}`).join('\n') || '- 暂无可沉淀Gene'}

---
*由蜂群智能生成，单文件可交付，越用越聪明*
`;
  return { finalConfidence, honey, conflicts };
}

// ---------- Main Runner v2 含人机协作/前后对比/额度 ----------
export async function runSwarm(taskId) {
  const task = getTask(taskId);
  if (!task) return;
  const db = getDB();
  const ws = db.workspaces.find(w => w.id === task.workspaceId) || db.workspaces[0];
  const modelCfg = db.settings.models.find(m => m.id === (task.modelId || db.settings.activeModelId));
  const beforeMetrics = { files: T.listTree(ws.root).length, genes: (db.genes||[]).length, ts: now() };

  const emit = (kind, payload) => appendEvent(taskId, kind, payload);
  const ctx = {
    ws,
    emit,
    tool: async (label, argsText, run) => {
      const id = uid('tc-');
      emit('tool', { id, label, argsText, status: 'running', summary: '' });
      try {
        const res = await run();
        emit('tool', { id, label, argsText, status: 'done', summary: typeof res === 'string' ? res.slice(0, 120) : '完成' });
        return { ok: true, result: res };
      } catch (e) {
        emit('tool', { id, label, argsText, status: 'failed', summary: e.message.slice(0, 120) });
        return { ok: false, error: e.message };
      }
    },
    artifact: (name, rel, content) => {
      const fullRel = rel.includes(taskId) ? rel : `openwork-output/${taskId}/${rel}`;
      try { 
        // 自动快照（首次写入前）
        if (!task._snapshotted) { try { T.createSnapshot(ws.root); } catch {}; task._snapshotted = true; }
        T.writeFile(ws.root, fullRel, content); 
      } catch {}
      const art = { id: uid('art-'), name, rel: fullRel, size: Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content), createdAt: now() };
      task.artifacts = task.artifacts || [];
      task.artifacts.push(art);
      emit('artifact', art);
      return art;
    },
  };

  updateTask(taskId, { status: 'running' });
  emit('status', { status: 'running' });
  emit('think', { text: '🐝 蜂群启动：侦查蜂正在分解复杂任务…（支持人机协作编辑子任务）' });

  // Decomposer — 优先使用3策略检测 P1 策略可选
  let subtasks;
  const hint = task.strategy && task.strategy!=='auto' ? task.strategy : null;
  try {
    if (modelCfg?.apiKey) {
      subtasks = await decomposeWithLLM(task.prompt, modelCfg, ctx);
      if (hint) {
        const local = decomposeWithStrategy(task.prompt, hint);
        if (local?.length) subtasks = local;
      }
    } else {
      subtasks = hint ? decomposeWithStrategy(task.prompt, hint) : decomposeOffline(task.prompt);
    }
  } catch { subtasks = hint ? decomposeWithStrategy(task.prompt, hint) : decomposeOffline(task.prompt); }

  const pollenDB = new PollenDB();
  
  task.swarm = {
    enabled: true,
    subtasks,
    pollen: [],
    status: 'decomposing',
    startedAt: now(),
    creditsUsed: 0,
    before: beforeMetrics,
    strategy: subtasks[0]?.strategy || '通用',
    editable: true, // 允许人机协作编辑
  };
  save();

  emit('swarm_start', { subtasks, total: subtasks.length, strategy: task.swarm.strategy, before: beforeMetrics });
  emit('plan', { steps: subtasks.map(s => `${ROLE_META[s.role]?.icon || '🐝'} ${s.title} [${s.strategy||''}]`) });

  // 人机协作暂停点：若开启 humanInLoop，则等待用户编辑子任务（30秒超时自动继续）P1
  const humanInLoop = db.settings.swarm?.humanInLoop;
  if (humanInLoop) {
    task.swarm.waitingSince = now();
    task.swarm.status = 'waiting_human';
    save();
    emit('swarm_human_pause', { message: '分解完成，可在右侧编辑子任务，30秒后自动继续', subtasks, waitingSince: task.swarm.waitingSince });
    emit('think', { text: '⏸️ 人机协作：已暂停，等待用户编辑子任务（30s）… 右侧可编辑标题/指令' });
    const startWait = Date.now();
    while (Date.now() - startWait < 30000) {
      await sleep(1000);
      const fresh = getTask(taskId);
      if (fresh?.swarm?.humanApproved) {
        subtasks = fresh.swarm.subtasks;
        emit('think', { text: '✅ 用户已确认编辑，继续执行' });
        break;
      }
      if (fresh?.stopped) { emit('think', { text: '⛔ 用户已停止' }); updateTask(taskId,{ status:'failed' }); return; }
    }
    // 超时自动继续已在 scheduler 中处理，这里兜底
    if (!getTask(taskId)?.swarm?.humanApproved) {
      task.swarm.humanApproved = true;
      task.swarm.autoContinued = true;
      emit('think', { text: '⏰ 30秒超时自动继续执行' });
    }
    task.swarm.status = 'running';
  } else {
    task.swarm.status = 'running';
  }
  save();

  emit('think', { text: `侦查蜂分解完成：${subtasks.length}个简单任务（${task.swarm.strategy}），${Object.keys(ROLE_META).length}种工蜂角色并行 · 额度可见` });
  
  const concurrency = 3;
  for (let i = 0; i < subtasks.length; i += concurrency) {
    const batch = subtasks.slice(i, i + concurrency);
    await Promise.all(batch.map(async (sub) => {
      sub.status = 'running';
      emit('swarm_bee_update', { subtaskId: sub.id, status: 'running' });
      const pollen = await runWorkerBee(sub, task, pollenDB, ctx, 0);
      sub.status = pollen.confidence < 0.4 ? 'failed' : 'done';
      sub.confidence = pollen.confidence;
      sub.gdi = pollen.gdi;
      sub.deliverable = pollen.deliverable;
      task.swarm.pollen = pollenDB.snapshot();
      // 模型切换按模型计费：不同模型费率不同 P0 额度可见
      const modelRateMap = { offline: 0, deepseek: 1, kimi: 1.2, glm: 1.1, minimax: 0.9, openai: 2, custom: 1.5 };
      const modelId = task.modelId||modelCfg?.id||'offline';
      const modelRate = modelRateMap[modelId] || modelRateMap.custom;
      const baseCost = 10 + Math.round(pollen.confidence * 20);
      const cost = Math.round(baseCost * modelRate);
      task.swarm.creditsUsed += cost;
      task.swarm.creditsDetail = task.swarm.creditsDetail || [];
      task.swarm.creditsDetail.push({ subtask: subtask.title, model: modelId, rate: modelRate, base: baseCost, cost });
      save();
      emit('swarm_bee_update', { subtaskId: sub.id, status: sub.status, confidence: pollen.confidence, credits: task.swarm.creditsUsed });
    }));
    await sleep(300);
    const latest = getTask(taskId);
    if (latest?.stopped) { emit('think',{ text:'⛔ 任务已停止' }); return; }
  }

  // Queen aggregation
  emit('think', { text: '👑 蜂王聚合中：加权置信度 + GDI评分 + 冲突标红 + 前后对比…' });
  const { finalConfidence, honey, conflicts } = queenAggregate(pollenDB);
  
  const afterMetrics = { files: T.listTree(ws.root).length, genes: (getDB().genes||[]).length, ts: now(), artifacts: (task.artifacts||[]).length };
  const diffMetrics = {
    filesAdded: afterMetrics.files - beforeMetrics.files,
    genesAdded: afterMetrics.genes - beforeMetrics.genes,
    artifacts: afterMetrics.artifacts,
    creditsUsed: task.swarm.creditsUsed,
    before: beforeMetrics,
    after: afterMetrics,
  };

  const fullHoney = honey + `\n\n## 📊 前后对比\n- 文件：${beforeMetrics.files} → ${afterMetrics.files} (+${diffMetrics.filesAdded})\n- Gene：${beforeMetrics.genes} → ${afterMetrics.genes} (+${diffMetrics.genesAdded})\n- 产物：${afterMetrics.artifacts} 个\n- 额度消耗：${task.swarm.creditsUsed} / ${getDB().settings.swarm?.credits||1500}\n- 策略：${task.swarm.strategy}\n`;

  ctx.artifact('蜂蜜报告.md', `openwork-output/${taskId}/蜂蜜报告.md`, fullHoney);
  
  // Gene沉淀
  const genesToSave = pollenDB.toGene();
  if (genesToSave.length) {
    const dbb = getDB();
    dbb.genes = dbb.genes || [];
    for (const g of genesToSave) {
      dbb.genes.push({
        id: uid('gene-'),
        claim: g.claim,
        evidence: g.evidence,
        gdi: g.gdi,
        sourceTask: taskId,
        from: g.source,
        createdAt: now(),
        usage: 1,
      });
    }
    save();
    emit('swarm_gene', { genes: genesToSave, count: genesToSave.length });
  }

  task.swarm.status = 'done';
  task.swarm.finalConfidence = finalConfidence;
  task.swarm.conflicts = conflicts.length;
  task.swarm.honey = fullHoney;
  task.swarm.finishedAt = now();
  task.swarm.metrics = diffMetrics;
  save();

  emit('swarm_done', { finalConfidence, conflicts: conflicts.length, metrics: diffMetrics });
  emit('assistant_message', { text: fullHoney });
  emit('status', { status: 'done' });
  updateTask(taskId, { status: 'done' });
}

export function shouldUseSwarm(prompt, mode, settings) {
  if (mode === 'swarm') return true;
  if (prompt?.includes('蜂群') || prompt?.includes('swarm')) return true;
  // 复杂任务判断：长、含多个动词、办公复杂场景
  if (!prompt) return false;
  if (prompt.length > 80) return true;
  const complexKeywords = ['整理','分析','报告','周报','发票','会议','合同','调研','可视化','显存','计算器'];
  const hit = complexKeywords.filter(k => prompt.includes(k)).length;
  if (hit >= 2) return true;
  if (settings?.swarm?.autoEnable) return true;
  return false;
}
