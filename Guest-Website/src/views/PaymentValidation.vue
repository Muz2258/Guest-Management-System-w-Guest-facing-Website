<template>
  <main class="h-dvh p-32 flex flex-col justify-between bg-brand-sec-light-100">
    <div class="logo mx-auto mb-32 flex justify-center items-center gap-x-8">
      <img
        class="h-8 w-auto"
        src="@/assets/vectors/leaf-branch__left.svg"
        alt="Leaf Branch Left"
      />
      <img
        class="size-[1.75rem]"
        src="@/assets/vectors/wedding_letter-mark--black.svg"
        alt="Chidera and Emamuzo Wedding Letter Mark"
      />
      <img
        class="h-8 w-auto"
        src="@/assets/vectors/leaf-branch__right.svg"
        alt="Leaf Branch Right"
      />
    </div>
    <div class="flex flex-col items-center justify-center">
      <picture class="mb-32">
        <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp" type="image/webp">
        <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif" alt="🥰" width="88" height="88">
      </picture>
      <p class="text-s text-neutrals-neu-35 mb-8">Thank you</p>
      <h1 class="text-heading-lg text-neutrals-neu-0 mb-16">{{ guestName }}</h1>
      <p class="text-s text-neutrals-neu-35 text-center mb-48">We've received your gift and we are super grateful to you. Looking forward to more celebrations with you.</p>
      <Button label="Back to homepage" type="primary" @click="$router.push({ name: 'main-website' })" />
    </div>
    <p class="text-s text-neutrals-neu-35 text-center mb-24">Copyrights 2025 <br> Cheema '25 #BuiltToLast</p>
  </main>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()


/* ------------------ Computed Properties ------------------ */
const guestName = computed(() => {
  return guestStore.guestData?.guest?.first_name || 'Honoured Guest'
})
</script>

<style scoped>
</style>
