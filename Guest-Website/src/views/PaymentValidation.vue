<template>
  <main class="h-dvh p-32 flex flex-col justify-center bg-neutrals-neu-100">
    <div class="flex flex-col items-center justify-center">
      <picture class="mb-32">
        <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp" type="image/webp">
        <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif" alt="🥰" width="88" height="88">
      </picture>
      <p class="text-s text-neutrals-neu-35 mb-8">Thank you</p>
      <h1 class="text-heading-lg text-neutrals-neu-0 mb-16 text-center">{{ guestName }}</h1>
      <p class="text-s text-neutrals-neu-35 text-center mb-48">We've received your gift and we are super grateful to you. Looking forward to more celebrations with you.</p>
      <Button label="Back to homepage" type="secondary" @click="$router.push({ name: 'main-website' })" />
    </div>
    <!-- <p class="text-s text-neutrals-neu-35 text-center mb-24">Copyrights 2025 <br> Cheema '25 #BuiltToLast</p> -->
  </main>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()


/* ------------------ Computed Properties ------------------ */
const guestName = computed(() => {
  const firstName = guestStore.guestData?.guest?.name.first_name || ''
  const lastName = guestStore.guestData?.guest?.name.last_name || ''
  if (guestStore.guestData?.permissions.is_couple) {
    return `Mr & Mrs ${lastName ? lastName : firstName}`
  }
  return firstName
})


/* ------------------ Lifecycle Hooks ------------------ */
onMounted(() => {
  console.log('Guest Data:', guestStore.guestData?.auth_token)
})
</script>

<style scoped>
</style>
