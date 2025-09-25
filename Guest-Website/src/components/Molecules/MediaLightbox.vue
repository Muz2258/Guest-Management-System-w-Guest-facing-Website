<template>
    <div class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-between">
        <div class="flex items-center justify-end w-full px-24 py-16">
            <button @click="$emit('close')" class="px-12 py-12 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full flex items-center justify-center z-10 cursor-pointer">
                <Icon name="close" :size="12" :color="getColor('brand.sec_light_100')" />
            </button>
        </div>

        <div class="relative w-full max-w-5xl grow mx-24 overflow-hidden" @click.stop>
            <div 
                class="flex h-full touch-none" 
                ref="containerRef"
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

        <div class="flex flex-col gap-24 items-center pt-16 pb-32 w-full">
            <div class="w-full">
                <div class="flex gap-4 items-center w-full h-80 px-[calc(50%-28px)] ml-auto overflow-x-auto overflow-y-visible scrollbar-hide" ref="thumbnailContainer">
                    <div 
                        v-for="(item, index) in mediaItems" 
                        :key="`lightbox-thumb-${index}`"
                        class="w-56 h-56 shrink-0 cursor-pointer transition-all duration-250 ease-out"
                        :class="{ 'h-80 w-72': index === newCurrentIndex, 'opacity-50': index !== newCurrentIndex }"
                        @click="navigateToThumbnail(index)"
                        :ref="(el) => { if (el) thumbnailRefs[index] = el as HTMLElement }"
                    >
                        <img v-if="item.file_type === 'image'" :src="item.s3_thumbnail_url" :alt="item.filename" class="w-full h-full object-cover" />
                        <video v-else-if="item.file_type === 'video'" :src="item.s3_thumbnail_url" class="w-full h-full object-cover" muted />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '../Icon'
import { getColor } from '../../utils/colors';
import type { MediaItem } from '../../types/event'
import { useSwipe } from '@vueuse/core';
import VConsole from 'vconsole'

const vConsole = new VConsole()

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
const containerRef = ref<HTMLElement>() 
const thumbnailContainer = ref<HTMLElement>()
const thumbnailRefs = ref<(HTMLElement | null)[]>([])

// State for JS-driven swiping
const isDragging = ref(false)
const currentTranslate = ref(0)
const startTranslate = ref(0)
const swipeThreshold = 30 // Minimum pixels for a valid swipe
const animationId = ref(0)
const isAnimating = ref(false)
const newCurrentIndex = ref<number>(props.currentIndex)

const { lengthX, lengthY } = useSwipe(containerRef, {
  passive: false,
  onSwipeStart: (e) => {
    if (!containerRef.value || isAnimating.value) return
    console.log('starting swipe')

    e.preventDefault()

    isDragging.value = true
    const itemWidth = containerRef.value.clientWidth + 16
    startTranslate.value = -newCurrentIndex.value * itemWidth
    currentTranslate.value = startTranslate.value

    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }
    
    containerRef.value.style.transition = 'none'
  },
  onSwipe: (e) => {
    if (!isDragging.value || !containerRef.value || isAnimating.value) return
    console.log('swiping...', lengthX.value)

    e.preventDefault()
    
    if(Math.abs(lengthX.value) > Math.abs(lengthY.value)) {
      const itemWidth = containerRef.value.clientWidth + 16
      const maxTranslate = 0
      const minTranslate = -(props.mediaItems.length - 1) * itemWidth
      
      currentTranslate.value = Math.max(minTranslate, Math.min(maxTranslate, startTranslate.value - lengthX.value))
      
      animationId.value = requestAnimationFrame(() => {
        if (containerRef.value) {
            containerRef.value.style.transform = `translateX(${currentTranslate.value}px)`
        }
      })
    }
  },
  onSwipeEnd: (e) => {
    if (!isDragging.value || !containerRef.value) return
    console.log('ending swipe...')

    e.preventDefault()

    isDragging.value = false

    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }
    
    let targetIndex = newCurrentIndex.value

    if (Math.abs(lengthX.value) > swipeThreshold && Math.abs(lengthX.value) > Math.abs(lengthY.value)) {
      if(lengthX.value > 0 && newCurrentIndex.value < props.mediaItems.length - 1) {
          targetIndex = newCurrentIndex.value + 1
          console.log('currentIndex:', newCurrentIndex.value, '->', targetIndex)
      } else if(lengthX.value < 0 && newCurrentIndex.value > 0) {
          targetIndex = newCurrentIndex.value - 1
          console.log('currentIndex:', newCurrentIndex.value, '->', targetIndex)
      }
    }
    
    animateToIndex(targetIndex)
    scrollThumbnailToCenter(targetIndex)
    newCurrentIndex.value = targetIndex
  },
  threshold: swipeThreshold
})

