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
            @click="openMediaViewer(item.id)"
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
            @click="openMediaViewer(item.id)"
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
  </main>
</template>

<script setup lang="ts">
/* ----------------------- Imports ------------------- */
import type { MediaItem } from '@/types/event'


/* ----------------------- Type Definitions ------------------- */
interface MediaItemWithLayout extends MediaItem {
  _originalIndex: number
  aspectRatio?: number
  shouldAutoplay?: boolean
}

type MediaItemsWithLayout = Array<MediaItemWithLayout[]>

/* ----------------------- Stores ------------------- */
const galleryStore = useGalleryStore()
const router = useRouter()


/* ----------------------- Reactive State ------------------- */
const loadMoreTrigger: Ref<HTMLElement | null> = ref(null)
const columnsArray = ref<MediaItemWithLayout[][]>([[], []])
const columnItemsCount: Ref<[number, number]> = ref([0, 0])

const infiniteObserver: Ref<IntersectionObserver | null> = ref(null)
const lightBoxMediaItems = ref<MediaItemWithLayout[]>([])


/* ----------------------- Computed Properties ------------------- */
const currentPageCount = computed(() => galleryStore.currentPage)

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
const populateColumns = async (strategy: 'fresh' | 'append') => {
  let newItems: MediaItemWithLayout[]
  if(strategy === 'fresh') {
    console.log('💻 Freshly populating columns from scratch...')
    columnsArray.value = [[], []]
    columnItemsCount.value = [0, 0]
    newItems = mediaItemsWithLayout.value.flat()
  } else {
    console.log('💻 Appending new items to existing columns...')
    newItems = mediaItemsWithLayout.value[currentPageCount.value - 1]?.flat() || []
  }
  

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

const openMediaViewer = (id: string) => {
  router.push({
    name: 'media-viewer',
    params: { imageID: id }
  })
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

const onImageError = (item: MediaItem) => {
  const itemWithLayout = item as MediaItemWithLayout
  const itemInStore = galleryStore.mediaItems.flat()[itemWithLayout._originalIndex] as MediaItemWithLayout | undefined

  if (itemInStore) {
    itemInStore.aspectRatio = 1 
  }
}

const retryLoad = async () => {
  console.log(`[retryLoad] Retrying gallery load...`)
  galleryStore.resetStore()
  galleryStore.currentPage = 1
  await galleryStore.fetchMediaItems(1, 12)
  console.log(`[retryLoad] Reloaded gallery page 1. Total items:`, galleryStore.mediaItems.length)
}

const updateGallery = async (entry: IntersectionObserverEntry) => {
  if (entry.isIntersecting && galleryStore.hasNextPage && !galleryStore.loading) {
    console.log('🔃 Load more trigger intersecting, loading more items...')
    await galleryStore.loadMoreItems()
    populateColumns('append')
  }
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
    entries.forEach(entry => updateGallery(entry)) 
  }, { threshold: 0.1, rootMargin: '100px' })

  infiniteObserver.value.observe(loadMoreTrigger.value)
  console.log('[GalleryView] IntersectionObserver set up successfully.')
}


/* ------------------- Lifecycle Hooks ------------------- */
onMounted(async () => {
  console.log('⬇️ Gallery view mounted')
  if (galleryStore.mediaItems.length === 0) {
    console.log('⛔ No mediaItems, fetching page 1')
    await galleryStore.fetchMediaItems(1, 12)
    console.log('🆕 Successfully fetched initial mediaItems')
  }else {
    console.log('✅ mediaItems already loaded:', galleryStore.currentPage)
  }

  if(mediaItemsWithLayout.value.length > 0){
    console.log('💻 Populating columns with layout data...', mediaItemsWithLayout.value)
    await populateColumns('fresh')
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