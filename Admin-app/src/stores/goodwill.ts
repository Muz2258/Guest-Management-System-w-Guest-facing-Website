import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase'

export interface GoodwillMessage {
  guest_id: string
  message_id: string
  guest_name: {
    first_name: string
    last_name?: string
    middle_name?: string
    titles?: string[]
    suffixes?: string[]
  }
  message: string
  is_approved: boolean
  created_at: string
  approved_by: string | null
}

export const useGoodwillStore = defineStore('goodwill', () => {
  // State
  const messages = ref<GoodwillMessage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // Computed
  const approvedMessages = computed(() => 
    messages.value.filter(msg => msg.is_approved)
  )

  const pendingMessages = computed(() => 
    messages.value.filter(msg => !msg.is_approved)
  )

  const totalMessages = computed(() => messages.value.length)

  const approvedCount = computed(() => approvedMessages.value.length)

  const pendingCount = computed(() => pendingMessages.value.length)

  // Helper to format guest name
  const formatGuestName = (guestName: GoodwillMessage['guest_name']): string => {
    const parts = []
    
    if (guestName.titles?.length) {
      parts.push(guestName.titles.join(' '))
    }
    
    parts.push(guestName.first_name)
    
    if (guestName.middle_name) {
      parts.push(guestName.middle_name)
    }
    
    if (guestName.last_name) {
      parts.push(guestName.last_name)
    }
    
    if (guestName.suffixes?.length) {
      parts.push(guestName.suffixes.join(', '))
    }
    
    return parts.join(' ')
  }

  // Actions
  async function fetchMessages(force = false) {
    // Cache for 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    if (!force && lastFetched.value && lastFetched.value > twoMinutesAgo && messages.value.length > 0) {
      return
    }

    console.log('Fetching new goodwill message data')
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('goodwill_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      messages.value = data || []
      lastFetched.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch goodwill messages'
      console.error('Error fetching goodwill messages:', err)
    } finally {
      loading.value = false
    }
  }

  async function approveMessage(messageId: string) {
    try {
      const { error: updateError } = await supabase
        .from('goodwill_messages')
        .update({ is_approved: true })
        .eq('message_id', messageId)

      if (updateError) throw updateError

      // Update local state
      const message = messages.value.find(m => m.message_id === messageId)
      if (message) {
        message.is_approved = true
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve message'
      console.error('Error approving message:', err)
      return false
    }
  }

  async function unapproveMessage(messageId: string) {
    try {
      const { error: updateError } = await supabase
        .from('goodwill_messages')
        .update({ is_approved: false })
        .eq('message_id', messageId)

      if (updateError) throw updateError

      // Update local state
      const message = messages.value.find(m => m.message_id === messageId)
      if (message) {
        message.is_approved = false
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unapprove message'
      console.error('Error unapprove message:', err)
      return false
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('goodwill_messages')
        .delete()
        .eq('message_id', messageId)

      if (deleteError) throw deleteError

      // Remove from local state
      messages.value = messages.value.filter(m => m.message_id !== messageId)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete message'
      console.error('Error deleting message:', err)
      return false
    }
  }

  async function refresh() {
    await fetchMessages(true)
  }

  function clearError() {
    error.value = null
  }

  function getMessageById(messageId: string) {
    return messages.value.find(m => m.message_id === messageId)
  }

  return {
    // State
    messages,
    loading,
    error,
    lastFetched,
    
    // Computed
    approvedMessages,
    pendingMessages,
    totalMessages,
    approvedCount,
    pendingCount,
    
    // Actions
    fetchMessages,
    approveMessage,
    unapproveMessage,
    deleteMessage,
    refresh,
    clearError,
    getMessageById,
    formatGuestName
  }
})