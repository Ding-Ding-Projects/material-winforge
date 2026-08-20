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
let snapshotJournalStatus = 'unknown';
let gitExecutablePromise = null;
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
const EXTERNAL_EDITOR_CANDIDATES = Object.freeze({
  vscode: Object.freeze({
    label: 'Visual Studio Code',
    executables: Object.freeze(['Code.exe', 'code.exe']),
    fixedPaths: Object.freeze([
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'Code.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Microsoft VS Code', 'Code.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft VS Code', 'Code.exe'),
    ]),
  }),
  notepadpp: Object.freeze({
    label: 'Notepad++',
    executables: Object.freeze(['notepad++.exe']),
    fixedPaths: Object.freeze([
      path.join(process.env.PROGRAMFILES || '', 'Notepad++', 'notepad++.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Notepad++', 'notepad++.exe'),
    ]),
  }),
});
const EXTERNAL_EDITOR_IDS = Object.freeze(Object.keys(EXTERNAL_EDITOR_CANDIDATES));
const EXTERNAL_EDITOR_FILE = 'external-editor.json';
const EXTERNAL_EDITOR_PATH_MAX = 2048;
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
const SNAPSHOT_BASENAME = /^snapshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[0-9a-f]{16}\.json$/;
const SNAPSHOT_MAX_BYTES = 300 * 1024;
const APP_SETTING_KEYS_V1 = Object.freeze(['theme', 'lang', 'funnyEn', 'funnyZh']);
const APP_SETTING_KEYS = Object.freeze([...APP_SETTING_KEYS_V1, 'showEmojis']);
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

function externalEditorResult(status, message, extra = {}) {
  return { schemaVersion: 1, status, message: String(message).slice(0, 240), ...extra };
}

function validEditorId(id) {
  return typeof id === 'string' && EXTERNAL_EDITOR_IDS.includes(id);
}

async function readExternalEditorPreference() {
  try {
    const raw = await fs.promises.readFile(path.join(app.getPath('userData'), EXTERNAL_EDITOR_FILE), 'utf8');
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1 || !validEditorId(value.editorId)) return null;
    return value.editorId;
  } catch { return null; }
}

