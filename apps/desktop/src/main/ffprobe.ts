import { spawn } from "node:child_process";

export function ffprobeJson(file: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v","error",
      "-print_format","json",
      "-show_streams",
      "-show_format",
      file
    ];
    const p = spawn("ffprobe", args);
    let out = "", err = "";
    p.stdout.on("data", d => out += d);
    p.stderr.on("data", d => err += d);
    p.on("close", code => code === 0 ? resolve(JSON.parse(out)) : reject(new Error(err || `ffprobe exited ${code}`)));
  });
}