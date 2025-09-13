<template>
  <main class="page-wrapper">
    <Hero />
    <RSVP id="rsvp" />
    <EventDetails v-if="isRsvpGuest" id="details" />
    <LoveStory />
    <Gallery id="gallery" />
  </main>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()

/* ------------------ Computed Properties ------------------ */
const isRsvpGuest = computed(() => {
  return guestStore.guestData?.permissions.can_rsvp
})
</script>