import { usePrivacyStore } from '../stores/privacy'

/**
 * Composable for managing privacy data storage notice
 */
export function usePrivacy() {
  const privacyStore = usePrivacyStore()

  // Computed properties for easy access
  const showBanner = computed(() => privacyStore.shouldShowBanner)
  const hasClosedBanner = computed(() => privacyStore.hasClosedBanner)
  const hasAcknowledgedNotice = computed(() => privacyStore.hasAcknowledgedNotice)
  
  // Methods for banner management
  const closeBannerTemporarily = () => {
    privacyStore.closeBannerTemporarily()
  }

  const acknowledgeDataNotice = () => {
    privacyStore.acknowledgeDataNotice()
  }

  return {
    // State
    showBanner,
    hasClosedBanner,
    hasAcknowledgedNotice,
    
    // Methods
    closeBannerTemporarily,
    acknowledgeDataNotice,
    
    // Store access for advanced usage
    privacyStore
  }
}
