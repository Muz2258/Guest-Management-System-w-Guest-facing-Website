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
            v-for="(item, index) in columnsArray[0]"
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
            v-for="(item, index) in columnsArray[1]"
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
        ref="loadMoreTrigger"
        class="h-56 w-full flex items-center justify-center mt-16"
      >
      </div>

      <!-- Loading more indicator -->
      <div v-if="galleryStore.loading && galleryStore.mediaItems.length > 0" class="flex justify-center py-24">
        <div class="animate-spin rounded-full size-16 border-b-2 border-brand-pri"></div>
      </div>

      <!-- No items message -->
      <div v-else-if="!galleryStore.loading && galleryStore.mediaItems.length === 0" class="text-center py-12">
        <div class="text-gray-500">No media items found</div>
      </div>
    </div>

    <!-- Lightbox -->
    <MediaLightbox 
      v-if="showLightbox"
      :media-items="lightBoxMediaItems"
      v-model:current-index="currentLightboxIndex"
      @navigate="handleNavigation"
      @close="closeLightbox"
      @goTo="(index: number) => currentLightboxIndex = index"
    />
  </main>
</template>

<script setup lang="ts">
/* ----------------------- Imports ------------------- */
import type { MediaItem } from '@/types/event'
import { useIconPreloader } from '../composables/useIconPreloader'


/* ----------------------- Type Definitions ------------------- */
interface MediaItemWithLayout extends MediaItem {
  _originalIndex: number
  aspectRatio?: number
}

type MediaItemsWithLayout = Array<MediaItemWithLayout[]>

/* ----------------------- Stores ------------------- */
const galleryStore = useGalleryStore()


/* ----------------------- Reactive State ------------------- */
const loadMoreTrigger: Ref<HTMLElement | null> = ref(null)
const currentPageCount = ref<number>(1)
const columnsArray = ref<MediaItemWithLayout[][]>([[], []])
const columnItemsCount: Ref<[number, number]> = ref([0, 0])

const showLightbox = ref<boolean>(false)
const currentLightboxIndex = ref<number>(0)
const infiniteObserver: Ref<IntersectionObserver | null> = ref(null)
const lightBoxMediaItems = ref<MediaItemWithLayout[]>([])


/* ----------------------- Computed Properties ------------------- */
const mediaItemsWithLayout = computed<MediaItemsWithLayout>(() => {
  console.log('💻 Computing media items with layout...')
  const galleryItems = galleryStore.mediaItems

  const updatedGalleryItems = galleryItems.map((page, pageIndex) => {
    return page.map((item, itemIndex) => ({
      ...item,
      _originalIndex: pageIndex === 0 ? itemIndex : galleryItems.slice(0, pageIndex).reduce((acc, curr) => acc + curr.length, 0) + itemIndex,
      aspectRatio: (item as MediaItemWithLayout).aspectRatio ?? undefined,
    }))
  })

  console.log('💻 Media items with layout computed:', updatedGalleryItems)
  return updatedGalleryItems
})


/* ---------------------- Methods ---------------------- */
const populateColumns = async () => {
  const newItems = mediaItemsWithLayout.value[currentPageCount.value - 1]?.flat() || []

  newItems.forEach((item) => {
    const smallestIndex = columnItemsCount.value[0] <= columnItemsCount.value[1] ? 0 : 1
    
    columnsArray.value[smallestIndex]?.push(item)
    columnItemsCount.value[smallestIndex]++
  })
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
  const itemWithLayout = item as MediaItemWithLayout
  const itemInStore = galleryStore.mediaItems.flat()[itemWithLayout._originalIndex] as MediaItemWithLayout | undefined

  if (itemInStore && !itemInStore.aspectRatio) {
    itemInStore.aspectRatio = aspectRatio
  }
}

const onImageError = (event: Event, item: MediaItem) => {
  const itemWithLayout = item as MediaItemWithLayout
  const itemInStore = galleryStore.mediaItems.flat()[itemWithLayout._originalIndex] as MediaItemWithLayout | undefined

  if (itemInStore) {
    itemInStore.aspectRatio = 1 
  }
}

