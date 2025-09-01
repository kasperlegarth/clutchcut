import { app, BrowserWindow, Menu, shell } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import { dialog } from "electron";

export function buildMenu(win: BrowserWindow) {
  const isMac = process.platform === "darwin";
  const appName = app.getName();

  const template: MenuItemConstructorOptions[] = [];

  // macOS app-menu
  if (isMac) {
    const macAppMenu: MenuItemConstructorOptions = {
      label: appName,
      submenu: [
        { label: `About ${appName}`, click: () => showAbout(win) },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ] as MenuItemConstructorOptions[]
    };
    template.push(macAppMenu);
  }

  // File
  template.push({
    label: "File",
    submenu: [{ role: isMac ? "close" : "quit" }] as MenuItemConstructorOptions[]
  });

  // View
  template.push({
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ] as MenuItemConstructorOptions[]
  });

  // Help
  template.push({
    label: "Help",
    submenu: [
      { label: `About ${appName}`, click: () => showAbout(win) },
      {
        label: "Open Releases",
        click: () => shell.openExternal("https://github.com/kasperlegarth/clutchcut/releases")
      }
    ] as MenuItemConstructorOptions[]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAbout(win: BrowserWindow) {
  const appName = app.getName();
  const version = app.getVersion();
  const env = process.env.NODE_ENV || (app.isPackaged ? "production" : "development");
  const { electron, chrome, node } = process.versions;

  dialog.showMessageBox(win, {
    type: "info",
    title: `About ${appName}`,
    message: `${appName}`,
    detail:
`Version: ${version}
Environment: ${env}
Electron: ${electron}
Chrome: ${chrome}
Node: ${node}

© ${new Date().getFullYear()} Clutch Cut`,
    buttons: ["OK"]
  });
}
