<template>
  <div class="p-8">
    <FilePicker msg="Velkommen til Clutch Cut MVP" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FilePicker from "./components/FilePicker.vue";

const preloadMessage = ref("");
onMounted(async () => {
  // @ts-ignore
  await window.clutchcut?.checkForUpdates();
});
</script>
