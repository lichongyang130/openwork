/**
 * MCP Server 真实实现（兼容 @modelcontextprotocol/sdk）
 * 暴露 OpenWork 工具：listTree/readFile/writeFile/guardPath/createSnapshot/rollback
 * 可被 Claude Desktop / Cursor 等 MCP 客户端直接调用
 */
import { listTree, readFile, writeFile, guardPath, createSnapshot, listSnapshots, rollbackSnapshot, OUTPUT_DIR } from './tools.js';
import { getDB } from './store.js';

export const MCP_TOOLS = [
  { name: 'list_files', description: '列出工作区文件树', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } } },
  { name: 'read_file', description: '读取工作区文件内容', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' }, path: { type: 'string' } }, required: ['path'] } },
  { name: 'write_file', description: '写入文件到工作区', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' }, path: { type: 'string' }, content: { type: 'string' } }, required: ['path','content'] } },
  { name: 'create_snapshot', description: '创建可回滚快照', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } } },
  { name: 'list_snapshots', description: '列出快照', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' } } } },
  { name: 'rollback_snapshot', description: '回滚到指定快照', inputSchema: { type: 'object', properties: { workspaceId: { type: 'string' }, snapshotId: { type: 'string' } }, required: ['snapshotId'] } },
  { name: 'search_genes', description: '搜索Gene记忆', inputSchema: { type: 'object', properties: { keyword: { type: 'string' } } } },
];

export function getWorkspaceRoot(workspaceId) {
  const db = getDB();
  const ws = db.workspaces.find(w=>w.id===workspaceId) || db.workspaces[0];
  return ws.root;
}

export async function handleMcpTool(name, args) {
  const root = getWorkspaceRoot(args.workspaceId);
  switch(name) {
    case 'list_files': return { files: listTree(root).slice(0,100) };
    case 'read_file': return readFile(root, args.path, 8000);
    case 'write_file': return writeFile(root, args.path, args.content);
    case 'create_snapshot': return createSnapshot(root);
    case 'list_snapshots': return listSnapshots(root);
    case 'rollback_snapshot': return rollbackSnapshot(root, args.snapshotId);
    case 'search_genes': {
      const { searchGenes } = await import('./genes.js');
      return searchGenes(args.keyword||'');
    }
    default: throw new Error(`unknown tool ${name}`);
  }
}

// 若安装了 @modelcontextprotocol/sdk，则启动 stdio server
export async function startMcpStdio() {
  try {
    const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
    const server = new Server({ name: 'openwork-mcp', version: '0.2.0' }, { capabilities: { tools: {} } });
    server.setRequestHandler('tools/list', async () => ({ tools: MCP_TOOLS }));
    server.setRequestHandler('tools/call', async (req) => {
      const { name, arguments: args } = req.params;
      const result = await handleMcpTool(name, args||{});
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('[mcp] MCP stdio server 已启动，工具数', MCP_TOOLS.length);
  } catch (e) {
    console.log('[mcp] SDK 未安装，跳过 stdio 启动（工具层已兼容协议）', e.message);
  }
}
