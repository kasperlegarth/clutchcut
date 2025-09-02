<template>
  <div class="p-8">
    <FilePicker v-model="file" />
    <VideoPlayer ref="player" :filePath="file?.path ?? null" />

     <!-- Dummy clips (start/slut i sekunder) -->
    <div class="space-y-2">
      <button class="px-3 py-1.5 rounded bg-blue-600 text-white"
              @click="play(100.4, 112.2)">
        Play segment 100.4 → 112.2
      </button>
      <button class="px-3 py-1.5 rounded bg-blue-600 text-white"
              @click="play(8, 15)">
        Play segment 8 → 15
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FilePicker from "./components/FilePicker.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";

const file = ref<File | null>(null);
const player = ref<InstanceType<typeof VideoPlayer> | null>(null);

function play(start: number, end: number) {
  player.value?.playSegment(start, end);
}

onMounted(async () => {
  // @ts-ignore
  await window.clutchcut?.checkForUpdates();
});
</script>
