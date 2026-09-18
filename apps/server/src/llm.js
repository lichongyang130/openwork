import { uid } from './util.js';

/** OpenAI 兼容协议适配器（DeepSeek / Kimi / GLM / MiniMax / OpenAI 均支持） */
export async function chatCompletion(modelCfg, { messages, tools, temperature = 0.4 } = {}, ctx) {
  if (!modelCfg?.apiKey) throw new Error('未配置 API Key');
  const url = `${modelCfg.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const payload = {
    model: modelCfg.modelName || modelCfg.name || defaultModelName(modelCfg),
    messages,
    tools: tools?.length ? tools : undefined,
    temperature,
  };
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${modelCfg.apiKey}` },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // 服务端出站受限时，交给用户浏览器中继代发
    if (!ctx?.live) throw new Error('网络不可达，无法连接模型接口');
    return relayViaBrowser(ctx, url, modelCfg.apiKey, payload);
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`模型调用失败 ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message || { role: 'assistant', content: '' };
}

/* ---------------- 浏览器中继 ---------------- */
const pending = new Map();

export function resolveRelay(relayId, body) {
  const p = pending.get(relayId);
  if (!p) return false;
  clearTimeout(p.timer);
  pending.delete(relayId);
  p.resolve(body);
  return true;
}

/** SSE 连接时补发该任务尚未完成的 relay 请求（防止广播早于订阅） */
export function getPendingRelays(taskId) {
  return [...pending.values()]
    .filter((p) => p.taskId === taskId)
    .map((p) => ({ relayId: p.relayId, url: p.url, apiKey: p.apiKey, payload: p.payload }));
}

function relayViaBrowser(ctx, url, apiKey, payload) {
  const relayId = uid('relay-');
  ctx.emit('think', { text: '本地服务无法直连模型接口，正在通过你的浏览器中继调用…' });
  const wait = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(relayId); reject(new Error('浏览器中继超时')); }, 90000);
    pending.set(relayId, { resolve, reject, timer, taskId: ctx.task.id, relayId, url, apiKey, payload });
  });
  ctx.live('llm_relay', { relayId, url, apiKey, payload });
  return wait.then((out) => {
    if (!out?.ok) throw new Error(out?.error || '浏览器中继失败');
    return out.data?.choices?.[0]?.message || { role: 'assistant', content: '' };
  });
}

function defaultModelName(cfg) {
  return (
    {
      DeepSeek: 'deepseek-chat',
      Moonshot: 'moonshot-v1-8k',
      Zhipu: 'glm-4-flash',
      MiniMax: 'abab6.5s-chat',
      OpenAI: 'gpt-4o-mini',
      Tencent: 'deepseek-v3',
      Custom: cfg.name,
    }[cfg.provider] || 'gpt-4o-mini'
  );
}

export const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'list_dir',
      description: '列出工作区目录下的文件与子目录',
      parameters: { type: 'object', properties: { path: { type: 'string', description: '相对路径，默认根' } }, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: '读取工作区文件内容（文本，前 6000 字符）',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: '把成果 / 文档写入工作区（相对路径，含文件名）',
      parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'mkdir',
      description: '在工作区创建目录',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'move_file',
      description: '移动 / 重命名工作区文件',
      parameters: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_file',
      description: '删除工作区文件（高危，需用户确认）',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_files',
      description: '在整个工作区全文检索关键词，返回命中的文件与行（最多 30 条）',
      parameters: { type: 'object', properties: { query: { type: 'string', description: '关键词 / 正则' }, path: { type: 'string', description: '限定子目录，默认全部' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_cmd',
      description: '在工作区内执行一条 shell 命令（高危，需用户确认后执行）',
      parameters: { type: 'object', properties: { cmd: { type: 'string', description: '要执行的命令' } }, required: ['cmd'] },
    },
  },
];
