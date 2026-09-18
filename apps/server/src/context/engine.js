/**
 * 🔍 Context Engine
 * 负责：到底应该给当前 Agent 看哪些记忆？
 * 输入：用户prompt + projectId
 * 输出：Context Package
 */
import { searchMemories, searchDecisions, searchExperiences, getProjectMemories } from '../memory/retrieval.js';
import { getProject } from '../memory/project.js';
import { getDB } from '../store.js';

export function buildContextPackage(prompt, { projectId=null, topK=5 }={}) {
  const project = projectId ? getProject(projectId) : null;
  const relevant = searchMemories(prompt, { projectId, topK });
  const decisions = searchDecisions(prompt, projectId);
  const experiences = searchExperiences(prompt, projectId);
  const projectMems = projectId ? getProjectMemories(projectId) : {};

  // 行为模式发现（简单版）
  const db = getDB();
  const userTasks = (db.tasks||[]).slice(0, 50);
  const patterns = discoverPatterns(userTasks);

  // 去重：相关记忆已包含决策/经验则不重复
  const allIds = new Set(relevant.map(m=>m.id));
  const extraDecisions = decisions.filter(d=>!allIds.has(d.id));
  const extraExps = experiences.filter(e=>!allIds.has(e.id));

  const pkg = {
    query: prompt,
    project: project ? { id: project.id, name: project.name, goal: project.goal, progress: project.progress, techStack: project.techStack } : null,
    relevantMemories: relevant,
    decisions: extraDecisions,
    experiences: extraExps,
    projectMemory: {
      decisions: (projectMems.decision||[]).slice(0,3),
      recent: (projectMems.episodic||[]).slice(0,2),
    },
    patterns,
    timestamp: new Date().toISOString(),
  };

  // 转换为 LLM 可读的 system prompt 注入
  pkg.promptInjection = toPromptInjection(pkg);

  return pkg;
}

function discoverPatterns(tasks) {
  if (!tasks.length) return null;
  // 简单统计：用户最常做哪类任务
  const byIntent = {};
  for (const t of tasks) {
    const p = t.prompt||'';
    let intent = 'generic';
    if (/周报|总结/.test(p)) intent = 'weekly';
    else if (/报告|调研/.test(p)) intent = 'report';
    else if (/发票|报销/.test(p)) intent = 'invoice';
    else if (/会议|纪要/.test(p)) intent = 'meeting';
    else if (/代码|重构|Bug/.test(p)) intent = 'code';
    byIntent[intent] = (byIntent[intent]||0)+1;
  }
  const sorted = Object.entries(byIntent).sort((a,b)=>b[1]-a[1]);
  if (sorted.length && sorted[0][1]>=3) {
    return { topIntent: sorted[0][0], counts: byIntent, insight: `你最近 ${tasks.length} 个任务中，${sorted[0][1]} 个是 ${sorted[0][0]}，已为你准备对应模板` };
  }
  return null;
}

function toPromptInjection(pkg) {
  const lines = [];
  if (pkg.project) {
    lines.push(`【当前项目】${pkg.project.name} - ${pkg.project.goal||'无目标'} 进度${pkg.project.progress||0}% 技术栈:${(pkg.project.techStack||[]).join(',')}`);
  }
  if (pkg.relevantMemories.length) {
    lines.push(`【相关记忆】`);
    for (const m of pkg.relevantMemories.slice(0,5)) {
      lines.push(`- [${m.type} ${Math.round((m._score||0)*100)}%] ${m.content.slice(0,120)} (重要性${m.importance})`);
    }
  }
  if (pkg.decisions.length) {
    lines.push(`【历史决策】`);
    for (const d of pkg.decisions.slice(0,3)) lines.push(`- ${d.content}`);
  }
  if (pkg.experiences.length) {
    lines.push(`【经验/教训】`);
    for (const e of pkg.experiences.slice(0,3)) lines.push(`- ${e.type==='failure'?'❌':'✅'} ${e.content.slice(0,100)}`);
  }
  if (pkg.patterns?.insight) {
    lines.push(`【行为模式】${pkg.patterns.insight}`);
  }
  return lines.join('\n');
}

// 给 Queen 用的快速检索
export function quickContext(prompt, projectId) {
  return buildContextPackage(prompt, { projectId, topK: 5 });
}
