<script setup lang="ts">
import { ref } from "vue";
import { Button } from '@/components/ui/button';

defineProps<{ msg: string }>();

const count = ref(0);
</script>


<template>
  <div class="p-4 border rounded-xl shadow-sm text-center">
    <p class="text-lg font-semibold">{{ msg }}</p>
    <Button
      @click="count++"
    >
      Klik mig ({{ count }})
    </Button>
  </div>
</template>