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
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(50)

  // Computed
  const hasGuests = computed(() => guests.value.length > 0)

  // Actions
  async function fetchGuests(page?: number, limit?: number, filters?: { [k: string]: any } | undefined) {
    try {
      loading.value = true
      // error.value = null

      const limitVal = (typeof limit === 'number' && limit > 0) ? limit : pageSize.value
      const pageNum = (typeof page === 'number' && page > 0) ? page : currentPage.value
      const from = (pageNum - 1) * limitVal
      const to = from + limitVal - 1
      
      const buildQuery = (viewName: string) => supabase
        .from(viewName)
        .select('*', { count: 'exact' })
        .order('created_at', {ascending: false})
        .order('guest_id', {ascending: false})
        .range(from, to)

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
          } else {
            // Special-case boolean-ish strings
            if (value === 'true' || value === true) query = query.eq(col, true)
            else if (value === 'false' || value === false) query = query.eq(col, false)
            else query = query.eq(col, value)
          }
        }

        // map filter keys to view columns
        if (filters.guest_category) applyFilter('guest_category', filters.guest_category)
        if (filters.rsvp_status) applyFilter('rsvp_status', filters.rsvp_status)
        if (filters.family_side) applyFilter('family_side', filters.family_side)
        if (filters.invitation_type) applyFilter('invitation_type', filters.invitation_type)
        if (filters.plus_one_eligibility) applyFilter('plus_one_eligibility', filters.plus_one_eligibility)
        if (filters.invite_sent) applyFilter('invite_sent', filters.invite_sent)
        if (filters.spouse_rsvp_status) applyFilter('spouse_rsvp_status', filters.spouse_rsvp_status)
        if (filters.guest_type) applyFilter('guest_type', filters.guest_type)
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

  const searchGuests = async (query: string) => {}

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

      await fetchGuests(currentPage.value, pageSize.value)

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

  const bulkUpdate = async (table: string, data: Array<{}>, update: any) => {
    console.log('Perfoming bulk action for:', data, 'on table:', table)
    try{
      const {error} = await supabase
        .from(table)
        .update(update)
        .in('guest_id', data)

      if(error) {
        console.log(error)
        throw error
      }

      await fetchGuests(currentPage.value, pageSize.value)
    }catch (err) {
      console.log(err)
      error.value = err instanceof Error ? err.message : 'Failed bulk operation'
      console.error('Could not perform operation:', error.value)
      ElMessage.error(error.value)
    }
  }

  const bulkDelete = async (ids: string[]) => {
    console.log('Perfoming bulk delet for:', ids, 'on guest table')
    try{
      const {error} = await supabase
        .from('guests')
        .delete()
        .in('guest_id', ids)

      if(error) {
        console.log(error)
        throw error
      }

      await fetchGuests(currentPage.value, pageSize.value)
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed bulk operation'
      console.error('Could not perform operation:', error.value)
      ElMessage.error(error.value)
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
    deletePlusOne,
    bulkUpdate,
    bulkDelete
  }
})
