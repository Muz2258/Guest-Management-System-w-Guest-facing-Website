import type { GoodWillMessage } from "../types/guests"

export const useGoodWillStore = defineStore('goodWill', () => {
  // States
  const goodWillMessage = ref<GoodWillMessage | null>(null)
  const hasMessage = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Functions
  const fetchGoodWillMessage = async (token: string, forceRefresh = false) => {
    console.log('🔄 Starting good will message fetch process...', token)
    loading.value = true
    error.value = null

    try {
        // Check if we have valid cached data first (unless forcing refresh)
        if (!forceRefresh) {
            console.log('Checking for cached RSVP data...')
            const isDataCached = guestStorage.checkCache(token)

            if (isDataCached){
                const cachedData = guestStorage.getGuestData(token)

                if(cachedData?.guestData?.guestMessage) {
                    hasMessage.value = cachedData.guestData.guestMessage
                    console.log('✅ Loaded good will message from cache:', hasMessage.value)
                    loading.value = false
                    guestStorage.refreshExpiry()
                    return
                }else {
                    console.log('❌ Cached guest message is invalid or missing, forcing fresh fetch')
                }
            }
        }

        console.log('📡 Fetching fresh good will message from database...')

        const { data: res, error: err } = await supabase
            .rpc('guest_get_message', {
                auth_token: token
            })

        if (err) {
            console.log('❌ Supabase error:', err)
            throw err
        }

        console.log('✅ Good will message retrieved from database:', res)

        goodWillMessage.value = {has_message: res.has_message, ...res.message}

        console.log('✅ Good will message saved to store successfully:', goodWillMessage.value)

        // Save to secure storage for future use
        await guestStorage.saveGuestData(token, {guestMessage: goodWillMessage.value})
        console.log('✅ Good will message successfully saved to cache:', goodWillMessage.value)
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
        loading.value = false
    }
  }

  const initialiseGoodWillStoreFromCache = () => {
    console.log('🚀 Initialising guest store...')
    const cachedData = guestStorage.getGuestData()

    if(cachedData?.guestData?.guestMessage) {
      goodWillMessage.value = cachedData.guestData.guestMessage
      loading.value = false
      guestStorage.refreshExpiry()
      return
    }else {
      console.log('❌ Cached guest message is invalid or missing')
    }
  }

  const deleteGoodWillMessage = async (token: string) => {
    console.log('🔄 Starting good will message deletion process...', token)
    try {
        loading.value = true
        error.value = null
        console.log('🗑️ Simulating good will message deletion...', { token })

        const { data: res, error: err } = await supabase
          .rpc('guest_remove_message', {
            auth_token: token
          })

        if (err) {
            console.error('❌ Supabase RPC error:', err)
            throw err
        }

        console.log('✅ Good will message deleted successfully:', res)

        // Update local state
        goodWillMessage.value = null
        hasMessage.value = false

        // Update cached data
        await guestStorage.saveGuestData(token, { guestMessage: goodWillMessage.value })
        console.log('✅ Good will message successfully removed from cache')
    } catch (e) {
        console.error('❌ Error deleting good will message:', e)
        error.value = e instanceof Error ? e.message : 'Failed to delete good will message'
        throw e
    } finally {
        loading.value = false
    }
  }

  const saveGoodWillMessage = async (token: string, message: string) => {
    console.log('🔄 Starting good will message save process...', { token, message })
    try {
        loading.value = true
        error.value = null

        const { data: res, error: err } = await supabase
          .rpc('guest_update_message', {
            auth_token: token,
            message_text: message
          })

        if (err) {
            console.error('❌ Supabase RPC error:', err)
            throw err
        }

        console.log('✅ Good will message saved successfully to database:', res)

        // Update local state
        await fetchGoodWillMessage(token, true)
        hasMessage.value = true
    } catch (e) {
        console.error('❌ Error simulating good will message save:', e)
        error.value = e instanceof Error ? e.message : 'Failed to save well wish'
        throw e
    } finally {
        loading.value = false
    }
  }


  /* 

  const loadGoodWillMessage = async (token: string) => {
    if (!token) {
        console.error('❌ No guest token available to load good will message')
        return null
    }

    try {
        loading.value = true
        error.value = null
        console.log('📖 Starting good will message load...', token)

        const { data: goodWillResponse, error: supaBaseError } = await supabase
          .rpc('get_guest_messages', {
            auth_token: token
          })

        if (supaBaseError) {
            console.error('❌ Supabase RPC error:', supaBaseError)
            throw supaBaseError
        }

        console.log('✅ Good will message load simulated successfully:', goodWillResponse)

        const messageData = goodWillResponse.messages?.[0] || null;

        currentGoodWillMessage.value = messageData
        updateGoodWillStatus();

    } catch (e) {
        console.error('❌ Error simulating good will message load:', e)
        error.value = e instanceof Error ? e.message : 'Failed to load good will message'
        throw e
    } finally {
        loading.value = false
    }
  }

  const updateGoodWillStatus = () => {
    hasGoodWillMessage.value = !!currentGoodWillMessage.value?.message_text
  }

  const clearError = () => {
    error.value = null
  }

  const clearGoodWillMessage = () => {
    currentGoodWillMessage.value = null
    error.value = null
  }

  const initializeGoodWillStore = () => {
    if (!guestStore.guestData?.others.has_goodwill) {
      console.log('No good will message available for this guest.')
      currentGoodWillMessage.value = null
      updateGoodWillStatus();
      return
    }
    
    console.log('Initializing good will store with existing guest data...')

    currentGoodWillMessage.value = guestStore.guestData?.others.goodwill_message || null
    updateGoodWillStatus();

    console.log('Good will store initialized:', {
      hasGoodWillMessage: hasGoodWillMessage.value,
      currentGoodWillMessage: currentGoodWillMessage.value
    })
  } */

  return {
    // State
    goodWillMessage,
    loading,
    error,
    hasMessage,

    // Functions
    fetchGoodWillMessage,
    initialiseGoodWillStoreFromCache,
    deleteGoodWillMessage,
    saveGoodWillMessage
  }
})
