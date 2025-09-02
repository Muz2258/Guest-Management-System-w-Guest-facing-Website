export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friends' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information-only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'

export interface Guest {
  guest_id: string
  name: string
  phone: string
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  invitation_type: InvitationType
  invitation_method: InvitationMethod
  auth_token: string
  created_by: string
}

export interface RSVP {
  rsvp_id: string
  guest_id: string
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
  plus_one_attending: boolean | null
  plus_one_name: string | null
}

export interface GuestWithRSVP extends Guest {
  rsvp?: RSVP
}
