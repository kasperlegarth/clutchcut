import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("clutchcut", {
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  pickFile: (filters?: any) => ipcRenderer.invoke("file:pick", { filters }),
  ffprobe: (path: string) => ipcRenderer.invoke("ffprobe:meta", { path }),
  startAnalysis: (path: string) => ipcRenderer.invoke("analysis:start", { path }),
  cancelAnalysis: () => ipcRenderer.invoke("analysis:cancel"),
  onProgress: (cb: (p: any)=>void) => ipcRenderer.on("analysis:progress", (_e, p) => cb(p)),
});