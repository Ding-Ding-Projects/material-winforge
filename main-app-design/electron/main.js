'use strict';
// WinForge · Material 3 Preview — Electron main process.
// Frameless window: the renderer draws the M3 title bar and Windows caption
// buttons, and asks the main process to minimise / maximise / close over IPC.

const { app, BrowserWindow, ipcMain, shell, nativeTheme, session } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFile, spawn } = require('child_process');
const { randomBytes } = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RENDERER = path.join(__dirname, '..', 'WinForge M3.dc.html');
const ICON = path.join(__dirname, '..', 'assets', 'app.ico');
let win = null;
let updateCheck = null;
let updateTimer = null;
let previousCpuTimes = null;
let flushDnsActive = false;
let restartExplorerActive = false;
let emptyRecycleBinActive = false;
let snapshotActive = false;
let wingetUpgradeActive = null;
const externalAppLaunches = new Map();
const EXTERNAL_APP_EXECUTABLES = Object.freeze({
  vscode: ['Code.exe', 'code.exe'],
  githubdesktop: ['GitHubDesktop.exe'],
  libreoffice: ['soffice.exe', 'libreoffice.exe'],
  blender: ['blender.exe'],
  gimp: ['gimp-3.exe', 'gimp-2.10.exe', 'gimp.exe'],
  inkscape: ['inkscape.exe'],
  krita: ['krita.exe'],
  darktable: ['darktable.exe'],
  obs: ['obs64.exe', 'obs32.exe'],
  audacity: ['Audacity.exe'],
  handbrake: ['HandBrake.exe'],
  shotcut: ['shotcut.exe'],
  virtualbox: ['VirtualBox.exe'],
  dockerdesktop: ['Docker Desktop.exe'],
  wireshark: ['Wireshark.exe'],
});
const PACKAGE_ENGINE_EXECUTABLES = Object.freeze({
  winget: ['winget.exe'],
  scoop: ['scoop.cmd'],
  choco: ['choco.exe'],
  pip: ['pip.exe', 'pip3.exe'],
  npm: ['npm.cmd'],
  dotnet: ['dotnet.exe'],
  psgallery: [],
  psresource: [],
  cargo: ['cargo.exe'],
  bun: ['bun.exe'],
  vcpkg: ['vcpkg.exe'],
});
const WINGET_UPGRADE_ALLOWLIST = Object.freeze({
  'Git.Git': 'Git',
  'Microsoft.PowerShell': 'PowerShell',
  'GitHub.cli': 'GitHub CLI',
});
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

function finiteNumber(value, minimum, maximum) {
  return Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, value)) : null;
}

function cpuTimes() {
  let idle = 0;
  let total = 0;
  for (const cpu of os.cpus()) {
    const times = cpu && cpu.times;
    if (!times) continue;
    const values = [times.user, times.nice, times.sys, times.idle, times.irq];
    if (!values.every(Number.isFinite)) continue;
    idle += times.idle;
    total += values.reduce((sum, value) => sum + value, 0);
  }
  return total > 0 ? { idle, total } : null;
}

