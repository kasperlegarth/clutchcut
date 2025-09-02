<template>
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-neutral-50 dark:bg-neutral-900">
        <tr>
          <th class="text-left px-3 py-2 w-20">Time</th>
          <th class="text-left px-3 py-2">Text (OCR)</th>
          <th class="text-left px-3 py-2 w-20">Conf.</th>
          <th class="px-3 py-2 w-20"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ev in items" :key="ev.id" class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="px-3 py-1.5 tabular-nums">{{ ev.t.toFixed(2) }}s</td>
          <td class="px-3 py-1.5">{{ ev.text }}</td>
          <td class="px-3 py-1.5">{{ Math.round((ev.confidence ?? 0) * 100) }}%</td>
          <td class="px-3 py-1.5">
            <button class="px-2 py-1 rounded bg-blue-600 text-white" @click="$emit('play', ev.t)">Play</button>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="4" class="px-3 py-3 text-neutral-500">No events yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: { id:string; t:number; text:string; confidence?:number }[] }>();
defineEmits<{ (e: "play", t: number): void }>();
</script>
