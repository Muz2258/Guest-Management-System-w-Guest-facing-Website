import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'
import type { Guest, RSVP, CompleteGuestData, GuestCategory, AttendanceStatus } from '@/types/guest'
import { ElMessage } from 'element-plus'

export const useGuestStore = defineStore('guest', () => {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const guests = ref<CompleteGuestData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalGuests = ref(0)

  // Computed
  const hasGuests = computed(() => guests.value.length > 0)

  // Filters
  const filterAttendance = ref<AttendanceStatus | 'all'>('all')
  const filterCategory = ref<GuestCategory | 'all'>('all')

  const filteredGuests = computed(() => {
    let filtered = [...guests.value]

    if (filterAttendance.value !== 'all') {
      filtered = filtered.filter(guest => guest.rsvp?.attendance_status === filterAttendance.value)
    }

    if (filterCategory.value !== 'all') {
      filtered = filtered.filter(guest => guest.guest.guest_category === filterCategory.value)
    }

    return filtered
  })

  // Actions
  async function fetchGuests(page = 1, limit = 20) {
    try {
      loading.value = true
      error.value = null

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: err, count } = await supabase
        .from('guests')
        .select('*, rsvps(*), plus_ones(*)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (err) throw err

      guests.value = data.map(item => ({
        guest: {...item} as Guest,
        rsvp: item.rsvps?.[0] || null,
        plus_one_data: item.plus_ones || null
      }))

      totalGuests.value = count || 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch guests'
      ElMessage.error(error.value)
      if (e instanceof Error && !authStore.isAuthenticated) {
        await router.push('/login')
      }
    } finally {
      loading.value = false
    }
  }

  async function createGuest(guest: Omit<Guest, 'guest_id' | 'auth_token' | 'created_by'>) {
    console.log('🎯 GuestStore: Starting guest creation')
    console.log('📋 Guest data:', guest)

    try {
      loading.value = true
      error.value = null

      if (!authStore.user?.id) {
        throw new Error('No authenticated user found')
      }

      console.log('� Creating guest record:', guest)

      const { data: guestResData, error: guestInsertError } = await supabase
        .from('guests')
        .insert([guest])
        .select()
        .single()

      console.log('📝 Guest creation response:', { guestResData, guestInsertError })

      // Handle response
      if (guestInsertError) {
        throw new Error(`Guest creation failed: ${guestInsertError.message}`)
      }

      if (!guestResData) {
        throw new Error('Guest creation failed: No data returned')
      }

      console.log('✅ Guest record created:', guestResData)

      console.log('🔄 Refreshing guest list')
      await fetchGuests()
      console.log('✨ Guest creation completed successfully')
      ElMessage.success('Guest added successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create guest'
      console.error('❌ Guest creation failed:', error.value)
      ElMessage.error(error.value)
      if (error.value.includes('session')) {
        console.log('🔑 Session error detected, redirecting to login')
        await router.push('/login')
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateGuest(guestId: string, updates: Partial<Guest>) {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('guests')
        .update(updates)
        .eq('guest_id', guestId)

      if (err) throw err
      else console.log('Updated guest:', data)

      await fetchGuests()
      ElMessage.success('Guest updated successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update guest'
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteGuest(guestId: string) {
    try {
      loading.value = true
      error.value = null

      const {data, error: err } = await supabase
        .from('guests')
        .delete()
        .eq('guest_id', guestId)

      if (err) throw err
      else console.log('Deleted guest:', data)

      await fetchGuests()
      ElMessage.success('Guest removed successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete guest'
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
    }
  }

  /* async function updateRSVP(rsvpId: string, updates: Partial<RSVP>) {
    console.log('🔄 updateRSVP: Starting update with:', { rsvpId, updates })
    try {
      loading.value = true
      error.value = null

      // If updating plus_one related fields to false/null, ensure we set both fields
      if (updates.plus_one_attending === false || updates.plus_one_name === null) {
        updates = {
          ...updates,
          plus_one_attending: null,
          plus_one_name: null
        }
      }

      console.log('📝 updateRSVP: Sending update to database')
      const { data, error: err } = await supabase
        .from('rsvps')
        .update(updates)
        .eq('rsvp_id', rsvpId)
        .select()

      if (err) {
        console.error('❌ updateRSVP: Database error:', err)
        throw err
      }

      console.log('✅ updateRSVP: Update successful:', data)
      await fetchGuests()
      ElMessage.success('RSVP updated successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update RSVP'
      console.error('❌ updateRSVP: Error:', error.value)
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
      console.log('🏁 updateRSVP: Operation completed')
    }
  } */

  async function createOrUpdateRSVP(guestId: string, status: AttendanceStatus, spouseAttending?: boolean) {
    console.log('🔄 createOrUpdateRSVP: Starting with:', { guestId, status })
    try {
      loading.value = true
      error.value = null

      // First try to find existing RSVP
      console.log('🔍 createOrUpdateRSVP: Checking for existing RSVP')
      const { data: existingRsvp, error: fetchError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('guest_id', guestId)
        .single()

      console.log('📋 createOrUpdateRSVP: Existing RSVP check result:', { existingRsvp, fetchError })

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('❌ createOrUpdateRSVP: Error fetching existing RSVP:', fetchError)
        throw fetchError
      }

      let result
      if (existingRsvp?.rsvp_id) {
        console.log('📝 createOrUpdateRSVP: Updating existing RSVP:', existingRsvp.rsvp_id)
        result = await supabase
          .from('rsvps')
          .update({
            attendance_status: status,
            ...(spouseAttending !== undefined ? { spouse_attending: spouseAttending } : {})
          })
          .eq('rsvp_id', existingRsvp.rsvp_id)
          .select()

        console.log('📋 createOrUpdateRSVP: Update result:', result)
      } else {
        console.log('📝 createOrUpdateRSVP: Creating new RSVP')
        result = await supabase
          .from('rsvps')
          .insert([{
            guest_id: guestId,
            attendance_status: status,
            spouse_attending: spouseAttending
          }])
          .select()

        console.log('📋 createOrUpdateRSVP: Insert result:', result)
      }

      if (result.error) {
        console.error('❌ createOrUpdateRSVP: Operation failed:', result.error)
        throw result.error
      }

      console.log('✅ createOrUpdateRSVP: Operation successful:', result.data)
      await fetchGuests()
      ElMessage.success('RSVP status updated successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update RSVP status'
      console.error('❌ createOrUpdateRSVP: Error:', error.value)
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
      console.log('🏁 createOrUpdateRSVP: Operation completed')
    }
  }

  return {
    guests,
    loading,
    error,
    totalGuests,
    hasGuests,
    filterAttendance,
    filterCategory,
    filteredGuests,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    // updateRSVP,
    createOrUpdateRSVP,
  }
})

/* 

// Debugging functions
  async function debugPermissions() {
  console.log('=== PERMISSION DEBUG ===')
  
  // Test your permission functions directly
  const { data: guestsPermission, error: guestsError } = await supabase
    .rpc('user_has_feature_access', { feature_name: 'view_all_guests' })
  
  const { data: rsvpPermission, error: rsvpError } = await supabase
    .rpc('user_has_feature_access', { feature_name: 'view_rsvp_responses' })
  
  console.log('view_all_guests permission:', guestsPermission, guestsError)
  console.log('view_rsvp_responses permission:', rsvpPermission, rsvpError)
  
  // Check user's staff profile
  const { data: profile, error: profileError } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
  
  console.log('User staff profile:', profile, profileError)
  
  // Check user's role features (if you can access this table)
  if (profile?.[0]?.role) {
    const { data: roleFeatures, error: roleError } = await supabase
      .from('role_features')
      .select('*, features(*)')
      .eq('role', profile[0].role)
    
    console.log('Role features:', roleFeatures, roleError)
  }
  
  console.log('=== END PERMISSION DEBUG ===')
}


  async function testSupportingTables() {
    console.log('=== SUPPORTING TABLES TEST ===')
  const userId = (await supabase.auth.getUser()).data.user?.id
  
  // Test staff_profiles access
  const { data: staffData, error: staffError } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', userId)
  console.log('staff_profiles:', staffData, staffError)
  
  // Test role_features access
  const { data: roleData, error: roleError } = await supabase
    .from('role_features')
    .select('*')
    .limit(1)
  console.log('role_features:', roleData, roleError)
  
  // Test features access
  const { data: featureData, error: featureError } = await supabase
    .from('features')
    .select('*')
    .limit(1)
  console.log('features:', featureData, featureError)
  console.log('=== END SUPPORTING TABLES TEST ===') 
}

    async function testSimpleFetch() {
        console.log('=== SIMPLE FETCH TEST ===')
  try {
    // Test just guests table
    const { data: guestsOnly, error: guestsError } = await supabase
      .from('guests')
      .select('guest_id, name')
      .limit(1)
    
    console.log('Guests only:', guestsOnly, guestsError)
    
    // Test just rsvps table  
    const { data: rsvpsOnly, error: rsvpsError } = await supabase
      .from('rsvps')
      .select('rsvp_id, attendance_status')
      .limit(1)
    
    console.log('RSVPs only:', rsvpsOnly, rsvpsError)
    
  } catch (e) {
    console.log('Test error:', e)
  }
  console.log('=== END SIMPLE FETCH TEST ===')
}

*/
