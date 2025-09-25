<template>
    <div class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-between">
        <div class="flex items-center justify-end w-full px-24 py-16">
            <button @click="$emit('close')" class="px-12 py-12 bg-neutrals-neu-0 hover:bg-neutrals-neu-35 rounded-full flex items-center justify-center z-10 cursor-pointer">
                <Icon name="close" :size="12" :color="getColor('brand.sec_light_100')" />
            </button>
        </div>

        <div class="relative w-full grow mx-24 overflow-hidden" @click.stop>
          <!-- <div ref="swipeTarget" class="absolute inset-0 bg-black/50 z-100"></div> -->
          <div 
              class="flex h-full" 
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

          <button v-if="currentIndex !== 0" class="absolute left-24 top-1/2 transform -translate-y-1/2 p-12 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full"  @click="$emit('navigate', 'prev')" >
            <Icon name="arrow-head-left" :size="16" :color="getColor('neutral.neu_100')" />
          </button>

          <button v-if="currentIndex !== mediaItems.length - 1" class="absolute right-24 top-1/2 transform -translate-y-1/2 p-12 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full" @click="$emit('navigate', 'next')">
            <Icon name="arrow-head-right" :size="16" :color="getColor('neutral.neu_100')" />
          </button>
        </div>

        <div class="flex flex-col gap-24 items-center pt-16 pb-32 w-full">
          <div class="w-full">
            <div class="flex gap-4 items-center w-full h-80 px-[calc(50%-28px)] ml-auto overflow-x-auto overflow-y-visible scrollbar-hide" ref="thumbnailContainer">
              <div 
                v-for="(item, index) in mediaItems" 
                :key="`lightbox-thumb-${index}`"
                class="w-56 h-56 shrink-0 cursor-pointer transition-all duration-250 ease-out"
                :class="{ 'h-80 w-72': index === currentIndex, 'opacity-50': index !== currentIndex }"
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
// import { useSwipe } from '@vueuse/core';

interface Props {
    mediaItems: MediaItem[]
    currentIndex: number
}


const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    navigate: [direction: 'prev' | 'next']
    goTo: [index: number]
    'update:currentIndex': [index: number]
}>()

// --- REFINED STATE AND REFS ---
const containerRef = ref<HTMLElement | null>(null)
const thumbnailContainer = ref<HTMLElement | null>(null)
const thumbnailRefs = ref<(HTMLElement | null)[]>([])

// State for JS-driven swiping
// const isDragging = ref(false)
const currentTranslate = ref(0)
// const startTranslate = ref(0)
// const swipeThreshold = 30
// const animationId = ref(0)
const isAnimating = ref(false)

/* const { lengthX, lengthY } = useSwipe(containerRef, {
  passive: false,
  onSwipeStart: (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.value || isAnimating.value) return
    console.log('------------ Starting new swipe ------------')

    isDragging.value = true
    const itemWidth = containerRef.value.clientWidth + 16
    startTranslate.value = -props.currentIndex * itemWidth
    currentTranslate.value = startTranslate.value

    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }
    
    containerRef.value.classList.remove('swiper-animating')
  },
  onSwipe: (e) => {
    if (!isDragging.value || !containerRef.value || isAnimating.value) return
    console.log('swiping...', lengthX.value)
    
    if(Math.abs(lengthX.value) > Math.abs(lengthY.value)) {
      e.preventDefault()
      e.stopPropagation()

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
  onSwipeEnd: () => {
    if (!isDragging.value || !containerRef.value) return
    console.log('----------- Swipe Ended ------------')

    isDragging.value = false

    if (animationId.value) {
        cancelAnimationFrame(animationId.value)
    }
    
    let targetIndex = props.currentIndex

    if (Math.abs(lengthX.value) > swipeThreshold && Math.abs(lengthX.value) > Math.abs(lengthY.value)) {
      if(lengthX.value > 0 && props.currentIndex < props.mediaItems.length - 1) {
          targetIndex = props.currentIndex + 1
          console.log('currentIndex:', props.currentIndex, '->', targetIndex)
      } else if(lengthX.value < 0 && props.currentIndex > 0) {
          targetIndex = props.currentIndex - 1
          console.log('currentIndex:', props.currentIndex, '->', targetIndex)
      }
    }
    
    if (targetIndex === props.currentIndex) {
      animateToIndex(props.currentIndex)
    } else {
      emit('update:currentIndex', targetIndex)
    }
  },
  threshold: swipeThreshold
}) */

const animateToIndex = (index: number) => {
  if (!containerRef.value || isAnimating.value) return
  
  const targetTranslate = -index * (containerRef.value.clientWidth + 16)

  containerRef.value.classList.add('swiper-animating')
  isAnimating.value = true
  
  containerRef.value.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
  containerRef.value.style.transform = `translateX(${targetTranslate}px)`
  
  currentTranslate.value = targetTranslate
  
  setTimeout(() => {
      isAnimating.value = false
      if (containerRef.value) {
          containerRef.value.classList.remove('swiper-animating')
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


const goToSlide = (index: number, behavior: 'smooth' | 'instant') => {
    if (!containerRef.value) return
    
    if (behavior === 'smooth') {
        animateToIndex(index)
    } else {
        const targetTranslate = -index * (containerRef.value.clientWidth + 16)
        containerRef.value.style.transition = 'none'
        containerRef.value.style.transform = `translateX(${targetTranslate}px)`
        currentTranslate.value = targetTranslate
    }
}

const scrollThumbnailToCenter = (index: number) => {
    if (thumbnailContainer.value && thumbnailRefs.value[index]) {
        const container = thumbnailContainer.value
        const thumbnail = thumbnailRefs.value[index]
        const scrollLeft = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.clientWidth / 2)
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
}

const navigateToThumbnail = (index: number) => {
    emit('goTo', index)
}

watch(() => props.currentIndex, (newIndex, oldIndex) => {
  console.log(`Prop changed from ${oldIndex} to ${newIndex}. Starting animation.`);
  goToSlide(newIndex, 'smooth')
  scrollThumbnailToCenter(newIndex)
})

onMounted(() => {
  document.body.style.overflow = 'hidden'

  nextTick(() => {
    goToSlide(props.currentIndex, 'instant')
    scrollThumbnailToCenter(props.currentIndex)
  })
})

onUnmounted(() => {
    document.body.style.overflow = ''
})
</script>

<style scoped>
.swiper-animating {
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.transition-colors {
    transition-property: background-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.thumbnail-container {
    scroll-behavior: smooth;
    scroll-snap-type: x proximity;
}

.nav-button {
    display: flex;
    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    align-items: center;
    justify-content: center;
    border: none;
}

.nav-button:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.3);
}

.nav-button:disabled {
    background-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
}

img {
    -webkit-user-drag: none;
    -webkit-touch-callout: none;
}

.transition-transform {
    transition-property: transform;
}
</style>
