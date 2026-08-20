'use strict';
// Narrow, explicit bridge: window controls, preview identity, and deep links.
// No Node APIs and no remote module are exposed to the renderer.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winforge', {
  minimise: () => ipcRenderer.send('winforge:minimise'),
  maximise: () => ipcRenderer.send('winforge:maximise'),
  close: () => ipcRenderer.send('winforge:close'),
  version: () => ipcRenderer.invoke('winforge:version'),
  mode: () => ipcRenderer.invoke('winforge:mode'),
  systemMetrics: () => ipcRenderer.invoke('winforge:system-metrics'),
  readScheduledSource: payload => ipcRenderer.invoke('winforge:read-scheduled-source', payload),
  packageEngines: () => ipcRenderer.invoke('winforge:package-engines'),
  flushDns: () => ipcRenderer.invoke('winforge:flush-dns'),
  restartExplorer: () => ipcRenderer.invoke('winforge:restart-explorer'),
  emptyRecycleBin: () => ipcRenderer.invoke('winforge:empty-recycle-bin'),
  createSnapshot: payload => ipcRenderer.invoke('winforge:create-snapshot', payload),
  listSnapshots: () => ipcRenderer.invoke('winforge:list-snapshots'),
  listSnapshotJournal: () => ipcRenderer.invoke('winforge:list-snapshot-journal'),
  restoreSnapshot: id => ipcRenderer.invoke('winforge:restore-snapshot', id),
  wingetUpgrade: ids => ipcRenderer.invoke('winforge:winget-upgrade', ids),
  cancelWingetUpgrade: () => ipcRenderer.invoke('winforge:cancel-winget-upgrade'),
  onWingetUpgradeProgress: fn => ipcRenderer.on('winforge:winget-upgrade-progress', (_event, progress) => fn(progress)),
  launchExternalApp: id => ipcRenderer.invoke('winforge:launch-external-app', id),
  cancelExternalAppLaunch: id => ipcRenderer.invoke('winforge:cancel-external-app-launch', id),
  listExternalEditors: () => ipcRenderer.invoke('winforge:list-external-editors'),
  setExternalEditor: id => ipcRenderer.invoke('winforge:set-external-editor', id),
  openInExternalEditor: payload => ipcRenderer.invoke('winforge:open-in-external-editor', payload),
  updateState: () => ipcRenderer.invoke('winforge:update-state'),
  checkForUpdates: () => ipcRenderer.invoke('winforge:update-check'),
  cancelUpdate: () => ipcRenderer.invoke('winforge:update-cancel'),
  installUpdate: options => ipcRenderer.invoke('winforge:update-install', options),
  deferUpdate: () => ipcRenderer.invoke('winforge:update-later'),
  rollbackUpdate: () => ipcRenderer.invoke('winforge:update-rollback'),
  onUpdateState: fn => ipcRenderer.on('winforge:update-state', (_e, state) => fn(state)),
  onWindowState: fn => ipcRenderer.on('winforge:window-state', (_e, s) => fn(s)),
  onDeepLink: fn => ipcRenderer.on('winforge:deep-link', (_e, page) => fn(page)),
});
