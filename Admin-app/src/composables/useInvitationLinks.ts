// composables/useInvitationLinks.ts
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

interface SyncSummary {
  guestsNeedingLinks: number
  linksFromShortIo: number
  successfulMatches: number
  databaseUpdates: number
  failedUpdates: number
  unmatchedLinks: number
}

interface SyncResult {
  success: boolean
  totalGuests: number
  totalLinks: number
  matched: number
  updated: number
  failed: number
  notMatched: number
  results: any[]
  notMatchedLinks: any[]
  summary: SyncSummary
  error?: string
}

export const useInvitationLinks = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const syncResult = ref<SyncResult | null>(null)

  const syncInvitationLinks = async () => {
    loading.value = true
    error.value = null
    syncResult.value = null

    try {
      console.log('🔄 Starting invitation link sync...')

      const { data, error: invokeError } = await supabase.functions.invoke<SyncResult>(
        'sync_invitation_links'
      )

      if (invokeError) {
        throw new Error(invokeError.message)
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Sync failed')
      }

      syncResult.value = data
      console.log('✅ Sync completed successfully:', data?.summary)

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync invitation links'
      error.value = errorMessage
      console.error('❌ Sync error:', errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    syncResult,
    syncInvitationLinks
  }
}