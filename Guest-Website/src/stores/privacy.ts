export interface ConsentPreferences {
  essential: boolean      // Always true, cannot be disabled
  functional: boolean     // Guest data caching, remember preferences
}

export const usePrivacyStore = defineStore('privacy', () => {
  // State
  const hasSeenBanner = ref(false)
  const consentGiven = ref(false)
  const consentTimestamp = ref<number | null>(null)
  const preferences = ref<ConsentPreferences>({
    essential: true,    // Always required
    functional: false,  // Guest caching - requires consent
  })

  // Constants
  const CONSENT_STORAGE_KEY = 'wedding_privacy_consent'
  const CONSENT_VERSION = '1.0'
  const CONSENT_EXPIRY_DAYS = 365

  // Initialize from localStorage
  const initializeConsent = () => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        
        // Check if consent is still valid
        const now = Date.now()
        const expiryTime = data.timestamp + (CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        
        if (now < expiryTime && data.version === CONSENT_VERSION) {
          hasSeenBanner.value = true
          consentGiven.value = data.consentGiven
          consentTimestamp.value = data.timestamp
          preferences.value = { ...preferences.value, ...data.preferences }
          
          console.log('✅ Loaded valid consent preferences:', preferences.value)
          return
        }
      }
    } catch (error) {
      console.error('❌ Error loading consent preferences:', error)
    }
    
    // If no valid consent found, show banner
    hasSeenBanner.value = false
    consentGiven.value = false
  }

  // Save consent to localStorage
  const saveConsent = () => {
    try {
      const consentData = {
        version: CONSENT_VERSION,
        timestamp: Date.now(),
        consentGiven: consentGiven.value,
        preferences: preferences.value
      }
      
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
      consentTimestamp.value = consentData.timestamp
      
      console.log('✅ Consent preferences saved:', consentData)
    } catch (error) {
      console.error('❌ Error saving consent preferences:', error)
    }
  }

  // Accept all cookies
  const acceptAll = () => {
    preferences.value = {
      essential: true,
      functional: true,
    }
    consentGiven.value = true
    hasSeenBanner.value = true
    saveConsent()
    
    // Save guest data if available and we now have functional consent
    const guestStore = useGuestStore()
    if (guestStore.guestData) {
      guestStore.saveCurrentGuestData()
    }

    console.log('✅ All cookies accepted')
  }

  // Accept only essential cookies
  const acceptEssential = () => {
    preferences.value = {
      essential: true,
      functional: false,
    }
    consentGiven.value = true
    hasSeenBanner.value = true
    saveConsent()
    
    console.log('✅ Only essential cookies accepted')
  }

  // Accept custom preferences
  const acceptCustom = (customPreferences: Partial<ConsentPreferences>) => {
    preferences.value = {
      ...preferences.value,
      ...customPreferences,
      essential: true, // Always required - ensure this stays true
    }
    consentGiven.value = true
    hasSeenBanner.value = true
    saveConsent()

    // Save guest data if available and functional consent is now enabled
    const guestStore = useGuestStore()
    if (guestStore.guestData && preferences.value.functional) {
      guestStore.saveCurrentGuestData()
    }
    
    console.log('✅ Custom preferences accepted:', preferences.value)
  }

  // Reject all non-essential cookies
  const rejectAll = () => {
    acceptEssential()
  }

  // Clear all consent and reset
  const clearConsent = () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY)
      hasSeenBanner.value = false
      consentGiven.value = false
      consentTimestamp.value = null
      preferences.value = {
        essential: true,
        functional: false,
      }
      
      console.log('🧹 Consent cleared')
    } catch (error) {
      console.error('❌ Error clearing consent:', error)
    }
  }

  // Check if specific functionality is allowed
  const canUseFunction = (type: keyof ConsentPreferences) => {
    return preferences.value[type]
  }

  // Check if guest caching is allowed
  const canCacheGuestData = () => {
    return canUseFunction('functional')
  }

  return {
    // State
    hasSeenBanner,
    consentGiven,
    consentTimestamp,
    preferences,
    
    // Actions
    initializeConsent,
    acceptAll,
    acceptEssential,
    acceptCustom,
    rejectAll,
    clearConsent,
    
    // Getters
    canUseFunction,
    canCacheGuestData
  }
})
