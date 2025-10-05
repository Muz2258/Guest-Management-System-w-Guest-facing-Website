import type { EventDetails, EventConfig } from '../types/event'

export const useEventStore = defineStore('event', () => {
  // States
  const eventDetails = ref<EventDetails | null>(null)
  const eventConfig = ref<EventConfig | null>(null)
  const isInitialized = ref(false)

  // Computed getters
  const isRSVPOpen = computed(() => {
    if (!eventDetails.value) return false
    
    const now = new Date()
    const rsvpDeadline = new Date(eventDetails.value.rsvpEndDate + 'T' + eventDetails.value.rsvpEndTime)
    
    return now <= rsvpDeadline || eventConfig.value?.allowRSVPAfterDeadline || false
  })

  const daysUntilRSVPDeadline = computed(() => {
    if (!eventDetails.value) return null
    
    const rsvpDeadline = new Date(eventDetails.value.rsvpEndDate + 'T' + eventDetails.value.rsvpEndTime)
    const now = new Date()
    const timeDiff = rsvpDeadline.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return daysDiff > 0 ? daysDiff : 0
  })

  const formattedEventDate = computed(() => {
    if (!eventDetails.value) return ''
    
    const eventDate = new Date(eventDetails.value.eventDate)
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const formattedRSVPDeadline = computed(() => {
    if (!eventDetails.value) return ''
    
    const rsvpDeadline = new Date(eventDetails.value.rsvpEndDate + 'T' + eventDetails.value.rsvpEndTime)
    return rsvpDeadline.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  })

  // ✅ OPTIMIZATION: Lazy initialization - only load when needed
  const initializeEventData = () => {
    if (isInitialized.value) {
      console.log('🎉 Event data already initialized, skipping...')
      return
    }

    console.log('🎉 Initializing event data...')
    
    // Default event data - in a real app, this would come from an API or database
    eventDetails.value = {
      eventId: 'cheema-wedding-2025',
      eventName: "Cheema '25 Wedding Celebration",
      eventDate: '2025-11-15', // November 15, 2025
      eventTime: '12:00:00', // 12:00 PM
      groomName: 'Emamuzo Okerri',
      brideName: 'Chidera Emmanuel-wisdom',
      sessionDetails: [
        {
          sessionTitle: 'Church Service',
          locationName: 'Devout Christian Assembly',
          locationAddress: 'After Nativity Catholic Church, off Alegbo Okoribo Road, Warri, Delta State. Nigeria',
          locationCoordinates: '5.554419397932635, 5.802026810636565',
          startTime: '12:00 PM',
          endTime: '1:30 PM',
          remarks: 'Photoshoot with guests and family follows immediately after (30 minutes)'
        },
        {
          sessionTitle: 'Reception',
          locationName: 'DY Events Place',
          locationAddress: 'Edjeba road, off NPA - DSC Express way, Warri, Delta State. Nigeria',
          locationCoordinates: '5.541646646304213, 5.729015750779724',
          startTime: '2:30 PM',
          endTime: '4:00 PM',
          remarks: "Couple's entrance dance starts at 3:00 pm"
        },
        {
          sessionTitle: 'After Party',
          remarks: 'Venue details will be shared during the reception.'
        }
      ],
      rsvpEndDate: '2025-10-19', // October 19, 2025
      rsvpEndTime: '23:59:59', // 11:59 PM
      timezone: 'Africa/Lagos'
    }

    eventConfig.value = {
      allowRSVPAfterDeadline: false,
      maxPlusOnes: 1,
      requirePhoneNumber: false,
      requireAddress: false
    }

    isInitialized.value = true
    console.log('✅ Event data initialized successfully:', eventDetails.value)
  }

  // ✅ OPTIMIZATION: Auto-initialize only when data is accessed
  const ensureInitialized = () => {
    if (!isInitialized.value) {
      initializeEventData()
    }
  }

  // Computed that auto-initializes when accessed
  const eventDetailsReactive = computed(() => {
    ensureInitialized()
    return eventDetails.value
  })

  return {
    // State (with lazy initialization)
    eventDetails: eventDetailsReactive,
    eventConfig: computed(() => {
      ensureInitialized()
      return eventConfig.value
    }),
    
    // Computed
    isRSVPOpen,
    daysUntilRSVPDeadline,
    formattedEventDate,
    formattedRSVPDeadline,
    
    // Actions
    initializeEventData,
    ensureInitialized
  }
})
