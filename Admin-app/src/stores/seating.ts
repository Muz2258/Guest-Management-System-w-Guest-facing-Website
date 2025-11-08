import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/utils/supabase";
import { ElMessage } from "element-plus";

import type { Assignment, SeatingTable, UnassignedGuest } from "@/types/seating";

export const useSeatingStore = defineStore('seating', () => {
  const seatingArrangement = ref<SeatingTable[]>([])
  const unassignedGuests = ref<UnassignedGuest[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchSeatingChart = async () => {
    isLoading.value = true
    error.value = null

    try {
      const {data, error} = await supabase
        .rpc('admin_get_complete_seating_chart')

      if (error) throw error

      seatingArrangement.value = data || []
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch seating chart'
      ElMessage.error(error.value)
      console.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const createTable = async (tableData: Partial<{
    table_number: string
    table_name: string
    capacity: number
    display_order: number
    notes: string
  }>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          ...tableData,
          display_order: tableData.display_order ?? seatingArrangement.value.length + 1
        })

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create table'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const updateTable = async (tableId: string, updates: Partial<{
    table_number: string
    table_name: string
    capacity: number
    display_order: number
    notes: string
  }>) => {
    isLoading.value = true
    error.value = null

    try {
      const {error} = await supabase
        .from('tables')
        .update(updates)
        .eq('table_id', tableId)

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update table'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const deleteTable = async (tableId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error } = await supabase
       .from('tables')
       .delete()
       .eq('table_id', tableId)

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete table'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const assignGuestToTable = async (guestId: string, tableId: string, assignSpouse: boolean = true) => {
    isLoading.value = true
    error.value = null

    try{
      const {data, error} = await supabase
        .rpc('admin_assign_guest_to_table', {
          p_guest_id: guestId,
          p_table_id: tableId,
          p_assign_spouse: assignSpouse
        })

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to assign guest'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const assignPlusOneToTable = async (plusOneId: string, tableId: string) => {
    isLoading.value = true
    error.value = null

    try{
      const {data, error} = await supabase
        .rpc('admin_assign_plus_one_to_table', {
          p_plus_one_id: plusOneId,
          p_table_id: tableId
        })

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to assign plus one'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const removeAssignment = async (id: string) => {
    isLoading.value = true
    error.value = null

    try{
      const { error } = await supabase
        .from('seat_assignments')
        .delete()
        .eq('seat_assignment_id', id)

      if (error) throw error

      await fetchSeatingChart()
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove assignment'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const getAssignmentByGuestId = (id: string) => {
    const assignments: Assignment[] = []

    seatingArrangement.value.forEach(table => {
      table.assignments.forEach(assignment => {
        if(assignment.assignment_type !== 'plus_one' && assignment.id === id) {
          assignments.push(assignment)
        }
      })
    })

    return assignments
  }

  const getAssignmentByPlusOneId = (id: string): Assignment | null => {
    let plusOneAssignment: Assignment | null = null

    seatingArrangement.value.forEach(table => {
      table.assignments.forEach(assignment => {
        if(assignment.assignment_type === 'plus_one' && assignment.id === id) {
          plusOneAssignment = assignment
        }
      })
    })

    return plusOneAssignment
  }

  const moveGuestToTable = async (guestId: string, newTableId: string, assignSpouse: boolean = true) => {
    isLoading.value = true
    error.value = null

    try {
      const assignments = getAssignmentByGuestId(guestId)

      if(assignments.length === 0) {
        console.error('No assignment associated with guestId:', guestId, 'found')
        return
      }

      for (const assignment of assignments) {
        await removeAssignment(assignment.assignment_id)
      }

      await assignGuestToTable(guestId, newTableId, assignSpouse)
    }catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move guest to new table'
      console.error(error.value)
      ElMessage.error(error.value)
    }finally {
      isLoading.value = false
    }
  }

  const movePlusOneToTable = async (plusOneId: string, newTableId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const assignment = getAssignmentByPlusOneId(plusOneId)

      if (!assignment) {
        error.value = 'No assignment with plus one id: ' + plusOneId + ' found'
        console.error(error.value)
        ElMessage.error(error.value)
        return
      }

      await removeAssignment(assignment.assignment_id)

      await assignPlusOneToTable(plusOneId, newTableId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move plus one to new table'
      console.error(error.value)
      ElMessage.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  const fetchUnassignedGuests = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('admin_get_unassigned_guests')

      if (fetchError) throw fetchError

      unassignedGuests.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch unassigned guests'
      ElMessage.error(error.value)
      console.error(error.value)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // States
    seatingArrangement,
    unassignedGuests,
    isLoading,

    // Actions
    fetchSeatingChart,
    fetchUnassignedGuests,
    createTable,
    updateTable,
    deleteTable,
    assignGuestToTable,
    assignPlusOneToTable,
    removeAssignment,
    moveGuestToTable,
    movePlusOneToTable
  }
})