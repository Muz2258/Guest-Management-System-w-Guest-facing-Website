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

  // Ensure session is valid before any operation
  const ensureAuth = async () => {
    if (!authStore.isAuthenticated) {
      error.value = 'Authentication required'
      await router.push('/login')
      throw new Error('Authentication required')
    }
    return authStore.user?.id
  }

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
      await ensureAuth()
      loading.value = true
      error.value = null

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: err, count } = await supabase
        .from('guests')
        .select('*, rsvps(*)', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (err) {
        if (err.message?.includes('JWT')) {
          throw new Error('Session expired. Please login again.')
        }
        throw err
      }

      guests.value = data.map(item => ({
        ...item,
        rsvp: item.rsvps?.[0] || null
      }))

      totalGuests.value = count || 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch guests'
      ElMessage.error(error.value)
      if (error.value.includes('session')) {
        await router.push('/login')
      }
    } finally {
      loading.value = false
    }
  }

  async function createGuest(guest: Omit<Guest, 'guest_id' | 'auth_token' | 'created_by' | 'created_at' | 'updated_at'>) {
    try {
      const userId = await ensureAuth()
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('guests')
        .insert([{
          ...guest,
          created_by: userId
        }])
        .select()
        .single()

      if (err) {
        if (err.message?.includes('JWT')) {
          throw new Error('Session expired. Please login again.')
        }
        throw err
      }

      // Create initial RSVP record
      await supabase
        .from('rsvps')
        .insert([{
          guest_id: data.guest_id,
          attendance_status: 'pending',
          spouse_attending: null,
          plus_one_attending: null,
          plus_one_name: null
        }])

      await fetchGuests()
      ElMessage.success('Guest added successfully')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create guest'
      ElMessage.error(error.value)
      if (error.value.includes('session')) {
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

      const { error: err } = await supabase
        .from('guests')
        .update(updates)
        .eq('guest_id', guestId)

      if (err) throw err

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

      const { error: err } = await supabase
        .from('guests')
        .delete()
        .eq('guest_id', guestId)

      if (err) throw err

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
    updateRSVP
  }
})
