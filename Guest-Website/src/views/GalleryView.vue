<template>
  <main class="page-wrapper min-h-screen bg-neutrals-neu-100 pt-[3.75rem]">
    <!-- Gallery Content -->
    <div class="px-24 py-32">
      <div class="text-center mb-32">
        <h2 class="text-heading-md text-neutrals-neu-0 mb-8">Wedding Gallery</h2>
        <p class="text-neutrals-neu-35 text-s">All our beautiful memories in one place</p>
      </div>

      <!-- Infinite Scroll Gallery Grid -->
      <div 
        class="columns-2 gap-6 sm:columns-3" 
        v-if="galleryStore.mediaItems.length > 0"
      >
        <div 
          v-for="(item, index) in galleryStore.mediaItems" 
          :key="`gallery-${index}`"
          class="cursor-pointer mb-6 group"
          @click="openLightbox(index)"
        >
          <div class="relative overflow-hidden rounded-lg">
            <img 
              v-if="item.file_type === 'image'"
              :src="item.s3_preview_url" 
              :alt="item.filename"
              class="w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div 
              v-else-if="item.file_type === 'video'"
              class="relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            >
              <video 
                :src="item.s3_preview_url"
                class="w-full object-contain"
                muted
                playsinline
              />
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div class="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-brand-pri ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div 
        v-if="galleryStore.loading" 
        class="flex justify-center items-center py-32"
      >
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-pri"></div>
      </div>

      <!-- Error State -->
      <div 
        v-if="galleryStore.error && !galleryStore.loading" 
        class="text-center py-32"
      >
        <p class="text-denotive-red text-s mb-16">{{ galleryStore.error }}</p>
        <Button 
          label="Try Again" 
          type="secondary" 
          @click="loadMoreItems"
        />
      </div>

      <!-- End of Gallery Indicator -->
      <div 
        v-if="!galleryStore.loading && !galleryStore.hasNextPage && galleryStore.mediaItems.length > 0" 
        class="text-center py-32"
      >
        <p class="text-neutrals-neu-35 text-s">You've reached the end of our gallery! 💕</p>
      </div>

      <!-- Infinite Scroll Trigger -->
      <div 
        ref="infiniteScrollTrigger" 
        class="h-1 w-full"
        v-if="galleryStore.hasNextPage && !galleryStore.loading"
      ></div>
    </div>

    <!-- Lightbox -->
    <MediaLightbox 
      v-if="showLightbox"
      :media-items="galleryStore.mediaItems"
      :current-index="currentLightboxIndex"
      @close="closeLightbox"
      @navigate="navigateLightbox"
      @goTo="(index: number) => currentLightboxIndex = index"
    />
  </main>
</template>

<script setup lang="ts">
/* ------------------ Imports ------------------- */
import MediaLightbox from '../components/Molecules/MediaLightbox.vue'

/* ------------------ Stores ------------------- */
const galleryStore = useGalleryStore()

/* ------------------ Reactive Variables ------------------- */
const showLightbox = ref(false)
const currentLightboxIndex = ref(0)
const currentPage = ref(1)
const itemsPerPage = 20
const infiniteScrollTrigger = ref<HTMLElement | null>(null)

/* ------------------ Methods ------------------- */
const openLightbox = (index: number) => {
  currentLightboxIndex.value = index
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

const navigateLightbox = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentLightboxIndex.value > 0) {
    currentLightboxIndex.value = currentLightboxIndex.value - 1
  } else if (direction === 'next' && currentLightboxIndex.value < galleryStore.mediaItems.length - 1) {
    currentLightboxIndex.value = currentLightboxIndex.value + 1
  }
}

const loadMoreItems = async () => {
  if (galleryStore.loading || !galleryStore.hasNextPage) return

  await galleryStore.fetchMediaItems(currentPage.value, itemsPerPage)
  currentPage.value++
}

const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting && galleryStore.hasNextPage && !galleryStore.loading) {
        loadMoreItems()
      }
    },
    {
      rootMargin: '100px' // Load more when user is 100px away from the trigger
    }
  )

  observer.observe(infiniteScrollTrigger.value)

  // Cleanup observer when component unmounts
  onBeforeUnmount(() => {
    observer.disconnect()
  })
}

/* ------------------ Lifecycle ------------------- */
onMounted(async () => {
  // Load initial items
  await loadMoreItems()
  
  // Setup infinite scroll after initial load
  nextTick(() => {
    setupInfiniteScroll()
  })
})

// Handle route params for direct lightbox opening
const route = useRoute()
onMounted(() => {
  const imageIndex = route.query.image as string
  if (imageIndex && !isNaN(Number(imageIndex))) {
    // Wait for initial items to load, then open lightbox
    nextTick(() => {
      if (galleryStore.mediaItems.length > Number(imageIndex)) {
        openLightbox(Number(imageIndex))
      }
    })
  }
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-neutrals-neu-100);
}
</style>