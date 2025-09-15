<template>
  <main class="page-wrapper">
    <Hero />
    <RSVP v-if="hasToken" id="rsvp" />
    <EventDetails v-if="hasToken && isRsvpGuest" id="details" />
    <LoveStory />
    <Gallery id="gallery" />
  </main>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()

/* ------------------ Computed Properties ------------------ */
const hasToken = computed(() => {
  return !!guestStore.guestData?.auth_token
})

const isRsvpGuest = computed(() => {
  return guestStore.guestData?.permissions.can_rsvp
})
</script>