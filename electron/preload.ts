const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cc', {
  ping: () => ipcRenderer.invoke('cc:ping'),
});
