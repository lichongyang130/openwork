/**
 * 🧠 Memory OS - Manager
 * 8层记忆：episodic, semantic, user, project, decision, relationship, experience, failure
 * 核心：是否值得记、重要性评分、遗忘、巩固
 */
import { getDB, save } from '../store.js';
import { uid, now } from '../util.js';

const TYPE_WEIGHT = {
  decision: 0.95,
  project: 0.9,
  user: 0.88,
  experience: 0.85,
  failure: 0.82,
  semantic: 0.8,
  relationship: 0.75,
  episodic: 0.6,
};

const WORTHLESS_PATTERNS = [
  /^今天天气不错/,
  /^你好$/,
  /^谢谢/,
  /^ok$/i,
  /^好的$/,
];

const WORTHY_PATTERNS = [
  { re: /记住|以后.*都|偏好|喜欢|习惯/, type: 'user', importance: 0.9 },
  { re: /决定|采用|使用.*作为|技术选型|架构/, type: 'decision', importance: 0.94 },
  { re: /项目.*目标|正在做|进行中/, type: 'project', importance: 0.88 },
  { re: /经验|发现|成功|提升|解决/, type: 'experience', importance: 0.85 },
  { re: /失败|踩坑|问题|错误|教训/, type: 'failure', importance: 0.82 },
  { re: /是.*定义|等于|含义/, type: 'semantic', importance: 0.8 },
];

export function shouldRemember(text) {
  if (!text || text.trim().length < 6) return { remember: false, reason: 'too_short' };
  const t = text.trim();
  if (WORTHLESS_PATTERNS.some(r => r.test(t))) return { remember: false, reason: 'worthless' };
  for (const p of WORTHY_PATTERNS) {
    if (p.re.test(t)) return { remember: true, type: p.type, importance: p.importance, reason: 'pattern_match' };
  }
  // 长度 + 含技术词
  if (t.length > 20 && /(PostgreSQL|Redis|DAG|React|Python|架构|数据库|任务|蜂群|Agent)/i.test(t)) {
    return { remember: true, type: 'semantic', importance: 0.75, reason: 'tech_keyword' };
  }
  // 默认不记，靠 LLM 判断（Phase2）
  return { remember: false, reason: 'no_match' };
}

export function calcImportance(content, type, explicit = null) {
  if (explicit != null) return explicit;
  const base = TYPE_WEIGHT[type] || 0.7;
  const lenFactor = Math.min(0.1, content.length / 500);
  return Math.min(0.98, base + lenFactor);
}

export function createMemory({ type='episodic', content, summary=null, importance=null, confidence=0.85, source='conversation', projectId=null, tags=[], status='active' }) {
  const db = getDB();
  db.memories = db.memories || [];
  const mem = {
    id: uid('mem-'),
    type,
    content: content.slice(0, 2000),
    summary: (summary || content.slice(0, 48)).slice(0, 80),
    importance: calcImportance(content, type, importance),
    confidence,
    source,
    projectId,
    tags: tags.slice(0, 6),
    status,
    createdAt: now(),
    updatedAt: now(),
    usage: 0,
    embedding: null,
  };
  db.memories.unshift(mem);
  // 同步到专用表
  if (type === 'decision') {
    db.decisions = db.decisions || [];
    db.decisions.unshift({ ...mem, decisionId: mem.id });
  }
  if (type === 'experience') {
    db.experiences = db.experiences || [];
    db.experiences.unshift(mem);
  }
  if (type === 'failure') {
    db.failures = db.failures || [];
    db.failures.unshift(mem);
  }
  save();
  return mem;
}

export function updateMemory(id, patch) {
  const db = getDB();
  const m = (db.memories||[]).find(x=>x.id===id);
  if (!m) return null;
  Object.assign(m, patch, { updatedAt: now() });
  save();
  return m;
}

