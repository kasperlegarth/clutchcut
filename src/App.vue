<script setup lang="ts">
import { ref, watch } from 'vue'
import { Settings } from "@/components/modules/settings"
import { Confirm } from "@/components/modules/confirm"
import { Processing } from "@/components/modules/processing"
import { Events } from "@/components/modules/events"

const settingsModel = ref({
    projectName: '',
    game: '',
    footage: null,
    timestamp: null,
})

const step = ref(1);

const processingProgress = ref(0);

// For robust ETA: keep a short history of progress and timestamps
type ProgressSample = { value: number, time: number }
const progressHistory: ProgressSample[] = [];

const eta = ref<number | null>(null);

// Watch progress and go to step 4 when done
watch(processingProgress, (val) => {
    if (val >= 100 && step.value === 3) {
        setTimeout(() => {
            step.value = 4;
        }, 2000); // slight delay to show 100% completion
    }
});

function addRandomProgress() {
    const increment = Math.random() * (3.25 - 0.24) + 0.24;
    processingProgress.value = Math.min(100, processingProgress.value + increment);
}

function getEtaSeconds() {
    // Use a sliding window of the last 5-10 seconds for a more stable estimate
    const now = Date.now();
    // Remove old samples (older than 10s)
    while (progressHistory.length > 0 && now - progressHistory[0].time > 10000) {
        progressHistory.shift();
    }
    // Add current sample
    progressHistory.push({ value: processingProgress.value, time: now });
    // Need at least 2 samples to estimate
    if (progressHistory.length < 2) return null;
    const first = progressHistory[0];
    const last = progressHistory[progressHistory.length - 1];
    const deltaProgress = last.value - first.value;
    const deltaTime = (last.time - first.time) / 1000; // seconds
    if (deltaProgress <= 0 || deltaTime <= 0) return null;
    const rate = deltaProgress / deltaTime; // percent per second
    if (rate <= 0) return null;
    const remaining = 100 - processingProgress.value;
    return Math.round(remaining / rate);
}


function gotoStep(nextStep: number) {
    step.value = nextStep;

    if(nextStep === 3) {
        // Simulate progress for demo purposes
        processingProgress.value = 0;
        progressHistory.length = 0;
        eta.value = null;
        const interval = setInterval(() => {
            addRandomProgress();
            eta.value = getEtaSeconds();
            if (processingProgress.value >= 100) {
                clearInterval(interval);
            }
        }, 1000);
    }
}

</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center">
        <transition
            name="fade-left"
            mode="out-in"
            v-if="step >= 1"
        >
            <div v-if="step === 1" key="step1" class="flex flex-col items-center justify-center gap-4">
                <h1 class="text-3xl mb-10">New Project</h1>
                <Settings v-model:model="settingsModel" @next="gotoStep" />
                <small class="underline">Or see previous projects</small>
            </div>
            <div v-else-if="step === 2" key="step2">
                <transition name="fade-right" appear>
                    <div>
                        <Confirm :model="settingsModel" @next="gotoStep" />
                    </div>
                </transition>
            </div>
            <div v-else-if="step === 3" key="step3">
                <transition name="fade-right" appear>
                    <div>
                        <Processing :progress="processingProgress" :eta="eta ?? undefined" />
                    </div>
                </transition>
            </div>
            <div v-else-if="step === 4" key="step4">
                <transition name="fade-right" appear>
                    <Events :video-file="settingsModel.footage" :events="[
                        { type: 'kill', timestamp: 284 },
                        { type: 'revive', timestamp: 350 },
                        { type: 'kill', timestamp: 480 },
                        { type: 'kill', timestamp: 483 },
                        { type: 'kill', timestamp: 489 },
                        { type: 'squad revive', timestamp: 495 }
                    ]" />
                </transition>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.fade-left-enter-active,
.fade-left-leave-active {
    transition: opacity 0.4s, transform 0.4s;
}
.fade-left-enter-from {
    opacity: 0;
    transform: translateX(-40px);
}
.fade-left-enter-to {
    opacity: 1;
    transform: translateX(0);
}
.fade-left-leave-from {
    opacity: 1;
    transform: translateX(0);
}
.fade-left-leave-to {
    opacity: 0;
    transform: translateX(-40px);
}

.fade-right-enter-active {
    transition: opacity 0.4s, transform 0.4s;
}
.fade-right-enter-from {
    opacity: 0;
    transform: translateX(40px);
}
.fade-right-enter-to {
    opacity: 1;
    transform: translateX(0);
}
</style>
