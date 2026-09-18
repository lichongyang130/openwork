/**
 * 🧹 Memory Consolidation - 每晚整理
 * 人类睡觉整理记忆，AI也一样
 */
import { decayMemories, consolidateMemories, getMemoryStats } from './index.js';
import { now } from '../util.js';

let lastRun = 0;

export function runConsolidation() {
  const nowMs = Date.now();
  if (nowMs - lastRun < 60*60*1000) return { skipped: true }; // 1小时一次
  lastRun = nowMs;
  const decay = decayMemories();
  const merged = consolidateMemories();
  const stats = getMemoryStats();
  console.log(`[memory] consolidation decay=${JSON.stringify(decay)} merged=${JSON.stringify(merged)} stats=${JSON.stringify(stats)}`);
  return { decay, merged, stats, ts: now() };
}

// 每天晚上自动跑
export function startConsolidationJob() {
  setInterval(()=>{
    try { runConsolidation(); } catch(e){ console.error('[memory] consolidation error', e.message); }
  }, 6*60*60*1000); // 6小时
  console.log('[memory] consolidation job started');
}
