import type { MediaItems } from "@/types/event";

export const useGalleryStore = defineStore('gallery', () => {
  // States
  const mediaItems = ref<MediaItems>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const hasNextPage = ref(true)

  const fetchMediaItems = async (page: number = 1, limit: number = 12) => {
    try {
      loading.value = true
      error.value = null
      
      const offset = (page - 1) * limit
      
      // First, get the total count
      if (page === 1) {
        const { count } = await supabase
          .from('gallery_media')
          .select('*', { count: 'exact', head: true })
        
        totalCount.value = count || 0
      }
      
      // Then fetch the paginated data
      const { data: res, error: err } = await supabase
        .from('gallery_media')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (err) {
        console.error('Error fetching media:', err)
        error.value = 'Failed to load media items.'
        return
      }
      
      // If this is the first page, replace the array; otherwise, append
      mediaItems.value.push(res || [])
      
      // Update hasNextPage based on the response
      hasNextPage.value = (res?.length || 0) === limit && mediaItems.value.flat().length < totalCount.value
      
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
    fetchMediaItems,
    resetStore,
    getPreviewItems
  }
})