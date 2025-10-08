<template>
    <div class="px-24 py-16">
        <p class="text-center text-neutrals-neu-35 text-xs mb-8">Welcome</p>
        <h3 class="text-center text-heading-lg text-neutrals-neu-0 mb-20">
            {{ guestDisplayName }}
        </h3>
        <p class="text-neutrals-neu-35 text">
            We're so excited to celebrate with you on our special day. Take the time to:
        </p>
        <ul class="list-disc list-inside mt-8 text-neutrals-neu-35 text">
            <li>Explore our big day details</li>
            <li v-if="canRsvp">Update your RSVP <span class="text-brand-accent">(Required)</span></li>
            <li v-if="canAddPlusOne">Add your plus one</li>
            <li>Spoil us with gifts 😜</li>
            <li>and get ready to party! 💃🏾🕺🏾</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()


/* ------------------ Computed Properties ------------------ */
const guest = computed(() => guestStore.guestData?.guest)
const guestPermissions = computed(() => guestStore.guestData?.permissions)

const guestDisplayName = computed(() => {
  if (!guest.value) {
    return 'Honored Guest'
  }
  
  const firstName = guest.value.first_name || ''
  const lastName = guest.value.last_name || ''
  const isCouple = guestPermissions.value?.is_couple
  
  if (isCouple && lastName) {
    return `Mr. & Mrs. ${lastName}`
  }else {
    return firstName
  }
})

const canAddPlusOne = computed(() => guestPermissions.value?.can_bring_plus_one)
const canRsvp = computed(() => guestPermissions.value?.can_rsvp)
</script>

<style scoped>
</style>