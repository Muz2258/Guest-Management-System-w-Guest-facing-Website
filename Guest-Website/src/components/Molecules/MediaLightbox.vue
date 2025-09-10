<template>
    <div class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-between">
        <div class="flex items-center justify-end w-full px-24 py-16">
            <button 
                @click="$emit('close')"
                class="px-12 py-12 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full flex items-center justify-center z-10 cursor-pointer"
            >
                <Icon name="close" :size="12" :color="getColor('neutral.neu_100')" />
            </button>
        </div>
        <div 
            class="relative w-full max-w-5xl grow mx-24 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
            @click.stop
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            ref="scrollContainer"
        >
            <div class="flex h-full gap-16">
                <div 
                    v-for="(item, index) in mediaItems"
                    :key="`lightbox-main-${index}`"
                    class="flex-shrink-0 w-full flex items-center justify-center snap-always snap-center"
                >
                    <img 
                        v-if="item.type === 'image'"
                        :src="item.src" 
                        :alt="item.alt"
                        class="max-w-full max-h-full object-contain select-none"
                        draggable="false"
                    />
                    <video 
                        v-else-if="item.type === 'video'"
                        :src="item.src"
                        class="max-w-full max-h-full object-contain"
                        controls
                        :autoplay="index === currentIndex"
                        muted
                    />
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-24 items-center py-16 w-full">
            <div v-if="mediaItems[currentIndex]?.alt" class="bg-black/50 text-white px-16 py-8 rounded-md text-s max-w-md text-center">
                {{ mediaItems[currentIndex].alt }}
            </div>

            <div class="w-full">
                <div 
                    class="flex gap-4 items-center w-full h-80 px-[calc(50%-28px)] ml-auto overflow-x-auto overflow-y-visible scrollbar-hide"
                    ref="thumbnailContainer"
                    @scroll="handleThumbnailScroll"
                >
                    <div 
                        v-for="(item, index) in mediaItems" 
                        :key="`lightbox-thumb-${index}`"
                        class="w-56 h-56 shrink-0 cursor-pointer transition-all duration-250 ease-out"
                        :class="{
                            'h-80 w-72': index === currentIndex,
                            'opacity-50': index !== currentIndex
                        }"
                        @click="navigateToThumbnail(index)"
                        :ref="(el) => { if (el) thumbnailRefs[index] = el as HTMLElement }"
                    >
                        <img 
                            v-if="item.type === 'image'"
                            :src="item.src" 
                            :alt="item.alt"
                            class="w-full h-full object-cover"
                        />
                        <video 
                            v-else-if="item.type === 'video'"
                            :src="item.src"
                            class="w-full h-full object-cover"
                            muted
                        />
                    </div>
                </div>
            </div>
        </div>

        <button 
            @click="navigateToIndex('prev')"
            :disabled="currentIndex === 0"
            :class="{ 'opacity-25 pointer-events-none': currentIndex === 0 }"
            class="absolute left-24 top-1/2 -translate-y-1/2 items-center justify-center size-48 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full md:flex hidden cursor-pointer"
        >
            <Icon name="arrow-head-left" :size="24" :color="getColor('neutral.neu_100')" />
        </button>
        
        <button 
            @click="navigateToIndex('next')"
            :disabled="currentIndex === mediaItems.length - 1"
            :class="{ 'opacity-25 pointer-events-none': currentIndex === mediaItems.length - 1 }"
            class="absolute right-24 top-1/2 -translate-y-1/2 items-center justify-center size-48 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full md:flex hidden cursor-pointer"
        >
            <Icon name="arrow-head-right" :size="24" :color="getColor('neutral.neu_100')" />
        </button>
    
        <!-- DEPRECATED: Physics-Based Gesture Handling -->
        <!-- 
        <div 
            class="relative w-full max-w-5xl max-h-[80vh] mx-24 overflow-hidden touch-pan-x"
            @click.stop
            ref="containerRef"
        >
            <div 
                class="flex h-full"
                :class="{ 
                    'transition-transform duration-1200 ease-out': isSnapping,
                    'transition-transform duration-3200 ease-out': isMomentumScrolling
                }"
                :style="{ 
                    transform: `translateX(${currentTransform}px)`,
                    width: `${mediaItems.length * 100}%`
                }"
                ref="sliderRef"
            >
                <div 
                    v-for="(item, index) in mediaItems"
                    :key="item.id"
                    class="flex-shrink-0 flex items-center justify-center gap-8"
                    :style="{ width: `${100 / mediaItems.length}%` }"
                >
                    <img 
                        v-if="item.type === 'image'"
                        :src="item.src" 
                        :alt="item.alt"
                        class="max-w-full max-h-full object-contain select-none"
                        draggable="false"
                    />
                    
                    <video 
                        v-else-if="item.type === 'video'"
                        :src="item.src"
                        class="max-w-full max-h-full object-contain"
                        controls
                        :autoplay="index === currentIndex"
                        muted
                    />
                </div>
            </div>
        </div>
        -->

        <!-- NEW: Scroll Snap Container -->
        
        
        
        
        
        
        <!-- Mobile swipe indicator (shows briefly on first load) -->
        <!-- <div 
            v-if="showSwipeIndicator" 
            class="absolute bottom-120 left-1/2 -translate-x-1/2 bg-black/70 text-white px-12 py-6 rounded-md text-xs md:hidden animate-pulse"
        >
            Swipe left or right to navigate
        </div> -->
    </div>
