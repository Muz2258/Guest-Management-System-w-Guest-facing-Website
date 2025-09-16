export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friend' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information_only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'
export type GiftType = 'monetary' | 'item'

export interface Guest {
  first_name: string
  last_name: string
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  invitation_type: InvitationType
}

export interface RSVP {
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
  plus_one_attending: boolean | null
  plus_one_name: string | null
}

export interface Permissions {
  can_rsvp: boolean
  can_bring_plus_one: boolean
  is_couple: boolean
}

export interface GoodWillMessage {
  message_text: string
  has_message: boolean
}

export interface GiftItem {
  item_id: string
  item_name: string
  item_description: string
  item_image_url: string
  item_link: string
  item_price: number
}

export interface Gift {
  gift_type: GiftType
  gift_amount: number | null
  gift_item_id?: string | null
  status: 'pending' | 'success' | 'failed'
}

export interface GuestData {
  auth_token: string
  authenticated: boolean
  guest: Guest
  permissions: Permissions
}

export interface GuestGifts {
  guest_email: string
  gifts: Gift[]
}