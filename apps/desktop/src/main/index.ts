import { app, BrowserWindow, dialog, ipcMain, protocol, session } from "electron";
import * as path from "path";
import { lookup as mimeLookup } from "mime-types";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { buildMenu } from "./menu";
import { ffprobeJson } from "./ffprobe";
import { fileURLToPath } from "node:url";
import { Analyzer } from "./analysis";
import { shell } from "electron";

let analyzer: Analyzer | null = null;

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
    width: 1600,
    height: 900,
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

protocol.registerSchemesAsPrivileged([{
  scheme: "cc-file",
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);

function normalizeCcFileUrl(raw: string): string {
  let u = raw;

  // Sørg for "cc-file:///" (tre skråstreger)
  u = u.replace(/^cc-file:\/(?!\/)/i, "cc-file:///");   // cc-file:/C:/... -> cc-file:///C:/...
  u = u.replace(/^cc-file:\/\//i, "cc-file:///");       // cc-file://C:/... -> cc-file:///C:/...

  // Fix case: drevbogstav uden kolon efter tre skråstreger:
  // cc-file:///c/Users/...  ELLER  cc-file://c/Users/...  ->  cc-file:///C:/Users/...
  u = u.replace(/^cc-file:\/{2,3}([a-zA-Z])\//, (_m, d: string) => `cc-file:///${d.toUpperCase()}:\/`);

  return u;
}

function registerCcFileProtocol() {
  protocol.registerFileProtocol("cc-file", (request, callback) => {
    try {
      const normalized = normalizeCcFileUrl(request.url);

      // Byt schema til file: og lad WHATWG URL håndtere encoding
      const fileUrl = new URL(normalized.replace(/^cc-file:/i, "file:"));
      const absPath = fileURLToPath(fileUrl); // <- korrekt Windows-sti (C:\...)

      const mimeType = mimeLookup(absPath) || "application/octet-stream";

      callback({ path: absPath, mimeType });
    } catch (e) {
      console.error("[cc-file] error for", request.url, e);
      callback({ error: -6 });
    }
  });
}

ipcMain.handle("analysis:start", async (e, opts) => {
    console.log("[analysis:start] opts:", opts);           // 👈 se hele objektet
  console.log("[analysis:start] typeof filePath:", typeof opts?.filePath, "value:", opts?.filePath);
  const win = BrowserWindow.fromWebContents(e.sender)!;
  const filePath = opts?.filePath;
  if (!filePath || typeof filePath !== "string") {
    throw new Error("analysis:start: filePath mangler eller er ikke en streng");
  }
  analyzer?.cancel();
  analyzer = new Analyzer();
  return await analyzer.run(win, { ...opts, filePath });
});

ipcMain.handle("analysis:cancel", () => { analyzer?.cancel(); analyzer = null; });

// Til debug: åbne mappe
ipcMain.handle("fs:openPath", async (_e, p: string) => shell.openPath(p));

app.whenReady().then(() => {
  registerCcFileProtocol();
  const win = createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