function readSystemMetrics() {
  const result = {
    schemaVersion: 1,
    sampledAt: new Date().toISOString(),
    cpu: { available: false, usedPercent: null },
    memory: { available: false, usedPercent: null },
    disk: { available: false, usedPercent: null },
    network: { available: false, connected: false, interfaceCount: 0 },
    uptimeSeconds: null,
  };

  try {
    const current = cpuTimes();
    if (current && previousCpuTimes) {
      const totalDelta = current.total - previousCpuTimes.total;
      const idleDelta = current.idle - previousCpuTimes.idle;
      const usedPercent = totalDelta > 0 ? finiteNumber(((totalDelta - idleDelta) / totalDelta) * 100, 0, 100) : null;
      if (usedPercent !== null) result.cpu = { available: true, usedPercent: Math.round(usedPercent * 10) / 10 };
    }
    previousCpuTimes = current;
  } catch {
    previousCpuTimes = null;
  }

  try {
    const total = finiteNumber(os.totalmem(), 1, Number.MAX_SAFE_INTEGER);
    const free = finiteNumber(os.freemem(), 0, Number.MAX_SAFE_INTEGER);
    if (total !== null && free !== null) {
      const usedPercent = finiteNumber(((total - Math.min(total, free)) / total) * 100, 0, 100);
      if (usedPercent !== null) result.memory = { available: true, usedPercent: Math.round(usedPercent * 10) / 10 };
    }
  } catch {}

  try {
    if (typeof fs.statfsSync === 'function') {
      const stats = fs.statfsSync(app.getPath('userData'));
      const blockSize = finiteNumber(Number(stats.bsize), 1, Number.MAX_SAFE_INTEGER);
      const blocks = finiteNumber(Number(stats.blocks), 1, Number.MAX_SAFE_INTEGER);
      const freeBlocks = finiteNumber(Number(stats.bavail), 0, Number.MAX_SAFE_INTEGER);
      if (blockSize !== null && blocks !== null && freeBlocks !== null) {
        const totalBytes = blockSize * blocks;
        const freeBytes = blockSize * Math.min(blocks, freeBlocks);
        const usedPercent = finiteNumber(((totalBytes - freeBytes) / totalBytes) * 100, 0, 100);
        if (Number.isSafeInteger(totalBytes) && usedPercent !== null) result.disk = { available: true, usedPercent: Math.round(usedPercent * 10) / 10 };
      }
    }
  } catch {}

  try {
    const interfaces = os.networkInterfaces();
    let interfaceCount = 0;
    let connected = false;
    for (const addresses of Object.values(interfaces || {})) {
      if (!Array.isArray(addresses) || !addresses.some((address) => address && !address.internal)) continue;
      interfaceCount += 1;
      connected = true;
    }
    result.network = { available: true, connected, interfaceCount: Math.min(256, interfaceCount) };
  } catch {}

  try {
    const uptime = finiteNumber(os.uptime(), 0, 10 * 365 * 24 * 60 * 60);
    result.uptimeSeconds = uptime === null ? null : Math.round(uptime);
  } catch {}
  return result;
}

function externalAppResult(id, status, message) {
  return { schemaVersion: 1, id, status, message: String(message).slice(0, 240) };
}

function discoverExecutable(candidate, signal) {
  return new Promise((resolve) => {
    execFile('where.exe', [candidate], {
      windowsHide: true,
      timeout: 3_000,
      maxBuffer: 64 * 1024,
      encoding: 'utf8',
      shell: false,
      signal,
    }, (error, stdout) => {
      if (error) {
        if (signal.aborted || error.name === 'AbortError') resolve({ status: 'cancelled' });
        else if (error.killed || error.code === 'ETIMEDOUT') resolve({ status: 'timeout' });
        else if (error.code === 'ENOENT') resolve({ status: 'unavailable' });
        else resolve({ status: 'not-found' });
        return;
      }
      const match = String(stdout || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean);
      if (!match || match.length > 1024 || /[\u0000-\u001f]/.test(match) || !path.isAbsolute(match) || path.basename(match).toLowerCase() !== candidate.toLowerCase()) {
        resolve({ status: 'not-found' });
        return;
      }
      try {
        if (!fs.statSync(match).isFile()) { resolve({ status: 'not-found' }); return; }
      } catch { resolve({ status: 'not-found' }); return; }
      resolve({ status: 'found', executable: match });
    });
  });
}

async function readPackageEngines() {
  const engines = await Promise.all(Object.entries(PACKAGE_ENGINE_EXECUTABLES).map(async ([id, candidates]) => {
    if (process.platform !== 'win32') return { id, status: 'unavailable' };
    if (!candidates.length) return { id, status: 'unavailable' };
    const controller = new AbortController();
    let timedOut = false;
    for (const candidate of candidates) {
      const discovery = await discoverExecutable(candidate, controller.signal);
      if (discovery.status === 'found') return { id, status: 'available' };
      if (discovery.status === 'timeout') timedOut = true;
      if (discovery.status === 'unavailable') return { id, status: 'unavailable' };
    }
    return { id, status: timedOut ? 'timeout' : 'not-installed' };
  }));
  return { schemaVersion: 1, engines };
}