async function writeExternalEditorPreference(editorId) {
  if (!validEditorId(editorId)) return false;
  try {
    const directory = app.getPath('userData');
    await fs.promises.mkdir(directory, { recursive: true });
    const temporary = path.join(directory, `.${EXTERNAL_EDITOR_FILE}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`);
    await fs.promises.writeFile(temporary, `${JSON.stringify({ schemaVersion: 1, editorId }, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    await fs.promises.rename(temporary, path.join(directory, EXTERNAL_EDITOR_FILE));
    return true;
  } catch { return false; }
}

async function discoverExternalEditor(editorId) {
  if (!validEditorId(editorId)) return externalEditorResult('invalid-id', 'The requested editor identifier is not allowed.', { editorId: '' });
  const candidate = EXTERNAL_EDITOR_CANDIDATES[editorId];
  const checked = new Set();
  for (const fixedPath of candidate.fixedPaths) {
    if (!path.isAbsolute(fixedPath) || checked.has(fixedPath.toLowerCase())) continue;
    checked.add(fixedPath.toLowerCase());
    try {
      if (fs.statSync(fixedPath).isFile()) return externalEditorResult('available', `${candidate.label} is installed at a fixed Windows location.`, { editorId, label: candidate.label, executable: fixedPath });
    } catch {}
  }
  for (const executable of candidate.executables) {
    const found = await discoverExecutable(executable, new AbortController().signal);
    if (found.status === 'found') return externalEditorResult('available', `${candidate.label} is available on PATH.`, { editorId, label: candidate.label, executable: found.executable });
    if (found.status === 'timeout') return externalEditorResult('timeout', `${candidate.label} discovery timed out.`, { editorId, label: candidate.label });
  }
  return externalEditorResult('not-installed', `${candidate.label} is not installed in the supported fixed locations or on PATH.`, { editorId, label: candidate.label });
}

async function listExternalEditors() {
  const preferred = await readExternalEditorPreference();
  const editors = [];
  for (const id of EXTERNAL_EDITOR_IDS) editors.push(await discoverExternalEditor(id));
  const selected = preferred && editors.some(item => item.editorId === preferred && item.status === 'available') ? preferred : null;
  return { schemaVersion: 1, status: 'listed', selectedEditorId: selected, editors };
}

async function openInExternalEditor(payload) {
  if (!payload || typeof payload !== 'object' || !validEditorId(payload.editorId)) return externalEditorResult('invalid-id', 'The requested editor identifier is not allowed.', { editorId: '' });
  const target = typeof payload.target === 'string' ? payload.target.trim() : '';
  if (!target || target.length > EXTERNAL_EDITOR_PATH_MAX || /[\u0000-\u001f\u007f]/.test(target) || !path.isAbsolute(target) || /^(https?|file):/i.test(target)) return externalEditorResult('invalid-target', 'The selected file or project folder path is invalid.', { editorId: payload.editorId });
  const editor = await discoverExternalEditor(payload.editorId);
  if (editor.status !== 'available') return externalEditorResult(editor.status, editor.message, { editorId: payload.editorId, label: editor.label });
  try {
    const stat = await fs.promises.stat(target);
    if (!stat.isFile() && !stat.isDirectory()) return externalEditorResult('invalid-target', 'The selected path is not a file or folder.', { editorId: payload.editorId, label: editor.label });
    const error = await new Promise(resolve => execFile(editor.executable, [target], { windowsHide: true, shell: false, timeout: 5_000 }, error => resolve(error || null)));
    if (error) return externalEditorResult(error.code === 'ETIMEDOUT' ? 'timeout' : 'error', 'The selected editor was found but could not open the target.', { editorId: payload.editorId, label: editor.label });
    await writeExternalEditorPreference(payload.editorId);
    return externalEditorResult('opened', `${editor.label} opened the selected target.`, { editorId: payload.editorId, label: editor.label });
  } catch (error) {
    return externalEditorResult(error && error.code === 'ENOENT' ? 'not-found' : 'error', 'The selected target could not be opened by the editor.', { editorId: payload.editorId, label: editor.label });
  }
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

function validateSnapshotOwnership(ownership, payload) {
  if (!hasExactKeys(ownership, ['schemaVersion', 'global', 'projects', 'activeProjectId']) || ![1, 2].includes(ownership.schemaVersion)) return false;
  const settingValid = (key, value) => key === 'theme' ? ['dark', 'light'].includes(value) : key === 'lang' ? ['English', 'Cantonese', 'Bilingual'].includes(value) : key === 'showEmojis' ? typeof value === 'boolean' : Number.isInteger(value) && value >= 1 && value <= 5;
  const settingKeys = ownership.schemaVersion === 2 ? APP_SETTING_KEYS : APP_SETTING_KEYS_V1;
  if (!hasExactKeys(ownership.global, settingKeys) || !Object.entries(ownership.global).every(([key, value]) => settingValid(key, value))) return false;
  if (!Array.isArray(ownership.projects) || ownership.projects.length > 50) return false;
  const seen = new Set();
  for (const project of ownership.projects) {
    if (!hasExactKeys(project, ['id', 'name', 'overrides']) || !boundedString(project.id, 56, /^project-[a-z0-9-]{6,48}$/) || seen.has(project.id) || !boundedString(project.name, 64) || !project.name.trim() || /[\u0000-\u001f\u007f]/.test(project.name) || !isPlainObject(project.overrides)) return false;
    const keys = Object.keys(project.overrides);
    if (keys.length > settingKeys.length || !keys.every((key) => settingKeys.includes(key) && settingValid(key, project.overrides[key]))) return false;
    seen.add(project.id);
  }
  if (!(ownership.activeProjectId === null || (typeof ownership.activeProjectId === 'string' && seen.has(ownership.activeProjectId)))) return false;
  const active = ownership.projects.find((project) => project.id === ownership.activeProjectId);
  const effective = { ...ownership.global, ...(active ? active.overrides : {}) };
  return effective.theme === payload.theme && effective.lang === payload.lang && effective.funnyEn === payload.funnyEn && effective.funnyZh === payload.funnyZh && (payload.schemaVersion < 3 || effective.showEmojis === payload.showEmojis);
}

function validateSnapshotPayload(payload) {
  let encoded;
  try { encoded = JSON.stringify(payload); } catch { return null; }
  if (!encoded || Buffer.byteLength(encoded, 'utf8') > 256 * 1024) return null;
  const expectedKeys = payload && payload.schemaVersion === 3 ? ['schemaVersion', 'theme', 'lang', 'funnyEn', 'funnyZh', 'showEmojis', 'route', 'tabs', 'tweaks', 'ownership'] : payload && payload.schemaVersion === 2 ? ['schemaVersion', 'theme', 'lang', 'funnyEn', 'funnyZh', 'route', 'tabs', 'tweaks', 'ownership'] : ['schemaVersion', 'theme', 'lang', 'funnyEn', 'funnyZh', 'route', 'tabs', 'tweaks'];
  if (!hasExactKeys(payload, expectedKeys)) return null;
  if (![1, 2, 3].includes(payload.schemaVersion) || !['dark', 'light'].includes(payload.theme) || !['English', 'Cantonese', 'Bilingual'].includes(payload.lang) || (payload.schemaVersion === 3 && typeof payload.showEmojis !== 'boolean')) return null;
  if (payload.schemaVersion >= 2 && (payload.ownership?.schemaVersion !== payload.schemaVersion - 1 || !validateSnapshotOwnership(payload.ownership, payload))) return null;
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

async function discoverGitExecutable() {
  if (!gitExecutablePromise) {
    gitExecutablePromise = (async () => {
      if (process.platform !== 'win32') return null;
      const controller = new AbortController();
      const result = await discoverExecutable('git.exe', controller.signal);
      return result.status === 'found' ? result.executable : null;
    })();
  }
  const executable = await gitExecutablePromise;
  if (!executable) snapshotJournalStatus = 'unavailable';
  return executable;
}

function runLocalGit(executable, args, cwd, outputLimit = 4096) {
  return new Promise((resolve) => {
    execFile(executable, args, { cwd, windowsHide: true, timeout: 10_000, maxBuffer: 128 * 1024, encoding: 'utf8', shell: false }, (error, stdout) => {
      if (error) { resolve({ ok: false, output: '' }); return; }
      resolve({ ok: true, output: String(stdout || '').slice(0, outputLimit) });
    });
  });
}

async function listSnapshotJournal() {
  const executable = await discoverGitExecutable();
  if (!executable) return { schemaVersion: 1, status: 'unavailable', entries: [], invalidCount: 0, truncated: false };
  const journal = path.join(app.getPath('userData'), 'snapshot-journal');
  try {
    const gitDirectory = await fs.promises.stat(path.join(journal, '.git'));
    if (!gitDirectory.isDirectory()) return { schemaVersion: 1, status: 'listed', entries: [], invalidCount: 0, truncated: false };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { schemaVersion: 1, status: 'listed', entries: [], invalidCount: 0, truncated: false };
    return { schemaVersion: 1, status: 'failed', entries: [], invalidCount: 0, truncated: false };
  }
  const remotes = await runLocalGit(executable, ['remote'], journal);
  if (!remotes.ok || remotes.output.trim()) return { schemaVersion: 1, status: 'failed', entries: [], invalidCount: 0, truncated: false };
  const result = await runLocalGit(executable, ['log', '--max-count=51', '--date=iso-strict', '--format=%H%x1f%cI%x1f%s', '--name-only', '--', 'entries'], journal, 64 * 1024);
  if (!result.ok) return { schemaVersion: 1, status: 'failed', entries: [], invalidCount: 0, truncated: false };
  const lines = result.output.split(/\r?\n/);
  const entries = [];
  let invalidCount = 0;
  let validCount = 0;
  for (let index = 0; index < lines.length;) {
    const header = lines[index++].trim();
    if (!header) continue;
    const parts = header.split('\x1f');
    let entryPath = '';
    while (index < lines.length && !lines[index].trim()) index += 1;
    if (index < lines.length && !lines[index].includes('\x1f')) entryPath = lines[index++].trim().replace(/\\/g, '/');
    const basename = entryPath.startsWith('entries/') ? entryPath.slice(8) : '';
    const snapshotId = basename.endsWith('.journal.json') ? `${basename.slice(0, -13)}.json` : '';
    const parsedDate = parts.length === 3 ? new Date(parts[1]) : null;
    if (parts.length !== 3 || !/^[0-9a-f]{40}$/.test(parts[0]) || !parsedDate || !Number.isFinite(parsedDate.getTime()) || !parts[2] || parts[2].length > 160 || /[\u0000-\u001f\u007f]/.test(parts[2]) || !SNAPSHOT_BASENAME.test(snapshotId)) { invalidCount += 1; continue; }
    validCount += 1;
    if (entries.length < 50) entries.push({ commitSha: parts[0], timestamp: parsedDate.toISOString(), message: parts[2], snapshotId });
  }
  return { schemaVersion: 1, status: 'listed', entries, invalidCount: Math.min(10_000, invalidCount), truncated: validCount > entries.length };
}

async function appendSnapshotJournal(id, createdAt, state, bytes) {
  const executable = await discoverGitExecutable();
  if (!executable) return 'unavailable';
  const journal = path.join(app.getPath('userData'), 'snapshot-journal');
  const entries = path.join(journal, 'entries');
  try {
    await fs.promises.mkdir(entries, { recursive: true });
    if (!(await runLocalGit(executable, ['init', '--quiet'], journal)).ok) throw new Error('init');
    const remotes = await runLocalGit(executable, ['remote'], journal);
    if (!remotes.ok || remotes.output.trim()) throw new Error('remote');
    const entry = path.join(entries, `${id.slice(0, -5)}.journal.json`);
    const metadata = `${JSON.stringify({ schemaVersion: 1, snapshotId: id, createdAt, bytes, theme: state.theme, lang: state.lang, routeView: state.route.view }, null, 2)}\n`;
    await fs.promises.writeFile(entry, metadata, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    const relative = path.posix.join('entries', path.basename(entry));
    if (!(await runLocalGit(executable, ['add', '--', relative], journal)).ok) throw new Error('add');
    const committed = await runLocalGit(executable, ['-c', 'user.name=WinForge Snapshot Journal', '-c', 'user.email=local@winforge.invalid', 'commit', '--quiet', '-m', `Record local snapshot ${createdAt}`, '--', relative], journal);
    if (!committed.ok) throw new Error('commit');
    snapshotJournalStatus = 'available';
    return 'recorded';
  } catch {
    snapshotJournalStatus = 'failed';
    return 'failed';
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
    const createdAt = new Date().toISOString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    timer.unref();
    try {
      const record = `${JSON.stringify({ schemaVersion: 1, createdAt, state: JSON.parse(encoded) }, null, 2)}\n`;
      await fs.promises.writeFile(temporary, record, { encoding: 'utf8', flag: 'wx', mode: 0o600, signal: controller.signal });
    } finally { clearTimeout(timer); }
    await renameSnapshotWithRetry(temporary, destination);
    temporary = null;
    const bytes = (await fs.promises.stat(destination)).size;
    const journalStatus = await appendSnapshotJournal(filename, createdAt, JSON.parse(encoded), bytes);
    return { schemaVersion: 1, status: 'created', journalStatus, message: journalStatus === 'recorded' ? 'A new local JSON snapshot and revision-journal entry were created.' : journalStatus === 'unavailable' ? 'A new local JSON snapshot was created. Revision journaling is unavailable because Git is not installed.' : 'A new local JSON snapshot was created, but its revision-journal entry failed.' };
  } catch (error) {
    if (temporary) { try { await fs.promises.unlink(temporary); } catch {} }
    if (error && error.name === 'AbortError') return { schemaVersion: 1, status: 'timeout', message: 'Writing the local snapshot timed out. Retry is available.' };
    if (error && ['ENOSYS', 'ENOTSUP'].includes(error.code)) return { schemaVersion: 1, status: 'unsupported', message: 'Local snapshots are unavailable on this platform.' };
    return { schemaVersion: 1, status: 'failed', message: 'The local snapshot could not be created. Retry is available.' };
  } finally {
    snapshotActive = false;
  }
}

async function readSnapshotRecord(directory, id) {
  if (typeof id !== 'string' || !SNAPSHOT_BASENAME.test(id) || id.includes('..') || /[\\/]/.test(id)) return null;
  const target = path.join(directory, id);
  const stats = await fs.promises.stat(target);
  if (!stats.isFile() || stats.size < 2 || stats.size > SNAPSHOT_MAX_BYTES) return null;
  const raw = await fs.promises.readFile(target, { encoding: 'utf8' });
  if (Buffer.byteLength(raw, 'utf8') !== stats.size) return null;
  let record;
  try { record = JSON.parse(raw); } catch { return null; }
  if (!hasExactKeys(record, ['schemaVersion', 'createdAt', 'state']) || record.schemaVersion !== 1 || typeof record.createdAt !== 'string' || record.createdAt.length > 40) return null;
  const created = new Date(record.createdAt);
  if (!Number.isFinite(created.getTime()) || created.toISOString() !== record.createdAt) return null;
  const encoded = validateSnapshotPayload(record.state);
  if (!encoded) return null;
  return { id, createdAt: record.createdAt, bytes: stats.size, state: JSON.parse(encoded) };
}

async function listLocalSnapshots() {
  const directory = path.join(app.getPath('userData'), 'snapshots');
  try {
    await discoverGitExecutable();
    let names;
    try { names = await fs.promises.readdir(directory); }
    catch (error) {
      if (error && error.code === 'ENOENT') return { schemaVersion: 1, status: 'listed', snapshots: [], invalidCount: 0, truncated: false, journalStatus: snapshotJournalStatus };
      throw error;
    }
    const candidates = names.filter((name) => SNAPSHOT_BASENAME.test(name)).sort().reverse();
    const snapshots = [];
    let invalidCount = Math.min(10_000, names.length - candidates.length);
    let validCount = 0;
    for (const id of candidates) {
      try {
        const record = await readSnapshotRecord(directory, id);
        if (!record) { invalidCount += 1; continue; }
        validCount += 1;
        if (snapshots.length < 50) snapshots.push({ id: record.id, createdAt: record.createdAt, bytes: record.bytes, theme: record.state.theme, lang: record.state.lang, routeView: record.state.route.view });
      } catch { invalidCount += 1; }
    }
    return { schemaVersion: 1, status: 'listed', snapshots, invalidCount: Math.min(10_000, invalidCount), truncated: validCount > snapshots.length, journalStatus: snapshotJournalStatus };
  } catch (error) {
    if (error && ['ENOSYS', 'ENOTSUP'].includes(error.code)) return { schemaVersion: 1, status: 'unsupported', snapshots: [], invalidCount: 0, truncated: false, journalStatus: snapshotJournalStatus };
    return { schemaVersion: 1, status: 'failed', snapshots: [], invalidCount: 0, truncated: false, journalStatus: snapshotJournalStatus };
  }
}

async function restoreLocalSnapshot(id) {
  if (process.platform !== 'win32') return { schemaVersion: 1, status: 'unsupported', message: 'Local snapshot restore is supported only on Windows.' };
  if (typeof id !== 'string' || !SNAPSHOT_BASENAME.test(id) || id.includes('..') || /[\\/]/.test(id)) return { schemaVersion: 1, status: 'failed', message: 'The selected snapshot identifier is invalid.' };
  try {
    const directory = path.join(app.getPath('userData'), 'snapshots');
    const record = await readSnapshotRecord(directory, id);
    if (!record) return { schemaVersion: 1, status: 'failed', message: 'The selected snapshot is invalid or no longer readable.' };
    return { schemaVersion: 1, status: 'restored', message: 'The local snapshot was validated and returned for restore.', state: record.state };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { schemaVersion: 1, status: 'not-found', message: 'The selected snapshot was not found. Refresh the list and retry.' };
    if (error && ['ENOSYS', 'ENOTSUP'].includes(error.code)) return { schemaVersion: 1, status: 'unsupported', message: 'Local snapshot restore is unavailable on this platform.' };
    return { schemaVersion: 1, status: 'failed', message: 'The local snapshot could not be restored. Retry is available.' };
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
ipcMain.handle('winforge:list-snapshots', () => listLocalSnapshots());
ipcMain.handle('winforge:list-snapshot-journal', () => listSnapshotJournal());
ipcMain.handle('winforge:restore-snapshot', (_event, id) => restoreLocalSnapshot(id));
ipcMain.handle('winforge:winget-upgrade', (_event, ids) => upgradeWingetPackages(ids));
ipcMain.handle('winforge:cancel-winget-upgrade', () => {
  if (!wingetUpgradeActive) return { schemaVersion: 1, status: 'failed', message: 'No Winget upgrade operation is running.' };
  wingetUpgradeActive.abort();
  return { schemaVersion: 1, status: 'cancelled', message: 'Winget upgrade cancellation was requested.' };
});
ipcMain.handle('winforge:launch-external-app', (_event, id) => launchExternalApp(id));
ipcMain.handle('winforge:list-external-editors', () => listExternalEditors());
ipcMain.handle('winforge:set-external-editor', async (_event, id) => {
  if (!validEditorId(id)) return externalEditorResult('invalid-id', 'The requested editor identifier is not allowed.', { editorId: '' });
  const editor = await discoverExternalEditor(id);
  if (editor.status !== 'available') return externalEditorResult(editor.status, editor.message, { editorId: id, label: editor.label });
  if (!(await writeExternalEditorPreference(id))) return externalEditorResult('persistence-failed', 'The editor was found, but its preference could not be persisted.', { editorId: id, label: editor.label });
  return externalEditorResult('saved', `${editor.label} is now the selected external editor.`, { editorId: id, label: editor.label });
});
ipcMain.handle('winforge:open-in-external-editor', (_event, payload) => openInExternalEditor(payload));
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
