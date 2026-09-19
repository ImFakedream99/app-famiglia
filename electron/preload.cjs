const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('famigliaCredentials', {
  save: (email, password) => ipcRenderer.invoke('credentials:save', { email, password }),
  load: () => ipcRenderer.invoke('credentials:load'),
  clear: () => ipcRenderer.invoke('credentials:clear'),
});

contextBridge.exposeInMainWorld('famigliaUpdater', {
  install: (url) => ipcRenderer.invoke('update:download-install', url),
});
