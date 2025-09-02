import { contextBridge, ipcRenderer } from "electron";
import { pathToFileURL } from "url";

function toCcFileUrl(absPath: string): string {
  try {
    // pathToFileURL håndterer Windows-stier, mellemrum og # -> %23
    return pathToFileURL(absPath).toString().replace("file://", "cc-file://");
  } catch {
    // Fallback, hvis noget går galt: lav en rimelig URL manuelt
    let p = absPath.replace(/\\/g, "/");
    if (!p.startsWith("/")) p = "/" + p;               // C:/... -> /C:/...
    const encoded = encodeURI(p).replace(/#/g, "%23"); // sikre # mm.
    return `cc-file://${encoded}`;
  }
}

contextBridge.exposeInMainWorld("clutchcut", {
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  pickFile: (filters?: any) => ipcRenderer.invoke("file:pick", { filters }),
  ffprobe: (path:string) => ipcRenderer.invoke("ffprobe:meta", { path }),
  startAnalysis: (path: string) => ipcRenderer.invoke("analysis:start", { path }),
  cancelAnalysis: () => ipcRenderer.invoke("analysis:cancel"),
  onProgress: (cb: (p: any)=>void) => ipcRenderer.on("analysis:progress", (_e, p) => cb(p)),
  toCcFileUrl
});