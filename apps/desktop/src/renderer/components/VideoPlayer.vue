<template>
  <div class="flex flex-col gap-2">
    <video
      ref="videoEl"
      :src="srcUrl"
      class="w-full max-h-[70vh] bg-black rounded-xl"
      controls
      playsinline
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoaded"
    ></video>

    <div class="flex items-center gap-2 text-sm">
      <button class="px-3 py-1.5 rounded bg-neutral-200" @click="seekRel(-2)">« -2s</button>
      <button class="px-3 py-1.5 rounded bg-neutral-200" @click="togglePlay()">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button class="px-3 py-1.5 rounded bg-neutral-200" @click="seekRel(2)">+2s »</button>

      <div class="ml-auto text-xs text-neutral-600">
        t={{ currentTime.toFixed(2) }}s
        <span v-if="segmentActive"> • playing segment: [{{ segStart?.toFixed(2) }} → {{ segEnd?.toFixed(2) }}]</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  filePath: string | null
}>();

const videoEl = ref<HTMLVideoElement | null>(null);
const srcUrl = ref<string | undefined>(undefined);
const isPlaying = ref(false);
const currentTime = ref(0);

// Segment state
const segStart = ref<number | null>(null);
const segEnd = ref<number | null>(null);
const segmentActive = computed(() => segStart.value != null && segEnd.value != null);

// Når fil ændres → opdatér src
watch(() => props.filePath, (p) => {
  if (!p) { srcUrl.value = undefined; return; }
  // @ts-ignore – vinduet er blevet udvidet af preload
  srcUrl.value = window.clutchcut.toCcFileUrl(p);
});

function onLoaded() {
  // Autoplay off — men nulstil tid
  if (videoEl.value) {
    videoEl.value.currentTime = 0;
  }
}

function onTimeUpdate() {
  if (!videoEl.value) return;
  currentTime.value = videoEl.value.currentTime;

  // Stop ved segment-slut
  if (segmentActive.value && segEnd.value != null && currentTime.value >= segEnd.value) {
    videoEl.value.pause();
    isPlaying.value = false;
    // snap til slut-tid for pænhed
    videoEl.value.currentTime = segEnd.value;
    // ryd segment hvis du ønsker “one-shot”
    // segStart.value = segEnd.value = null;
  }
}

async function playSegment(start: number, end: number) {
  if (!videoEl.value) return;
  segStart.value = start;
  segEnd.value = end;

  // Seek til start og afspil
  await seekAbs(start);
  await videoEl.value.play();
  isPlaying.value = true;
}

async function seekAbs(t: number) {
  if (!videoEl.value) return;
  videoEl.value.currentTime = Math.max(0, t);
  // Vent et microtick så browsers afspiller opdaterer glidebar før afspilning
  await Promise.resolve();
}

function seekRel(d: number) {
  if (!videoEl.value) return;
  videoEl.value.currentTime = Math.max(0, videoEl.value.currentTime + d);
}

function togglePlay() {
  if (!videoEl.value) return;
  if (videoEl.value.paused) {
    videoEl.value.play(); isPlaying.value = true;
  } else {
    videoEl.value.pause(); isPlaying.value = false;
  }
}

// Keyboard genveje: J/K/L og piletaster (kun når video har fokus eller globalt – her globalt)
function onKey(e: KeyboardEvent) {
  if (!videoEl.value) return;
  switch (e.key.toLowerCase()) {
    case "j": e.preventDefault(); seekRel(-1); break;      // -1s
    case "l": e.preventDefault(); seekRel(+1); break;      // +1s
    case "k": e.preventDefault(); togglePlay(); break;     // play/pause
    case "arrowleft": e.preventDefault(); seekRel(-0.2); break;
    case "arrowright": e.preventDefault(); seekRel(+0.2); break;
  }
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// Expose API til parent (så parent kan kalde playSegment)
defineExpose({ playSegment, seekAbs });
</script>
