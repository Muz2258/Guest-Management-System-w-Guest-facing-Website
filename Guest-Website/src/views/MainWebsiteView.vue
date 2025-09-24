<template>
  <main class="page-wrapper">
    <Hero @hero-ready="handleHeroReady" @hero-animation-ended="handleAnimationEnded" />
    
    <template v-if="heroMounted">
      <RSVP v-if="hasToken && mountedSections.rsvp" id="rsvp" />
      <EventDetails v-if="hasToken && isRsvpGuest && mountedSections.eventDetails" id="details" />
      <LoveStory v-if="mountedSections.loveStory" />
      <Gallery v-if="mountedSections.gallery" id="gallery" />
    </template>
  </main>
</template>

<script setup lang="ts">
import { useIconPreloader } from '../composables/useIconPreloader'

/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()


/* ------------------ Props and Emitters ------------------- */
const emit = defineEmits<{
  'hero-ready': [],
  'hero-animation-ended': []
}>()


/* ------------------ Variables and States ------------------ */
const heroMounted = ref(false)
const mountedSections = ref({
  rsvp: false,
  eventDetails: false,
  loveStory: false,
  gallery: false
})

/* ------------------ Computed Properties ------------------ */
const hasToken = computed(() => {
  return !!guestStore.guestData?.auth_token
})

const isRsvpGuest = computed(() => {
  return guestStore.guestData?.permissions.can_rsvp
})

/* ------------------ Methods ------------------ */
const mountSectionsIncrementally = async () => {
  console.log('🚀 Starting incremental section mounting')
  
  await nextTick()
  mountedSections.value.rsvp = true
  console.log('✅ RSVP section mounted')
  
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.eventDetails = true
  console.log('✅ EventDetails section mounted')
  
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.loveStory = true
  console.log('✅ LoveStory section mounted')
  
  await new Promise(resolve => requestAnimationFrame(resolve))
  mountedSections.value.gallery = true
  console.log('✅ Gallery section mounted')
}

const handleHeroReady = async () => {
  heroMounted.value = true
  console.log('🎯 Hero ready - starting incremental section mounting')
  
  emit('hero-ready')
  
  await mountSectionsIncrementally()
  console.log('🎉 All sections mounted')
}

const handleAnimationEnded = () => {
  console.log('🎉 Hero animation ended')
  emit('hero-animation-ended')
}

onBeforeMount(() => {
  console.log('🔃 Preloading icons...')
  useIconPreloader().preloadAllIcons().catch(err => {
    console.error('❌ Error preloading icons:', err)
  })
})
</script>