<template>
  <div>
    <CookieBanner v-if="showCookie" />
    <RouterView />
    <Modal v-if="showWelcome" @close="handleClose">
      <template #body>
        <WelcomeMsg />
      </template>
      <template #footer>
        <WelcomeFoot 
          @details-click="goToDetails"
        />
      </template>
    </Modal>
    <!-- <CacheStatus :token="guestData?.auth_token" :show="true"/> -->
  </div>
</template>

<script setup lang="ts">
// Stores
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()

// Computed properties
const showWelcome = computed(() => uiStore.showWelcome)
const showCookie = computed(() => uiStore.showCookie && !privacyStore.hasSeenBanner)

// Functions
const handleClose = () => {
  uiStore.hideAllModals();
}

const goToDetails = () => {
  uiStore.hideAllModals();
  uiStore.scrollToSection('details');
}
</script>

<style>
</style>
