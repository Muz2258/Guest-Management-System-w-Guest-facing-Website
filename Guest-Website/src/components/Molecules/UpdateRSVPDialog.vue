<template>
    <div class="px-24 py-24">
        <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
            Rethinking your RSVP?
        </h3>
        <p class="text-neutrals-neu-46 text-s text-center mb-32">
            Feel free to update your RSVP response below. We understand that plans can change, and we want to ensure we have the most accurate headcount for our special day.
        </p>
        
        <div class="flex flex-col gap-16">
            <p class="text-center text-neutrals-neu-46 text-sm">
                Current response: <span class="text-neutrals-neu-0">{{ currentRSVPText }}</span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
// Stores
const guestStore = useGuestStore()

// Computed properties
const currentRSVPText = computed(() => {
    const status = guestStore.guest?.rsvp?.attendance_status
    if (status === 'attending') return "Yes, I'll be there"
    if (status === 'not_attending') return "Sorry, I can't make it"
    return 'No response yet'
})
</script>

<style scoped>
</style>
