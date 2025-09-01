// apps/desktop/src/main/ffprobe.ts
import { spawn } from "node:child_process";
import { app } from "electron";
import ffprobeStatic from "ffprobe-static";

/**
 * Returnerer den rigtige sti til ffprobe, afhængigt af om vi kører dev eller packaged.
 */
function getFfprobePath() {
  // ffprobe-static peger som udgangspunkt ind i app.asar → vi skal bruge unpacked
  const unpackedPath = ffprobeStatic.path.replace("app.asar", "app.asar.unpacked");

  if (!app.isPackaged) {
    // I dev virker det fint at bruge den direkte sti fra node_modules
    return ffprobeStatic.path;
  }

  return unpackedPath;
}

/**
 * Kør ffprobe og returner metadata i JSON-format
 */
export function ffprobeJson(file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_streams",
      "-show_format",
      file,
    ];

    const proc = spawn(getFfprobePath(), args, { windowsHide: true });

    let out = "";
    let err = "";

    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("error", (e) => reject(e));

    proc.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(out));
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(err || `ffprobe exited with code ${code}`));
      }
    });
  });
}
