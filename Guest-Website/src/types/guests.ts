export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friend' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information_only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'
export type GiftType = 'monetary' | 'item'
export type PlusOneType = 'spouse' | 'others'

export interface Name {
  titles: []
  first_name: string
  middle_name?: string | null
  last_name?: string | null
  suffixes: []
}

export interface Guest {
  name: Name
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  plus_one_limit: number
  invitation_type: InvitationType
}

export interface Permissions {
  can_rsvp: boolean
  can_bring_plus_one: boolean
  is_couple: boolean
}

export interface GuestData {
  auth_token: string
  authenticated: boolean
  guest: Guest
  permissions: Permissions
}

export interface RSVP {
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
}

export interface PlusOnes {
  plus_one_id: string
  type: PlusOneType
  name: Name
}

export interface PlusOneData {
  plus_ones: PlusOnes[]
  plus_one_limit: number
  plus_one_remaining: number
}

export interface RSVPData {
  rsvp: RSVP
  plus_one_data: PlusOneData
}

export interface GoodWillMessage {
  message_text: string
  has_message: boolean
}

export interface GiftItem {
  gift_item_id: string
  name: string
  image_url: string
  external_link: string
  price: number
  delivery_fee: number
  amount_contributed: number
  is_active: boolean
  contributors: number
  store_name?: string
}

export interface Gift {
  gift_type: GiftType
  gift_amount: number | null
  gift_item_id?: string | null
  status: 'pending' | 'success' | 'failed'
}

export interface GuestGifts {
  guest_email: string
  gifts: Gift[]
}