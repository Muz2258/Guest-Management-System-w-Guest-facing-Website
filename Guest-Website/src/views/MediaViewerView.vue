<template>
  <div class="relative bg-neutrals-neu-0 h-dvh flex items-center justify-center">
    <div v-if="!hideUI" class="absolute top-0 left-0 right-0 flex items-center justify-start px-16 pb-16 pt-32 z-100 bg-neutrals-neu-0/25">
      <button @click="goBack" class="p-8 bg-neutrals-neu-0/50 rounded-full flex items-center justify-center">
        <Icon name="arrow-head-left" :size="16" :color="getColor('brand.sec_light_100')" />
      </button>
    </div>

    <div class="relative w-full h-full overflow-hidden" @click="toggleUI" >
      <div ref="containerRef" class="h-full flex space-x-8">
        <div 
          v-for="(item, index) in mediaItems"
          :key="`lightbox-main-${index}`"
          class="flex-shrink-0 w-full h-full"
          style="margin-right: 16px;" 
        >
          <div v-if="item.file_type === 'image'" class="relative w-full h-full">
            <img 
              :src="item.s3_web_url" 
              :alt="item.filename"
              class="w-full h-full object-contain select-none" 
              draggable="false" 
            />
          </div>

          <div v-else-if="item.file_type === 'video'" class="relative w-full h-full">
            <video 
              :ref="el => videoRefs[index] = el as HTMLVideoElement" 
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
          </div>
        </div>
      </div>
    </div>

    <button v-if="currentIndex !== 0 && !hideUI" class="absolute left-16 top-1/2 transform -translate-y-1/2 p-8 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full" @click.stop="navigateMedia('prev')" >
      <Icon name="arrow-head-left" :size="16" :color="getColor('neutral.neu_100')" />
    </button>

    <button v-if="currentIndex !== mediaItems.length - 1 && !hideUI" class="absolute right-16 top-1/2 transform -translate-y-1/2 p-8 flex items-center justify-center bg-neutrals-neu-0/50 rounded-full" @click.stop="navigateMedia('next')">
      <Icon name="arrow-head-right" :size="16" :color="getColor('neutral.neu_100')" />
    </button>

    <div v-if="!hideUI" class="absolute bottom-0 left-0 right-0 flex flex-col gap-24 items-center py-16">
      <div v-if="!hideUI && mediaItems[currentIndex]?.file_type === 'video'" class="flex items-center justify-center gap-12 z-100">
        <div class="flex items-center justify-center gap-8 py-8 px-12 bg-neutrals-neu-0/50 rounded-full border border-neutrals-neu-46/30" @click.stop="togglePlay(currentIndex)">
          <Icon :name="videoTimes[currentIndex]?.isPlaying ? 'pause-solid' : 'play-solid'" :color="getColor('neutral.neu_100')" :size="16" />
          <p class="flex gap-4 items-center justify-center text-neutrals-neu-100 text-s">
            <span>{{ videoTimes[currentIndex]?.currentTime }}</span>
            <span> / </span>
            <span class="opacity-65">{{ videoTimes[currentIndex]?.duration }}</span>
          </p>
        </div>
        <div class="flex items-center justify-center p-8 bg-neutrals-neu-0/50 rounded-full border border-neutrals-neu-46/30" @click.stop="toggleMute(currentIndex)">
          <Icon :name="videoTimes[currentIndex]?.isMuted ? 'mute-solid' : 'unmute-solid'" :color="getColor('neutral.neu_100')" :size="16" />
        </div>
      </div>
      <div class="w-full bg-neutrals-neu-0/25 py-16">
        <div class="flex gap-4 items-center w-full h-[4rem] px-[calc(50%-24px)] ml-auto overflow-x-auto overflow-y-visible scrollbar-hide" ref="thumbnailContainer">
          <div 
            v-for="(item, index) in mediaItems" 
            :key="`lightbox-thumb-${index}`"
            class="h-[3rem] w-[2rem] shrink-0 cursor-pointer transition-all duration-250 ease-out"
            :class="{ 'h-[4rem] w-[3.5rem]': index === currentIndex}"
            @click="currentIndex = index"
            :ref="(el) => { if (el) thumbnailRefs[index] = el as HTMLElement }"
          >
            <img v-if="item.file_type === 'image'" :src="item.s3_thumbnail_url" :alt="item.filename" class="w-full h-full object-cover" />
            <div v-else-if="item.file_type === 'video'" class="relative w-full h-full after:block after:absolute after:top-0 after:left-0 after:size-full after:bg-neutrals-neu-0/50 after:z-10">
              <img  :src="item.s3_thumbnail_url" class="w-full h-full object-cover" />
              <Icon name="video-solid" :size="24" :color="getColor('neutral.neu_100')" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../components/Icon'
