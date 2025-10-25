import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";
import type { GuestName, GuestType } from "@/types/guest";
import { ElMessage } from "element-plus";

type PlusOne = {
  plus_one_id: string
  name: GuestName
  is_tagged: boolean
}

type Guest = {
  guest_id: string
  name: GuestName
  guest_type: GuestType
  spouse_attending: boolean
  is_tagged: boolean
  is_spouse_tagged?: boolean
  plus_ones: PlusOne[]
}

export const useCheckinStore = defineStore('checkin', () => {
  const guestList = ref<Guest[]>([])
  const searchResultList = ref<Guest[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchGuestList = async () => {
    error.value = null
    isLoading.value = true

    try {
      const {data, error } = await supabase
        .from('guests')
        .select('guest_id, guest_type, name, is_tagged, is_spouse_tagged, rsvps(spouse_attending), plus_ones(plus_one_id, name, is_tagged)')
        .order('name')

      if(error) {
        throw error
      }

      guestList.value = data.map(guest => {
        return {
          ...guest,
          spouse_attending: guest.rsvps[0]?.spouse_attending
        }
      })
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch guest list'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const updateCheckinStatus = async (id: string, status: boolean) => {
    try{
      const {data, error} = await supabase
        .from('guests')
        .update({is_tagged: status})
        .eq('guest_id', id)

      if(error) {
        throw error
      }

      return true
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update check-in status'
      console.error(error.value)
      ElMessage.error(error.value)
      return false
    }
  }

  const updateSpouseCheckinStatus = async (id: string, status: boolean) => {
    try{
      const {data, error} = await supabase
        .from('guests')
        .update({is_spouse_tagged: status})
        .eq('guest_id', id)

      if(error) {
        throw error
      }

      return true
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update spouse check-in status'
      console.error(error.value)
      ElMessage.error(error.value)
      return false
    }
  }

  const updatePlusOneCheckinStatus = async (id: string, status: boolean) => {
    try {
      const {data, error} = await supabase
        .from('plus_ones')
        .update({is_tagged: status})
        .eq('plus_one_id', id)

      if(error) {
        throw error
      }

      return true
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update plus one check-in status'
      console.error(error.value)
      ElMessage.error(error.value)
      return false
    }
  }

  const searchAttendingGuestByName = async (query: string) => {
    error.value = null
    isLoading.value = true

    try {
      const {data, error} = await supabase.rpc(
        'check_in_search_guests_by_name',
        {
          search_term: query
        }
      )

      if(error) throw error

      searchResultList.value = data
    }catch(err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch search results'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  return {
    guestList,
    searchResultList,
    isLoading,
    fetchGuestList,
    updateCheckinStatus,
    updateSpouseCheckinStatus,
    updatePlusOneCheckinStatus,
    searchAttendingGuestByName
  }
})