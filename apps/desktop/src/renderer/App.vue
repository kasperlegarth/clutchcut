<template>
  <div class="p-8">
    <FilePicker v-model="file" @start="startAnalysis" />
    <DebugFrames @options="onDebugOptions" class="mt-6" />
    <div v-if="scanning" class="w-full bg-neutral-200 rounded h-3 overflow-hidden">
      <div class="h-full bg-blue-600 transition-all duration-200"
          :style="{ width: progress + '%' }"></div>
    </div>
    <div v-if="scanning" class="mt-1 text-sm text-neutral-600">
      {{ progress }}% • ETA: {{ fmtEta(etaMs) }}
    </div>
    <h2 class="text-lg font-semibold mt-4">Events</h2>
    <EventsTable :items="events" />
    <VideoPlayer ref="player" :filePath="file ?? null" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FilePicker from "./components/FilePicker.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";
import EventsTable from "@/components/EventsTable.vue";
import DebugFrames from "./components/DebugFrames.vue";

const debugOpts = ref({ keepFrames: true, previewEveryN: 10 });

function onDebugOptions(p: { keepFrames:boolean; previewEveryN:number }) {
  debugOpts.value = p;
}

const file = ref<string | null>(null);
const player = ref<InstanceType<typeof VideoPlayer> | null>(null);

const events = ref<any[]>([]);
const scanning = ref(false);
const progress = ref(0);
const etaMs = ref<number | null>(null);

function play(start: number, end: number) {
  player.value?.playSegment(start, end);
}

function normalizePath(p: unknown): string | null {
  if (!p) return null;
  if (typeof p === "string") return p;
  if (typeof (p as any).path === "string") return (p as any).path;
  return null;
}

function startAnalysis() {
  const p = normalizePath(file.value);
  if (!p) {
    // vis en pæn fejl til brugeren
    console.error("No valid file path from picker");
    return;
  }

  console.log('starting analysis');
  console.log(p);

  scanning.value = true;
  progress.value = 0;
  events.value = [];

  // ROI (procenter) – bare et gæt der ofte passer til BF2042 killfeed (øverst højre)
  const roi = { x: 0.70, y: 0.05, w: 0.28, h: 0.40 };

  // progress events
  // @ts-ignore
  window.clutchcut.onAnalysisProgress((p) => {
    if (p?.step === "scan") {
      if (typeof p.progress === "number") progress.value = p.progress;
      if (typeof p.etaMs === "number") etaMs.value = p.etaMs;

      console.log(p.progress)
    }
  });

  const payload = {
    filePath: p,           // <-- VIGTIGT: hedder filePath
    roi: { x: 0.70, y: 0.05, w: 0.28, h: 0.40 },
    rules: { stepSec: 0.5, minDiff: 0.4 },
    ocrLang: "eng",
    debug: { keepFrames: true, previewEveryN: 10 }
  };

  // @ts-ignore
  window.clutchcut.startAnalysis(payload).then((res) => {
    events.value = res.events;
  }).finally(() => {
    scanning.value = false;
  });

}
function fmtEta(ms: number | null) {
  if (ms == null) return "—";
  const s = Math.max(0, Math.round(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return hh > 0 ? `${hh}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`
                : `${mm}:${String(ss).padStart(2,"0")}`;
}

onMounted(async () => {
  // @ts-ignore
  await window.clutchcut?.checkForUpdates();
});
</script>
