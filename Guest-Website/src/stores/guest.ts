import { supabase } from '../utils/supabase'
import { guestStorage } from '../utils/guestStorage'
import type { GuestData } from '../types/guests'

export const useGuestStore = defineStore('guest', () => {
  // States
  const accessedViaToken = ref(false)
  const guestData = ref<GuestData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasCachedData = ref(false)

  // Functions
  const fetchGuestByToken = async (token: string, forceRefresh = false) => {
    console.log('🔄 Starting guest fetch process...', { token, forceRefresh })
    loading.value = true
    error.value = null
    
    try {
      // Check if we have valid cached data first (unless forcing refresh)
      if (!forceRefresh) {
        const isDataCached = guestStorage.checkCache(token)

        if (isDataCached){
          const cachedData = guestStorage.getGuestData(token)

          if(cachedData?.guestData?.guestInfo) {
            guestData.value = cachedData.guestData.guestInfo
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
        console.error('❌ Supabase error:', err)
        throw err
      }

      console.log('✅ Guest data retrieved successfully:', res)

      guestData.value = { auth_token: token, ...res }

      console.log('🔄 Successfully stored guest data to store:', guestData.value)

      // Save to secure storage for future use
      await guestStorage.saveGuestData(token, {guestInfo: guestData.value})
      console.log('✅ Guest data successfully saved to cache:', guestData.value)
    } catch (e) {
      console.error('❌ Error in fetchGuestByToken:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      guestData.value = null

      // Clear any potentially corrupted cached data
      guestStorage.clearGuestData()
    } finally {
      console.log('🏁 Guest fetch process completed', {
        success: !!guestData.value,
        hasError: !!error.value
      })
      loading.value = false
    }
  }

  const initialiseGuestStoreFromCache = () => {
    console.log('🚀 Initialising guest store...')
    const cachedData = guestStorage.getGuestData()

    if(cachedData?.guestData?.guestInfo) {
      guestData.value = cachedData.guestData.guestInfo
      loading.value = false
      guestStorage.refreshExpiry()
      hasCachedData.value = true
      return
    }else {
      console.log('❌ Cached guest info is invalid or missing')
    }
  }

  const saveCurrentGuestData = async () => {
    guestStorage.saveGuestData(guestData.value?.auth_token || '', {guestInfo: guestData.value})
  }

  const setError = (message: string) => {
    error.value = message
  }

  return {
    // States
    accessedViaToken,
    guestData,
    hasCachedData,
    loading,
    error,

    // Functions
    fetchGuestByToken,
    initialiseGuestStoreFromCache,
    setError,
    saveCurrentGuestData
  }
})
