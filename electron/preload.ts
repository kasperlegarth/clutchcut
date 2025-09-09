// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('cc', {
  ping: () => ipcRenderer.invoke('cc:ping'),
});
