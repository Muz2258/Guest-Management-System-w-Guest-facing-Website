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
      // Validation: Check if table has available capacity before attempting assignment
      const table = seatingArrangement.value.find(t => t.table_id === tableId)
      if (table) {
        const requiredSeats = assignSpouse ? 2 : 1
        if (table.available_count < requiredSeats) {
          throw new Error(`Table ${table.table_number} does not have enough available seats (needs ${requiredSeats}, has ${table.available_count})`)
        }
      }

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
      throw err // Re-throw to allow caller to handle
    }finally {
      isLoading.value = false
    }
  }

  const assignPlusOneToTable = async (plusOneId: string, tableId: string) => {
    isLoading.value = true
    error.value = null

    try{
      // Validation: Check if table has available capacity
      const table = seatingArrangement.value.find(t => t.table_id === tableId)
      if (table && table.available_count < 1) {
        throw new Error(`Table ${table.table_number} is at full capacity`)
      }

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
      throw err // Re-throw to allow caller to handle
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

  const swapGuestsBetweenTables = async (
    sourceAssignmentId: string,
    targetAssignmentId: string
  ) => {
    isLoading.value = true
    error.value = null

    try {
      // Validation: Ensure both assignments exist in current seating arrangement
      let sourceFound = false
      let targetFound = false
      
      seatingArrangement.value.forEach(table => {
        table.assignments.forEach(assignment => {
          if (assignment.assignment_id === sourceAssignmentId) sourceFound = true
          if (assignment.assignment_id === targetAssignmentId) targetFound = true
        })
      })
      
      if (!sourceFound || !targetFound) {
        throw new Error('One or both assignments not found in current seating arrangement')
      }

      // fetch current table ids for both assignments
      const { data: sourceData, error: srcErr } = await supabase
        .from('seat_assignments')
        .select('table_id')
        .eq('seat_assignment_id', sourceAssignmentId)
        .single()

      if (srcErr) throw srcErr

      const { data: targetData, error: tgtErr } = await supabase
        .from('seat_assignments')
        .select('table_id')
        .eq('seat_assignment_id', targetAssignmentId)
        .single()

      if (tgtErr) throw tgtErr

      const sourceTableId = sourceData?.table_id
      const targetTableId = targetData?.table_id

      if (!sourceTableId || !targetTableId) {
        throw new Error('Could not determine table ids for assignments')
      }

      // Additional validation: Ensure we're not swapping within the same table
      if (sourceTableId === targetTableId) {
        throw new Error('Cannot swap guests within the same table')
      }

      // Use a workaround: Remove both assignments and recreate them with swapped table_ids
      // This avoids capacity constraint violations during the swap
      
      // Step 1: Get full assignment details before deletion
      const { data: sourceFullData, error: srcFullErr } = await supabase
        .from('seat_assignments')
        .select('*')
        .eq('seat_assignment_id', sourceAssignmentId)
        .single()

      if (srcFullErr) throw srcFullErr

      const { data: targetFullData, error: tgtFullErr } = await supabase
        .from('seat_assignments')
        .select('*')
        .eq('seat_assignment_id', targetAssignmentId)
        .single()

      if (tgtFullErr) throw tgtFullErr

      // Step 2: Delete both assignments
      const { error: delErr1 } = await supabase
        .from('seat_assignments')
        .delete()
        .eq('seat_assignment_id', sourceAssignmentId)

      if (delErr1) throw delErr1

      const { error: delErr2 } = await supabase
        .from('seat_assignments')
        .delete()
        .eq('seat_assignment_id', targetAssignmentId)

      if (delErr2) throw delErr2

      // Step 3: Recreate with swapped table_ids
      const { error: insertErr1 } = await supabase
        .from('seat_assignments')
        .insert({
          ...sourceFullData,
          seat_assignment_id: sourceAssignmentId,
          table_id: targetTableId,
          assigned_at: new Date().toISOString()
        })

      if (insertErr1) throw insertErr1

      const { error: insertErr2 } = await supabase
        .from('seat_assignments')
        .insert({
          ...targetFullData,
          seat_assignment_id: targetAssignmentId,
          table_id: sourceTableId,
          assigned_at: new Date().toISOString()
        })

      if (insertErr2) throw insertErr2

      // Refresh seating chart
      await fetchSeatingChart()
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to swap guests'
      console.error(error.value)
      ElMessage.error(error.value)
      return { success: false, message: error.value }
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
    movePlusOneToTable,
    swapGuestsBetweenTables
  }
})