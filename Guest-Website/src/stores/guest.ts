import { supabase } from '../utils/supabase'
import { guestStorage } from '../utils/guestStorage'
import type { RSVP, GuestWithRSVP, GuestJoinResponse } from '../types/guests'

export const useGuestStore = defineStore('guest', () => {
  // States
  const guest = ref<GuestWithRSVP | null>(null)
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
        const cacheLoaded = loadFromCache(token)
        if (cacheLoaded){
          loading.value = false
          guestStorage.refreshExpiry()
          hasCachedData.value = true
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

  const savePlusOne = async (firstName: string, lastName: string) => {
    if (!guest.value) {
      console.error('❌ No guest data available to save plus one')
      throw new Error('No guest data available')
    }

    try {
      loading.value = true
      console.log('💾 Simulating plus one data save...', { firstName, lastName })

      // Construct the full name
      const plusOneName = lastName ? `${firstName} ${lastName}` : firstName

      // Simulate database update with delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate successful database response
      const simulatedData = {
        rsvp_id: guest.value.rsvp?.rsvp_id || `rsvp_${Date.now()}`,
        guest_id: guest.value.guest_id,
        attendance_status: guest.value.rsvp?.attendance_status || 'pending',
        spouse_attending: guest.value.rsvp?.spouse_attending || null,
        plus_one_attending: true,
        plus_one_name: plusOneName
      }

      console.log('✅ Plus one save simulated successfully:', simulatedData)

      // Update local guest data
      if (guest.value.rsvp) {
        guest.value.rsvp.plus_one_attending = true
        guest.value.rsvp.plus_one_name = plusOneName
      } else {
        // Create new RSVP if it doesn't exist
        guest.value.rsvp = simulatedData as RSVP
      }

      // Save updated data to cache
      await guestStorage.saveGuestData(guest.value.auth_token, guest.value)
      
      console.log('✅ Plus one data updated in store and cache (simulated)')
      return simulatedData

    } catch (e) {
      console.error('❌ Error simulating plus one save:', e)
      error.value = e instanceof Error ? e.message : 'Failed to save plus one data'
      throw e
    } finally {
      loading.value = false
    }
  }

  const removePlusOne = async () => {
    if (!guest.value) {
      console.error('❌ No guest data available to remove plus one')
      throw new Error('No guest data available')
    }

    try {
      loading.value = true
      console.log('🗑️ Simulating plus one removal...')

      // Simulate database update with delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simulate successful database response
      const simulatedData = {
        rsvp_id: guest.value.rsvp?.rsvp_id || `rsvp_${Date.now()}`,
        guest_id: guest.value.guest_id,
        attendance_status: guest.value.rsvp?.attendance_status || 'pending',
        spouse_attending: guest.value.rsvp?.spouse_attending || null,
        plus_one_attending: false,
        plus_one_name: null
      }

      console.log('✅ Plus one removal simulated successfully:', simulatedData)

      // Update local guest data
      if (guest.value.rsvp) {
        guest.value.rsvp.plus_one_attending = false
        guest.value.rsvp.plus_one_name = null
      }

      // Save updated data to cache
      await guestStorage.saveGuestData(guest.value.auth_token, guest.value)
      
      console.log('✅ Plus one data removed from store and cache (simulated)')
      return simulatedData

    } catch (e) {
      console.error('❌ Error simulating plus one removal:', e)
      error.value = e instanceof Error ? e.message : 'Failed to remove plus one data'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateGuestRSVP = async (attendanceStatus: 'attending' | 'not_attending') => {
    if (!guest.value) {
      console.error('❌ No guest data available to update RSVP')
      throw new Error('No guest data available')
    }

    try {
      loading.value = true
      console.log('💾 Simulating guest RSVP update...', { attendanceStatus })

      // Simulate database update with delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate successful database response
      const simulatedData = {
        rsvp_id: guest.value.rsvp?.rsvp_id || `rsvp_${Date.now()}`,
        guest_id: guest.value.guest_id,
        attendance_status: attendanceStatus,
        spouse_attending: guest.value.rsvp?.spouse_attending || null,
        plus_one_attending: guest.value.rsvp?.plus_one_attending || null,
        plus_one_name: guest.value.rsvp?.plus_one_name || null
      }

      console.log('✅ Guest RSVP update simulated successfully:', simulatedData)

      // Update local guest data
      if (guest.value.rsvp) {
        guest.value.rsvp.attendance_status = attendanceStatus
      } else {
        // Create new RSVP if it doesn't exist
        guest.value.rsvp = simulatedData as RSVP
      }

      // Save updated data to cache
      await guestStorage.saveGuestData(guest.value.auth_token, guest.value)
      
      console.log('✅ Guest RSVP data updated in store and cache (simulated)')
      return simulatedData

    } catch (e) {
      console.error('❌ Error simulating guest RSVP update:', e)
      error.value = e instanceof Error ? e.message : 'Failed to update guest RSVP'
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateSpouseRSVP = async (spouseAttending: boolean) => {
    if (!guest.value) {
      console.error('❌ No guest data available to update spouse RSVP')
      throw new Error('No guest data available')
    }

    try {
      loading.value = true
      console.log('💾 Simulating spouse RSVP update...', { spouseAttending })

      // Simulate database update with delay
      await new Promise(resolve => setTimeout(resolve, 900))

      // Simulate successful database response
      const simulatedData = {
        rsvp_id: guest.value.rsvp?.rsvp_id || `rsvp_${Date.now()}`,
        guest_id: guest.value.guest_id,
        attendance_status: guest.value.rsvp?.attendance_status || 'pending',
        spouse_attending: spouseAttending,
        plus_one_attending: guest.value.rsvp?.plus_one_attending || null,
        plus_one_name: guest.value.rsvp?.plus_one_name || null
      }

      console.log('✅ Spouse RSVP update simulated successfully:', simulatedData)

      // Update local guest data
      if (guest.value.rsvp) {
        guest.value.rsvp.spouse_attending = spouseAttending
      } else {
        // Create new RSVP if it doesn't exist
        guest.value.rsvp = simulatedData as RSVP
      }

      // Save updated data to cache
      await guestStorage.saveGuestData(guest.value.auth_token, guest.value)
      
      console.log('✅ Spouse RSVP data updated in store and cache (simulated)')
      return simulatedData

    } catch (e) {
      console.error('❌ Error simulating spouse RSVP update:', e)
      error.value = e instanceof Error ? e.message : 'Failed to update spouse RSVP'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // States
    guest,
    loading,
    error,
    hasCachedData,

    // Functions
    fetchGuestByToken,
    setError,
    loadFromCache,
    clearGuestData,
    refreshGuestData,
    hasValidCachedData,
    saveCurrentGuestData,
    loadAnyValidCachedData,
    savePlusOne,
    removePlusOne,
    updateGuestRSVP,
    updateSpouseRSVP
  }
})
