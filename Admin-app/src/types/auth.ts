export type FeaturePermission = 
  | 'create_guests'
  | 'edit_guest_details'
  | 'delete_guests'
  | 'view_all_guests'
  | 'edit_rsvp_responses'
  | 'manual_rsvp_entry'
  | 'view_rsvp_responses'

export interface UserStaffProfile {
  id: string
  user_id: string
  is_active: boolean
  features: FeaturePermission[]
  created_at: string
  updated_at: string
}

export interface FeatureAccess {
  canCreateGuests: boolean
  canEditGuests: boolean
  canDeleteGuests: boolean
  canViewGuests: boolean
  canManageRSVPs: boolean
  canViewRSVPs: boolean
}
