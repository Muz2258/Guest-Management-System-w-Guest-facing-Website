<template>
  <main v-if="isMobile">
    <transition appear name="slide-down">
      <HeaderNavigation />
    </transition>

    <transition name="fade">
      <CookieBanner v-if="showCookie"/>
    </transition>

    <RouterView />
    
    <!-- ✅ OPTIMIZED: Lazy load modals with Suspense -->
    <Suspense>
      <template #default>
        <component 
          v-if="showWelcomeModal" 
          :is="WelcomeModalComponent" 
          :is-visible="showWelcomeModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showWelcomeModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showPlusOneModal" 
          :is="ManagePlusOneModalComponent" 
          :is-visible="showPlusOneModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showPlusOneModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showRemovePlusOneModal" 
          :is="RemovePlusOneModalComponent" 
          :is-visible="showRemovePlusOneModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showRemovePlusOneModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showUpdateRSVPModal" 
          :is="UpdateRsvpModalComponent" 
          :is-visible="showUpdateRSVPModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showUpdateRSVPModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showGoodWillModal" 
          :is="ManageGoodWillMessageModalComponent" 
          :is-visible="showGoodWillModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showGoodWillModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showDeleteGoodWillModal" 
          :is="DeleteGoodWillModalComponent" 
          :is-visible="showDeleteGoodWillModal" 
        />
      </template>
      <template #fallback>
        <div v-if="showDeleteGoodWillModal" class="modal-loading" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <component 
          v-if="showGiftBottomSheet" 
          :is="GiftBottomSheetComponent" 
          :is-visible="showGiftBottomSheet" 
        />
      </template>
      <template #fallback>
        <div v-if="showGiftBottomSheet" class="modal-loading" />
      </template>
    </Suspense>
  </main>
  
  <main v-else class="h-dvh flex flex-col justify-center items-center p-32">
    <div class="flex items-center space-x-16 mb-32">
      <div><Icon name="no-landscape" :color="getColor('denotive.denote_red')" :size="24"/></div>
      <div><Icon name="phone" :color="getColor('brand.accent')" :size="32"/></div>
      <div><Icon name="no-laptops" :color="getColor('denotive.denote_red')" :size="24"/></div>
    </div>
    <h1 class="text-heading-lg text-neutrals-neu-0 text-center mb-16">Phones in portrait Only</h1>
    <p class="text-s text-neutrals-neu-35 text-center max-w-[50%]">
      Sorry! This site works best on mobile phones in portrait mode. Please open your invitation link on your phone.
    </p>
  </main>
</template>

<script setup lang="ts">
/* -------------------- Imports ------------------ */
import Icon from './components/Icon'
import { getColor } from './utils/colors'

// ✅ CRITICAL: Keep these components that load immediately
import HeaderNavigation from './components/Organisms/HeaderNavigation.vue'
import CookieBanner from './components/Molecules/CookieBanner.vue'

// ✅ OPTIMIZATION: Lazy load modal components with smart preloading
const WelcomeModalComponent = defineAsyncComponent(() => import('./components/Templates/WelcomeModal.vue'))
const ManagePlusOneModalComponent = defineAsyncComponent(() => import('./components/Templates/ManagePlusOneModal.vue'))
const RemovePlusOneModalComponent = defineAsyncComponent(() => import('./components/Templates/RemovePlusOneModal.vue'))
const UpdateRsvpModalComponent = defineAsyncComponent(() => import('./components/Templates/UpdateRsvpModal.vue'))
const ManageGoodWillMessageModalComponent = defineAsyncComponent(() => import('./components/Templates/ManageGoodWillMessageModal.vue'))
const DeleteGoodWillModalComponent = defineAsyncComponent(() => import('./components/Templates/DeleteGoodWillModal.vue'))
const GiftBottomSheetComponent = defineAsyncComponent(() => import('./components/Templates/GiftBottomSheet.vue'))

/* ------------------ Stores ------------------ */
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()

/* ------------------ Reactive Variables ------------------ */
const showCookieWithDelay = ref(false)
const isMobile = ref<boolean>(true)

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
watch(showWelcomeModal, (newValue, oldValue) => {
  if (oldValue && !newValue && privacyStore.shouldShowBanner) {
    setTimeout(() => {
      showCookieWithDelay.value = true
    }, 1500)
  }
}, { immediate: false })

watch(() => privacyStore.shouldShowBanner, (newValue) => {
  if (!newValue) {
    showCookieWithDelay.value = false
  }
})

/* ------------------- Functions --------------------- */
const checkMobileSize = () => {
  isMobile.value = window.innerWidth <= 600
}

// ✅ OPTIMIZATION: Smart preloading of likely-used modals
const preloadCriticalModals = () => {
  // Preload high-priority modals after app is loaded
  setTimeout(() => {
    console.log('🚀 Preloading critical modals...')
    
    // Preload welcome and RSVP modals (most likely to be used)
    Promise.allSettled([
      WelcomeModalComponent,
      UpdateRsvpModalComponent
    ]).then(() => {
      console.log('✅ Critical modals preloaded')
    }).catch((error) => {
      console.warn('❌ Error preloading critical modals:', error)
    })
    
    // Preload other modals after a delay
    setTimeout(() => {
      Promise.allSettled([
        ManagePlusOneModalComponent,
        ManageGoodWillMessageModalComponent,
        GiftBottomSheetComponent
      ]).then(() => {
        console.log('✅ Secondary modals preloaded')
      }).catch((error) => {
        console.warn('❌ Error preloading secondary modals:', error)
      })
    }, 2000)
    
  }, 3000) // Wait 3 seconds after app load
}

/* ------------------- Lifecycle Hooks --------------------- */
onMounted(() => {
  checkMobileSize()
  window.addEventListener('resize', checkMobileSize)
  
  // If welcome modal is not showing and privacy banner should show, show it immediately
  if (!showWelcomeModal.value && privacyStore.shouldShowBanner) {
    showCookieWithDelay.value = true
  }
  
  // ✅ Start smart preloading
  preloadCriticalModals()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileSize)
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

/* ✅ OPTIMIZATION: Lightweight modal loading spinner */
.modal-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
</style>