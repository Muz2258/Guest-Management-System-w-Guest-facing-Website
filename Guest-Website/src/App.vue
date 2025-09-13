<template>
  <div>
    <CookieBanner v-if="showCookie" />
    <RouterView />
    <WelcomeModal v-if="showWelcomeModal" />
    <ManagePlusOneModal v-if="showPlusOneModal" />
    <RemovePlusOneModal v-if="showRemovePlusOneModal" />
    <UpdateRsvpModal v-if="showUpdateRSVPModal" />
    <ManageGoodWillMessageModal v-if="showGoodWillModal" />
    <DeleteGoodWillModal v-if="showDeleteGoodWillModal" />
    <transition name="sheet" >
      <GiftBottomSheet v-if="showGiftBottomSheet" />
    </transition>
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
const showCookie = computed(() => uiStore.showCookie && !privacyStore.hasSeenBanner)
</script>

<style>
.sheet-enter-active .backdrop {
  transition: opacity 250ms ease-in-out;
}

.sheet-enter-active .bottom-sheet {
  transition: transform 400ms cubic-bezier(.33,.18,.11,.98);
}

.sheet-leave-active .backdrop {
  transition: opacity 250ms ease-in-out;
}

.sheet-leave-active .bottom-sheet {
  transition: transform 400ms cubic-bezier(.33,.18,.11,.98);
}

.sheet-enter-from .backdrop {
  opacity: 0;
}

.sheet-leave-to .backdrop {
  opacity: 0;
}

.sheet-enter-from .bottom-sheet {
  opacity: 0;
  transform: translateY(65%);
}

.sheet-leave-to .bottom-sheet {
  opacity: 0;
  transform: translateY(65%);
}
</style>
