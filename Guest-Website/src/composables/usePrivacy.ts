/**
 * Composable for managing privacy consent and GDPR compliance
 */
export function usePrivacy() {
  const privacyStore = usePrivacyStore()

  // Computed properties for easy access
  const hasConsent = computed(() => privacyStore.consentGiven)
  const showBanner = computed(() => !privacyStore.hasSeenBanner)
  const preferences = computed(() => privacyStore.preferences)
  
  // Specific consent checks
  const canUseFunctional = computed(() => preferences.value.functional)

  // Helper methods
  const canUseFunction = (type: keyof ConsentPreferences): boolean => {
    return privacyStore.canUseFunction(type)
  }

  const updatePreferences = (newPreferences: Partial<ConsentPreferences>) => {
    privacyStore.acceptCustom(newPreferences)
  }

  const resetConsent = () => {
    privacyStore.clearConsent()
  }

  // Consent management methods
  const acceptAll = () => {
    privacyStore.acceptAll()
  }

  const acceptEssential = () => {
    privacyStore.acceptEssential()
  }

  const rejectAll = () => {
    privacyStore.rejectAll()
  }

  return {
    // State
    hasConsent,
    showBanner,
    preferences,
    
    // Specific consent checks
    canUseFunctional,
    
    // Methods
    canUseFunction,
    updatePreferences,
    resetConsent,
    acceptAll,
    acceptEssential,
    rejectAll,
    
    // Store access for advanced usage
    privacyStore
  }
}
