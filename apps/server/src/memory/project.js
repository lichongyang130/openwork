/**
 * 📁 Project Memory
 * 项目本身拥有记忆：目标、架构、决策、TODO、进度
 */
import { getDB, save } from '../store.js';
import { uid, now } from '../util.js';
import { listMemories } from './index.js';

export function getProject(id) {
  const db = getDB();
  return (db.projects||[]).find(p=>p.id===id) || null;
}

export function listProjects() {
  const db = getDB();
  return db.projects||[];
}

export function upsertProject({ id, name, goal, techStack=[], progress }) {
  const db = getDB();
  db.projects = db.projects||[];
  let p = db.projects.find(x=>x.id===id);
  if (!p) {
    p = { id: id||uid('proj-'), name: name||id, goal: goal||'', techStack, progress: progress||0, status: 'active', createdAt: now(), updatedAt: now() };
    db.projects.push(p);
  } else {
    if (name) p.name = name;
    if (goal) p.goal = goal;
    if (techStack) p.techStack = techStack;
    if (progress!=null) p.progress = progress;
    p.updatedAt = now();
  }
  save();
  return p;
}

export function getProjectMemory(wsId) {
  const db = getDB();
  const proj = getProject(wsId) || { id: wsId, name: wsId, goal: '', progress: 0, techStack: [] };
  const tasks = (db.tasks||[]).filter(t=>t.workspaceId===wsId);
  const done = tasks.filter(t=>t.status==='done').length;
  const total = tasks.length||1;
  const calcProgress = Math.round((done/total)*100);

  // 相关记忆
  const memories = listMemories({ projectId: wsId, limit: 20 });
  const decisions = memories.filter(m=>m.type==='decision');
  const todos = tasks.filter(t=>['planning','running','waiting'].includes(t.status)).map(t=>({ id: t.id, title: t.title, status: t.status }));
  const recent = tasks.slice(0,5).map(t=>({ id: t.id, title: t.title, status: t.status, updatedAt: t.updatedAt }));

  return {
    project: { ...proj, progress: proj.progress||calcProgress, tasksTotal: tasks.length, tasksDone: done },
    memories,
    decisions,
    todos,
    recent,
    stats: { total: tasks.length, done, running: tasks.filter(t=>t.status==='running').length, waiting: tasks.filter(t=>t.status==='waiting').length }
  };
}

export function updateProjectProgress(wsId, task) {
  const db = getDB();
  const tasks = (db.tasks||[]).filter(t=>t.workspaceId===wsId);
  const done = tasks.filter(t=>t.status==='done').length;
  const progress = tasks.length ? Math.round((done/tasks.length)*100) : 0;
  const proj = getProject(wsId);
  if (proj) {
    proj.progress = progress;
    proj.updatedAt = now();
    save();
  }
  return progress;
}
