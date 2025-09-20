<template>
  <main v-if="isMobile" class="page-wrapper">
    <Hero />
    <RSVP v-if="hasToken" id="rsvp" />
    <EventDetails v-if="hasToken && isRsvpGuest" id="details" />
    <LoveStory />
    <Gallery id="gallery" />
  </main>
  <main v-else class="h-dvh flex flex-col justify-center items-center p-32">
    <div class="flex items-center space-x-16 mb-32">
      <div><Icon name="no-landscape" :color="getColor('denotive.denote_red')" :size="24"/></div>
      <div><Icon name="phone" :color="getColor('brand.accent')" :size="32"/></div>
      <div><Icon name="no-laptops" :color="getColor('denotive.denote_red')" :size="24"/></div>
    </div>
    <h1 class="text-heading-lg text-neutrals-neu-0 text-center mb-16">Phones in portrait Only</h1>
    <p class="text-s text-neutrals-neu-35 text-center max-w-[50%]">
      Sorry! This site works best on mobile phones in portrait mode. Please open your invitation link on your phone.
    </p>
  </main>
</template>

<script setup lang="ts">
/* -------------------- Imports ------------------ */
import Icon from '../components/Icon'
import { getColor } from '../utils/colors'


/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()


/* ------------------ Reactive Variables ------------------ */
const isMobile = ref<boolean>(true)


/* ------------------ Computed Properties ------------------ */
const hasToken = computed(() => {
  return !!guestStore.guestData?.auth_token
})

const isRsvpGuest = computed(() => {
  return guestStore.guestData?.permissions.can_rsvp
})


/* ------------------- Functions --------------------- */
const checkMobileSize = () => {
  isMobile.value = window.innerWidth <= 600
}


/* ------------------- Lifecycle Hooks --------------------- */
onMounted(() => {
  checkMobileSize()
  window.addEventListener('resize', checkMobileSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileSize)
})
</script>