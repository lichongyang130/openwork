/**
 * Electron 主进程 - OpenWork 桌面壳
 * 未安装 electron 时，Web 版完整可用；安装后可打包为桌面应用
 */
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = (() => {
  try { return require('electron'); } catch { return {}; }
})();

if (!app) {
  console.log('[electron] electron 未安装，跳过桌面壳启动，Web 版已完整可用');
  module.exports = {};
  return;
}

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'OpenWork - 蜂群办公',
  });
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) mainWindow.loadURL('http://127.0.0.1:5173');
  else mainWindow.loadFile(path.join(__dirname, '../apps/web/dist/index.html'));
  // 暴露 selectFolder
  console.log('[electron] 窗口已创建，preload:', path.join(__dirname, 'preload.js'));
}

app?.whenReady().then(createWindow);
app?.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app?.on('activate', () => { if (BrowserWindow.getAllWindows().length===0) createWindow(); });

ipcMain?.handle('select-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (canceled) return null;
  return filePaths[0];
});
ipcMain?.handle('open-file', async (_, filePath) => {
  const { shell } = require('electron');
  await shell.openPath(filePath);
  return true;
});
