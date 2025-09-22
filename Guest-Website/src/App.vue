<template>
  <main v-if="isMobile">
    <transition appear name="slide-down">
      <HeaderNavigation @mounted="onHeaderMounted" />
    </transition>

    <transition name="fade">
      <CookieBannerComponent v-if="showCookie" />
    </transition>

    <RouterView v-slot="{ Component }">
      <component :is="Component" @hero-ready="onHeroReady" @preload-rsvp-modals="preloadRSVPModals" />
    </RouterView>
    
    <!-- ✅ PRELOADED: WelcomeModal loads immediately - no delay for first-time users -->
    <WelcomeModalComponent 
      v-if="showWelcomeModal" 
      :is-visible="showWelcomeModal" 
    />

    <!-- ✅ OPTIMIZED LAZY: Workflow modals with zero delay settings -->

    <!-- ✅ SCROLL-TRIGGERED: RSVP modals load when user scrolls to RSVP section -->
    <ManagePlusOneModalComponent 
      v-if="showPlusOneModal && rsvpModalsLoaded" 
      :is-visible="showPlusOneModal" 
    />

    <RemovePlusOneModalComponent 
      v-if="showRemovePlusOneModal && rsvpModalsLoaded" 
      :is-visible="showRemovePlusOneModal" 
    />

    <UpdateRsvpModalComponent 
      v-if="showUpdateRSVPModal && rsvpModalsLoaded" 
      :is-visible="showUpdateRSVPModal" 
    />

    <ManageGoodWillMessageModalComponent 
      v-if="showGoodWillModal && rsvpModalsLoaded" 
      :is-visible="showGoodWillModal" 
    />

    <DeleteGoodWillModalComponent 
      v-if="showDeleteGoodWillModal && rsvpModalsLoaded" 
      :is-visible="showDeleteGoodWillModal" 
    />

    <component 
      v-if="showGiftBottomSheet" 
      :is="GiftBottomSheetComponent" 
      :is-visible="showGiftBottomSheet" 
    />
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
import HeaderNavigation from './components/Organisms/HeaderNavigation.vue'
import WelcomeModalComponent from './components/Templates/WelcomeModal.vue'

// ✅ CONDITIONAL: Cookie banner only loads for token users after welcome modal
const CookieBannerComponent = defineAsyncComponent({
  loader: () => import('./components/Molecules/CookieBanner.vue'),
  delay: 50, // Reduced delay for faster response
  timeout: 3000
})

// ✅ SCROLL-TRIGGERED: RSVP modals only load when user scrolls to RSVP section
const rsvpModalsLoaded = ref(false)

// Define async components that will be loaded on demand
const ManagePlusOneModalComponent = defineAsyncComponent(() => import('./components/Templates/ManagePlusOneModal.vue'))
const RemovePlusOneModalComponent = defineAsyncComponent(() => import('./components/Templates/RemovePlusOneModal.vue'))
const UpdateRsvpModalComponent = defineAsyncComponent(() => import('./components/Templates/UpdateRsvpModal.vue'))
const ManageGoodWillMessageModalComponent = defineAsyncComponent(() => import('./components/Templates/ManageGoodWillMessageModal.vue'))
const DeleteGoodWillModalComponent = defineAsyncComponent(() => import('./components/Templates/DeleteGoodWillModal.vue'))

// ✅ Simple function to preload RSVP modals when triggered by MainWebsiteView
const preloadRSVPModals = async () => {
  if (rsvpModalsLoaded.value) return
  
  console.log('🎯 Preloading RSVP section modals (including gift bottom sheet)...')
  
  try {
    // Preload all RSVP-related components including gift bottom sheet
    await Promise.all([
      import('./components/Templates/ManagePlusOneModal.vue'),
      import('./components/Templates/RemovePlusOneModal.vue'),
      import('./components/Templates/UpdateRsvpModal.vue'),
      import('./components/Templates/ManageGoodWillMessageModal.vue'),
      import('./components/Templates/DeleteGoodWillModal.vue'),
      import('./components/Templates/GiftBottomSheet.vue') // Gift bottom sheet is also in RSVP section
    ])
    
    rsvpModalsLoaded.value = true
    console.log('✅ RSVP section modals preloaded successfully (including gift bottom sheet)')
  } catch (error) {
    console.error('❌ Failed to preload RSVP modals:', error)
  }
}

const GiftBottomSheetComponent = defineAsyncComponent({
  loader: () => import('./components/Templates/GiftBottomSheet.vue'),
  delay: 0,
  timeout: 5000
})

/* ------------------ Stores ------------------ */
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()

/* ------------------ Reactive Variables ------------------ */
const showCookieWithDelay = ref(false)
const isMobile = ref<boolean>(true)

// ✅ RESOURCE-DRIVEN LOADING: Track when critical resources are ready
const criticalResourcesLoaded = ref({
  header: false,
  hero: false,
  fonts: false
  // Removed images requirement to simplify - fonts and components are sufficient
})

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

