const J = (r) => r.json();

export const api = {
  state: () => fetch('/api/state').then(J),
  createTask: (body) => fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  getTask: (id) => fetch(`/api/tasks/${id}`).then(J),
  deleteTask: (id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(J),
  message: (id, text) => fetch(`/api/tasks/${id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) }).then(J),
  approve: (id, aid, approve) => fetch(`/api/tasks/${id}/approvals/${aid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approve }) }).then(J),
  events: (id, after) => new EventSource(`/api/tasks/${id}/events?after=${after}`),
  wsFiles: (id) => fetch(`/api/workspaces/${id}/files`).then(J),
  addWorkspace: (body) => fetch('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  artText: (taskId, artId) => fetch(`/api/artifacts/${taskId}/${artId}/text`).then(J),
  artRaw: (taskId, artId) => `/api/artifacts/${taskId}/${artId}/raw`,
  saveSettings: (body) => fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  testModel: (body) => fetch('/api/models/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  pinTask: (id) => fetch(`/api/tasks/${id}/pin`, { method: 'POST' }).then(J),
  archiveTask: (id) => fetch(`/api/tasks/${id}/archive`, { method: 'POST' }).then(J),
  cacheStats: () => fetch('/api/cache/stats').then(J),
  cacheClear: () => fetch('/api/cache/clear', { method: 'POST' }).then(J),
  createSkill: (body) => fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  deleteSkill: (id) => fetch(`/api/skills/${id}`, { method: 'DELETE' }).then(J),
  skillFromTask: (id) => fetch(`/api/skills/from-task/${id}`, { method: 'POST' }).then(J),
  audit: () => fetch('/api/audit').then(J),
  wsFile: (wsId, p) => fetch(`/api/workspaces/${wsId}/file?path=${encodeURIComponent(p)}`).then(J),
  renameTask: (id, title) => fetch(`/api/tasks/${id}/rename`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) }).then(J),
  deleteModel: (id) => fetch('/api/models/' + encodeURIComponent(id), { method: 'DELETE' }).then(J),
  toggleSkill: (id) => fetch(`/api/skills/${id}/toggle`, { method: 'POST' }).then(J),
  installSkill: (id) => fetch(`/api/skills/${id}/install`, { method: 'POST' }).then(J),
  addAutomation: (body) => fetch('/api/automations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  toggleAutomation: (id) => fetch(`/api/automations/${id}/toggle`, { method: 'POST' }).then(J),
  deleteAutomation: (id) => fetch(`/api/automations/${id}`, { method: 'DELETE' }).then(J),
  runAutomation: (id) => fetch(`/api/automations/${id}/run`, { method: 'POST' }).then(J),
  // 蜂群 v2
  swarmDecompose: (prompt, strategy='auto') => fetch('/api/swarm/decompose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, strategy }) }).then(J),
  swarmCredits: () => fetch('/api/swarm/credits').then(J),
  swarmUpdateSubtasks: (taskId, subtasks) => fetch(`/api/swarm/tasks/${taskId}/subtasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks }) }).then(J),
  channelPush: (body) => fetch('/api/channels/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  listGenes: (q) => fetch(`/api/genes${q ? '?q=' + encodeURIComponent(q) : ''}`).then(J),
  createGene: (body) => fetch('/api/genes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  updateGeneGDI: (id, delta) => fetch(`/api/genes/${id}/gdi`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta }) }).then(J),
  deleteGene: (id) => fetch(`/api/genes/${id}`, { method: 'DELETE' }).then(J),
  listMarketGenes: (q) => fetch(`/api/marketplace/genes${q ? '?q=' + encodeURIComponent(q) : ''}`).then(J),
  installMarketGene: (id) => fetch(`/api/marketplace/genes/${id}/install`, { method: 'POST' }).then(J),
  // 🧠 HiveMind Memory OS
  listMemories: (params={}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`/api/memories${qs?'?'+qs:''}`).then(J);
  },
  searchMemories: (q, opts={}) => {
    const qs = new URLSearchParams({ q, ...opts }).toString();
    return fetch(`/api/memories/search?${qs}`).then(J);
  },
  createMemory: (body) => fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(J),
  deleteMemory: (id) => fetch(`/api/memories/${id}`, { method: 'DELETE' }).then(J),
  brainRemember: (text, projectId) => fetch('/api/brain/remember', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, projectId }) }).then(J),
  brainCockpit: () => fetch('/api/brain/cockpit').then(J),
  contextPackage: (prompt, projectId) => fetch(`/api/context/package?prompt=${encodeURIComponent(prompt)}${projectId?'&projectId='+encodeURIComponent(projectId):''}`).then(J),
  projectMemory: (id) => fetch(`/api/projects/${id}/memory`).then(J),
  listProjects: () => fetch('/api/projects').then(J),
  memoryStats: () => fetch('/api/memories/stats').then(J),
  consolidate: () => fetch('/api/brain/consolidate', { method: 'POST' }).then(J),
};
