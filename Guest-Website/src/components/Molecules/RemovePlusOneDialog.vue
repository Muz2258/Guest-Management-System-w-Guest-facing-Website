<template>
    <div class="px-24 py-24">
        <h3 class="text-heading-md text-center lining-nums text-neutrals-neu-0 mb-16">
            Removing your +1?
        </h3>
        <p class="text-neutrals-neu-46 text-s text-center mb-32">
            You are about to remove {{ plusOneName }} from your RSVP. This action cannot be undone.
            If you change your mind, you can always add a new +1 later.
        </p>
    </div>
</template>

<script setup lang="ts">
// Stores
const guestStore = useGuestStore()

// Computed properties
const plusOneName = computed(() => {
  const plusOneFullName = guestStore.guest?.rsvp?.plus_one_name || 'your +1'
  return plusOneFullName
})
</script>