</template>

<script setup lang="ts">
import Icon from '../Icon'
import { getColor } from '../../utils/colors';

interface MediaItem {
    // id: string
    type: 'image' | 'video'
    src: string
    alt: string
}

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

// Refs
const scrollContainer = ref<HTMLElement>()
const thumbnailContainer = ref<HTMLElement>()
const thumbnailRefs = ref<(HTMLElement | null)[]>([])
// const showSwipeIndicator = ref(true)
const isScrolling = ref(false)
const isThumbnailScrolling = ref(false)
const scrollTimeout = ref<NodeJS.Timeout>()
const thumbnailScrollTimeout = ref<NodeJS.Timeout>()
let touchStartX = 0
let touchStartTime = 0
// let isCustomSwiping = false

// Handle scroll events with strict single-item enforcement
/* const handleScroll = () => {
    if (isCustomSwiping) return
    
    // Clear any existing timeout
    clearTimeout(scrollTimeout.value)
    
    // Debounce scroll events to detect when scrolling stops
    scrollTimeout.value = setTimeout(() => {
        const newIndex = getCurrentScrollIndex()
        
        // Clamp to valid range - this prevents wrapping
        const clampedIndex = Math.max(0, Math.min(props.mediaItems.length - 1, newIndex))
        
        // Force scroll to exact position if we're not aligned or went out of bounds
        if (clampedIndex !== newIndex) {
            scrollToIndex(clampedIndex)
            return
        }
        
        // Additional boundary enforcement - prevent going beyond first/last item
        if (newIndex < 0) {
            scrollToIndex(0)
            scrollThumbnailToCenter(0)
            return
        }
        
        if (newIndex >= props.mediaItems.length) {
            scrollToIndex(props.mediaItems.length - 1)
            scrollThumbnailToCenter(props.mediaItems.length - 1)
            return
        }
        
        // If the calculated index differs from current prop, emit navigation
        if (clampedIndex !== props.currentIndex) {
            const direction = clampedIndex > props.currentIndex ? 'next' : 'prev'
            emit('navigate', direction)
        }
        
        // Double-check alignment after a brief delay
        setTimeout(() => {
            const finalIndex = getCurrentScrollIndex()
            const finalClampedIndex = Math.max(0, Math.min(props.mediaItems.length - 1, finalIndex))
            
            if (finalClampedIndex !== props.currentIndex) {
                scrollToIndex(props.currentIndex)
                scrollThumbnailToCenter(props.currentIndex)
            }
        }, 25)
    }, 30)
} */

// Handle thumbnail scroll to detect which thumbnail is centered
const handleThumbnailScroll = () => {
    isThumbnailScrolling.value = true

    clearTimeout(thumbnailScrollTimeout.value)
    
    thumbnailScrollTimeout.value = setTimeout(() => {
        if (!thumbnailContainer.value) {
            isThumbnailScrolling.value = false
            return
        }
        
        const container = thumbnailContainer.value
        const containerRect = container.getBoundingClientRect()
        const containerCenter = containerRect.left + containerRect.width / 2
        
        let closestIndex = 0
        let minDistance = Infinity
        
        thumbnailRefs.value.forEach((el, index) => {
            if (el) {
                const thumbnailRect = el.getBoundingClientRect()
                const thumbnailCenter = thumbnailRect.left + thumbnailRect.width / 2
                const distance = Math.abs(containerCenter - thumbnailCenter)
                
                if (distance < minDistance) {
                    minDistance = distance
                    closestIndex = index
                }
            }
        })
        
        // Only navigate if we're scrolling to a different item
        // Use goTo instead of navigate to jump directly without sequential logic
        if (closestIndex !== props.currentIndex) {
            emit('goTo', closestIndex)
        }
        
        // Reset flag after processing
        setTimeout(() => {
            isThumbnailScrolling.value = false
        }, 5)
    }, 15)
}

