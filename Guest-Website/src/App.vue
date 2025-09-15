<template>
  <div>
    <CookieBanner v-if="showCookie"/>
    <RouterView />
    <WelcomeModal v-if="showWelcomeModal" />
    <ManagePlusOneModal v-if="showPlusOneModal" />
    <RemovePlusOneModal v-if="showRemovePlusOneModal" />
    <UpdateRsvpModal v-if="showUpdateRSVPModal" />
    <ManageGoodWillMessageModal v-if="showGoodWillModal" />
    <transition name="modal-transition">
      <DeleteGoodWillModal v-if="showDeleteGoodWillModal" />
    </transition>
    
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
const showCookie = computed(() => privacyStore.shouldShowBanner)
</script>

<style>
.sheet-enter-active .backdrop, .modal-transition-enter-active .backdrop {
  transition: opacity 250ms ease-in-out;
}

.sheet-enter-active .bottom-sheet, .modal-transition-enter-active .content{
  transition: transform 400ms cubic-bezier(.33,.18,.11,.98);
}

.sheet-leave-active .backdrop, .modal-transition-leave-active .backdrop {
  transition: opacity 250ms ease-in-out;
}

.sheet-leave-active .bottom-sheet, .modal-transition-leave-active .content{
  transition: transform 400ms cubic-bezier(.33,.18,.11,.98);
}

.sheet-enter-from .backdrop, .sheet-leave-to .backdrop, .modal-transition-enter-from .backdrop, .modal-transition-leave-to .backdrop {
  opacity: 0;
}

.sheet-enter-from .bottom-sheet, .sheet-leave-to .bottom-sheet, .modal-transition-enter-from .content, .modal-transition-leave-to .content {
  opacity: 0;
  transform: translateY(65%);
}
</style>
