import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("clutchcut", {
  checkForUpdates: () => ipcRenderer.invoke("update:check")
});