/* ------------------ Simple Event-Based RSVP Modal Loading ------------------ */
// Listen for event from MainWebsiteView when RSVP section comes into view
const handleRSVPPreloadEvent = () => {
  console.log('� Received RSVP preload signal from MainWebsiteView')
  preloadRSVPModals()
}

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

// ✅ RESOURCE LOADING COORDINATION: Track when critical resources are ready
const checkAllResourcesLoaded = () => {
  console.log('🔍 Checking resource loading status:', criticalResourcesLoaded.value)
  const allLoaded = Object.values(criticalResourcesLoaded.value).every(loaded => loaded)
  
  if (allLoaded) {
    console.log('🎯 All critical resources loaded - removing loading screen')
    hideInitialLoadingScreen()
  }
}

// ✅ Hide the HTML loading screen with smooth transition
const hideInitialLoadingScreen = () => {
  const loadingScreen = document.getElementById('initial-loading-screen')
  console.log('Is loading screen present?', !!loadingScreen)

  if (loadingScreen) {
    console.log('🎬 Removing loading screen - hero animation will start immediately with reduced delays')
    loadingScreen.style.transition = 'opacity 0.5s ease-out'
    loadingScreen.style.opacity = '0'
    setTimeout(() => {
      loadingScreen.style.display = 'none'
    }, 1000)
  }
}

const onHeaderMounted = () => {
  criticalResourcesLoaded.value.header = true
  console.log('✅ Header component mounted')
  checkAllResourcesLoaded()
}

const onHeroReady = () => {
  criticalResourcesLoaded.value.hero = true
  console.log('✅ Hero component ready for animation')
  checkAllResourcesLoaded()
}

const onFontsReady = () => {
  criticalResourcesLoaded.value.fonts = true
  console.log('✅ Fonts loaded')
  checkAllResourcesLoaded()
}

// ✅ INTELLIGENT PRELOADING: Aligned with actual user flow and timing
const preloadCriticalModals = () => {
  const guestStore = useGuestStore()
  
  // Preload if user has guest data (either via token or cached)
  if (!guestStore.accessedViaToken && !guestStore.hasCachedData) {
    console.log('📭 User accessing without token or cached data - minimal preloading')
    return
  }
  
  const userType = guestStore.accessedViaToken ? 'token user' : 'returning guest'
  const preloadDelay = guestStore.hasCachedData ? 100 : 250 // Faster for returning guests
  
  setTimeout(() => {
    console.log(`🚀 Starting intelligent modal preloading for ${userType}...`)
    
    // Phase 1: Preload welcome modal immediately since it shows at 3.5s (for token users)
    if (guestStore.accessedViaToken) {
      import('./components/Templates/WelcomeModal.vue')
        .then(() => console.log('✅ Welcome modal preloaded (ready for 3.5s timer)'))
        .catch((error) => console.warn('❌ Error preloading welcome modal:', error))
    }
    
    // Phase 2: Preload RSVP-related modals
    setTimeout(() => {
      if (guestStore.guestData?.permissions?.can_rsvp) {
        Promise.allSettled([
          import('./components/Templates/UpdateRsvpModal.vue'),
          import('./components/Templates/ManagePlusOneModal.vue')
        ]).then(() => {
          console.log('✅ RSVP modals preloaded')
        }).catch((error) => {
          console.warn('❌ Error preloading RSVP modals:', error)
        })
      }
    }, preloadDelay) // Faster timing for returning guests
    
    // Phase 3: Preload secondary features
    setTimeout(() => {
      Promise.allSettled([
        import('./components/Templates/GiftBottomSheet.vue'),
        import('./components/Templates/ManageGoodWillMessageModal.vue')
      ]).then(() => {
        console.log('✅ Secondary modals preloaded')
      }).catch((error) => {
        console.warn('❌ Error preloading secondary modals:', error)
      })
    }, preloadDelay * 2) // Scale with user type
    
  }, preloadDelay) // Start preloading after minimal delay for returning guests
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
  
  // ✅ Listen for RSVP preload signal from MainWebsiteView
  window.addEventListener('preload-rsvp-modals', handleRSVPPreloadEvent)
  
  // ✅ RESOURCE LOADING: Check for fonts
  // Check if fonts are already loaded
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      onFontsReady()
    }).catch(() => {
      // Fallback: assume fonts loaded after timeout
      setTimeout(onFontsReady, 1000)
    })
  } else {
    // Fallback for browsers without font loading API
    setTimeout(onFontsReady, 500)
  }
  
  // ✅ Initial check in case everything is already ready
  setTimeout(() => {
    checkAllResourcesLoaded()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobileSize)
  window.removeEventListener('preload-rsvp-modals', handleRSVPPreloadEvent)
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

/* ✅ SMOOTH TRANSITIONS: Focus on natural animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.6s cubic-bezier(.39,.39,.01,.99);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(75%);
}

.slide-down-enter-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 3.5s;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
</style>