<script lang="ts" setup>
import { Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { defineEmits, defineProps, reactive, watch } from 'vue'

const emit = defineEmits(['next', 'update:model'])

const props = defineProps({
  model: {
    type: Object,
    default: () => ({
      projectName: '',
      game: '',
      footage: null,
      timestamp: null,
    })
  }
})

const form = reactive({
  projectName: props.model.projectName,
  game: props.model.game,
  footage: props.model.footage,
  timestamp: props.model.timestamp,
})

watch(form, (val) => {
  emit('update:model', { ...val })
}, { deep: true })

function handleNext() {
  form.timestamp = new Date().toISOString()
  emit('update:model', { ...form })
  emit('next', 2) // Always go to step 2 from settings
}
</script>

<template>
    <Card class="w-[650px]" s>
        <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div class="grid item-center w-full gap-4">
              <div class="flex flex-col space-y-1.5">
                <Label for="project-name">Project Name</Label>
                <Input id="project-name" placeholder="My Awesome Project" v-model="form.projectName" />
              </div>
              <div class="flex flex-col space-y-1.5">
                <Label for="video-quality">Game</Label>
                <Select v-model:model-value="form.game" default-value="Battlefield 2042">
                  <SelectTrigger id="video-quality" class="w-full">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Battlefield 2042">Battlefield 2042</SelectItem>
                    <SelectItem value="Battlefield 6" disabled>Battlefield 6 (coming soon ...)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex flex-col space-y-1.5">
                <Label for="video-footage">Footage</Label>
                <Input
                  id="video-footage"
                  type="file"
                  accept="video/mp4,video/x-m4v,video/*"
                  @change="(e: Event) => form.footage = (e.target as HTMLInputElement).files?.[0] ?? null"
                />
              </div>
            </div>
          </form>
        </CardContent>
    <CardFooter class="flex justify-end">
  <Button @click="handleNext">Next</Button>
    </CardFooter>
    </Card>
</template>