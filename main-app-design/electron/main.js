'use strict';
// WinForge · Material 3 Preview — Electron main process.
// Frameless window: the renderer draws the M3 title bar and Windows caption
// buttons, and asks the main process to minimise / maximise / close over IPC.

const { app, BrowserWindow, ipcMain, shell, nativeTheme, session } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

const RENDERER = path.join(__dirname, '..', 'WinForge M3.dc.html');
const ICON = path.join(__dirname, '..', 'assets', 'app.ico');
let win = null;
let updateCheck = null;
let updateTimer = null;
let updateState = {
  state: 'idle',
  currentVersion: app.getVersion(),
  version: null,
  releaseNotesUrl: null,
  progress: null,
  message: 'Updates have not been checked yet.',
  unsigned: true,
};

function publishUpdateState(patch) {
  updateState = { ...updateState, ...patch };
  if (win && !win.isDestroyed()) win.webContents.send('winforge:update-state', updateState);
}

function classifyUpdateError(error) {
  const message = String(error && (error.message || error) || 'Unknown update failure.');
  if (/ENOTFOUND|ECONN|ETIMEDOUT|offline|network/i.test(message)) return { state: 'offline', message: 'The update service is unreachable. The current version remains active.' };
  if (/sha|checksum|integrity|corrupt|signature/i.test(message)) return { state: 'corrupt', message: 'The downloaded update failed its package hash check and was not staged.' };
  if (/yaml|json|metadata|release|version|provider/i.test(message)) return { state: 'invalid', message: 'The update feed returned invalid or unsupported metadata. The current version remains active.' };
  return { state: 'failed', message };
}

async function checkForUpdates(source = 'scheduled') {
  if (!app.isPackaged) {
    publishUpdateState({ state: 'failed', message: 'Update checks are available only in the installed application.' });
    return updateState;
  }
  if (updateCheck) return updateState;
  publishUpdateState({ state: 'checking', progress: null, message: source === 'manual' ? 'Checking for updates…' : 'Background update check in progress…' });
  try {
    updateCheck = await autoUpdater.checkForUpdates();
    if (updateCheck && updateCheck.downloadPromise) await updateCheck.downloadPromise;
    return updateState;
  } catch (error) {
    publishUpdateState(classifyUpdateError(error));
    return updateState;
  } finally {
    updateCheck = null;
  }
}

function configureUpdater() {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Ding-Ding-Projects',
    repo: 'material-winforge',
  });
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.on('checking-for-update', () => publishUpdateState({ state: 'checking', progress: null, message: 'Checking the HTTPS release feed…' }));
  autoUpdater.on('update-available', (info) => publishUpdateState({
    state: 'available', version: info.version,
    releaseNotesUrl: `https://github.com/Ding-Ding-Projects/material-winforge/releases/tag/v${encodeURIComponent(info.version)}`,
    message: `Version ${info.version} is available. Downloading the unsigned Squirrel update in the background…`,
  }));
  autoUpdater.on('update-not-available', () => publishUpdateState({ state: 'up-to-date', version: null, progress: null, message: `Version ${app.getVersion()} is current.` }));
  autoUpdater.on('download-progress', (progress) => publishUpdateState({
    state: 'downloading', progress: Math.max(0, Math.min(100, Math.round(progress.percent || 0))),
    message: `Downloading update: ${Math.max(0, Math.min(100, Math.round(progress.percent || 0)))}%.`,
  }));
  autoUpdater.on('update-downloaded', (info) => publishUpdateState({
    state: 'ready', version: info.version, progress: 100,
    releaseNotesUrl: `https://github.com/Ding-Ding-Projects/material-winforge/releases/tag/v${encodeURIComponent(info.version)}`,
    message: `Version ${info.version} passed feed metadata and package hash validation and is ready to install. The artifact is unsigned.`,
  }));
  autoUpdater.on('error', (error) => publishUpdateState(classifyUpdateError(error)));
  setTimeout(() => checkForUpdates('startup'), 30_000).unref();
  updateTimer = setInterval(() => checkForUpdates('scheduled'), 6 * 60 * 60 * 1000);
  updateTimer.unref();
}

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
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#131314' : '#ffffff',
    title: 'WinForge · Material 3 Preview',
    icon: ICON,
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
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });
}

ipcMain.on('winforge:minimise', () => win && win.minimize());
ipcMain.on('winforge:maximise', () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize(); else win.maximize();
});
ipcMain.on('winforge:close', () => win && win.close());
ipcMain.handle('winforge:version', () => app.getVersion());
ipcMain.handle('winforge:mode', () => 'preview');
ipcMain.handle('winforge:update-state', () => updateState);
ipcMain.handle('winforge:update-check', () => checkForUpdates('manual'));
ipcMain.handle('winforge:update-cancel', () => {
  const token = updateCheck && updateCheck.cancellationToken;
  if (!token) return { ok: false, reason: 'No cancellable metadata or download request is active.' };
  token.cancel();
  updateCheck = null;
  publishUpdateState({ state: 'cancelled', progress: null, message: 'The active update request was cancelled. The current version remains active.' });
  return { ok: true };
});
ipcMain.handle('winforge:update-later', () => {
  publishUpdateState({ state: 'later', message: `Version ${updateState.version || 'the downloaded update'} remains staged. Restart installation was deferred.` });
  return updateState;
});
ipcMain.handle('winforge:update-install', (_event, options = {}) => {
  if (updateState.state !== 'ready' && updateState.state !== 'later') return { ok: false, reason: 'No validated update is ready to install.' };
  if (options.unsavedWork) {
    publishUpdateState({ state: 'ready', message: 'Restart was paused because unsaved work was reported. Save it, then choose Restart to install update again.' });
    return { ok: false, reason: 'unsaved-work' };
  }
  publishUpdateState({ state: 'installing', message: `Restarting to install version ${updateState.version}. The update remains unsigned.` });
  setImmediate(() => autoUpdater.quitAndInstall(false, true));
  return { ok: true };
});
ipcMain.handle('winforge:update-rollback', () => {
  publishUpdateState({ state: 'rollback', message: 'Automatic rollback is unavailable after Squirrel finishes installation. The current release page remains available for manual recovery.' });
  return { ok: false, reason: 'manual-recovery-required', releaseUrl: 'https://github.com/Ding-Ding-Projects/material-winforge/releases' };
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.winforge.m3');
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: /^https?:/i.test(details.url) && !/^https:\/\/github\.com\/Ding-Ding-Projects\/material-winforge\//i.test(details.url) });
  });
  createWindow();
  configureUpdater();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
app.on('before-quit', () => { if (updateTimer) clearInterval(updateTimer); });
