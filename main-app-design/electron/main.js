'use strict';
// WinForge · Material 3 — Electron main process.
// Frameless window: the renderer draws the M3 title bar and Windows caption
// buttons, and asks the main process to minimise / maximise / close over IPC.

const { app, BrowserWindow, ipcMain, shell, nativeTheme } = require('electron');
const path = require('path');

const RENDERER = path.join(__dirname, '..', 'WinForge M3.dc.html');
let win = null;

// Squirrel.Windows install/uninstall/update events: exit immediately so the
// installer can finish. Squirrel owns the per-user install and relaunch.
if (process.platform === 'win32') {
  const squirrel = process.argv[1] || '';
  if (/^--squirrel-(install|updated|uninstall|obsolete|firstrun)/.test(squirrel)) {
    if (squirrel !== '--squirrel-firstrun') { app.quit(); }
  }
}

// One instance only — a second launch focuses the existing window and honours
// its --page deep link.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
    const page = deepLink(argv);
    if (page) win.webContents.send('winforge:deep-link', page);
  });
}

function deepLink(argv) {
  const i = (argv || []).indexOf('--page');
  return i >= 0 && argv[i + 1] ? String(argv[i + 1]) : null;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 940,
    minHeight: 620,
    show: false,
    frame: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#131314' : '#ffffff',
    title: 'WinForge',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  win.loadFile(RENDERER);
  win.once('ready-to-show', () => {
    win.show();
    const page = deepLink(process.argv);
    if (page) win.webContents.send('winforge:deep-link', page);
  });

  // Report maximise state so the renderer can swap the caption glyph.
  const sendState = () => win && win.webContents.send('winforge:window-state', { maximised: win.isMaximized() });
  win.on('maximize', sendState);
  win.on('unmaximize', sendState);
  win.on('closed', () => { win = null; });

  // External links open in the user's browser, never inside the app frame.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.on('winforge:minimise', () => win && win.minimize());
ipcMain.on('winforge:maximise', () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize(); else win.maximize();
});
ipcMain.on('winforge:close', () => win && win.close());
ipcMain.handle('winforge:version', () => app.getVersion());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
