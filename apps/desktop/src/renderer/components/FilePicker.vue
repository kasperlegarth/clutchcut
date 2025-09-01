<template>
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Clutch Cut</CardTitle>
        <CardDescription>Pick a video file to start analysing your footage.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid w-full items-center gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="file">Select a file</Label>
            <Input @change="handleFilePick" id="file" type="file" />
          </div>
          <div v-if="file">
            <p>
                File size:
                {{ formatFileSize(file.size) }}
            </p>
            <p>
                File type: {{ file.type }}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Analyse</Button>
      </CardFooter>
    </Card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const file = ref<File | null>(null);

const handleFilePick = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    file.value = target.files[0];
  }
};

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let unitIndex = -1;
  let s = size;
  do {
    s /= 1024;
    unitIndex++;
  } while (s >= 1024 && unitIndex < units.length - 1);
  return `${s.toFixed(2)} ${units[unitIndex]}`;
}
</script>