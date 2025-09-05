<template>
  <main class="page-wrapper">
    <container class="content-wrapper">
      <HeroSection />
      <EventDetailsSection />
    </container>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuestStore } from '../stores/guest'
import { storeToRefs } from 'pinia'

// Components
import HeroSection from '../components/Templates/Hero.vue'
import EventDetailsSection from '../components/Templates/EventDetails.vue'

// Composables
const guestStore = useGuestStore()
const { guest } = storeToRefs(guestStore)

// Computed Variables
const guestData = computed(() => {
    console.log('🔄 Computing guest data from:', guest.value)
    const currentGuest = guest?.value ?? null

    if (!currentGuest) {
      console.log('ℹ️ No guest data available')
      return null
    }

    if (guest?.value && typeof guest.value.name === 'string' && guest.value.name.includes(' ')) {
        currentGuest.name = { 
            first_name: guest.value.name.split(' ')[0], 
            last_name: guest.value.name.split(' ')[1] ?? null 
        }
    }

    console.log('✅ Guest data computed:', currentGuest)

    return currentGuest
})
</script>

<style scoped>
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
