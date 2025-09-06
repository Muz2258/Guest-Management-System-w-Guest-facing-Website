<template>
  <main class="page-wrapper">
    <div class="content-wrapper">
      <Hero />
      <EventDetails id="details" />
    </div>
  </main>
  <Modal v-if="showModal" @close="handleClose">
    <template #body>
      <WelcomeMsg v-if="showWelcome" />
    </template>
    <template #footer>
      <WelcomeFoot 
        v-if="showWelcome"
        @details-click="goToDetails"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
// Stores and Utilities
const uiStore = useUIStore()

// Computed properties
const showModal = computed(() => uiStore.showModal)
const showWelcome = computed(() => uiStore.showWelcome)

// Functions
const handleClose = () => {
  uiStore.hideAllModals();
}

const goToDetails = () => {
  uiStore.hideAllModals();
  uiStore.scrollToSection('details');
}
</script>

<style lang="postcss" scoped>
@reference '../styles/main.css';

#main-hero-image::before {
  content: "Cheema '25";
  display: inline-block;
  position: absolute;
  bottom: 0;
  left: -9%;
  writing-mode: sideways-lr;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}

#main-hero-image::after {
  content: "#BuiltToLast";
  display: inline-block;
  position: absolute;
  top: 0;
  right: -9%;
  writing-mode: sideways-rl;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}
</style>