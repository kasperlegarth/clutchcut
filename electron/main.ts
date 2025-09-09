// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function resolvePreloadPath() {
  // Prod / "bundlet" sti (hvor __dirname normalt er dist-electron)
  const prodPreload = join(__dirname, 'preload.js');
  // Dev: vite-plugin-electron outputter hertil
  const devPreload = join(process.cwd(), 'dist-electron', 'preload.js');
  return existsSync(prodPreload) ? prodPreload : devPreload;
}

let win: BrowserWindow | null = null

const createWindow = async () => {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: resolvePreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // når du bygger renderer (vite build), vil index.html ligge i dist/
    await win.loadFile(join(process.cwd(), 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

ipcMain.handle('cc:ping', () => 'pong')
