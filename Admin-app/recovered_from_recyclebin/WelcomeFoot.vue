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

// Store variables
const { guestData } = guestStore

// Define emits for parent component
const emit = defineEmits<{
  rsvpClick: []
  detailsClick: []
  galleryClick: []
}>()

// Computed properties
const canRSVP = computed(() => {
  if (!guestData) return false
  return guestData.permissions.can_rsvp
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