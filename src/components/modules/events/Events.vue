<script setup lang="ts">
import { computed } from 'vue'
import { Play } from "lucide-vue-next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { prettyDuration } from '@/lib/utils'

export interface Event {
    type: 'kill' | 'revive' | 'squad revive'
    timestamp: number
}

import type { PropType } from 'vue'

const props = defineProps({
    events: {
        type: Array as PropType<Event[] | null>,
        default: null
    },
    videoFile: {
        type: Object as PropType<File | null>,
        default: null
    }
})

import { ref } from 'vue'
const videoSrc = computed(() => {
    if (!props.videoFile) return null;
    return URL.createObjectURL(props.videoFile);
});

const videoRef = ref<HTMLVideoElement | null>(null)
let playTimeout: ReturnType<typeof setTimeout> | null = null

function playEvent(event: Event) {
    if (!videoRef.value) return;
    const seekTo = Math.max(0, event.timestamp - 2);
    videoRef.value.currentTime = seekTo;
    videoRef.value.play();
    if (playTimeout) clearTimeout(playTimeout);
    playTimeout = setTimeout(() => {
        videoRef.value?.pause();
    }, 4000);
}
</script>

<template>
    <div class="flex gap-8">
        <Card class="w-[650px] pb-0">
            <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>A list of all recognized events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table v-if="props.events && props.events.length > 0">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Time of event</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="(event, index) in props.events" :key="index">
                            <TableCell class="capitalize">{{ event.type }}</TableCell>
                            <TableCell>{{ prettyDuration(event.timestamp, 'short') }}</TableCell>
                            <TableCell class="text-right">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Play :size="20" class="cursor-pointer" @click="playEvent(event)" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>See event</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div v-else>
                    <p>No events recorded.</p>
                </div>
            </CardContent>
        </Card>
        <div class="aspect-video flex-shrink-0">
            <video v-if="videoSrc" :src="videoSrc" class="h-100 rounded-xl" ref="videoRef" />
        </div>
    </div>
</template>
