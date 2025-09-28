<template>
  <div class="fixed inset-0 bg-black/90 z-[9999] flex flex-col items-center justify-between">
    <div v-if="!hideUI" class="absolute top-0 left-0 right-0 flex items-center justify-end px-24 py-16 z-100 bg-neutrals-neu-0/25">
      <button @click="$emit('close')" class="px-12 py-12 bg-neutrals-neu-0/50 rounded-full flex items-center justify-center">
        <Icon name="close" :size="12" :color="getColor('brand.sec_light_100')" />
      </button>
    </div>

    <div class="relative w-full grow overflow-hidden" @click="toggleUI" >
      <div ref="containerRef" class="h-full flex space-x-8">
        <div 
          v-for="(item, index) in mediaItems"
          :key="`lightbox-main-${index}`"
          class="flex-shrink-0 w-full h-full"
          style="margin-right: 16px;" 
        >
          <div v-if="item.file_type === 'image'" class="relative w-full h-full">
            <!-- <div v-if="index === currentIndex && !isMediaLoaded" class="flex justify-center py-24">
              <div class="animate-spin rounded-full size-32 border-b-2 border-neutrals-neu-100"></div>
            </div> -->
            <img 
              :src="item.s3_web_url" 
              :alt="item.filename"
              class="w-full h-full object-contain select-none" 
              draggable="false" 
            />
          </div>

          <div v-else-if="item.file_type === 'video'" class="relative w-full h-full">
            <!-- <div v-if="index === currentIndex && !isMediaLoaded" class="flex justify-center py-24">
              <div class="animate-spin rounded-full size-32 border-b-2 border-neutrals-neu-100"></div>
            </div> -->
            <video 
              :ref="el => setVideoRefS(el, index)" 
              class="w-full h-full object-contain" 
              muted 
              :src="item.s3_web_url" 
              :autoplay="index === currentIndex"
              playsinline
              @play="handlePlay(index)"
              @pause="handlePause(index)"
              @timeupdate="handleTimeUpdate(index, $event)"
              @loadedmetadata="handleVideoLoad(index)"
            />

            <div v-if="!hideUI" class="absolute bottom-[8rem] left-0 right-0 flex items-center justify-center gap-12 z-100">
              <div class="flex items-center justify-center gap-12 p-12 bg-neutrals-neu-0/50 rounded-full border border-neutrals-neu-46/30" @click.stop="togglePlay(index)">
                <Icon :name="videoTimes[index]?.isPlaying ? 'pause-solid' : 'play-solid'" :color="getColor('neutral.neu_100')" :size="16" />
                <span class="text-neutrals-neu-100 text-s">
                  {{ videoTimes[index]?.currentTime }} / {{ videoTimes[index]?.duration }}
                </span>
              </div>
              <div class="flex items-center justify-center p-12 bg-neutrals-neu-0/50 rounded-full border border-neutrals-neu-46/30" @click.stop="toggleMute(index)">
                <Icon :name="videoTimes[index]?.isMuted ? 'mute-solid' : 'unmute-solid'" :color="getColor('neutral.neu_100')" :size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="currentIndex !== 0 && !hideUI" class="absolute left-16 top-1/2 transform -translate-y-1/2 p-12 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full"  @click.stop="$emit('navigate', 'prev')" >
      <Icon name="arrow-head-left" :size="16" :color="getColor('neutral.neu_100')" />
    </button>

    <button v-if="currentIndex !== mediaItems.length - 1 && !hideUI" class="absolute right-16 top-1/2 transform -translate-y-1/2 p-12 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full" @click.stop="$emit('navigate', 'next')">
      <Icon name="arrow-head-right" :size="16" :color="getColor('neutral.neu_100')" />
    </button>

    <div v-if="!hideUI" class="absolute bottom-0 left-0 right-0 flex flex-col gap-24 items-center py-16 bg-neutrals-neu-0/25">
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
import type { ComponentPublicInstance } from 'vue';

interface Props {
    mediaItems: MediaItem[]
    currentIndex: number
}

const galleryStore = useGalleryStore()

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    navigate: [direction: 'prev' | 'next']
    goTo: [index: number]
    'update:currentIndex': [index: number]
    'load-more': []
}>()

// --- REFINED STATE AND REFS ---
const containerRef = ref<HTMLElement | null>(null)
const thumbnailContainer = ref<HTMLElement | null>(null)
const thumbnailRefs = ref<(HTMLElement | null)[]>([])
const videoRefs = ref<Record<number, HTMLVideoElement | null>>({})
const videoTimes = ref<Record<any, any>>({})

const currentTranslate = ref(0)
const isAnimating = ref(false)
const hideUI = ref(false)

const setVideoRefS = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el) {
    videoRefs.value[index] = el as HTMLVideoElement
  }
}

const handleVideoLoad = (index: number) => {
  const video = videoRefs.value[index]
  if(video) {
    videoTimes.value[index] = {
      duration: formatTime(video.duration),
      currentTime: formatTime(0),
      isMuted: true,
      isPlaying: false
    }
  }
}

const handleTimeUpdate = (index: number, event: Event) => {
  const video = event.target as HTMLVideoElement
  if(video && index === props.currentIndex) {
    videoTimes.value[index].currentTime = formatTime(video.currentTime)
  }
}

const togglePlay = (index: number) => {
  const video = videoRefs.value[index]
  if(video) {
    if(video.paused) {
      video.play()
      videoTimes.value[index].isPlaying = true
    } else {
      video.pause()
      videoTimes.value[index].isPlaying = false
    }
  }
}

const toggleMute = (index: number) => {
  const video = videoRefs.value[index]
  if(video) {
    if(video.muted) {
      video.muted = false
      videoTimes.value[index].isMuted = false
    }else {
      video.muted = true
      videoTimes.value[index].isMuted = true
    }
  }
}

const handlePlay = (index: number) => {
  const video = videoRefs.value[index]
  if(video) {
    videoTimes.value[index].isPlaying = true
  }
}

const handlePause = (index: number) => {
  const video = videoRefs.value[index]
  if(video) {
    videoTimes.value[index].isPlaying = false
  }
}

const animateToIndex = (index: number) => {
  if (!containerRef.value || isAnimating.value) return
  
  const targetTranslate = -index * (containerRef.value.clientWidth + 16)

  console.log(containerRef.value.clientWidth)

  isAnimating.value = true
  
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

const formatTime = (seconds: number) => {
  seconds = Math.floor(seconds);

  // const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

const toggleUI = () => {
  hideUI.value = !hideUI.value
}

watch(() => props.currentIndex, async (newIndex, oldIndex) => {
  goToSlide(newIndex, 'smooth')
  scrollThumbnailToCenter(newIndex)

  if(newIndex !== oldIndex) {
    const oldVideo = videoRefs.value[oldIndex]
    if(oldVideo) {
      oldVideo.pause()
      oldVideo.muted = true
      oldVideo.currentTime = 0
      videoTimes.value[oldIndex].currentTime = formatTime(0)
      videoTimes.value[oldIndex].isPlaying = false
      videoTimes.value[oldIndex].isMuted = true
    }

    const newVideo = videoRefs.value[newIndex]
    if(newVideo) {
      newVideo.play()
      videoTimes.value[newIndex].isPlaying = true
    }
  }

  if (newIndex >= ((props.mediaItems.length - 1) / galleryStore.currentPage) / 2 && newIndex > oldIndex) {
    emit('load-more')
  }
})

watch(() => hideUI.value, newVal => {
  if(newVal === false) {
    nextTick(() => {
      scrollThumbnailToCenter(props.currentIndex)
    })
  }
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
