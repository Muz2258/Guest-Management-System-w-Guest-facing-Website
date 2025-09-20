<template>
    <div class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-between">
        <div class="flex items-center justify-end w-full px-24 py-16">
            <button @click="$emit('close')" class="px-12 py-12 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full flex items-center justify-center z-10 cursor-pointer">
                <Icon name="close" :size="12" :color="getColor('neutral.neu_100')" />
            </button>
        </div>

        <div class="relative w-full max-w-5xl grow mx-24 overflow-hidden" @click.stop>
            <div 
                class="flex h-full" 
                ref="containerRef"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <div 
                    v-for="(item, index) in mediaItems"
                    :key="`lightbox-main-${index}`"
                    class="flex-shrink-0 w-full flex items-center justify-center"
                    style="margin-right: 16px;" 
                >
                    <img v-if="item.file_type === 'image'" :src="item.s3_web_url" :alt="item.filename" class="max-w-full max-h-full object-contain select-none" draggable="false" />
                    <video v-else-if="item.file_type === 'video'" :src="item.s3_web_url" class="max-w-full max-h-full object-contain" controls :autoplay="index === currentIndex" muted />
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-24 items-center py-16 w-full">
            <!-- <div v-if="mediaItems[currentIndex]?.filename" class="bg-black/50 text-white px-16 py-8 rounded-md text-s max-w-md text-center">
                {{ mediaItems[currentIndex].filename }}
            </div> -->
            <div class="w-full">
                <div class="flex gap-4 items-center w-full h-80 px-[calc(50%-28px)] ml-auto overflow-x-auto overflow-y-visible scrollbar-hide" ref="thumbnailContainer">
                    <div 
                        v-for="(item, index) in mediaItems" 
                        :key="`lightbox-thumb-${index}`"
                        class="w-56 h-56 shrink-0 cursor-pointer transition-all duration-250 ease-out"
                        :class="{ 'h-80 w-72': index === currentIndex, 'opacity-50': index !== currentIndex }"
                        @click="navigateToThumbnail(index)"
                        :ref="(el: HTMLElement | null) => { if (el) thumbnailRefs[index] = el as HTMLElement }"
                    >
                        <img v-if="item.file_type === 'image'" :src="item.s3_thumbnail_url" :alt="item.filename" class="w-full h-full object-cover" />
                        <video v-else-if="item.file_type === 'video'" :src="item.s3_thumbnail_url" class="w-full h-full object-cover" muted />
                    </div>
                </div>
            </div>
        </div>

        <button @click="navigateToIndex('prev')" :disabled="currentIndex === 0" :class="{ 'opacity-25 pointer-events-none': currentIndex === 0 }" class="absolute left-24 top-1/2 -translate-y-1/2 items-center justify-center size-48 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full md:flex hidden cursor-pointer">
            <Icon name="arrow-head-left" :size="24" :color="getColor('neutral.neu_100')" />
        </button>
        
        <button @click="navigateToIndex('next')" :disabled="currentIndex === mediaItems.length - 1" :class="{ 'opacity-25 pointer-events-none': currentIndex === mediaItems.length - 1 }" class="absolute right-24 top-1/2 -translate-y-1/2 items-center justify-center size-48 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full md:flex hidden cursor-pointer">
            <Icon name="arrow-head-right" :size="24" :color="getColor('neutral.neu_100')" />
        </button>
    </div>
</template>

<script setup lang="ts">
import Icon from '../Icon'
import { getColor } from '../../utils/colors';
import type { MediaItem } from '../../types/event'

 
interface Props {
    mediaItems: MediaItem[]
    currentIndex: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    navigate: [direction: 'prev' | 'next']
    goTo: [index: number]
}>()

// --- REFINED STATE AND REFS ---
const containerRef = ref<HTMLElement>() // Changed from scrollContainer
const thumbnailContainer = ref<HTMLElement>()
const thumbnailRefs = ref<(HTMLElement | null)[]>([])

// State for JS-driven swiping
const isDragging = ref(false)
const touchStartX = ref(0)
const currentTranslate = ref(0)
const startTranslate = ref(0)
const swipeThreshold = 50 // Minimum pixels for a valid swipe