function flushDns() {
  if (process.platform !== 'win32') return Promise.resolve({ schemaVersion: 1, status: 'unsupported', message: 'DNS cache flushing is supported only on Windows.' });
  if (flushDnsActive) return Promise.resolve({ schemaVersion: 1, status: 'failed', message: 'A DNS cache flush is already running. Wait, then retry.' });
  flushDnsActive = true;
  return new Promise((resolve) => {
    execFile('ipconfig.exe', ['/flushdns'], {
      windowsHide: true,
      timeout: 10_000,
      maxBuffer: 128 * 1024,
      encoding: 'utf8',
      shell: false,
    }, (error) => {
      flushDnsActive = false;
      if (!error) { resolve({ schemaVersion: 1, status: 'flushed', message: 'The Windows DNS resolver cache was flushed.' }); return; }
      if (error.killed || error.code === 'ETIMEDOUT') { resolve({ schemaVersion: 1, status: 'timeout', message: 'DNS cache flushing timed out. Retry is available.' }); return; }
      resolve({ schemaVersion: 1, status: 'failed', message: 'Windows did not complete the DNS cache flush. Retry is available.' });
    });
  });
}

function emptyRecycleBin() {
  if (process.platform !== 'win32') return Promise.resolve({ schemaVersion: 1, status: 'unsupported', message: 'Emptying the Recycle Bin is supported only on Windows.' });
  if (emptyRecycleBinActive) return Promise.resolve({ schemaVersion: 1, status: 'failed', message: 'A Recycle Bin empty operation is already running. Wait, then retry.' });
  emptyRecycleBinActive = true;
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Clear-RecycleBin -Force -ErrorAction Stop'], {
      windowsHide: true,
      timeout: 30_000,
      maxBuffer: 128 * 1024,
      encoding: 'utf8',
      shell: false,
    }, (error) => {
      emptyRecycleBinActive = false;
      if (!error) { resolve({ schemaVersion: 1, status: 'emptied', message: 'The Recycle Bin was emptied.' }); return; }
      if (error.killed || error.code === 'ETIMEDOUT') { resolve({ schemaVersion: 1, status: 'timeout', message: 'Emptying the Recycle Bin timed out. Retry is available.' }); return; }
      resolve({ schemaVersion: 1, status: 'failed', message: 'Windows did not empty the Recycle Bin. Retry is available.' });
    });
  });
}

function runFixedProcess(executable, args, timeout) {
  return new Promise((resolve) => {
    execFile(executable, args, {
      windowsHide: true,
      timeout,
      maxBuffer: 128 * 1024,
      encoding: 'utf8',
      shell: false,
    }, (error) => {
      if (!error) { resolve('ok'); return; }
      if (error.killed || error.code === 'ETIMEDOUT') { resolve('timeout'); return; }
      resolve('failed');
    });
  });
}

function startExplorerProcess() {
  return new Promise((resolve) => {
    let settled = false;
    let child;
    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(status);
    };
    const timer = setTimeout(() => finish('timeout'), 5_000);
    timer.unref();
    try {
      child = spawn('explorer.exe', [], { windowsHide: true, shell: false, detached: true, stdio: 'ignore' });
      child.once('error', () => finish('failed'));
      child.once('spawn', () => { child.unref(); finish('ok'); });
    } catch {
      finish('failed');
    }
  });
}

