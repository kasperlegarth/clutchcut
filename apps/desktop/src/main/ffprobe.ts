import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { once } from "node:events";
import ffprobeStatic from "ffprobe-static";

function resolveFfprobePath() {
  const raw = (ffprobeStatic as any)?.path ?? (ffprobeStatic as unknown as string);
  if (typeof raw !== "string" || raw.length === 0) return "ffprobe";
  const unpacked = raw.replace("app.asar", "app.asar.unpacked");
  return existsSync(unpacked) ? unpacked : raw;
}

export async function ffprobeJson(inputPath: string): Promise<any> {
  // 🔒 Validering – stop fejl med 'undefined'
  if (!inputPath || typeof inputPath !== "string") {
    throw new Error("ffprobe: inputPath er tom/ugyldig (forventede string)");
  }
  if (!existsSync(inputPath)) {
    throw new Error(`ffprobe: fil findes ikke: ${inputPath}`);
  }

  const bin = resolveFfprobePath();
  const args = [
    "-v", "error",
    "-show_format",
    "-show_streams",
    "-print_format", "json",
    inputPath
  ];

  return new Promise(async (resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true });
    let out = "", err = "";
    child.stdout.on("data", d => out += d.toString());
    child.stderr.on("data", d => err += d.toString());
    const [code] = (await once(child, "close")) as [number];
    if (code === 0) {
      try { resolve(JSON.parse(out || "{}")); }
      catch (e:any) { reject(new Error("ffprobe: kunne ikke parse JSON: " + e.message)); }
    } else {
      reject(new Error(`ffprobe exit ${code}: ${err || out || "ukendt fejl"}`));
    }
  });
}
