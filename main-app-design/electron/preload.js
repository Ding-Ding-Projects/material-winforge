'use strict';
// Narrow, explicit bridge: window controls, the app version, and deep links.
// No Node APIs and no remote module are exposed to the renderer.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('winforge', {
  minimise: () => ipcRenderer.send('winforge:minimise'),
  maximise: () => ipcRenderer.send('winforge:maximise'),
  close: () => ipcRenderer.send('winforge:close'),
  version: () => ipcRenderer.invoke('winforge:version'),
  onWindowState: fn => ipcRenderer.on('winforge:window-state', (_e, s) => fn(s)),
  onDeepLink: fn => ipcRenderer.on('winforge:deep-link', (_e, page) => fn(page)),
});
