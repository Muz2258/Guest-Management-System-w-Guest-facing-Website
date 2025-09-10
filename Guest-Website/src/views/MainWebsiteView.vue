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
// Store variables
const guestStore = useGuestStore()

// Computed variables
const isRsvpGuest = computed(() => {
  return guestStore.guest?.invitation_type === 'rsvp_guest'
})
</script>

<style lang="postcss" scoped>
@reference '../styles/main.css';

#main-hero-image::before {
  content: "Cheema '25";
  display: inline-block;
  position: absolute;
  bottom: 0;
  left: -9%;
  writing-mode: sideways-lr;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}

#main-hero-image::after {
  content: "#BuiltToLast";
  display: inline-block;
  position: absolute;
  top: 0;
  right: -9%;
  writing-mode: sideways-rl;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}
</style>