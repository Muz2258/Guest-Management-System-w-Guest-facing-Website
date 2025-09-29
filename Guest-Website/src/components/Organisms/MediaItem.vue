<template>
  <div class="relative overflow-hidden rounded-lg bg-gray-100 group">
    <!-- Image skeleton -->
    <div 
      v-if="!isLoaded"
      class="animate-pulse bg-neutrals-neu-76 w-full"
      :style="{ aspectRatio: (item as MediaItemWithAspectRatio).aspectRatio || getRandomAspectRatio() }"
    ></div>
    
    <!-- Error state -->
    <div 
      v-if="hasError"
      class="flex items-center justify-center h-48 bg-gray-100 text-gray-500"
    >
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-sm">Failed to load</p>
      </div>
    </div>
    
    <!-- Actual media content -->
    <div>
      <!-- Image -->
      <img 
        v-if="item.file_type === 'image'"
        :src="item.s3_preview_url"
        :alt="item.filename"
        class="w-full object-cover transition-all duration-300 group-hover:scale-105"
        :class="{ 'opacity-0': !isLoaded && !hasError }"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <!-- Video -->
      <div 
        v-else-if="item.file_type === 'video'"
        class="relative overflow-hidden"
      >
        <video 
          :src="item.s3_preview_url"
          class="w-full object-cover transition-all duration-300 group-hover:scale-105"
          muted
          playsinline
          @play="handlePlay"
          @pause="handlePause"
          @loadedmetadata="handleVideoLoad"
          @error="handleVideoError"
        />
        <div class="absolute bottom-12 left-12 bg-neutrals-neu-0/50 flex items-center justify-center gap-8 p-6 rounded-lg border border-neutrals-neu-46/50">
          <Icon name="video-solid" :size="16" :color="getColor('neutral.neu_100')" />
          <span class="text-neutrals-neu-100 text-s">{{ item.caption }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from '@/types/event'
import { getColor } from '@/utils/colors'
import Icon from '@/components/Icon'

// Types for runtime-enhanced media items
interface MediaItemWithAspectRatio extends MediaItem {
  aspectRatio?: number // Added at runtime when image loads
}

// Props
interface MediaItemProps {
  item: MediaItem
}

const props = defineProps<MediaItemProps>()

// Emits
const emit = defineEmits<{
  'image-load': [event: Event, item: MediaItem]
  'image-error': [item: MediaItem]
  'video-play': [item: MediaItem]
  'video-pause': [item: MediaItem]
}>()

// Reactive state
const isLoaded: Ref<boolean> = ref(false)
const hasError: Ref<boolean> = ref(false)

// Event handlers
const handleImageLoad = (event: Event): void => {
  isLoaded.value = true
  emit('image-load', event, props.item)
}

const handleImageError = (): void => {
  hasError.value = true
  isLoaded.value = true // Prevent skeleton from showing
  emit('image-error', props.item)
}

const handleVideoLoad = () => {
  isLoaded.value = true
}

const handleVideoError = (): void => {
  hasError.value = true
  isLoaded.value = true
}

const handlePlay = () => {
  emit('video-play', props.item)
}

const handlePause = () => {
  emit('video-pause', props.item)
}

const commonAspectRatios: string[] = [
  '1.0',
  '4 / 3',
  '9 / 16',
  '10 / 16',
  '9 / 21'
];

const getRandomAspectRatio = (): string => {
  const randomIndex = Math.floor(Math.random() * commonAspectRatios.length);
  return commonAspectRatios[randomIndex] ?? '1.0'
}
</script>