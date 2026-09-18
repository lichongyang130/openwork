/**
 * 🔎 Memory Retrieval + Context Engine helpers
 * BM25 简化版 + 评分公式 Score = Importance * Relevance * Confidence * Recency * Frequency
 */
import { getDB } from '../store.js';

function tokenize(text) {
  return (text||'').toLowerCase().split(/[\W_]+/).filter(Boolean).slice(0, 100);
}

function relevanceScore(queryTokens, mem) {
  const memTokens = new Set(tokenize(mem.content + ' ' + mem.summary + ' ' + (mem.tags||[]).join(' ')));
  if (!queryTokens.length) return 0.5;
  let hit = 0;
  for (const q of queryTokens) {
    if (memTokens.has(q)) hit++;
    else {
      // 子串匹配
      for (const mt of memTokens) {
        if (mt.includes(q) || q.includes(mt)) { hit+=0.5; break; }
      }
    }
  }
  return Math.min(1, hit / queryTokens.length);
}

export function searchMemories(query, { projectId=null, types=null, topK=5, minScore=0.1 }={}) {
  const db = getDB();
  let arr = (db.memories||[]).filter(m=>m.status==='active');
  if (projectId) {
    // 项目相关优先，但也包含全局记忆（user/semantic）
    arr = arr.filter(m=> !m.projectId || m.projectId===projectId || ['user','semantic','experience','failure'].includes(m.type));
  }
  if (types && types.length) arr = arr.filter(m=>types.includes(m.type));

  const qTokens = tokenize(query);
  const nowMs = Date.now();

  const scored = arr.map(m=>{
    const relevance = relevanceScore(qTokens, m);
    const days = (nowMs - new Date(m.updatedAt||m.createdAt).getTime())/86400000;
    const recency = Math.exp(-days/30); // 30天半衰
    const frequency = Math.log((m.usage||0)+1)*0.2 + 1;
    const importance = m.importance||0.5;
    const confidence = m.confidence||0.5;
    // 公式
    const score = importance * relevance * confidence * recency * frequency;
    return { ...m, _relevance: relevance, _recency: recency, _score: score };
  }).filter(m=>m._score>=minScore)
    .sort((a,b)=>b._score-a._score)
    .slice(0, topK);

  return scored;
}

// 专门检索决策
export function searchDecisions(query, projectId=null) {
  return searchMemories(query, { projectId, types: ['decision'], topK: 5 });
}

// 检索经验
export function searchExperiences(query, projectId=null) {
  return searchMemories(query, { projectId, types: ['experience','failure'], topK: 5 });
}

// 项目记忆聚合
export function getProjectMemories(projectId) {
  const db = getDB();
  const all = (db.memories||[]).filter(m=>m.status==='active' && (!projectId || m.projectId===projectId || !m.projectId));
  const byType = {};
  for (const m of all) {
    byType[m.type] = byType[m.type] || [];
    byType[m.type].push(m);
  }
  // 按 score 排序
  for (const k of Object.keys(byType)) {
    byType[k] = byType[k].sort((a,b)=>(b.importance||0)-(a.importance||0)).slice(0,10);
  }
  return byType;
}
