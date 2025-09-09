import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
fileURLToPath(import.meta.url);
let win = null;
async function createWindow() {
  const preload = fileURLToPath(new URL("./preload.cjs", import.meta.url));
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false
      // sandbox: false // (default) – lad den bare være
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    await win.loadFile("../dist/index.html");
  }
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
ipcMain.handle("cc:ping", () => "pong");
