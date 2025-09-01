<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-center mb-4">
      🎮 Clutch Cut
    </h1>
    <HelloWorld msg="Velkommen til Clutch Cut MVP" />
    <p class="text-sm text-gray-500 mt-4 text-center">
      Preload test: {{ preloadMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const preloadMessage = ref("");
onMounted(async () => {
  // @ts-ignore
  await window.clutchcut?.checkForUpdates();
});
</script>
