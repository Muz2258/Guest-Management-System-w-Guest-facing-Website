<template>
  <main class="page-wrapper">
    <!-- ✅ PRIORITY 1: Hero loads immediately -->
    <Hero @hero-ready="onHeroReady" />
    
    <!-- ✅ PRIORITY 2: Secondary sections load after hero is ready -->
    <template v-if="heroMounted">
      <RSVP v-if="hasToken && mountedSections.rsvp" id="rsvp" />
      <EventDetails v-if="hasToken && isRsvpGuest && mountedSections.eventDetails" id="details" />
      <LoveStory v-if="mountedSections.loveStory" />
      <Gallery v-if="mountedSections.gallery" id="gallery" />
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, watch, ref } from 'vue'
import { useGuestStore } from '../stores/guest'

// ✅ RESOURCE COORDINATION: Pass hero-ready event to App.vue
const emit = defineEmits<{
  'hero-ready': []
}>()

/* ------------------ Progressive Mounting State ------------------ */
const heroMounted = ref(false)
const mountedSections = ref({
  rsvp: false,
  eventDetails: false,
  loveStory: false,
  gallery: false
})

// ✅ INCREMENTAL MOUNTING: Mount sections progressively without setTimeout
const mountSectionsIncrementally = async () => {
  // Use nextTick and requestAnimationFrame for smoother, non-blocking mounting
  console.log('🚀 Starting incremental section mounting')
  
  // Mount RSVP section first (most important for users)
  await nextTick()
  mountedSections.value.rsvp = true
  console.log('✅ RSVP section mounted')
  
  // Allow browser to render RSVP, then mount EventDetails
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.eventDetails = true
  console.log('✅ EventDetails section mounted')
  
  // Allow browser to render EventDetails, then mount LoveStory
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.loveStory = true
  console.log('✅ LoveStory section mounted')
  
  // Allow browser to render LoveStory, then mount Gallery (heaviest content last)
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.gallery = true
  console.log('✅ Gallery section mounted')
  
  // ✅ CRITICAL: Setup RSVP intersection observer after all sections are mounted
  // This ensures the observer works correctly with the progressive mounting
  await nextTick() // Ensure DOM is fully updated
  setupRSVPModalPreloading()
}

const onHeroReady = () => {
  heroMounted.value = true
  console.log('🎯 Hero ready - starting incremental section mounting')
  
  // Emit to App.vue
  emit('hero-ready')
  
  // Start mounting other sections
  mountSectionsIncrementally()
}

/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()

/* ------------------ Computed Properties ------------------ */
const hasToken = computed(() => {
  return !!guestStore.guestData?.auth_token
})

const isRsvpGuest = computed(() => {
  return guestStore.guestData?.permissions.can_rsvp
})

/* ------------------ RSVP Modal Preloading ------------------ */
let rsvpObserver: IntersectionObserver | null = null // Prevent multiple observers

const setupRSVPModalPreloading = () => {
  // ✅ SAFETY: Prevent duplicate observers
  if (rsvpObserver) {
    console.log('🔄 RSVP observer already exists, skipping setup')
    return
  }
  
  // Look for the RSVP section by ID
  const rsvpSection = document.getElementById('rsvp')
  
  if (!rsvpSection || !isRsvpGuest.value) {
    console.log('⚠️ RSVP section not found or guest has no RSVP permissions')
    return
  }

  rsvpObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('🎯 RSVP section in view, triggering modal preload...')
          // Emit custom event to tell App.vue to preload RSVP modals
          window.dispatchEvent(new CustomEvent('preload-rsvp-modals'))
          
          // Clean up observer after triggering
          if (rsvpObserver) {
            rsvpObserver.disconnect()
            rsvpObserver = null
          }
        }
      })
    },
    {
      rootMargin: '0px 0px -50% 0px', // Only trigger when 10% of section height is visible
      threshold: 0.1 // Trigger when 10% of the RSVP section is visible
    }
  )

  rsvpObserver.observe(rsvpSection)
  console.log('👁️ RSVP section observer set up in MainWebsiteView')
}

/* ------------------ Lifecycle Hooks ------------------ */
onMounted(() => {
  // ✅ INTERSECTION OBSERVER: Now handled automatically after progressive mounting
  // setupRSVPModalPreloading() is called from mountSectionsIncrementally()
  console.log('📱 MainWebsiteView mounted - progressive section mounting will handle RSVP observer')
})

// ✅ WATCH: Handle dynamic guest data changes
// Note: Intersection observer is now handled by progressive mounting, not watchers
watch([hasToken, isRsvpGuest], ([newHasToken, newIsRsvpGuest]) => {
  if (newHasToken && newIsRsvpGuest) {
    console.log('👁️ Guest permissions updated - RSVP observer will be set up during progressive mounting')
    // No need to setup intersection observer here - it's handled in mountSectionsIncrementally
  }
}, { immediate: false })
</script>