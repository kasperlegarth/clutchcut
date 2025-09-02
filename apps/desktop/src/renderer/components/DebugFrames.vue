<template>
  <div class="rounded-xl border p-3 space-y-2">
    <div class="text-sm font-medium">Debug frames</div>
    <div class="flex items-center gap-3">
      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="keepFrames" class="accent-blue-600">
        Behold frame-filer
      </label>
      <label class="inline-flex items-center gap-2 text-sm">
        Preview hver
        <input type="number" min="1" v-model.number="previewEveryN" class="w-16 border rounded px-2 py-1 text-sm">
        . frame
      </label>
      <button v-if="keptDir" class="ml-auto px-3 py-1.5 rounded bg-neutral-800 text-white" @click="openDir">
        Åbn mappe
      </button>
    </div>
    <div v-if="last" class="mt-2">
      <div class="text-xs text-neutral-600">#{{last.idx}} · t={{last.t.toFixed(2)}}s</div>
      <img :src="ccUrl(last.path)" class="max-w-full border rounded" alt="debug frame">
    </div>
    <div v-else class="text-sm text-neutral-500">Ingen frames endnu…</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits<{ (e:"options", payload:{ keepFrames:boolean; previewEveryN:number }): void }>();

const keepFrames = ref(false);
const previewEveryN = ref(10);

watch([keepFrames, previewEveryN], () => {
  emit("options", { keepFrames: keepFrames.value, previewEveryN: previewEveryN.value });
}, { immediate: true });

const last = ref<{ idx:number;t:number;path:string }|null>(null);
const keptDir = ref<string|null>(null);

// @ts-ignore
window.clutchcut.onAnalysisDebugFrame((p)=>last.value=p);
// @ts-ignore
window.clutchcut.onAnalysisFramesKept(({dir})=>keptDir.value=dir);

function ccUrl(p:string) {
  // @ts-ignore
  return window.clutchcut.toCcFileUrl(p);
}
async function openDir() {
  if (!keptDir.value) return;
  // @ts-ignore
  await window.clutchcut.openPath(keptDir.value);
}
</script>
