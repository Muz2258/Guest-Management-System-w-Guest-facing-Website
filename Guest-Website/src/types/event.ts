export interface SessionDetail {
  sessionTitle: string
  locationName: string
  locationAddress: string
  locationCoordinates: string
  startTime: string
  endTime: string
  remarks?: string
}

export interface EventDetails {
  eventId: string
  eventDate: string // ISO date string (YYYY-MM-DD)
  eventTime: string // ISO time string (HH:MM:SS)
  groomName: string
  brideName: string
  eventName: string
  sessionDetails: SessionDetail[]
  rsvpEndDate: string // ISO datetime string
  rsvpEndTime: string
  timezone: string
  createdAt?: string
  updatedAt?: string
}

export interface EventConfig {
  allowRSVPAfterDeadline: boolean
  maxPlusOnes: number
  requirePhoneNumber: boolean
  requireAddress: boolean
}

export interface MediaItem {
  id: string
  filename: string
  file_type: string
  s3_thumbnail_url: string
  s3_preview_url: string
  s3_web_url: string
  caption: string | null
  is_featured: boolean
  created_at: string
}
