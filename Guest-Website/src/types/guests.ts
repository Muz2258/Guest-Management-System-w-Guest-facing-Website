export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friend' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information_only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'
export type GiftType = 'monetary' | 'item'

export interface Guest {
  guest_id: string
  first_name: string
  last_name: string
  email: string | null
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  invitation_type: InvitationType
  invitation_method: InvitationMethod
}

export interface RSVP {
  rsvp_id: string
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
  plus_one_attending: boolean | null
  plus_one_name: string | null
  submitted_at: string | null
  updated_at: string | null
}

export interface Permissions {
  can_rsvp: boolean
  can_bring_plus_one: boolean
  is_couple: boolean
  token_expires_at: string | null
  has_goodwill: boolean
}

export interface GoodWillMessage {
  message_id: string
  guest_id: string
  message_text: string
  is_approved: boolean
  created_at: string
  updated_at: string | null
  approved_at: string | null
  approved_by: string | null
  has_message: boolean
}

export interface GiftItem {
  gift_name: string
  gift_description: string
  gift_image_url: string
  gift_link: string
}

export interface Gift {
  gift_type: GiftType
  gift_amount: number | null
  gift_details: GiftItem | null
  guest_email: string | null
}

export interface GuestData {
  auth_token: string
  authenticated: boolean
  guest: Guest
  permissions: Permissions
}