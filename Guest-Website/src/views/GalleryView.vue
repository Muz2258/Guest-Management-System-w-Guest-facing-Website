<template>
  <main class="page-wrapper min-h-screen bg-neutrals-neu-100 pt-[3.75rem]">
    <!-- Gallery Content -->
    <div class="px-24 py-32">
      <div class="text-center mb-32">
        <h2 class="text-heading-md text-neutrals-neu-0 mb-8">Wedding Gallery</h2>
        <p class="text-neutrals-neu-35 text-s">All our beautiful memories in one place</p>
      </div>

      <div 
        v-if="galleryStore.loading && galleryStore.mediaItems.length === 0" 
        class="grid grid-cols-2 gap-6"
      >
        <div 
          v-for="col in 2" 
          :key="`skeleton-col-${col}`"
          class="space-y-6"
        >
          <div 
            v-for="item in 6" 
            :key="`skeleton-${col}-${item}`"
            class="animate-pulse bg-neutrals-neu-76 rounded-lg"
            :style="{ height: getRandomSkeletonHeight() }"
          ></div>
        </div>
      </div>

      <div v-if="galleryStore.error" class="text-center py-12">
        <div class="text-red-500 mb-4">{{ galleryStore.error }}</div>
        <button 
          @click="retryLoad"
          class="px-4 py-2 bg-brand-pri text-white rounded-lg hover:bg-brand-pri/90"
        >
          Retry
        </button>
      </div>

      <!-- Infinite Scroll Gallery Grid -->
      <div 
        v-else
        class="grid grid-cols-2 gap-6"
      >
        <!-- Left Column -->
        <div class="space-y-6">
          <div
            v-for="(item, index) in columns.leftColumn"
            :key="`left-${item.id || index}`"
            class="cursor-pointer group"
            @click="openLightbox(getOriginalIndex(item))"
          >
            <MediaItem 
              :item="item"
              @image-load="onImageLoad"
              @image-error="onImageError"
            />
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <div
            v-for="(item, index) in columns.rightColumn"
            :key="`right-${item.id || index}`"
            class="cursor-pointer group"
            @click="openLightbox(getOriginalIndex(item))"
          >
            <MediaItem 
              :item="item"
              @image-load="onImageLoad"
              @image-error="onImageError"
            />
          </div>
        </div>
      </div>

      <!-- Load more trigger for infinite scroll -->
      <div 
        v-if="galleryStore.hasNextPage && !galleryStore.loading && galleryStore.mediaItems.length > 0"
        ref="loadMoreTrigger"
        class="p-24 w-full flex items-center justify-center mt-16"
      >
        <div class="text-gray-400 text-sm">Scroll to load more</div>
      </div>

      <!-- Loading more indicator -->
      <div v-if="galleryStore.loading && galleryStore.mediaItems.length > 0" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pri"></div>
      </div>

      <!-- No items message -->
      <div v-else-if="!galleryStore.loading && galleryStore.mediaItems.length === 0" class="text-center py-12">
        <div class="text-gray-500">No media items found</div>
      </div>
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
/* ----------------------- Imports ------------------- */
import type { MediaItem } from '@/types/event'
import { useIntersectionObserver } from '@vueuse/core'
import { useIconPreloader } from '../composables/useIconPreloader'

/* ----------------------- Type Definitions ------------------- */
interface MediaItemWithLayout extends MediaItem {
  _originalIndex: number
  aspectRatio?: number
}

interface ColumnDistribution {
  leftColumn: MediaItemWithLayout[]
  rightColumn: MediaItemWithLayout[]
}

/* ----------------------- Stores ------------------- */
const galleryStore = useGalleryStore()

/* ----------------------- Reactive State ------------------- */
const loadedImages = ref(new Set<string>())
const loadMoreTrigger: Ref<HTMLElement | null> = ref(null)
const currentPage = ref<number>(1)

const showLightbox = ref<boolean>(false)
const currentLightboxIndex = ref<number>(0)
const initialImgCount = ref<number>(0)


/* ----------------------- Computed Properties ------------------- */
const initialImagesLoaded = computed(() => {
  return loadedImages.value.size >= initialImgCount.value && initialImgCount.value > 0
})

const mediaItemsWithLayout: ComputedRef<MediaItemWithLayout[]> = computed(() => {
  const result = galleryStore.mediaItems.map((item, index) => ({
    ...item,
    _originalIndex: index,
    aspectRatio: (item as MediaItemWithLayout).aspectRatio ?? undefined,
  }))

  return result
})

const columns: ComputedRef<ColumnDistribution> = computed(() => {
  const columnsArr: [MediaItemWithLayout[], MediaItemWithLayout[]] = [[], []]
  const columnHeights: [number, number] = [0, 0]
  mediaItemsWithLayout.value.forEach((item) => {
    const shortestIndex = columnHeights[0] <= columnHeights[1] ? 0 : 1
    columnsArr[shortestIndex].push(item)
    const itemHeight = getItemConceptualHeight(item)
    columnHeights[shortestIndex] += itemHeight + 24
    console.log(`[GalleryView] Assigned item ${item.id} to column ${shortestIndex}, conceptual height: ${itemHeight}`)
  })

  return { 
    leftColumn: columnsArr[0], 
    rightColumn: columnsArr[1] 
  }
})

/* ---------------------- Methods ---------------------- */
const getRandomHeight = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getItemConceptualHeight = (item: MediaItemWithLayout): number => {
  if (item.aspectRatio && item.aspectRatio > 0) {
    return 300 / item.aspectRatio
  }
  return item.file_type === 'video' ? getRandomHeight(250, 400) : getRandomHeight(500, 800)
}


