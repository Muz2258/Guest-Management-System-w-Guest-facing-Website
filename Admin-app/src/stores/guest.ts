import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'
import type { Guest, RSVP, GuestWithRSVP, GuestCategory, AttendanceStatus } from '@/types/guest'
import { ElMessage } from 'element-plus'

export const useGuestStore = defineStore('guest', () => {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const guests = ref<GuestWithRSVP[]>([])
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
      filtered = filtered.filter(guest => guest.guest_category === filterCategory.value)
    }

    return filtered
  })

  // Actions
  async function fetchGuests(page = 1, limit = 10) {
    try {
      loading.value = true
      error.value = null

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: err, count } = await supabase
        .from('guests')
        .select('*, rsvps(*)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (err) throw err

      guests.value = data.map(item => ({
        ...item,
        rsvp: item.rsvps?.[0] || null
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

  async function updateRSVP(rsvpId: string, updates: Partial<RSVP>) {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('rsvps')
        .update(updates)
        .eq('rsvp_id', rsvpId)

      if (err) throw err

      await fetchGuests()
      ElMessage.success('RSVP updated successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update RSVP'
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
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
    updateRSVP,
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
