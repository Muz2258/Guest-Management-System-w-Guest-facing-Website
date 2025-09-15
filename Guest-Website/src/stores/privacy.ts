/**
 * Privacy Store
 * Manages data storage notification acknowledgment and guest privacy preferences
 */
import { guestStorage } from "../utils/guestStorage"
import { logger, ErrorType, createError } from '../utils/errorHandler'

export const usePrivacyStore = defineStore('privacy', () => {
  const guestStore = useGuestStore()

  // State - session-based banner visibility
  const shouldShowBanner = ref(false)
  const hasClosedBanner = ref(false)

  // Initialize notification state - show banner for new guests or those who haven't closed it
  const initializeNotice = (token: string) => {
    try {
      const storedData = guestStorage.getGuestData(token)
      
      // Check if user has permanently dismissed the banner
      const hasAcknowledgedPermanently = storedData?.data?.cookiesSeen || false
      
      if (hasAcknowledgedPermanently) {
        // User has already acknowledged the notice permanently, don't show banner
        shouldShowBanner.value = false
        hasClosedBanner.value = true
        console.log('✅ User has already acknowledged data notice permanently')
      } else {
        // New user or user who hasn't acknowledged yet - show banner
        shouldShowBanner.value = true
        hasClosedBanner.value = false
        console.log('✅ Showing data notice banner for new/returning user')
      }
    } catch (error) {
      const appError = createError(ErrorType.STORAGE, 'Failed to load notice state', {
        context: 'privacy-store-init'
      })
      logger.log(appError)
      // Default to showing banner for safety
      shouldShowBanner.value = true
      hasClosedBanner.value = false
    }
  }

  // Initialize for cached users (no token) - don't show banner since they've been here before
  const initializeForCachedUser = () => {
    shouldShowBanner.value = false
    hasClosedBanner.value = true
    console.log('✅ Cached user detected, not showing banner')
  }

  // Temporarily close banner for this session (don't save permanently)
  const closeBannerTemporarily = () => {
    shouldShowBanner.value = false
    hasClosedBanner.value = true
    console.log('✅ Data storage banner closed for this session')
  }

  // Permanently acknowledge the data storage notice
  const acknowledgeDataNotice = () => {
    const token = guestStore.guestData?.auth_token

    if(!token) {
      const error = createError(ErrorType.AUTHENTICATION, 'No auth token found in guest store', {
        context: 'privacy-acknowledge-notice'
      })
      logger.log(error)
      throw error
    }

    // Hide banner immediately
    shouldShowBanner.value = false
    hasClosedBanner.value = true
    
    // Save permanent acknowledgment
    guestStorage.markCookiesAsSeen(token)
    console.log(guestStorage.getGuestData(token))
    console.log('✅ Data storage: notice acknowledged permanently')
  }

  return {
    // State
    shouldShowBanner,
    hasClosedBanner,
    
    // Actions
    initializeNotice,
    initializeForCachedUser,
    closeBannerTemporarily,
    acknowledgeDataNotice,
    
    // Computed for backwards compatibility
    hasAcknowledgedNotice: computed(() => hasClosedBanner.value)
  }
})
