export type AssignmentType = 'primary_guest' | 'spouse' | 'plus_one'

export interface Assignment {
  assignment_id: string
  assignment_type: AssignmentType
  id: string  // guest_id for primary_guest/spouse, plus_one_id for plus_one
  name: {
    first_name: string
    last_name?: string
    middle_name?: string
    titles?: string[]
    suffixes?: string[]
  }
  guest_category?: string
  family_side?: string
  assigned_at: string
  notes?: string
}

export interface SeatingTable {
  table_id: string
  table_number: string
  table_name?: string
  capacity: number
  display_order: number
  assigned_count: number
  available_count: number
  notes?: string
  assignments: Assignment[]
}

export interface AssignGuestResult {
  success: boolean
  guest_id: string
  table_id: string
  assignments_created: number
  primary_assigned: boolean
  spouse_assigned: boolean
}

export interface AssignPlusOneResult {
  success: boolean
  plus_one_id: string
  table_id: string
}

export interface RemoveAssignmentsResult {
  success: boolean
  guest_id: string
  assignments_removed: number
}

export interface UnassignedGuest {
  id: string
  name: string
  type: AssignmentType
  has_spouse: boolean
  category: string | null
  family_side: string | null
}