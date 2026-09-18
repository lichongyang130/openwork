/**
 * Electron Preload - 安全隔离
 * 暴露 selectFolder API 给渲染进程
 */
const { contextBridge, ipcRenderer } = (() => {
  try { return require('electron'); } catch { return {}; }
})();

if (contextBridge) {
  contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    platform: process.platform,
    version: '0.2.0',
  });
  console.log('[preload] electronAPI 已暴露');
}
