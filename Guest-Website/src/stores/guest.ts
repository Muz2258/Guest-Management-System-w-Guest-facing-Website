import { supabase } from '../utils/supabase'
import { guestStorage } from '../utils/guestStorage'
import type { GuestData } from '../types/guests'
import { reactive, computed } from 'vue'
import { 
  ErrorType, 
  createError, 
  createErrorState, 
  setError as setErrorState, 
  clearError, 
  type ErrorState 
} from '../utils/errorHandler'

export const useGuestStore = defineStore('guest', () => {
  // States
  const accessedViaToken = ref(false)
  const guestData = ref<GuestData | null>(null)
  const loading = ref(false)
  const errorState: ErrorState = reactive(createErrorState())
  const hasCachedData = ref(false)

  // Functions
  const fetchGuestByToken = async (token: string, forceRefresh = false) => {
    console.log('🔄 Starting guest fetch process...', { token, forceRefresh })
    loading.value = true
    clearError(errorState)
    
    try {
      // Check if we have valid cached data first (unless forcing refresh)
      if (!forceRefresh) {
        const isDataCached = guestStorage.checkCache()

        if (isDataCached){
          const cachedData = guestStorage.getGuestData()

          if(cachedData?.data?.guestData?.guestInfo) {
            guestData.value = cachedData.data.guestData.guestInfo
            loading.value = false
            guestStorage.refreshExpiry()
            hasCachedData.value = true
            return
          }else {
            console.log('❌ Cached guest info is invalid or missing, forcing fresh fetch')
          }
        }
      }

      console.log('📡 Fetching fresh data from database...')

      const {data: res, error: err} = await supabase
        .rpc('guest_get_primary_data', {
          auth_token: token
        })

      if (err) {
        const appError = createError(ErrorType.SERVER, err.message, {
          context: 'guest-fetch',
          userMessage: 'Unable to load your invitation data. Please check your link and try again.'
        })
        throw appError
      }

      console.log('✅ Guest data retrieved successfully:', res)

      guestData.value = { auth_token: token, ...res }

      console.log('🔄 Successfully stored guest data to store:', guestData.value)

      // Save to secure storage for future use
      await guestStorage.saveGuestData(token, {guestInfo: guestData.value})
      console.log('✅ Guest data successfully saved to cache:', guestData.value)
    } catch (e) {
      setErrorState(errorState, e, 'guest-fetch')
      guestData.value = null

      // Clear any potentially corrupted cached data
      guestStorage.clearGuestData()
    } finally {
      console.log('🏁 Guest fetch process completed', {
        success: !!guestData.value,
        hasError: errorState.hasError
      })
      loading.value = false
    }
  }

  const initialiseGuestStoreFromCache = () => {
    console.log('🚀 Initialising guest store...')
    const cachedData = guestStorage.getGuestData()

    if(cachedData?.data?.guestData?.guestInfo) {
      guestData.value = cachedData.data.guestData.guestInfo
      loading.value = false
      guestStorage.refreshExpiry()
      hasCachedData.value = true
      return
    }else {
      console.log('❌ Cached guest info is invalid or missing')
    }
  }

  const saveCurrentGuestData = async (token: string) => {
    guestStorage.saveGuestData(token, {guestInfo: guestData.value})
  }

  const setError = (message: string) => {
    const error = createError(ErrorType.UNKNOWN, message, {
      context: 'guest-store',
      userMessage: message
    })
    setErrorState(errorState, error)
  }

  return {
    // States
    accessedViaToken,
    guestData,
    hasCachedData,
    loading,
    errorState,

    // Functions
    fetchGuestByToken,
    initialiseGuestStoreFromCache,
    setError,
    saveCurrentGuestData,
    
    // Computed getters for backwards compatibility
    getGuestToken: computed(() => guestData.value?.auth_token)
  }
})
