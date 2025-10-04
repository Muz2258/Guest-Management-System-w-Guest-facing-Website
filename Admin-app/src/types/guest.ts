export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friend' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information_only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'
export type PlusOneType = 'spouse' | 'others'

export interface GuestName {
  title: []
  first_name: string
  middle_name?: string
  last_name?: string
  suffixes?: []
}

export interface Guest {
  guest_id: string
  name: GuestName
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  plus_one_limit: number
  invitation_type: InvitationType
  invitation_method: InvitationMethod
  auth_token: string
}

export interface RSVP {
  rsvp_id: string
  guest_id: string
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
}

export interface PlusOne {
  plus_one_id: string
  name: GuestName
  type: PlusOneType
}

export interface PlusOneData {
  plus_ones: PlusOne[]
  plus_one_limit: number
  plus_one_remaining: number
}

export interface CompleteGuestData {
  guest: Guest
  rsvp?: RSVP
  plus_one_data: PlusOneData
}
