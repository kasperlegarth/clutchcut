<script lang="ts" setup>
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computed } from 'vue'
import { formatDate } from '@/lib/utils'

interface SettingsModel {
	projectName: string
	game: string
	footage: File | null
	timestamp: string | null
}

const emit = defineEmits(['next'])

const props = defineProps({
	model: {
		type: Object as () => SettingsModel & Record<string, any>,
		required: true
	}
})

const fileInfo = computed(() => {
	if (!props.model.footage) return null
	const file = props.model.footage
	// Name without extension
	const name = file.name.replace(/\.[^/.]+$/, '')
	// Type as 'Video: <format>'
	let type = file.type
	if (type.startsWith('video/')) {
		type = 'Video: ' + type.split('/')[1].toUpperCase()
	}
	// Size in best unit under 1000
	let size = file.size
	let displaySize = ''
	if (size < 1000) {
		displaySize = size + ' B'
	} else if (size < 1000 * 1000) {
		displaySize = (size / 1024).toFixed(2) + ' KB'
	} else if (size < 1000 * 1000 * 1000) {
		displaySize = (size / (1024 * 1024)).toFixed(2) + ' MB'
	} else {
		displaySize = (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
	}
	return {
		name,
		type,
		displaySize
	}
})

function handleConfirm() {
	emit('next', 3) // Always go to step 3 from confirm
}
</script>

<template>
		<Card class="w-[650px]">
			<CardHeader>
				<CardTitle>Confirm your information</CardTitle>
				<CardDescription>Review and confirm your entered data</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<div>
						<strong>Project name:</strong> {{ model.projectName }}
					</div>
					<div>
						<strong>Game:</strong> {{ model.game }}
					</div>
					<div>
						  <strong>Timestamp:</strong> {{ formatDate(model.timestamp) }}
					</div>
					<div v-if="fileInfo">
						<strong>File name:</strong> {{ fileInfo.name }}<br>
						<strong>File type:</strong> {{ fileInfo.type }}<br>
						<strong>File size:</strong> {{ fileInfo.displaySize }}
					</div>
					<div v-else>
						<strong>File:</strong> No file selected
					</div>
				</div>
			</CardContent>
			<CardFooter class="flex justify-end">
				<Button @click="handleConfirm">Confirm</Button>
			</CardFooter>
		</Card>
</template>
