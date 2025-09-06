<template>
    <div class="flex flex-col gap-8 items-center px-24 pb-24">
        <Button v-if="canRSVP" label="RSVP Now" type="primary" class="w-full" @click="handleRSVPClick" />
        <Button label="View Details" type="secondary" class="w-full" @click="handleDetailsClick" />
        <Button label="See Gallery" type="tertiary" class="w-full" @click="handleGalleryClick" />
    </div>
</template>

<script setup lang="ts">
// Stores and Utilities
const guestStore = useGuestStore()

// Define emits for parent component
const emit = defineEmits<{
  rsvpClick: []
  detailsClick: []
  galleryClick: []
}>()

// Computed properties
const guest = computed(() => guestStore.guest)

const canRSVP = computed(() => {
  if (!guest.value) return false
  return guest.value.invitation_type === 'rsvp_guest'
})

// Event handlers
const handleRSVPClick = () => {
  emit('rsvpClick')
}

const handleDetailsClick = () => {
  emit('detailsClick')
}

const handleGalleryClick = () => {
  emit('galleryClick')
}
</script>

<style scoped></style>