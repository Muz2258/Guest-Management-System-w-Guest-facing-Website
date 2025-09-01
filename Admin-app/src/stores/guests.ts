import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Guest } from '../types'

export const useGuestStore = defineStore('guests', () => {
  const guests = ref<Guest[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchGuests = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase
      //   .from('guests')
      //   .select('*')
      // if (error) throw error
      // guests.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  const addGuest = async (guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: Implement Supabase insert
      // const { data, error } = await supabase
      //   .from('guests')
      //   .insert(guest)
      //   .select()
      // if (error) throw error
      // guests.value.push(data[0])
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  return {
    guests,
    isLoading,
    error,
    fetchGuests,
    addGuest
  }
})
