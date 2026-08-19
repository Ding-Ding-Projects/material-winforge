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
