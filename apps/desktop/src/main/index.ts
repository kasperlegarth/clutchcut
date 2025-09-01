import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // NB: __dirname er 'dist-electron/main' ved runtime (CJS)
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV === "development";
  const devUrl = "http://localhost:1337";

  if (isDev) {
    console.log("[MAIN] Loading DEV URL:", devUrl);
    win.loadURL(devUrl);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const prodIndex = path.join(__dirname, "../../dist/index.html");
    console.log("[MAIN] Loading PROD file:", prodIndex);
    win.loadFile(prodIndex);
  }
}

app.whenReady().then(() => {
  console.log("[APP] Ready");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Ekstra log – hvis noget går galt ser vi det i terminalen
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT]", err);
});