const getRandomSkeletonHeight = () => {
  const heights = ['200px', '250px', '300px', '180px', '220px']
  return heights[Math.floor(Math.random() * heights.length)]
}

const getOriginalIndex = (item: MediaItemWithLayout): number => {
  return item._originalIndex
}

const onImageLoad = (event: Event, item: MediaItem) => {
  const img = event.target as HTMLImageElement
  const aspectRatio = img.naturalWidth / img.naturalHeight
  console.log(`[onImageLoad] Image loaded: ${item.filename}, aspectRatio: ${aspectRatio}`)
  const itemWithLayout = item as MediaItemWithLayout
  const itemInStore = galleryStore.mediaItems[itemWithLayout._originalIndex] as MediaItemWithLayout | undefined
  if (itemInStore && !itemInStore.aspectRatio) {
    itemInStore.aspectRatio = aspectRatio
    console.log(`[onImageLoad] Set aspectRatio for item ${item.id}`)
  }
  loadedImages.value.add(item.id)
  console.log(`[onImageLoad] loadedImages size:`, loadedImages.value.size)
}

const onImageError = (event: Event, item: MediaItem) => {
  console.warn(`[onImageError] Failed to load image: ${item.filename}`)
  const itemWithLayout = item as MediaItemWithLayout
  const itemInStore = galleryStore.mediaItems[itemWithLayout._originalIndex] as MediaItemWithLayout | undefined
  if (itemInStore) {
    itemInStore.aspectRatio = 1 
    console.log(`[onImageError] Set fallback aspectRatio for item ${item.id}`)
  }
  loadedImages.value.add(item.id) 
  console.log(`[onImageError] loadedImages size:`, loadedImages.value.size)
}

const openLightbox = (index: number) => {
  currentLightboxIndex.value = index
  showLightbox.value = true
  console.log(`[openLightbox] Opened lightbox at index:`, index, 'Item:', galleryStore.mediaItems[index])
}

const closeLightbox = () => {
  showLightbox.value = false
  console.log(`[closeLightbox] Closed lightbox`)
}

const navigateLightbox = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentLightboxIndex.value > 0) {
    currentLightboxIndex.value = currentLightboxIndex.value - 1
    console.log(`[navigateLightbox] Navigated to previous. New index:`, currentLightboxIndex.value, 'Item:', galleryStore.mediaItems[currentLightboxIndex.value])
  } else if (direction === 'next' && currentLightboxIndex.value < galleryStore.mediaItems.length - 1) {
    currentLightboxIndex.value = currentLightboxIndex.value + 1
    console.log(`[navigateLightbox] Navigated to next. New index:`, currentLightboxIndex.value, 'Item:', galleryStore.mediaItems[currentLightboxIndex.value])
  } else {
    console.log(`[navigateLightbox] Navigation ignored. Direction:`, direction, 'Current index:', currentLightboxIndex.value)
  }
}

const loadMoreItems = async () => {
  if (galleryStore.loading || !galleryStore.hasNextPage) {
    console.log(`[loadMoreItems] Skipped: loading=${galleryStore.loading}, hasNextPage=${galleryStore.hasNextPage}`)
    return
  }
  try {
    currentPage.value++
    console.log(`[loadMoreItems] Loading more items. Page:`, currentPage.value)
    await galleryStore.fetchMediaItems(currentPage.value, 12)
    console.log(`[loadMoreItems] Loaded page:`, currentPage.value, 'Total items:', galleryStore.mediaItems.length)
  } catch (error) {
    console.error('[loadMoreItems] Failed to load more items:', error)
    currentPage.value-- 
  }
}

const retryLoad = async () => {
  console.log(`[retryLoad] Retrying gallery load...`)
  galleryStore.resetStore()
  currentPage.value = 1
  await galleryStore.fetchMediaItems(1, 12)
  console.log(`[retryLoad] Reloaded gallery page 1. Total items:`, galleryStore.mediaItems.length)
}

watch(() => galleryStore.mediaItems, (newItem) => {
  if (newItem.length > 0 && currentPage.value === 1) {
    initialImgCount.value = newItem.length
    console.log(`[GalleryView] initialImgCount incremented to:`, initialImgCount.value)
  }
}, { immediate: true })

watch([loadMoreTrigger, initialImagesLoaded], ([newTrigger, imagesLoaded]) => {
  console.log('loadedImages changed, size:', loadedImages.value.size)
  if(newTrigger && imagesLoaded) {
    console.log(`[GalleryView] All initial images loaded. Setting up intersection observer with loadMoreTrigger:`, loadMoreTrigger.value)
    if (loadMoreTrigger.value) {
      const { stop } = useIntersectionObserver(
        loadMoreTrigger,
        (entries) => {
          console.log('[GalleryView] IntersectionObserver:', { entries, hasNextPage: galleryStore.hasNextPage, loading: galleryStore.loading })
          if (entries && galleryStore.hasNextPage && !galleryStore.loading) {
            loadMoreItems()
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      )
      onUnmounted(stop)
    }
  }
})

// Initialize
onBeforeMount(async () => {
  console.log('[GalleryView] onBeforeMount')
  if (galleryStore.mediaItems.length === 0) {
    console.log('[GalleryView] No mediaItems, fetching page 1')
    await galleryStore.fetchMediaItems(1, 12)
    console.log('[GalleryView] Fetched initial mediaItems:', galleryStore.mediaItems.length)
  }
  console.log('🔃 Preloading icons...')
  useIconPreloader().preloadAllIcons().catch(err => {
    console.error('❌ Error preloading icons:', err)
  })
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-neutrals-neu-100);
}
</style>