import { getColor } from '../utils/colors';
import type { MediaItem } from '../types/event'

const galleryStore = useGalleryStore()
const route = useRoute()
const router = useRouter()

// --- REFINED STATE AND REFS ---
const containerRef = ref<HTMLElement | null>(null)
const thumbnailContainer = ref<HTMLElement | null>(null)
const thumbnailRefs = ref<(HTMLElement | null)[]>([])
const videoRefs = ref<Record<number, HTMLVideoElement | null>>({})
const videoTimes = ref<Record<any, any>>({})

const currentIndex = ref<number>(0)
const currentTranslate = ref(0)
const isAnimating = ref(false)
const hideUI = ref(false)

const mediaItems = computed<MediaItem[]>(() => {
  const items = galleryStore.mediaItems.flat()
  return items
})

const goBack = () => {
  router.push({
    name: 'gallery',
  })
}

const navigateMedia = (direction: string) => {
  if(direction === 'next') currentIndex.value++
  if(direction === 'prev') currentIndex.value--
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
  if(video && index === currentIndex.value) {
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
  
  if (index !== currentIndex.value) {
    if (index > currentIndex.value) {
      navigateMedia('next')
    } else {
      navigateMedia('prev')
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

const scrollThumbnailToCenter = (index: number, behavior: 'smooth' | 'instant') => {
  if (thumbnailContainer.value && thumbnailRefs.value[index]) {
    const container = thumbnailContainer.value
    const thumbnail = thumbnailRefs.value[index]
    const scrollLeft = thumbnail.offsetLeft - (container.clientWidth / 2) + (thumbnail.clientWidth / 2)
    container.scrollTo({ left: scrollLeft, behavior: behavior })
  }
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

watch(() => currentIndex.value, async (newIndex, oldIndex) => {
  goToSlide(newIndex, 'smooth')
  scrollThumbnailToCenter(newIndex, 'smooth')

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

  if (newIndex >= ((mediaItems.value.length - 1) / galleryStore.currentPage) / 2 && newIndex > oldIndex) {
    galleryStore.loadMoreItems()
  }
})

watch(() => hideUI.value, newVal => {
  if(newVal === false) {
    nextTick(() => {
      scrollThumbnailToCenter(currentIndex.value, 'instant')
    })
  }
})

onMounted(async () => {
  console.log('checking for media items in store')
  if(galleryStore.mediaItems.length === 0) {
    console.log('fetching media items for media viewer')
    await galleryStore.fetchMediaItems()
    console.log('fetched media items:', galleryStore.mediaItems)
  }

  nextTick(() => {
    const imageID = route.params.imageID as string

    console.log('🎯 Checking for image ID in route params:', imageID)
    if(!imageID) return

    const mediaItem = mediaItems.value.find(item => item.id === imageID)
    if(!mediaItem) {
      console.warn(`⚠️ No media item found with ID: ${imageID}`)
      return
    }

    currentIndex.value = mediaItems.value.indexOf(mediaItem)
    if(currentIndex.value === -1) {
      console.warn(`⚠️ Media item with ID: ${imageID} not found in media items array`)
      return
    }

    console.log(`🎯 Opening Media Viewer at index from query param: ${currentIndex.value}`)
  
  
    goToSlide(currentIndex.value, 'instant')
    scrollThumbnailToCenter(currentIndex.value, 'instant')
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
