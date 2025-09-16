<template>
  <div>
    <CookieBanner v-if="showCookie"/>

    <RouterView />
    
    <WelcomeModal v-if="showWelcomeModal" :is-visible="showWelcomeModal" />

    <ManagePlusOneModal v-if="showPlusOneModal" :is-visible="showPlusOneModal" />

    <RemovePlusOneModal v-if="showRemovePlusOneModal" :is-visible="showRemovePlusOneModal" />

    <UpdateRsvpModal v-if="showUpdateRSVPModal" :is-visible="showUpdateRSVPModal" />

    <ManageGoodWillMessageModal v-if="showGoodWillModal" :is-visible="showGoodWillModal" />

    <DeleteGoodWillModal v-if="showDeleteGoodWillModal" :is-visible="showDeleteGoodWillModal" />

    <GiftBottomSheet v-if="showGiftBottomSheet" :is-visible="showGiftBottomSheet" />
  </div>
</template>

<script setup lang="ts">
/* ------------------ Stores ------------------ */
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()

/* ------------------ Computed Properties ------------------ */
const showWelcomeModal = computed(() => uiStore.showWelcomeModal)
const showGiftBottomSheet = computed(() => uiStore.showGiftBottomSheet)
const showPlusOneModal = computed(() => uiStore.showPlusOneModal)
const showRemovePlusOneModal = computed(() => uiStore.showRemovePlusOneModal)
const showGoodWillModal = computed(() => uiStore.showGoodWillModal)
const showUpdateRSVPModal = computed(() => uiStore.showUpdateRSVPModal)
const showDeleteGoodWillModal = computed(() => uiStore.showDeleteGoodWillModal)
const showCookie = computed(() => privacyStore.shouldShowBanner)
</script>

<style>

</style>