const animateToIndex = (index: number) => {
  if (!containerRef.value || isAnimating.value) return
  
  isAnimating.value = true
  const targetTranslate = -index * (containerRef.value.clientWidth + 16)
  
  containerRef.value.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
  containerRef.value.style.transform = `translateX(${targetTranslate}px)`
  
  currentTranslate.value = targetTranslate
  
  setTimeout(() => {
      isAnimating.value = false
      if (containerRef.value) {
          containerRef.value.style.transition = 'none'
      }
  }, 300)
  
  if (index !== props.currentIndex) {
    if (index > props.currentIndex) {
        emit('navigate', 'next')
    } else {
        emit('navigate', 'prev')
    }
  }
}

/* // --- SAFARI-COMPATIBLE SWIPE LOGIC ---
const handleTouchStart = (event: TouchEvent) => {
    if (!containerRef.value || isAnimating.value) return
    if (!event.touches || event.touches.length !== 1) return
    
    const touch = event.touches[0]
    if (!touch) return
    
    isDragging.value = true
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY

    // Calculate the container's starting position (include 16px gap)
    const itemWidth = containerRef.value.clientWidth + 16
    startTranslate.value = -props.currentIndex * itemWidth
    currentTranslate.value = startTranslate.value
    
    // Cancel any ongoing animation
    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }
    
    // Disable CSS transition for instant drag effect
    containerRef.value.style.transition = 'none'
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || !containerRef.value || isAnimating.value || !event.touches?.[0]) return
  
  const currentX = event.touches[0].clientX
  const currentY = event.touches[0].clientY
  const deltaX = currentX - touchStartX.value
  const deltaY = currentY - touchStartY.value
  
  // Only handle horizontal swipes (prevent interference with vertical scrolling)
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    event.preventDefault() // Crucial for Safari
    event.stopPropagation()
    
    // Constrain movement to valid bounds (include 16px gap)
    const itemWidth = containerRef.value.clientWidth + 16
    const maxTranslate = 0
    const minTranslate = -(props.mediaItems.length - 1) * itemWidth
    
    currentTranslate.value = Math.max(minTranslate, Math.min(maxTranslate, startTranslate.value + deltaX))
    
    // Use requestAnimationFrame for smooth performance
    animationId.value = requestAnimationFrame(() => {
      if (containerRef.value) {
          containerRef.value.style.transform = `translateX(${currentTranslate.value}px)`
      }
    })
  }
}

const handleTouchEnd = (event: TouchEvent) => {
    if (!isDragging.value || !containerRef.value) return
    
    // Prevent default to avoid Safari's elastic scroll
    event.preventDefault()
    event.stopPropagation()
    
    isDragging.value = false
    
    // Cancel any pending animation
    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }

    const deltaX = currentTranslate.value - startTranslate.value
    
    // Determine the target index based on swipe distance and direction
    let targetIndex = props.currentIndex
    
    if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX < 0 && props.currentIndex < props.mediaItems.length - 1) {
            targetIndex = props.currentIndex + 1
        } else if (deltaX > 0 && props.currentIndex > 0) {
            targetIndex = props.currentIndex - 1
        }
    }
    
    // Animate to the target position
    animateToIndex(targetIndex)
}

// --- SAFARI-OPTIMIZED ANIMATION ---
const animateToIndex = (index: number) => {
    if (!containerRef.value || isAnimating.value) return
    
    isAnimating.value = true
    const targetTranslate = -index * (containerRef.value.clientWidth + 16)
    
    // Use CSS transition for smooth animation
    containerRef.value.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
    containerRef.value.style.transform = `translateX(${targetTranslate}px)`
    
    currentTranslate.value = targetTranslate
    
    // Clear animation flag after transition
    setTimeout(() => {
        isAnimating.value = false
        if (containerRef.value) {
            containerRef.value.style.transition = 'none'
        }
    }, 300)
    
    // Emit navigation event if index changed
    if (index !== props.currentIndex) {
        if (index > props.currentIndex) {
            emit('navigate', 'next')
        } else {
            emit('navigate', 'prev')
        }
    }
} */

// --- REFINED NAVIGATION ---
// This single function now handles all slide movements
const goToSlide = (index: number, behavior: 'smooth' | 'instant') => {
    if (!containerRef.value) return
    
    if (behavior === 'smooth') {
        animateToIndex(index)
    } else {
        // Instant positioning (include 16px gap)
        const targetTranslate = -index * (containerRef.value.clientWidth + 16)
        containerRef.value.style.transition = 'none'
        containerRef.value.style.transform = `translateX(${targetTranslate}px)`
        currentTranslate.value = targetTranslate
    }
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

// --- WATCHER AND LIFECYCLE HOOKS ---
watch(() => props.currentIndex, (newIndex) => {
    goToSlide(newIndex, 'smooth')
    scrollThumbnailToCenter(newIndex)
})

onMounted(() => {
  document.body.style.overflow = 'hidden'

  nextTick(() => {
      // Initial position set instantly
      goToSlide(props.currentIndex, 'instant')
      scrollThumbnailToCenter(props.currentIndex)
  })
})

onUnmounted(() => {
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
