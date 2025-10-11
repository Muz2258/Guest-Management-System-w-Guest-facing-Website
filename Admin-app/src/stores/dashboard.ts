// stores/dashboard.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase' // Adjust import path as needed

export interface DashboardStats {
  // 1. Total guests invited breakdown
  total_guests_invited: number
  guests_rsvp: number
  guests_info_only: number
  guests_by_category: Record<string, number>
  guests_by_type: Record<string, number>
  guests_bride_side: number
  guests_groom_side: number
  guests_mutual: number
  guests_no_side: number
  
  // 2. Total attending breakdown
  primary_guests_attending: number
  spouses_attending: number
  plus_ones_attending: number
  total_attending_headcount: number
  
  // 3. Attendance breakdown
  guests_attending: number
  guests_not_attending: number
  guests_pending: number
  
  // 4 & 5. Invitation tracking
  invitations_sent: number
  invitations_not_sent: number
  
  // 6. Recent responses
  responses_last_7_days: number
  responses_last_30_days: number
  
  // Metadata
  last_updated: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Computed
  const responseRate = computed(() => {
    if (!stats.value || stats.value.guests_rsvp === 0) return 0
    const responded = stats.value.guests_attending + stats.value.guests_not_attending
    return Math.round((responded / stats.value.guests_rsvp) * 100)
  })

  const pendingInvitations = computed(() => {
    if (!stats.value) return 0
    return stats.value.invitations_not_sent
  })

  const guestsByCategory = computed(() => {
    if (!stats.value?.guests_by_category) return []
    return Object.entries(stats.value.guests_by_category).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  })

  const guestsByType = computed(() => {
    if (!stats.value?.guests_by_type) return []
    return Object.entries(stats.value.guests_by_type).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))
  })

  const attendanceBreakdown = computed(() => {
    if (!stats.value) return []
    return [
      { name: 'Attending', value: stats.value.guests_attending, type: 'success' as 'success' },
      { name: 'Not Attending', value: stats.value.guests_not_attending, type: 'danger' as 'danger' },
      { name: 'Pending', value: stats.value.guests_pending, type: 'warning' as 'warning' }
    ]
  })

  // Actions
  async function fetchStats(force = false) {
    // Only fetch if we haven't fetched yet, or if force refresh, or if data is older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (!force && lastFetched.value && lastFetched.value > fiveMinutesAgo && stats.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single()

      if (fetchError) throw fetchError

      stats.value = data
      lastFetched.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard stats'
      console.error('Error fetching dashboard stats:', err)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await fetchStats(true)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    stats,
    loading,
    error,
    lastFetched,
    
    // Computed
    responseRate,
    pendingInvitations,
    guestsByCategory,
    guestsByType,
    attendanceBreakdown,
    
    // Actions
    fetchStats,
    refresh,
    clearError
  }
})