const handleNavigation = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentLightboxIndex.value > 0) {
    currentLightboxIndex.value--
  } else if (direction === 'next' && currentLightboxIndex.value < lightBoxMediaItems.value.length - 1) {
    currentLightboxIndex.value++
  }
}

const openLightbox = (index: number) => {
  currentLightboxIndex.value = index
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

const loadMoreItems = async () => {
  if (galleryStore.loading || !galleryStore.hasNextPage) {
    console.log(`[loadMoreItems] Skipped: loading=${galleryStore.loading}, hasNextPage=${galleryStore.hasNextPage}`)
    return
  }
  try {
    currentPageCount.value++
    console.log(`[loadMoreItems] Loading more items. Page:`, currentPageCount.value)
    await galleryStore.fetchMediaItems(currentPageCount.value, 12)
    await populateColumns()
    lightBoxMediaItems.value = mediaItemsWithLayout.value.flat()
    console.log(`[loadMoreItems] Loaded page ${currentPageCount.value}. Total items:`, galleryStore.mediaItems[currentPageCount.value - 1]?.length)
  } catch (error) {
    console.error('[loadMoreItems] Failed to load more items:', error)
    currentPageCount.value--
  }
}

const retryLoad = async () => {
  console.log(`[retryLoad] Retrying gallery load...`)
  galleryStore.resetStore()
  currentPageCount.value = 1
  await galleryStore.fetchMediaItems(1, 12)
  console.log(`[retryLoad] Reloaded gallery page 1. Total items:`, galleryStore.mediaItems.length)
}

const initializeInfiniteObserver = () => {
  console.log('🔃 Initializing IntersectionObserver for infinite scroll...')
  if (infiniteObserver.value && loadMoreTrigger.value) {
    console.log('🚫 IntersectionObserver already initialized.')
    return
  }

  if(!loadMoreTrigger.value) {
    console.warn('⚠️ loadMoreTrigger is null, cannot initialize IntersectionObserver.')
    return
  }

  infiniteObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && galleryStore.hasNextPage && !galleryStore.loading) {
        console.log('🔃 Load more trigger intersecting, loading more items...')
        loadMoreItems()
      }
    })
  }, { threshold: 0.1, rootMargin: '100px' })

  infiniteObserver.value.observe(loadMoreTrigger.value)
  console.log('[GalleryView] IntersectionObserver set up successfully.')
}


/* ------------------- Lifecycle Hooks ------------------- */
onBeforeMount(async () => {
  console.log('🟡 GalleryView preparing to mount...')

  console.log('🔃 Preloading icons...')
  useIconPreloader().preloadAllIcons()
    .catch(err => {
      console.error('❌ Error preloading icons:', err)
    })
})

onMounted(async () => {
  console.log('⬇️ Gallery view mounted')
  if (galleryStore.mediaItems.length === 0) {
    console.log('⛔ No mediaItems, fetching page 1')
    await galleryStore.fetchMediaItems(1, 12)
    currentPageCount.value = galleryStore.mediaItems.length
    console.log('🆕 Successfully fetched initial mediaItems')
  }else {
    console.log('✅ mediaItems already loaded:', galleryStore.mediaItems.length)
    currentPageCount.value = galleryStore.mediaItems.length
  }

  if(mediaItemsWithLayout.value.length > 0){
    await populateColumns()
    initializeInfiniteObserver()
    lightBoxMediaItems.value = mediaItemsWithLayout.value.flat()
  }
})

onUnmounted(() => {
  if (infiniteObserver.value && loadMoreTrigger.value) {
    infiniteObserver.value.unobserve(loadMoreTrigger.value)
    console.log('[GalleryView] IntersectionObserver disconnected on unmount.')
  }
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  background: var(--color-neutrals-neu-100);
}
</style>