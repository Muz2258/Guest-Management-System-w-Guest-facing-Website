import type { MediaItems } from "@/types/event";

export const useGalleryStore = defineStore('gallery', () => {
  // States
  const mediaItems = ref<MediaItems>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const hasNextPage = ref(true)
  const currentPage = ref(1)

  const fetchMediaItems = async (page: number = 1, limit: number = 12) => {
    try {
      loading.value = true
      error.value = null
      
      // Then fetch the paginated data
      const { data: res, error: err } = await supabase
        .rpc('guest_get_media_items', {
          max_qty: limit,
          page_number: page
        })
      
      if (err) {
        console.error('Error fetching media:', err)
        error.value = 'Failed to load media items.'
        return
      }

      totalCount.value = res.total_count
      hasNextPage.value = res.has_more
      currentPage.value = res.current_page
      
      mediaItems.value.push(res.items || [])
      
    } catch (err) {
      console.error('Failed to fetch media items:', err)
      error.value = 'An unexpected error occurred.'
    } finally {
      loading.value = false
    }
  }

  // Method to reset the store (useful for refreshing)
  const resetStore = () => {
    mediaItems.value = []
    totalCount.value = 0
    hasNextPage.value = true
    error.value = null
  }

  // Method to get limited items for preview (used in main gallery component)
  const getPreviewItems = (limit: number = 6) => {
    return mediaItems.value
      .flat()
      .filter(item => item.created_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  return {
    mediaItems,
    loading,
    error,
    totalCount,
    hasNextPage,
    currentPage,
    fetchMediaItems,
    resetStore,
    getPreviewItems
  }
})