<script setup lang="ts">
import { computed } from 'vue'
import { Check } from "lucide-vue-next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
const props = defineProps({
    progress: {
        type: Number,
        required: true,
        default: 0
    },
    eta: {
        type: Number,
        required: false,
        default: null
    }
})

const prettyEta = computed(() => {
    if (props.eta === null) return 'Calculating...'
    const totalSeconds = props.eta
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    let parts = []
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)

    return parts.join(' ')
})

function formatProgress(val: number) {
    return val.toFixed(2)
}
</script>
<template>
    <Card class="w-[650px]">
        <CardHeader>
            <CardTitle>Processing</CardTitle>
            <CardDescription>Your footage is being processed. This may take a few minutes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-4">
                <div class="w-full">
                    <Progress v-model="props.progress" />
                </div>
                <div class="flex flex-col">
                    <small class="text-muted-foreground">Progress: {{ formatProgress(props.progress) }}%</small>
                    <small class="text-muted-foreground">Estimated time remaining: {{ prettyEta }}</small>
                    <small v-if="props.progress >= 100" class="flex gap-x-1 align-center text-muted-foreground mt-5"><Check size="20" /> Wrapping up last touches...</small>
                </div>
            </div>
        </CardContent>
    </Card>
</template>