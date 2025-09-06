import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'
import { guestStorage } from '../utils/guestStorage'
import type { RSVP, GuestWithRSVP, GuestJoinResponse } from '../types/guests'

export const useGuestStore = defineStore('guest', () => {
  // States
  const guest = ref<GuestWithRSVP | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Functions
  const fetchGuestByToken = async (token: string, forceRefresh = false) => {
    console.log('🔄 Starting guest fetch process...', { token, forceRefresh })
    loading.value = true
    error.value = null
    
    try {
      // Check if we have valid cached data first (unless forcing refresh)
      if (!forceRefresh) {
        const cacheLoaded = loadFromCache(token)
        if (cacheLoaded){
          loading.value = false
          guestStorage.refreshExpiry()
          return
        }
      }

      console.log('📡 Fetching fresh data from Supabase...')
      const { data: guestInfo, error: supabaseError } = await supabase
        .from('guests')
        .select('*, rsvps (*)')
        .eq('auth_token', token)
        .single()

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError)
        throw supabaseError
      }

      if (!guestInfo) {
        console.error('❌ No guest found for token:', token)
        throw new Error('Guest not found')
      }

      console.log('✅ Guest data retrieved successfully:', guestInfo)

      const transformGuestInfo = (info: GuestJoinResponse) => {
        const { rsvps, ...guestDetails } = info
        return { ...guestDetails, rsvp: rsvps?.[0] as RSVP | null }
      }

      const transformedData = transformGuestInfo(guestInfo)
      guest.value = transformedData

      // Save to secure storage for future use
      await guestStorage.saveGuestData(token, transformedData)

      console.log('✅ Guest data transformed successfully:', guest.value)
    } catch (e) {
      console.error('❌ Error in fetchGuestByToken:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred'
      guest.value = null
      
      // Clear any potentially corrupted cached data
      guestStorage.clearGuestData()
    } finally {
      console.log('🏁 Guest fetch process completed', { 
        success: !!guest.value,
        hasError: !!error.value
      })
      loading.value = false
    }
  }

  const setError = (message: string | null) => {
    console.error('⚠️ Setting error:', message)
    error.value = message
  }

  const loadFromCache = (token: string) => {
    console.log('📦 Attempting to load guest data from cache...')
    const cachedData = guestStorage.getGuestData(token)
    
    if (cachedData && cachedData.isValid) {
      guest.value = cachedData.guestData
      console.log('✅ Loaded guest data from cache:', guest.value)
      return true
    }
    
    console.log('📭 No valid cached data found')
    return false
  }

  const clearGuestData = () => {
    guest.value = null
    error.value = null
    guestStorage.clearGuestData()
    console.log('🧹 Cleared guest data from store and cache')
  }

  const refreshGuestData = async (token: string) => {
    console.log('🔄 Forcing refresh of guest data...')
    await fetchGuestByToken(token, true)
  }

  const hasValidCachedData = (token: string) => {
    return guestStorage.hasValidData(token)
  }

  const saveCurrentGuestData = async () => {
    // Only save if we have guest data and a token (indicating URL access)
    if (guest.value && guest.value.auth_token) {
      console.log('💾 Saving current guest data to cache...')
      await guestStorage.saveGuestData(guest.value.auth_token, guest.value)
    } else {
      console.log('⚠️ No guest data or token available for caching')
    }
  }

  const loadAnyValidCachedData = () => {
    console.log('🔍 Checking for any valid cached guest data...')
    const cachedData = guestStorage.getGuestData()
    
    if (cachedData && cachedData.isValid) {
      guest.value = cachedData.guestData
      console.log('✅ Loaded guest data from cache for base URL access:', guest.value)
      return true
    }
    
    console.log('📭 No valid cached data found for base URL access')
    return false
  }

  return {
    guest,
    loading,
    error,
    fetchGuestByToken,
    setError,
    loadFromCache,
    clearGuestData,
    refreshGuestData,
    hasValidCachedData,
    saveCurrentGuestData,
    loadAnyValidCachedData
  }
})
