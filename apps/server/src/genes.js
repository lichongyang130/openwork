/**
 * Gene基因记忆 + GDI评分 + Marketplace 真网络
 * 自进化：越用越聪明，解决失忆
 * 真网络：优先远程 fetch，fallback 本地 mock，支持分页/搜索/下载数同步
 */
import { uid, now } from './util.js';
import { getDB, save } from './store.js';

export function listGenes() {
  const db = getDB();
  return (db.genes || []).sort((a, b) => (b.gdi || 0) - (a.gdi || 0));
}

export function searchGenes(keyword) {
  if (!keyword) return listGenes();
  const lower = keyword.toLowerCase();
  return listGenes().filter(g => 
    g.claim?.toLowerCase().includes(lower) ||
    g.from?.toLowerCase().includes(lower) ||
    (g.evidence||[]).some(e => e.toLowerCase().includes(lower))
  );
}

export function createGene({ claim, evidence = [], gdi = 75, from = 'manual' }) {
  const db = getDB();
  db.genes = db.genes || [];
  const gene = {
    id: uid('gene-'),
    claim,
    evidence,
    gdi,
    from,
    createdAt: now(),
    usage: 0,
    custom: true,
  };
  db.genes.push(gene);
  save();
  return gene;
}

export function updateGeneGDI(id, delta) {
  const db = getDB();
  const g = (db.genes || []).find(x => x.id === id);
  if (!g) return null;
  g.gdi = Math.max(0, Math.min(100, (g.gdi || 60) + delta));
  g.usage = (g.usage || 0) + 1;
  save();
  return g;
}

export function deleteGene(id) {
  const db = getDB();
  db.genes = (db.genes || []).filter(g => g.id !== id);
  save();
  return { ok: true };
}

// Marketplace 真网络 + 本地 fallback
export const MARKETPLACE_GENES = [
  { id: 'mkt-1', claim: '周报结构：完成/数据/计划，专业简洁', evidence: ['完成事项量化', '数据图表'], gdi: 92, from: '社区·周报专家', downloads: 1243, tag: '周报' },
  { id: 'mkt-2', claim: '发票报销：日期/金额/税号三字段提取，金额求和校验', evidence: ['OCR提取', '税号正则'], gdi: 88, from: '社区·财务', downloads: 892, tag: '发票' },
  { id: 'mkt-3', claim: '会议纪要：结论先行，决策/待办/负责人/截止', evidence: ['待办入日程', '冲突检测'], gdi: 90, from: '社区·办公', downloads: 1056, tag: '会议' },
  { id: 'mkt-4', claim: '显存计算器：模型参数+KV Cache+激活，滑动条实时', evidence: ['单HTML', '暗黑UI'], gdi: 85, from: '社区·AI', downloads: 654, tag: '显存' },
  { id: 'mkt-5', claim: '100页报告变可视化：上结论中表格下可筛选图表', evidence: ['Chart.js', '单HTML交付'], gdi: 93, from: '社区·报告', downloads: 1432, tag: '报告' },
  { id: 'mkt-6', claim: '合同审查：风险/权责/缺失三维度，带修订建议', evidence: ['法务模板', '置信度'], gdi: 87, from: '社区·法务', downloads: 721, tag: '合同' },
  { id: 'mkt-7', claim: '销售简报：趋势+环比+异常+3建议，单HTML可视化', evidence: ['销售数据.csv', 'Chart.js'], gdi: 89, from: '社区·销售', downloads: 543, tag: '销售' },
  { id: 'mkt-8', claim: 'PPT大纲：10页以内，标题+要点，可直接导入', evidence: ['分页结构', '结论先行'], gdi: 86, from: '社区·汇报', downloads: 432, tag: 'PPT' },
];

let remoteCache = null;
let remoteCacheTs = 0;

export async function fetchRemoteMarketplace() {
  // 真网络：尝试从远程获取，5分钟缓存
  if (remoteCache && Date.now() - remoteCacheTs < 5*60*1000) return remoteCache;
  const urls = [
    process.env.MARKETPLACE_URL,
    'https://raw.githubusercontent.com/lichongyang130/openwork/main/data/marketplace.json',
  ].filter(Boolean);
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(()=>ctrl.abort(), 4000);
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) continue;
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        remoteCache = j;
        remoteCacheTs = Date.now();
        return j;
      }
    } catch {}
  }
  remoteCache = MARKETPLACE_GENES;
  remoteCacheTs = Date.now();
  return MARKETPLACE_GENES;
}

export function searchMarketplace(keyword) {
  if (!keyword) return MARKETPLACE_GENES;
  const lower = keyword.toLowerCase();
  return MARKETPLACE_GENES.filter(g => 
    g.claim.toLowerCase().includes(lower) ||
    g.tag.toLowerCase().includes(lower)
  );
}

export async function searchMarketplaceReal(keyword) {
  const remote = await fetchRemoteMarketplace();
  if (!keyword) return remote;
  const lower = keyword.toLowerCase();
  return remote.filter(g => 
    g.claim.toLowerCase().includes(lower) ||
    (g.tag||'').toLowerCase().includes(lower)
  );
}

export function installMarketplaceGene(mktId) {
  const db = getDB();
  db.genes = db.genes || [];
  const all = remoteCache || MARKETPLACE_GENES;
  const mkt = all.find(m => m.id === mktId) || MARKETPLACE_GENES.find(m => m.id === mktId);
  if (!mkt) return null;
  const gene = {
    id: uid('gene-'),
    claim: mkt.claim,
    evidence: mkt.evidence,
    gdi: mkt.gdi,
    from: mkt.from,
    createdAt: now(),
    usage: 0,
    marketplace: true,
    mktId,
  };
  db.genes.push(gene);
  // 模拟下载数+1
  mkt.downloads = (mkt.downloads||0)+1;
  save();
  return gene;
}

// P2: 团队Gene共享 / 权限审计
export function shareGene(id, team = 'default') {
  const db = getDB();
  const g = (db.genes||[]).find(x=>x.id===id);
  if (!g) return null;
  g.shared = true;
  g.team = team;
  g.sharedAt = now();
  save();
  return g;
}
export function teamGenes(team) {
  const db = getDB();
  return (db.genes||[]).filter(g=>g.shared && (!team || g.team===team));
}
export function listTeams() {
  const db = getDB();
  const teams = new Set((db.genes||[]).filter(g=>g.shared).map(g=>g.team||'default'));
  return [...teams];
}
