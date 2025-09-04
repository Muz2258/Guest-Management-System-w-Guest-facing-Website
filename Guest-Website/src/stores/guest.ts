import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { ref } from 'vue'
import type { Guest, RSVP, GuestWithRSVP, GuestJoinResponse } from '@/types/guest'

export const useGuestStore = defineStore('guest', () => {
    const guest = ref<GuestWithRSVP | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchGuestByToken = async (token: string) => {
      console.log('🔄 Starting guest fetch process...', { token })
      loading.value = true
      error.value = null
      
      try {
        console.log('📡 Sending request to Supabase...')
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

        guest.value = transformGuestInfo(guestInfo)

        console.log('✅ Guest data transformed successfully:', guest.value)
      } catch (e) {
        console.error('❌ Error in fetchGuestByToken:', e)
        error.value = e instanceof Error ? e.message : 'An error occurred'
        guest.value = null
      } finally {
        console.log('🏁 Guest fetch process completed', { 
          success: !!guest.value,
          hasError: !!error.value
        })
        loading.value = false
      }
    }

  function setError(message: string | null) {
    console.error('⚠️ Setting error:', message)
    error.value = message
  }

  return {
    guest,
    error,
    fetchGuestByToken,
    setError
  }
})
