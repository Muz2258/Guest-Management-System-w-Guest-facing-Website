<template>
  <main class="page-wrapper">
    <Hero />
    <RSVP id="rsvp" />
    <EventDetails v-if="isRsvpGuest" id="details" />
    <LoveStory />
    <Gallery />
  </main>
</template>

<script setup lang="ts">
// Stores
const guestStore = useGuestStore()

// Store states
const { guestData } = guestStore

// Computed variables
const isRsvpGuest = computed(() => {
  return guestData?.permissions.can_rsvp
})
</script>