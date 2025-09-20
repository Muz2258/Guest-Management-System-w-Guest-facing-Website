<template>
  <div>
    <!-- Global Header Navigation -->
    <transition appear name="slide-down">
      <HeaderNavigation />
    </transition>

    <transition name="fade">
      <CookieBanner v-if="showCookie"/>
    </transition>

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

/* ------------------ Reactive Variables ------------------ */
const showCookieWithDelay = ref(false)

/* ------------------ Computed Properties ------------------ */
const showWelcomeModal = computed(() => uiStore.showWelcomeModal)
const showGiftBottomSheet = computed(() => uiStore.showGiftBottomSheet)
const showPlusOneModal = computed(() => uiStore.showPlusOneModal)
const showRemovePlusOneModal = computed(() => uiStore.showRemovePlusOneModal)
const showGoodWillModal = computed(() => uiStore.showGoodWillModal)
const showUpdateRSVPModal = computed(() => uiStore.showUpdateRSVPModal)
const showDeleteGoodWillModal = computed(() => uiStore.showDeleteGoodWillModal)

// Cookie banner should show with delay after welcome modal closes
const showCookie = computed(() => {
  return privacyStore.shouldShowBanner && showCookieWithDelay.value
})

/* ------------------ Watchers ------------------ */
// Watch for welcome modal changes to trigger delayed cookie banner
watch(showWelcomeModal, (newValue, oldValue) => {
  // When welcome modal closes (was true, now false)
  if (oldValue && !newValue && privacyStore.shouldShowBanner) {
    // Add delay before showing cookie banner
    setTimeout(() => {
      showCookieWithDelay.value = true
    }, 1500) // 1.5 second delay
  }
}, { immediate: false })

// Initialize cookie banner state based on current conditions
onMounted(() => {
  // If welcome modal is not showing and privacy banner should show, show it immediately
  if (!showWelcomeModal.value && privacyStore.shouldShowBanner) {
    showCookieWithDelay.value = true
  }
})

// Reset when banner should not be shown
watch(() => privacyStore.shouldShowBanner, (newValue) => {
  if (!newValue) {
    showCookieWithDelay.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.6s cubic-bezier(.39,.39,.01,.99);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(75%);
}
</style>
