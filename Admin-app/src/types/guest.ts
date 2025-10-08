export type GuestType = 'single' | 'couple'
export type GuestCategory = 'family' | 'friend' | 'asoebi' | 'bestman' | 'chiefbridesmaid'
export type InvitationType = 'rsvp_guest' | 'information_only'
export type InvitationMethod = 'digital' | 'physical_qr'
export type AttendanceStatus = 'attending' | 'not_attending' | 'pending'
export type PlusOneEligibility = 'eligible' | 'not_eligible'
export type PlusOneType = 'spouse' | 'others'
export type GiftStatus = 'pending' | 'success' | 'abandoned'
export type GiftTypes = 'monetary' | 'full_purchase' | 'contribution'
export type FamilySide = 'bride' | 'groom' | 'both'

export interface GuestName {
  titles: []
  first_name: string
  middle_name?: string
  last_name?: string
  suffixes?: []
}

export interface GuestTableRow {
  guest_id: string
  auth_token: string
  name: GuestName
  guest_category: GuestCategory
  family_side: FamilySide
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  plus_one_limit: number
  invitation_type: InvitationType
  invitation_method: InvitationMethod
  invitation_link: string | null
  created_at: string
  updated_at: string
  rsvp_status: AttendanceStatus | null
  spouse_rsvp_status: boolean | null
  invite_sent: boolean
  rsvp_submitted_at: string
  rsvp_updated_at: string
  total_plus_ones: number
}

export interface Guest {
  guest_id: string
  guest_category: GuestCategory
  guest_type: GuestType
  plus_one_eligibility: PlusOneEligibility
  invitation_type: InvitationType
  invitation_method: InvitationMethod
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  auth_token: string
  // auth_token_hash: string | null
  // token_created_at: string | null
  // token_expires_at: string | null
  // token_last_used_at: string | null
  // token_use_count: number | null
  // is_token_active: boolean | null
  name: GuestName
  plus_one_limit: number | null
  family_side: FamilySide
  invitation_link: string | null
}

export interface RSVP {
  rsvp_id: string
  guest_id: string
  attendance_status: AttendanceStatus
  spouse_attending: boolean | null
  submitted_at: string | null
  updated_at: string | null
  updated_by: string | null
  invite_sent: boolean | null
}

export interface PlusOne {
  plus_one_id: string
  guest_id: string
  type: PlusOneType
  name: GuestName
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Gift {
  gift_id: string
  guest_id: string
  reference: string
  amount: number
  guest_email: string
  is_anonymous: boolean
  status: GiftStatus
  paystack_access_code: string | null
  paystack_reference: string | null
  paystack_customer_code: string | null
  payment_channel: string | null
  transaction_fees: number | null
  created_at: string
  paid_at: string | null
  updated_at: string
  failure_reason: string | null
  gift_item_id: string | null
  gift_type: GiftTypes
  total_amount_paid: number | null
  processing_fee: number | null
  delivery_fee: number | null
  payment_description: string | null
}

export interface GuestMessage {
  message_id: string
  guest_id: string
  message_text: string
  is_approved: boolean
  created_at: string
  updated_at: string
  approved_at: string
  approved_by: string | null
}

export interface CompleteGuestData {
  guest: Guest
  rsvp?: RSVP
  plus_ones: PlusOne[]
  gifts?: Gift[]
  goodwill_messages?: GuestMessage[]
}