async function restartExplorer() {
  if (process.platform !== 'win32') return { schemaVersion: 1, status: 'unsupported', message: 'Explorer restart is supported only on Windows.' };
  if (restartExplorerActive) return { schemaVersion: 1, status: 'failed', message: 'An Explorer restart is already running. Wait, then retry.' };
  restartExplorerActive = true;
  try {
    const stopped = await runFixedProcess('taskkill.exe', ['/F', '/IM', 'explorer.exe', '/T'], 10_000);
    if (stopped === 'timeout') return { schemaVersion: 1, status: 'timeout', message: 'Stopping Explorer timed out. Retry is available.' };
    if (stopped !== 'ok') return { schemaVersion: 1, status: 'failed', message: 'Windows did not stop Explorer. Retry is available.' };
    const started = await startExplorerProcess();
    if (started === 'timeout') return { schemaVersion: 1, status: 'timeout', message: 'Starting Explorer timed out. Retry is available.' };
    if (started !== 'ok') return { schemaVersion: 1, status: 'failed', message: 'Explorer stopped but Windows did not confirm its restart. Retry is available.' };
    return { schemaVersion: 1, status: 'restarted', message: 'Windows Explorer was stopped and restarted.' };
  } catch {
    return { schemaVersion: 1, status: 'failed', message: 'Windows did not complete the Explorer restart. Retry is available.' };
  } finally {
    restartExplorerActive = false;
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, keys) {
  return isPlainObject(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function boundedString(value, maximum, pattern = null) {
  return typeof value === 'string' && value.length >= 1 && value.length <= maximum && (!pattern || pattern.test(value));
}

function validateSnapshotPayload(payload) {
  let encoded;
  try { encoded = JSON.stringify(payload); } catch { return null; }
  if (!encoded || Buffer.byteLength(encoded, 'utf8') > 256 * 1024) return null;
  if (!hasExactKeys(payload, ['schemaVersion', 'theme', 'lang', 'funnyEn', 'funnyZh', 'route', 'tabs', 'tweaks'])) return null;
  if (payload.schemaVersion !== 1 || !['dark', 'light'].includes(payload.theme) || !['English', 'Cantonese', 'Bilingual'].includes(payload.lang)) return null;
  if (![payload.funnyEn, payload.funnyZh].every((value) => Number.isInteger(value) && value >= 1 && value <= 5)) return null;
  const routeValid = (route) => hasExactKeys(route, ['view', 'id']) && boundedString(route.view, 64, /^[a-z0-9-]+$/) && (route.id === null || boundedString(route.id, 128, /^[a-zA-Z0-9:._-]+$/));
  if (!routeValid(payload.route) || !Array.isArray(payload.tabs) || payload.tabs.length > 64 || !Array.isArray(payload.tweaks) || payload.tweaks.length > 1_500) return null;
  if (!payload.tabs.every((tab) => hasExactKeys(tab, ['id', 'label', 'route']) && boundedString(tab.id, 128, /^[a-zA-Z0-9:._-]+$/) && boundedString(tab.label, 160) && routeValid(tab.route))) return null;
  const seenTweaks = new Set();
  if (!payload.tweaks.every((entry) => {
    if (!hasExactKeys(entry, ['id', 'value']) || !boundedString(entry.id, 160, /^[a-zA-Z0-9._-]+$/) || typeof entry.value !== 'boolean' || seenTweaks.has(entry.id)) return false;
    seenTweaks.add(entry.id);
    return true;
  })) return null;
  return encoded;
}

async function renameSnapshotWithRetry(source, destination) {
  const delays = [0, 15, 35, 60, 90, 120];
  for (let index = 0; index < delays.length; index += 1) {
    if (delays[index]) await new Promise((resolve) => setTimeout(resolve, delays[index]));
    try { await fs.promises.rename(source, destination); return; }
    catch (error) {
      if (!['EPERM', 'EACCES', 'EBUSY'].includes(error && error.code) || index === delays.length - 1) throw error;
    }
  }
}

async function createLocalSnapshot(payload) {
  if (snapshotActive) return { schemaVersion: 1, status: 'failed', message: 'A local snapshot is already being written. Wait, then retry.' };
  const encoded = validateSnapshotPayload(payload);
  if (!encoded) return { schemaVersion: 1, status: 'failed', message: 'The local snapshot state did not match the bounded schema.' };
  snapshotActive = true;
  let temporary = null;
  try {
    const directory = path.join(app.getPath('userData'), 'snapshots');
    await fs.promises.mkdir(directory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nonce = randomBytes(8).toString('hex');
    const filename = `snapshot-${timestamp}-${nonce}.json`;
    const destination = path.join(directory, filename);
    temporary = path.join(directory, `.${filename}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    timer.unref();
    try {
      const record = `${JSON.stringify({ schemaVersion: 1, createdAt: new Date().toISOString(), state: JSON.parse(encoded) }, null, 2)}\n`;
      await fs.promises.writeFile(temporary, record, { encoding: 'utf8', flag: 'wx', mode: 0o600, signal: controller.signal });
    } finally { clearTimeout(timer); }
    await renameSnapshotWithRetry(temporary, destination);
    temporary = null;
    return { schemaVersion: 1, status: 'created', message: 'A new local JSON snapshot was created.' };
  } catch (error) {
    if (temporary) { try { await fs.promises.unlink(temporary); } catch {} }
    if (error && error.name === 'AbortError') return { schemaVersion: 1, status: 'timeout', message: 'Writing the local snapshot timed out. Retry is available.' };
    if (error && ['ENOSYS', 'ENOTSUP'].includes(error.code)) return { schemaVersion: 1, status: 'unsupported', message: 'Local snapshots are unavailable on this platform.' };
    return { schemaVersion: 1, status: 'failed', message: 'The local snapshot could not be created. Retry is available.' };
  } finally {
    snapshotActive = false;
  }
}

function publishWingetProgress(progress) {
  if (win && !win.isDestroyed()) win.webContents.send('winforge:winget-upgrade-progress', { schemaVersion: 1, ...progress });
}

function runWingetUpgrade(id, signal) {
  return new Promise((resolve) => {
    execFile('winget.exe', ['upgrade', '--id', id, '--exact', '--accept-source-agreements', '--accept-package-agreements'], {
      windowsHide: true,
      timeout: 15 * 60 * 1000,
      maxBuffer: 1024 * 1024,
      encoding: 'utf8',
      shell: false,
      signal,
    }, (error) => {
      if (!error) { resolve('completed'); return; }
      if (signal.aborted || error.name === 'AbortError') { resolve('cancelled'); return; }
      if (error.killed || error.code === 'ETIMEDOUT') { resolve('timeout'); return; }
      if (error.code === 'ENOENT') { resolve('unsupported'); return; }
      resolve('failed');
    });
  });
}

async function upgradeWingetPackages(ids) {
  if (process.platform !== 'win32') return { schemaVersion: 1, status: 'unsupported', items: [], message: 'Winget upgrades are supported only on Windows.' };
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 10 || new Set(ids).size !== ids.length || !ids.every((id) => typeof id === 'string' && Object.hasOwn(WINGET_UPGRADE_ALLOWLIST, id))) {
    return { schemaVersion: 1, status: 'failed', items: [], message: 'The Winget upgrade selection was invalid or not allowlisted.' };
  }
  if (wingetUpgradeActive) return { schemaVersion: 1, status: 'failed', items: [], message: 'A Winget upgrade operation is already running.' };
  const controller = new AbortController();
  wingetUpgradeActive = controller;
  const items = [];
  let processed = 0;
  try {
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index];
      if (controller.signal.aborted) {
        for (const remaining of ids.slice(index)) items.push({ id: remaining, status: 'cancelled' });
        break;
      }
      publishWingetProgress({ completed: processed, total: ids.length, currentId: id, status: 'running' });
      const status = await runWingetUpgrade(id, controller.signal);
      items.push({ id, status });
      processed += 1;
      publishWingetProgress({ completed: processed, total: ids.length, currentId: id, status });
      if (status === 'cancelled') {
        for (const remaining of ids.slice(index + 1)) items.push({ id: remaining, status: 'cancelled' });
        break;
      }
    }
    const successful = items.filter((item) => item.status === 'completed').length;
    let status;
    if (items.some((item) => item.status === 'cancelled')) status = 'cancelled';
    else if (successful === ids.length) status = 'completed';
    else if (successful > 0) status = 'partial';
    else if (items.some((item) => item.status === 'timeout')) status = 'timeout';
    else if (items.length && items.every((item) => item.status === 'unsupported')) status = 'unsupported';
    else status = 'failed';
    const message = status === 'completed' ? 'All selected Winget upgrades completed.' : status === 'partial' ? 'Some selected Winget upgrades completed; unsuccessful items remain retryable.' : status === 'cancelled' ? 'The Winget upgrade operation was cancelled; unfinished items remain retryable.' : status === 'timeout' ? 'A selected Winget upgrade timed out; retry is available.' : status === 'unsupported' ? 'Winget is unavailable on this system.' : 'The selected Winget upgrades did not complete; retry is available.';
    return { schemaVersion: 1, status, items, message };
  } finally {
    wingetUpgradeActive = null;
  }
}

async function launchExternalApp(id) {
  if (typeof id !== 'string' || !Object.hasOwn(EXTERNAL_APP_EXECUTABLES, id)) return externalAppResult('', 'invalid-id', 'The requested app identifier is not allowed.');
  if (externalAppLaunches.has(id)) return externalAppResult(id, 'busy', 'A launch check for this app is already running.');
  const controller = new AbortController();
  externalAppLaunches.set(id, controller);
  try {
    for (const candidate of EXTERNAL_APP_EXECUTABLES[id]) {
      const discovery = await discoverExecutable(candidate, controller.signal);
      if (discovery.status === 'cancelled') return externalAppResult(id, 'cancelled', 'The launch check was cancelled.');
      if (discovery.status === 'timeout') return externalAppResult(id, 'timeout', 'Executable discovery timed out.');
      if (discovery.status !== 'found') continue;
      const openError = await shell.openPath(discovery.executable);
      if (openError) return externalAppResult(id, 'error', 'The installed app was found but could not be opened.');
      return externalAppResult(id, 'launched', 'The installed app was opened.');
    }
    return externalAppResult(id, 'not-installed', 'No allowed executable candidate was found on PATH.');
  } catch (error) {
    if (controller.signal.aborted) return externalAppResult(id, 'cancelled', 'The launch check was cancelled.');
    return externalAppResult(id, 'error', 'Executable discovery or launch failed.');
  } finally {
    externalAppLaunches.delete(id);
  }
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
ipcMain.handle('winforge:system-metrics', () => readSystemMetrics());
ipcMain.handle('winforge:package-engines', () => readPackageEngines());
ipcMain.handle('winforge:flush-dns', () => flushDns());
ipcMain.handle('winforge:restart-explorer', () => restartExplorer());
ipcMain.handle('winforge:empty-recycle-bin', () => emptyRecycleBin());
ipcMain.handle('winforge:create-snapshot', (_event, payload) => createLocalSnapshot(payload));
ipcMain.handle('winforge:winget-upgrade', (_event, ids) => upgradeWingetPackages(ids));
ipcMain.handle('winforge:cancel-winget-upgrade', () => {
  if (!wingetUpgradeActive) return { schemaVersion: 1, status: 'failed', message: 'No Winget upgrade operation is running.' };
  wingetUpgradeActive.abort();
  return { schemaVersion: 1, status: 'cancelled', message: 'Winget upgrade cancellation was requested.' };
});
ipcMain.handle('winforge:launch-external-app', (_event, id) => launchExternalApp(id));
ipcMain.handle('winforge:cancel-external-app-launch', (_event, id) => {
  if (typeof id !== 'string' || !Object.hasOwn(EXTERNAL_APP_EXECUTABLES, id)) return externalAppResult('', 'invalid-id', 'The requested app identifier is not allowed.');
  const controller = externalAppLaunches.get(id);
  if (!controller) return externalAppResult(id, 'idle', 'No launch check is active for this app.');
  controller.abort();
  return externalAppResult(id, 'cancelling', 'Cancellation was requested.');
});
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
