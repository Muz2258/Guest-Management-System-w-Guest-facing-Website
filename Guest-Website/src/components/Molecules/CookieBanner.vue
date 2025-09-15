<template>
  <div class="sticky top-0 z-100 p-24 flex flex-col items-start gap-16 bg-brand-accent">
    <div class="flex gap-24 items-start">
      <p class="text-s text-neutrals-neu-100">
        We store essential data locally to remember your invitation and improve your experience. 
        No personal data leaves your device.
        <a href="/privacy-policy" class="text-neutrals-neu-100 hover:text-neutrals-neu-100 underline">
          Learn more
        </a>
      </p>
      <div class="flex items-center justify-center p-6 rounded-full bg-neutrals-neu-100 cursor-pointer" @click="handleTemporaryClose">
        <Icon name="close" :size="12" :stroke-width="2" :color="getColor('brand.accent')"  />
      </div>
    </div>
    
    <Button label="Got it" type="alt-solid" @click="handlePermanentAcknowledge"/>
  </div>
</template>

<script setup lang="ts">
// Imports
import Icon from '../Icon'
import { getColor } from '../../utils/colors'

// Stores
const privacyStore = usePrivacyStore()

// Methods
const handlePermanentAcknowledge = () => {
  privacyStore.acknowledgeDataNotice()
}

const handleTemporaryClose = () => {
  privacyStore.closeBannerTemporarily()
}
</script>

<style scoped>
/* Custom toggle switch styles are handled by Tailwind classes above */
</style>
