import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from './auth'
import { useRouter } from 'vue-router'
import type { Guest, RSVP, CompleteGuestData, GuestCategory, AttendanceStatus, GuestTableRow, PlusOne } from '@/types/guest'
import { ElMessage } from 'element-plus'

export const useGuestStore = defineStore('guest', () => {
  const authStore = useAuthStore()
  const router = useRouter()
  
  const guest = ref<CompleteGuestData | null>(null)
  const guests = ref<GuestTableRow[]>([])
  const loading = ref(false)
  const guestLoading = ref(false)
  const error = ref<string | null>(null)
  const totalGuests = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(50)

  // Computed
  const hasGuests = computed(() => guests.value.length > 0)

  // Filters
  const filterAttendance = ref<AttendanceStatus | 'all'>('all')
  const filterCategory = ref<GuestCategory | 'all'>('all')

  const filteredGuests = computed(() => {
    let filtered = [...guests.value]

    if (filterAttendance.value !== 'all') {
      filtered = filtered.filter(guest => guest.rsvp_status === filterAttendance.value)
    }

    if (filterCategory.value !== 'all') {
      filtered = filtered.filter(guest => guest.guest_category === filterCategory.value)
    }

    return filtered
  })

  // Actions
  async function fetchGuests(page = 1, limit = 50, filters?: { [k: string]: any } | undefined) {
    try {
      loading.value = true
      // error.value = null

      const from = (page - 1) * limit
      const to = from + limit - 1
      // Build base query from view (try vw_guests_list and fallback to vw_guest_list)
      const buildQuery = (viewName: string) => supabase
        .from(viewName)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      console.log('fetchGuests called with filters:', filters)

      let query: any = buildQuery('vw_guest_list')

      // Apply optional filters. Support arrays (use IN) or single values (use EQ).
      if (filters) {
        const applyFilter = (col: string, value: any) => {
          if (value === undefined || value === null) return
          if (Array.isArray(value)) {
            const vals = value.filter(v => v !== undefined && v !== null && v !== '' )
            if (vals.length === 0) return
            query = query.in(col, vals)
          } else if (value === 'all') {
            // skip
          } else {
            // Special-case boolean-ish strings
            if (value === 'true' || value === true) query = query.eq(col, true)
            else if (value === 'false' || value === false) query = query.eq(col, false)
            else query = query.eq(col, value)
          }
        }

        // map filter keys to view columns
        if (filters.guest_category) applyFilter('guest_category', filters.guest_category)
        if (filters.attendance_status) applyFilter('rsvp_status', filters.attendance_status)
        if (filters.family_side) applyFilter('family_side', filters.family_side)
        if (filters.invitation_type) applyFilter('invitation_type', filters.invitation_type)
        if (filters.plus_one_eligibility) applyFilter('plus_one_eligibility', filters.plus_one_eligibility)
        if (typeof filters.invite_sent !== 'undefined' && filters.invite_sent !== 'all') applyFilter('invite_sent', filters.invite_sent)
      }

      let data: any = null
      let err: any = null
      let count: any = null

      try {
        const res = await query
        data = res.data
        err = res.error
        count = res.count
        if (err) throw err
      } catch (e) {
        console.warn('Primary view query failed, attempting fallback view vw_guest_list:', e)
        // try fallback
        try {
          query = buildQuery('vw_guest_list')
          const res2 = await query
          data = res2.data
          err = res2.error
          count = res2.count
          if (err) throw err
        } catch (e2) {
          // rethrow original or fallback error
          throw e2
        }
      }

      console.log('Fetched guests:', { data, count })
      guests.value = (data || []).map((guest: any) => ({
        ...guest
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

  const fetchGuestData = async (guestID: string) => {
    console.log('Initiating guest data fetching sequence for:', guestID)

    try {
      guestLoading.value = true

      const { data: guestData, error: fetchError } = await supabase
        .from('guests')
        .select('*, rsvps(*), gifts(*), plus_ones(*), goodwill_messages(*)')
        .eq('guest_id', guestID)
        .single()

      if (fetchError) {
        error.value = `Failed to fetch guest data: ${fetchError.message}`
        console.error(error.value)
        return false
      }

      guest.value = {
        guest: { ...guestData },
        rsvp: guestData.rsvps?.[0],
        plus_ones: guestData.plus_ones,
        gifts: guestData.gifts,
        goodwill_messages: guestData.goodwill_messages
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch guest data'
      console.error('❌ fetchGuestData error:', error.value)
    } finally {
      guestLoading.value = false
    }
  }

  async function createGuest(guest: Omit<Guest, 'guest_id' | 'auth_token' | 'created_at' | 'updated_at' | 'invitation_link' | 'created_by'>) {
    console.log('🎯 GuestStore: Starting guest creation')

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

      // Handle response
      if (guestInsertError) {
        throw new Error(`Guest creation failed: ${guestInsertError.message}`)
      }

      if (!guestResData) {
        throw new Error('Guest creation failed: No data returned')
      }
      
      console.log('✅ Guest record created:', guestResData)

      await generateInvitationLink(guestResData)

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

      await fetchGuests(currentPage.value, pageSize.value)
      ElMessage.success('Guest removed successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete guest'
      ElMessage.error(error.value)
      throw e
    } finally {
      loading.value = false
    }
  }

  const generateInvitationLink = async (guest: GuestTableRow) => {
    console.log('🔗 Generating invitation link for guest:', guest)

    const guestId = guest.guest_id
    const authToken = guest.auth_token
    const guestName = guest.name
    const invitationType = guest.invitation_type

    if (!guestId || !authToken) {
      console.warn('⚠️ Missing guest ID or auth token, cannot generate link')
      return
    }

    try {
      console.log('🌐 Invoking invitation link generator function')

      const {data: linkResult, error: linkError } = await supabase.functions.invoke('invitation_link_generator', {
        body: {
          guest_id: guestId,
          auth_token: authToken,
          invitation_type: invitationType,
          name: guestName
        }
      })

      if (linkError) {
        console.error('❌ Failed to generate invitation link:', linkError)
        throw linkError
      }

      console.log('✅ Invitation link generated successfully:', linkResult)
    } catch (e) {
      console.error('❌ Error generating invitation link:', e)
    }
  }

  const markInviteAsSent = async (newVal: boolean, guestID: string) => {
    console.log('✉️ Marking invitation as sent for guest:', guest)

    try {
      const { data, error: err } = await supabase
        .from('rsvps')
        .update({ invite_sent: newVal })
        .eq('guest_id', guestID)

      if (err) throw err
      console.log('✅ Invitation marked as sent:', data)
    } catch (e) {
      console.error('❌ Error marking invitation as sent:', e)
    }
  }

  async function updateRSVP(guestId: string, updates: Partial<RSVP>) {
    console.log('🔄 updateRSVP: Starting update with:', { guestId, updates })
    try {
      loading.value = true
      error.value = null

      console.log('📝 updateRSVP: Sending update to database')
      const { data, error: err } = await supabase
        .from('rsvps')
        .update(updates)
        .eq('guest_id', guestId)
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
  }

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
          .eq('guest_id', existingRsvp.guest_id)
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

  const createOrUpdatePlusOne = async (plusOnes: Partial<PlusOne[]>) => {
    console.log('Initializing plus one update with:', plusOnes)

    try{
      const {error: updateError} = await supabase
        .from('plus_ones')
        .upsert(plusOnes, {onConflict: 'plus_one_id'})

      if(updateError) {
        console.error('Failed to create or update plus one')
        throw updateError
      }

      console.log('Plus one updated successfully')
      // If the payload contains a guest_id, refresh that guest's full data so
      // the locally-stored `guest.plus_ones` receive the DB-assigned plus_one_id
      let guestIdForRefresh: string | null = null
      if (Array.isArray(plusOnes) && plusOnes.length > 0) {
        const first = (plusOnes as any[])[0]
        if (first && first.guest_id) guestIdForRefresh = String(first.guest_id)
      }

      if (guestIdForRefresh) {
        try {
          await fetchGuestData(guestIdForRefresh)
        } catch (e) {
          console.warn('Failed to refresh guest data after plus_one upsert:', e)
        }
      }

      // Also refresh the guest list (table view)
      await fetchGuests(currentPage.value, pageSize.value);
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update plus one record'
      console.error('❌ createOrUpdatePlusOne: Error:', error.value)
      ElMessage.error(error.value)
      throw err
    }
  }

  const deletePlusOne = async (id: string) => {
    console.log('Starting plus one delet action for:', id)

    try {
      const {error: actionError} = await supabase
        .from('plus_ones')
        .delete()
        .eq('plus_one_id', id)

      if(actionError) {
        console.error('Could not perform delete action', actionError.message)
        throw actionError
      }

      // Refresh the guest list
      await fetchGuests(currentPage.value, pageSize.value)

      // If we have a loaded guest in the store, refresh its detail so the local
      // plus_ones array stays in sync with the DB
      try {
        if (guest.value && guest.value.guest && guest.value.guest.guest_id) {
          await fetchGuestData(guest.value.guest.guest_id)
        }
      } catch (e) {
        console.warn('Failed to refresh guest data after plus_one delete:', e)
      }
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete plus one record'
      console.error('❌ deletePlusOne: Error:', error.value)
      ElMessage.error(error.value)
      throw err
    }
  }

  return {
    // States
    guest,
    guests,
    loading,
    error,
    totalGuests,
    hasGuests,
    currentPage,
    pageSize,

    // Filters
    filterAttendance,
    filterCategory,
    filteredGuests,

    // Actions
    fetchGuestData,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    updateRSVP,
    createOrUpdateRSVP,
    generateInvitationLink,
    markInviteAsSent,
    createOrUpdatePlusOne,
    deletePlusOne
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
