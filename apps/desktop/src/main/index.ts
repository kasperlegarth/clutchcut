import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      devTools: true
    }
  });

  const isDev = !app.isPackaged;
  const devUrl = "http://localhost:1337";
  const prodIndex = path.join(__dirname, "../../dist/index.html");

  if (isDev) {
    console.log("[MAIN] DEV mode →", devUrl);
    win.loadURL(devUrl).catch(err => console.error("[MAIN] loadURL(dev) failed:", err));
    // Åbn devtools straks
    win.webContents.openDevTools({ mode: "detach" });
    // Og sørg for de også åbner efter første load
    win.webContents.on("did-finish-load", () => {
      if (!win.webContents.isDevToolsOpened()) {
        win.webContents.openDevTools({ mode: "detach" });
      }
    });
  } else {
    console.log("[MAIN] PROD mode →", prodIndex);
    win.loadFile(prodIndex).catch(err => console.error("[MAIN] loadFile(prod) failed:", err));
  }
}

app.whenReady().then(() => {
  console.log("[APP] Ready (isPackaged =", app.isPackaged, ")");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (err) => console.error("[UNCAUGHT]", err));
