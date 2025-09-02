import { BrowserWindow, app, ipcMain, protocol, shell } from "electron";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { promises as fsp } from "node:fs";
import { mkdirSync, rmSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import ffmpegStatic from "ffmpeg-static";
import { ffprobeJson } from "./ffprobe";

type ROI = { x: number; y: number; w: number; h: number };
type Rules = { stepSec: number; minDiff: number };
type Event = { id: string; type: "feed-change"; t: number; text: string; confidence?: number };

export type AnalysisOptions = {
  filePath: string;
  durationSec?: number;
  fps?: number;
  roi: ROI;
  rules?: Partial<Rules>;
  ocrLang?: string;
  debug?: {
    keepFrames?: boolean;
    previewEveryN?: number;
    outDir?: string;
  };
};

const DEFAULT_RULES: Rules = { stepSec: 0.5, minDiff: 0.35 };

export class Analyzer {
  private abort = false;
  private worker: any = null;

  cancel() { this.abort = true; }

  private getFfmpegPath() {
    return (ffmpegStatic as unknown as string).replace("app.asar", "app.asar.unpacked");
  }

  private async probeDim(filePath: string) {
    const j = await ffprobeJson(filePath);
    const v = j.streams.find((s: any) => s.codec_type === "video");
    return { w: Number(v?.width || 0), h: Number(v?.height || 0) };
  }

  private buildCropFilter(dim: { w: number; h: number }, roi: ROI) {
    const cw = Math.max(16, Math.round(dim.w * roi.w));
    const ch = Math.max(24, Math.round(dim.h * roi.h));
    const cx = Math.min(Math.max(0, Math.round(dim.w * roi.x)), Math.max(0, dim.w - cw));
    const cy = Math.min(Math.max(0, Math.round(dim.h * roi.y)), Math.max(0, dim.h - ch));

    return [
      `crop=${cw}:${ch}:${cx}:${cy}`,
      `scale='if(lt(iw,256),256,iw)':'if(lt(ih,96),96,ih)':flags=neighbor`,
      `format=gray`,
      `eq=contrast=1.3:brightness=0.02`
    ].join(",");
  }

  private async changedEnough(prevBuf: Buffer | null, curBuf: Buffer, thr = 0.015) {
    try {
      const size = 64;
      const cur = await sharp(curBuf).resize(size, size).raw().greyscale().toBuffer();
      if (!prevBuf) return true;
      const prev = await sharp(prevBuf).resize(size, size).raw().greyscale().toBuffer();
      let sum = 0;
      for (let i = 0; i < cur.length; i++) sum += Math.abs(cur[i] - prev[i]);
      return sum / cur.length / 255 >= thr;
    } catch { return true; }
  }

  private diffRatio(a: string, b: string) {
    if (a === b) return 0;
    const aa = a.toLowerCase().trim(), bb = b.toLowerCase().trim();
    if (!aa && !bb) return 0;
    const maxLen = Math.max(aa.length, bb.length) || 1;
    let same = 0;
    for (let i = 0; i < Math.min(aa.length, bb.length); i++) if (aa[i] === bb[i]) same++;
    return 1 - same / maxLen;
  }

  private async dumpFramesToTemp(filePath: string, vf: string, fps = 2, outDir?: string) {
    const dir = outDir ?? join(app.getPath("temp"), `clutchcut-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const args = [
      "-i", filePath,
      "-vf", `${vf},fps=${fps}`,
      "-start_number", "0",
      "-frame_pts", "1",
      "-f", "image2",
      "-vcodec", "mjpeg", "-q:v", "3",
      join(dir, "%08d.jpg")
    ];
    const proc = spawn(this.getFfmpegPath(), args, { windowsHide: true });
    return { dir, proc };
  }

  async run(win: BrowserWindow, opt: AnalysisOptions) {
    this.abort = false;
    const rules: Rules = { ...DEFAULT_RULES, ...opt.rules };
    const lang = opt.ocrLang || "eng";

    this.worker = await createWorker(lang, 1, { cachePath: join(app.getPath("userData"), "tess-cache"), logger: () => {} });
    await this.worker.setParameters({
      tessedit_pageseg_mode: "6",
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#[]()_+-:!?. ",
      preserve_interword_spaces: "1",
      user_defined_dpi: "150"
    });

    const dim = await this.probeDim(opt.filePath);
    const vf = this.buildCropFilter(dim, opt.roi);

    const stepSec = Math.max(0.1, rules.stepSec);
    const fps = opt.fps ?? Math.max(1, Math.round(1 / stepSec));
    const duration = Number.isFinite(opt.durationSec) ? opt.durationSec! : 90 * 60;
    const totalFrames = Math.floor(duration * fps);

    const previewEveryN = opt.debug?.previewEveryN ?? 10;
    const keepFrames = !!opt.debug?.keepFrames;
    const outDir = opt.debug?.outDir;

    const { dir, proc } = await this.dumpFramesToTemp(opt.filePath, vf, fps, outDir);

    let lastThumb: Buffer | null = null, lastText = "";
    const events: Event[] = [];

    const t0 = Date.now(); let handled = 0, emaMs = 0; const alpha = 0.2;

    try {
      for (let idx = 0; !this.abort; idx++) {
        const filename = join(dir, `${String(idx).padStart(8, "0")}.jpg`);
        try { await fsp.access(filename); } catch { if (proc.exitCode !== null) break; await delay(10); continue; }
        const buf = await fsp.readFile(filename);

        const changed = await this.changedEnough(lastThumb, buf, 0.015);
        lastThumb = buf; if (!changed) continue;

        if (idx % previewEveryN === 0) win.webContents.send("analysis:debugFrame", { idx, t: idx / fps, path: filename });

        const { data } = await this.worker.recognize(buf);
        const text = (data?.text || "").trim(), conf = (data?.confidence ?? 60) / 100;

        if (text && this.diffRatio(lastText, text) >= rules.minDiff) {
          events.push({ id: randomUUID(), type: "feed-change", t: idx / fps, text, confidence: conf });
          win.webContents.send("analysis:progress", { step: "event", t: idx / fps, index: events.length, text });
          lastText = text;
        }

        handled++; const ms = Date.now() - t0; emaMs = emaMs ? alpha*(ms/handled)+(1-alpha)*emaMs : ms/handled;
        if (idx % 10 === 0) win.webContents.send("analysis:progress", { step:"scan", progress: Math.round((idx/totalFrames)*100), etaMs: (totalFrames-handled)*emaMs });
      }
    } finally {
      try { proc.kill("SIGTERM"); } catch {}
      if (!keepFrames) rmSync(dir, { recursive: true, force: true }); else win.webContents.send("analysis:framesKept", { dir });
      await this.worker.terminate();
    }

    return { events, clips: [], tookMs: Date.now() - t0 };
  }
}