export function deleteMemory(id) {
  const db = getDB();
  db.memories = (db.memories||[]).filter(m=>m.id!==id);
  db.decisions = (db.decisions||[]).filter(m=>m.id!==id);
  db.experiences = (db.experiences||[]).filter(m=>m.id!==id);
  db.failures = (db.failures||[]).filter(m=>m.id!==id);
  save();
  return { ok: true };
}

export function listMemories({ type, projectId, status='active', q, limit=100 }={}) {
  const db = getDB();
  let arr = db.memories || [];
  if (type) arr = arr.filter(m=>m.type===type);
  if (projectId) arr = arr.filter(m=>!m.projectId || m.projectId===projectId);
  if (status) arr = arr.filter(m=>m.status===status);
  if (q) {
    const lower = q.toLowerCase();
    arr = arr.filter(m=> m.content.toLowerCase().includes(lower) || m.summary.toLowerCase().includes(lower) || (m.tags||[]).some(t=>t.toLowerCase().includes(lower)));
  }
  // 按 importance * confidence * recency 排序
  const nowMs = Date.now();
  arr = arr.map(m=>{
    const days = (nowMs - new Date(m.createdAt).getTime())/86400000;
    const recency = Math.exp(-days/30);
    const freq = Math.log((m.usage||0)+1)*0.1 + 1;
    const score = (m.importance||0.5)*(m.confidence||0.5)*recency*freq;
    return { ...m, _score: score, _recency: recency };
  }).sort((a,b)=>b._score-a._score);
  return arr.slice(0, limit);
}

export function recordUsage(ids) {
  const db = getDB();
  for (const id of ids) {
    const m = (db.memories||[]).find(x=>x.id===id);
    if (m) m.usage = (m.usage||0)+1;
  }
  save();
}

// 遗忘机制
export function decayMemories() {
  const db = getDB();
  const nowMs = Date.now();
  let archived = 0, decayed = 0;
  for (const m of (db.memories||[])) {
    if (m.status!=='active') continue;
    // 核心记忆永不遗忘
    if (['decision','project','user'].includes(m.type) && (m.importance||0)>0.85) continue;
    const days = (nowMs - new Date(m.updatedAt).getTime())/86400000;
    if (days > 30 && (m.usage||0)<2) {
      m.status = 'archived';
      archived++;
    } else if (days > 7) {
      m.importance = Math.max(0.1, (m.importance||0.5)*0.95);
      decayed++;
    }
  }
  if (archived||decayed) save();
  return { archived, decayed };
}

// 巩固：合并相似记忆
export function consolidateMemories() {
  const db = getDB();
  const groups = new Map();
  for (const m of (db.memories||[]).filter(m=>m.status==='active')) {
    const key = `${m.type}:${(m.tags||[])[0]||m.summary.slice(0,8)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  }
  let merged = 0;
  for (const [key, list] of groups) {
    if (list.length>=3) {
      // 找最重要的作为主，合并其他
      const sorted = list.sort((a,b)=>(b.importance||0)-(a.importance||0));
      const main = sorted[0];
      const others = sorted.slice(1);
      // 如果内容相似度高（简单：summary 包含）
      const similar = others.filter(o=> main.content.includes(o.summary.slice(0,10)) || o.content.includes(main.summary.slice(0,10)));
      if (similar.length>=2) {
        main.usage = (main.usage||0) + similar.reduce((s,x)=>s+(x.usage||0),0);
        main.confidence = Math.min(0.98, (main.confidence||0.5)+0.05);
        main.updatedAt = now();
        // 归档被合并的
        for (const s of similar) s.status = 'archived';
        merged += similar.length;
      }
    }
  }
  if (merged) save();
  return { merged };
}

export function getMemoryStats() {
  const db = getDB();
  const all = db.memories||[];
  const byType = {};
  for (const m of all) {
    if (m.status!=='active') continue;
    byType[m.type] = (byType[m.type]||0)+1;
  }
  return { total: all.filter(m=>m.status==='active').length, archived: all.filter(m=>m.status==='archived').length, byType };
}
