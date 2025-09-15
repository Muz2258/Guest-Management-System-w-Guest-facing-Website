import { useGuestStore } from '../stores/guest'
import { guestStorage } from '../utils/guestStorage'

/**
 * Composable for guest data caching and storage operations
 */
export function useGuestCache() {
  const guestStore = useGuestStore()

  /**
   * Check if the current guest data is cached and load it
   */
  const loadCachedData = () => {
    return guestStore.initialiseGuestStoreFromCache()
  }

  /**
   * Force refresh guest data from the server
   */
  const refreshData = async (token: string) => {
    await guestStore.fetchGuestByToken(token)
  }

  /**
   * Clear all cached guest data
   */
  const clearCache = () => {
    // Reset the guest data to null to clear cache
    guestStore.guestData = null
    guestStore.hasCachedData = false
  }

  /**
   * Check if valid cached data exists
   */
  const hasCachedData = () => {
    return guestStore.hasCachedData
  }

  /**
   * Get information about the cached data
   */
  const getCacheInfo = () => {
    const timeUntilExpiry = guestStorage.getTimeUntilExpiry()
    return {
      hasData: !!timeUntilExpiry,
      expiresIn: timeUntilExpiry,
      expiresInHours: timeUntilExpiry ? Math.floor(timeUntilExpiry / (1000 * 60 * 60)) : 0,
      expiresInMinutes: timeUntilExpiry ? Math.floor(timeUntilExpiry / (1000 * 60)) : 0
    }
  }

  /**
   * Manually refresh cache expiry (extend the TTL)
   */
  const extendCacheExpiry = () => {
    guestStorage.refreshExpiry()
  }

  return {
    loadCachedData,
    refreshData,
    clearCache,
    hasCachedData,
    getCacheInfo,
    extendCacheExpiry
  }
}