// Touch handling for fast swiping
const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX
  touchStartTime = Date.now()
//   isCustomSwiping = false
}

const handleTouchMove = (event: TouchEvent) => {
  const currentX = event.touches[0].clientX
  const deltaX = touchStartX - currentX
  const deltaTime = Date.now() - touchStartTime
  
  // Detect fast swipe (high velocity)
  const velocity = Math.abs(deltaX) / deltaTime
  
  if (velocity > 0.5 && Math.abs(deltaX) > 50) {
    // isCustomSwiping = true
    event.preventDefault()
    
    // Determine direction
    const direction = deltaX > 0 ? 'next' : 'prev'
    
    // Navigate if within bounds
    if (direction === 'next' && props.currentIndex < props.mediaItems.length - 1) {
      emit('navigate', 'next')
    } else if (direction === 'prev' && props.currentIndex > 0) {
      emit('navigate', 'prev')
    }
  }
}

const handleTouchEnd = () => {
  // Reset custom swiping flag after a brief delay
  setTimeout(() => {
    // isCustomSwiping = false
  }, 100)
}

// Scroll to specific index
const scrollToIndex = (index: number) => {
    if (scrollContainer.value) {
        const itemWidth = scrollContainer.value.clientWidth + 16 // width + gap
        isScrolling.value = true
        scrollContainer.value.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
        })
        // Reset scrolling flag after animation completes
        setTimeout(() => {
            isScrolling.value = false
        }, 5) // Increased to 100ms for smoother animation completion
    }
}

// Center a specific thumbnail in the thumbnail container
const scrollThumbnailToCenter = (index: number) => {
    if (thumbnailContainer.value && thumbnailRefs.value[index]) {
        const container = thumbnailContainer.value
        const thumbnail = thumbnailRefs.value[index]
        
        const containerWidth = container.clientWidth
        const thumbnailLeft = thumbnail.offsetLeft
        const thumbnailWidth = thumbnail.clientWidth
        
        // Calculate scroll position to center the thumbnail
        const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2)
        
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        })
    }
}

const moveToIndex = (index: number) => {
    if (scrollContainer.value) {
        const itemWidth = scrollContainer.value.clientWidth + 16 // width + gap
        scrollContainer.value.scrollTo({
            left: index * itemWidth,
            behavior: 'instant' // Instant jump without animation
        })
    }
}

// Navigate to thumbnail and center it
const navigateToThumbnail = (index: number) => {
    // Navigate main view
    emit('goTo', index)
    // Center the thumbnail
    scrollThumbnailToCenter(index)
}

// Navigate programmatically
const navigateToIndex = (direction: 'prev' | 'next') => {
    console.log('navigateToIndex called with direction:', direction)

    // Prevent navigation beyond boundaries
    if (direction === 'prev' && props.currentIndex === 0) {
        return // Don't navigate if already at first item
    }
    
    if (direction === 'next' && props.currentIndex === props.mediaItems.length - 1) {
        return // Don't navigate if already at last item
    }
    
    console.log('Emitting navigation direction:', direction)
    emit('navigate', direction)
}



// Find which item is currently centered
/* const getCurrentScrollIndex = (): number => {
    if (!scrollContainer.value) return props.currentIndex
    
    const container = scrollContainer.value
    const itemWidth = container.clientWidth + 16 // width + gap
    const scrollLeft = container.scrollLeft
    
    // Calculate which item should be centered based on scroll position
    return Math.round(scrollLeft / itemWidth)
} */

// Watch for external navigation changes
watch(() => props.currentIndex, (newIndex) => {    
    if (!isThumbnailScrolling.value && !isScrolling.value) {
        scrollToIndex(newIndex)
        scrollThumbnailToCenter(newIndex)
    }
})

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
        case 'Escape':
            emit('close')
            break
        case 'ArrowLeft':
            if (props.currentIndex > 0) {
                navigateToIndex('prev')
            }
            break
        case 'ArrowRight':
            if (props.currentIndex < props.mediaItems.length - 1) {
                navigateToIndex('next')
            }
            break
    }
}

// Lifecycle
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
    
    // Initial scroll position for main container and thumbnails
    nextTick(() => {
        moveToIndex(props.currentIndex)
        scrollThumbnailToCenter(props.currentIndex)
    })
    
    // Hide indicator after 3 seconds
    /* setTimeout(() => {
        showSwipeIndicator.value = false
    }, 3000) */
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
    // Clean up any pending timeouts
    clearTimeout(scrollTimeout.value)
    clearTimeout(thumbnailScrollTimeout.value)
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
