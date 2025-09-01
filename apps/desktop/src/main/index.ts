import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { buildMenu } from "./menu";
import { ffprobeJson } from "./ffprobe";

ipcMain.handle("update:check", () => autoUpdater.checkForUpdatesAndNotify());

function setupAutoUpdater(win: BrowserWindow) {
  autoUpdater.logger = log;
  (autoUpdater.logger as any).transports.file.level = "info";

  // Hvis du vil teste prereleases (fx 0.2.0-beta.1):
  // autoUpdater.allowPrerelease = true;

  autoUpdater.on("checking-for-update", () => win.webContents.send("update:status", "checking"));
  autoUpdater.on("update-available", () => win.webContents.send("update:status", "available"));
  autoUpdater.on("update-not-available", () => win.webContents.send("update:status", "none"));
  autoUpdater.on("error", (err) => log.error("[UPDATE] error:", err));
  autoUpdater.on("download-progress", (p) => win.webContents.send("update:progress", p.percent));
  autoUpdater.on("update-downloaded", async () => {
    const res = await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["Genstart nu", "Senere"],
      title: "Opdatering klar",
      message: "En ny version er downloadet. Vil du genstarte og installere?"
    });
    if (res.response === 0) autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdatesAndNotify();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;
  const devUrl = "http://localhost:1337";
  const prodIndex = path.join(__dirname, "../../dist/index.html");

  if (isDev) {
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(prodIndex);
  }

  buildMenu(win); 

  if (app.isPackaged) setupAutoUpdater(win);
  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); } else {
  app.on("second-instance", (_e, argv) => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
    // evt. håndter deep link/fil her senere
  });
}

ipcMain.handle("ffprobe:meta", async (_e, { path }) => {
  const j = await ffprobeJson(path);
  const vStream = j.streams.find((s:any)=> s.codec_type === "video");
  const fps = vStream?.r_frame_rate ? eval(vStream.r_frame_rate) : 0;
  return {
    durationSec: Number(j.format.duration || 0),
    fps
  };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
