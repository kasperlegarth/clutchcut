import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("clutchcut", {
  ping: () => "pong"
});