// --- REFINED SWIPE LOGIC ---
const handleTouchStart = (event: TouchEvent) => {
    if (!containerRef.value) return
    isDragging.value = true
    touchStartX.value = event.touches[0].clientX

    // Calculate the container's starting position
    const itemWidth = containerRef.value.clientWidth + 16
    startTranslate.value = -props.currentIndex * itemWidth
    
    // Disable CSS transition for instant drag effect
    containerRef.value.style.transition = 'none'
}

const handleTouchMove = (event: TouchEvent) => {
    if (!isDragging.value || !containerRef.value) return
    const currentX = event.touches[0].clientX
    const deltaX = currentX - touchStartX.value

    // Follow the finger
    currentTranslate.value = startTranslate.value + deltaX
    containerRef.value.style.transform = `translateX(${currentTranslate.value}px)`
}

const handleTouchEnd = () => {
    if (!isDragging.value || !containerRef.value) return
    isDragging.value = false
    
    // Enable CSS transition for smooth snapping
    containerRef.value.style.transition = 'transform 0.3s ease-out'

    const deltaX = currentTranslate.value - startTranslate.value

    // Check if swipe distance exceeds the threshold
    if (deltaX < -swipeThreshold && props.currentIndex < props.mediaItems.length - 1) {
        emit('navigate', 'next')
    } else if (deltaX > swipeThreshold && props.currentIndex > 0) {
        emit('navigate', 'prev')
    } else {
        // Not a valid swipe, snap back to the current index
        goToSlide(props.currentIndex, 'smooth')
    }
}

// --- REFINED NAVIGATION ---
// This single function now handles all slide movements
const goToSlide = (index: number, behavior: 'smooth' | 'instant') => {
    if (!containerRef.value) return
    const itemWidth = containerRef.value.clientWidth + 16 // width + gap
    const newPosition = -index * itemWidth

    containerRef.value.style.transition = behavior === 'smooth' ? 'transform 0.3s ease-out' : 'none'
    containerRef.value.style.transform = `translateX(${newPosition}px)`

    currentTranslate.value = newPosition // Keep state in sync
}

// Center a specific thumbnail (this logic is good, no changes)
const scrollThumbnailToCenter = (index: number) => {
    if (thumbnailContainer.value && thumbnailRefs.value[index]) {
        const container = thumbnailContainer.value
        const thumbnail = thumbnailRefs.value[index]
        const scrollLeft = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.clientWidth / 2)
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
}

// Navigate via thumbnail click
const navigateToThumbnail = (index: number) => {
    emit('goTo', index)
}

// Navigate via arrow buttons
const navigateToIndex = (direction: 'prev' | 'next') => {
    emit('navigate', direction)
}

// --- WATCHER AND LIFECYCLE HOOKS ---
watch(() => props.currentIndex, (newIndex) => {
    goToSlide(newIndex, 'smooth')
    scrollThumbnailToCenter(newIndex)
})

const handleKeydown = (e: KeyboardEvent) => {
    // This logic is good, no changes needed
    switch (e.key) {
        case 'Escape': emit('close'); break
        case 'ArrowLeft': if (props.currentIndex > 0) navigateToIndex('prev'); break
        case 'ArrowRight': if (props.currentIndex < props.mediaItems.length - 1) navigateToIndex('next'); break
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    nextTick(() => {
        // Initial position set instantly
        goToSlide(props.currentIndex, 'instant')
        scrollThumbnailToCenter(props.currentIndex)
    })
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
})
</script>

<style scoped>
/* Ensure smooth transitions */
.transition-colors {
    transition-property: background-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms; /* Balanced timing for smooth color transitions */
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    /* Optimize scroll performance */
    overscroll-behavior-x: contain;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* Thumbnail container specific styling */
.thumbnail-container {
    scroll-behavior: smooth;
    scroll-snap-type: x proximity;
}

/* Touch handling optimizations */
.touch-pan-x {
    touch-action: pan-x;
    -webkit-user-select: none;
    user-select: none;
}

/* Navigation button responsive visibility */
.nav-button {
    display: flex;
    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    align-items: center;
    justify-content: center;
    transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1); /* Balanced hover timing */
    border: none;
    cursor: pointer;
}

.nav-button:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.3);
}

.nav-button:disabled {
    background-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
}

/* Prevent image dragging on touch devices */
img {
    -webkit-user-drag: none;
    -webkit-touch-callout: none;
}

/* Smooth momentum scrolling */
.transition-transform {
    transition-property: transform;
}
</style>
