export interface WellWish {
  wish_id: string
  guest_id: string
  message: string
  created_at: string
  updated_at: string
}

export const useWellWishesStore = defineStore('wellWishes', () => {
  // States
  const currentWellWish = ref<WellWish | null>(null)
  const hasWellWish = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Functions
  const saveWellWish = async (guestId: string, message: string) => {
    if (!guestId) {
        console.error('❌ No guest ID available to save well wish')
        throw new Error('No guest ID available')
    }

    try {
        loading.value = true
        error.value = null
        console.log('💾 Simulating well wish save...', { guestId, message })

        // Simulate database save with delay
        await new Promise(resolve => setTimeout(resolve, 1200))

        // Create simulated response data
        const now = new Date().toISOString()
        const simulatedWellWish: WellWish = {
            wish_id: currentWellWish.value?.wish_id || `wish_${Date.now()}`,
            guest_id: guestId,
            message: message.trim(),
            created_at: currentWellWish.value?.created_at || now,
            updated_at: now
        }

        console.log('✅ Well wish save simulated successfully:', simulatedWellWish)

        // Update local state
        currentWellWish.value = simulatedWellWish
        updateWellWishStatus();

        return simulatedWellWish

    } catch (e) {
        console.error('❌ Error simulating well wish save:', e)
        error.value = e instanceof Error ? e.message : 'Failed to save well wish'
        throw e
    } finally {
        loading.value = false
    }
  }

  const loadWellWish = async (guestId: string) => {
    if (!guestId) {
        console.error('❌ No guest ID available to load well wish')
        return null
    }

    try {
        loading.value = true
        error.value = null
        console.log('📖 Simulating well wish load...', { guestId })

        // Simulate database load with delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // For simulation, return existing well wish if it exists
        // In real implementation, this would query the database
        console.log('✅ Well wish load simulated successfully:', currentWellWish.value)
        updateWellWishStatus();

        return currentWellWish.value

    } catch (e) {
        console.error('❌ Error simulating well wish load:', e)
        error.value = e instanceof Error ? e.message : 'Failed to load well wish'
        throw e
    } finally {
        loading.value = false
    }
  }

  const deleteWellWish = async (guestId: string) => {
    if (!guestId) {
        console.error('❌ No guest ID available to delete well wish')
        throw new Error('No guest ID available')
    }

    try {
        loading.value = true
        error.value = null
        console.log('🗑️ Simulating well wish deletion...', { guestId })

        // Simulate database delete with delay
        await new Promise(resolve => setTimeout(resolve, 600))

        console.log('✅ Well wish deletion simulated successfully')

        // Clear local state
        currentWellWish.value = null
        updateWellWishStatus();

        return true

    } catch (e) {
        console.error('❌ Error simulating well wish deletion:', e)
        error.value = e instanceof Error ? e.message : 'Failed to delete well wish'
        throw e
    } finally {
        loading.value = false
    }
  }

  const updateWellWishStatus = () => {
    hasWellWish.value = !!currentWellWish.value?.message
  }

  const clearError = () => {
    error.value = null
  }

  const clearWellWish = () => {
    currentWellWish.value = null
    error.value = null
  }

  return {
    // State
    currentWellWish,
    loading,
    error,
    hasWellWish,

    // Functions
    saveWellWish,
    loadWellWish,
    deleteWellWish,
    clearError,
    clearWellWish
  }
})
