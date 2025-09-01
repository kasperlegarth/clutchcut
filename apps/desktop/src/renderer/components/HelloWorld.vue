<template>
  <div class="p-4 border rounded-xl shadow-sm text-center">
    <p class="text-lg font-semibold">{{ msg }}</p>
    <button
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      @click="count++"
    >
      Klik mig ({{ count }})
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
</script>
