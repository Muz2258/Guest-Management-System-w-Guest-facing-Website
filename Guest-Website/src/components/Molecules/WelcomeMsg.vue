<template>
    <div class="px-24 pt-16 pb-16">
        <p class="text-center text-neutrals-neu-35 text-xs mb-8">Welcome</p>
        <h3 class="text-center text-heading-md text-neutrals-neu-0 mb-16">
            {{ guestDisplayName }}
        </h3>
        <p class="text-center text-neutrals-neu-35 text">
            We're so excited to celebrate with you. Explore our big day details, {{ guest?.invitation_type === 'rsvp_guest' ? 'RSVP' : '' }}, spoil us with gifts 😜, {{ guest?.plus_one_eligibility === 'eligible' ? 'add your plus one,' : '' }} and get ready to party! Any questions? Just reach out.
        </p>
    </div>
</template>

<script setup lang="ts">
// Stores and Utilities
const guestStore = useGuestStore()

// Computed properties
const guest = computed(() => guestStore.guest)

const guestDisplayName = computed(() => {
  if (!guest.value) {
    return 'Honored Guest'
  }
  
  const firstName = guest.value.first_name || ''
  const lastName = guest.value.last_name || ''
  const isCouple = guest.value.guest_type === 'couple'
  
  if (isCouple && lastName) {
    return `Mr. & Mrs. ${lastName}`
  }else {
    return firstName
  }
})
</script>

<style scoped>
</style>