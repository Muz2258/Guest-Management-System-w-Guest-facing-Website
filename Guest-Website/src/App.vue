<template>
  <main v-if="isMobile">
    <transition appear name="slide-in">
      <HeaderNavigation v-if="showHeader" />
    </transition>

    <transition name="fade">
      <CookieBanner v-if="showCookie" />
    </transition>

    <RouterView v-slot="{ Component }">
      <component :is="Component" @hero-ready="closeLoaderScreen" @hero-animation-ended="openWelcomeModal" />
    </RouterView>
    
    <WelcomeModal 
      v-if="showWelcomeModal" 
      :is-visible="showWelcomeModal" 
    />

    <ManagePlusOneModal 
      v-if="showPlusOneModal && rsvpModalsLoaded" 
      :is-visible="showPlusOneModal" 
    />

    <RemovePlusOneModal 
      v-if="showRemovePlusOneModal && rsvpModalsLoaded" 
      :is-visible="showRemovePlusOneModal" 
    />

    <UpdateRsvpModal 
      v-if="showUpdateRSVPModal && rsvpModalsLoaded" 
      :is-visible="showUpdateRSVPModal" 
    />

    <ManageGoodWillMessageModal 
      v-if="showGoodWillModal && rsvpModalsLoaded" 
      :is-visible="showGoodWillModal" 
    />

    <DeleteGoodWillModal 
      v-if="showDeleteGoodWillModal && rsvpModalsLoaded" 
      :is-visible="showDeleteGoodWillModal" 
    />

    <GiftBottomSheet 
      v-if="showGiftBottomSheet"
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
/* -------------------- Local Type Definitions ------------------ */
interface RsvpModalComponents {
  managePlusOneModal?: any
  removePlusOneModal?: any
  updateRsvpModal?: any
  manageGoodWillMessageModal?: any
  deleteGoodWillModal?: any
  giftBottomSheet?: any
}


/* -------------------- Imports ------------------ */
import Icon from './components/Icon'
import { getColor } from './utils/colors'
import { guestStorage } from './utils/guestStorage'


/* ------------------ Stores ------------------ */
const guestStore = useGuestStore()
const rsvpStore = useRSVPStore()
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()
const route = useRoute()

const lazyStoreAccess = {
  async getGoodWillStore() {
    const { useGoodWillStore } = await import('./stores/goodWill')
    return useGoodWillStore()
  },
  async getGiftStore() {
    const { useGiftStore } = await import('./stores/gift')
    return useGiftStore()
  }
}


/* ------------------ Variables and States ------------------ */
const rsvpModalComponents = ref<RsvpModalComponents>({})
const rsvpModalsLoaded = ref(false)


/* ------------------ Components ------------------ */
const preloadRSVPModals = async () => {
  if (rsvpModalsLoaded.value) return
  
  console.log('🎯 Preloading RSVP section modals (including gift bottom sheet)...')
  
  try {
    const [
      managePlusOneModal,
      removePlusOneModal,
      updateRsvpModal,
      manageGoodWillMessageModal,
      deleteGoodWillModal,
      giftBottomSheet
    ] = await Promise.all([
      import('./components/Templates/ManagePlusOneModal.vue'),
      import('./components/Templates/RemovePlusOneModal.vue'),
      import('./components/Templates/UpdateRsvpModal.vue'),
      import('./components/Templates/ManageGoodWillMessageModal.vue'),
      import('./components/Templates/DeleteGoodWillModal.vue'),
      import('./components/Templates/GiftBottomSheet.vue') // Gift bottom sheet is also in RSVP section
    ])

    rsvpModalComponents.value = {
      managePlusOneModal: managePlusOneModal.default,
      removePlusOneModal: removePlusOneModal.default,
      updateRsvpModal: updateRsvpModal.default,
      manageGoodWillMessageModal: manageGoodWillMessageModal.default,
      deleteGoodWillModal: deleteGoodWillModal.default,
      giftBottomSheet: giftBottomSheet.default
    }
    
    rsvpModalsLoaded.value = true
    console.log('✅ RSVP section modals preloaded successfully (including gift bottom sheet)')
  } catch (error) {
    console.error('❌ Failed to preload RSVP modals:', error)
  }
}

const ManagePlusOneModal = defineAsyncComponent({
  loader: rsvpModalComponents.value.managePlusOneModal || (() => import('./components/Templates/ManagePlusOneModal.vue')),
  delay: 0,
})

const RemovePlusOneModal = defineAsyncComponent({
  loader: rsvpModalComponents.value.removePlusOneModal || (() => import('./components/Templates/RemovePlusOneModal.vue')),
  delay: 0,
})

const UpdateRsvpModal = defineAsyncComponent({
  loader: rsvpModalComponents.value.updateRsvpModal || (() => import('./components/Templates/UpdateRsvpModal.vue')),
  delay: 0,
})

const ManageGoodWillMessageModal = defineAsyncComponent({
  loader: rsvpModalComponents.value.manageGoodWillMessageModal || (() => import('./components/Templates/ManageGoodWillMessageModal.vue')),
  delay: 0,
})

const DeleteGoodWillModal = defineAsyncComponent({
  loader: rsvpModalComponents.value.deleteGoodWillModal || (() => import('./components/Templates/DeleteGoodWillModal.vue')),
  delay: 0,
})

const GiftBottomSheet = defineAsyncComponent({
  loader: rsvpModalComponents.value.giftBottomSheet || (() => import('./components/Templates/GiftBottomSheet.vue')),
  delay: 0,
})

const CookieBanner = defineAsyncComponent({
  loader: () => import('./components/Molecules/CookieBanner.vue'),
  delay: 50,
  timeout: 3000
})


/* ------------------ Reactive Variables ------------------ */
const showCookieWithDelay = ref(false)
const isMobile = ref<boolean>(true)
const tempToken = ref<string | null>(null)
const showHeader = ref<boolean>(true)

/* ------------------ Computed Properties ------------------ */
const showWelcomeModal = computed(() => uiStore.showWelcomeModal && !guestStore.hasCachedData && privacyStore.shouldShowBanner)
const showGiftBottomSheet = computed(() => uiStore.showGiftBottomSheet)
const showPlusOneModal = computed(() => uiStore.showPlusOneModal)
const showRemovePlusOneModal = computed(() => uiStore.showRemovePlusOneModal)
const showGoodWillModal = computed(() => uiStore.showGoodWillModal)
const showUpdateRSVPModal = computed(() => uiStore.showUpdateRSVPModal)
const showDeleteGoodWillModal = computed(() => uiStore.showDeleteGoodWillModal)

const showCookie = computed(() => {
  return privacyStore.shouldShowBanner && showCookieWithDelay.value
})


/* ------------------- Methods --------------------- */
const openWelcomeModal = () => {
  console.log('🎯 Hero animation ended. Checking if welcome modal should be shown')
  if(!tempToken.value || guestStore.hasCachedData) {
    console.log('✅ Guest either has cached data or is not visiting with token. Skipping welcome modal')
    return
  }
  uiStore.showHideWelcomeModal(true)
}

const closeLoaderScreen = () => {
  console.log('🎯 Hero ready - closing loader screen')
  const loaderScreen = document.getElementById('initial-loader')

  loaderScreen?.classList.add('fade-out')

  console.log('Loader screen closed.')
  preloadRSVPModals()
}

const checkMobileSize = () => {
  isMobile.value = window.innerWidth <= 600
}

const withRetry = async (fn: () => Promise<void>, retries = 3, delay = 1000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn()
      return
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error)

      if (attempt === retries) {
        throw error
      }

      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

const initialiseCriticalDataFromCache = (cachedData: any) => {
  console.log('🚀 Initialising critical stores with cached data')

  if(cachedData?.guestData?.guestInfo) {
    console.log('✅ Found valid cached guest data, initializing store with cached data')
    guestStore.guestData = cachedData.guestData.guestInfo
    guestStore.hasCachedData = true
    guestStore.loading = false
    guestStorage.refreshExpiry()
  }

  if(cachedData?.guestData?.guestRsvp) {
    console.log('✅ Found valid cached RSVP data, initializing store with cached data')
    rsvpStore.rsvpData = cachedData.guestData.guestRsvp
    rsvpStore.loadingInit = false
    guestStorage.refreshExpiry()
  }

  console.log('⚡ Critical data initialized, returning control to route guard')
}

const initialiseNonCriticalDataFromCache = async(cachedData: any) => {
  console.log('🚀 Initialising non-critical stores from cache')
  const initialiseInBackground = []

  if(cachedData?.guestData?.guestMessage) {
    const goodWillPromise = withRetry(async () => {
      try {
        console.log('✅ Found valid cached Good Will message data, initializing store from cache')
        const goodWillStore = await lazyStoreAccess.getGoodWillStore()
        goodWillStore.goodWillMessage = cachedData.guestData.guestMessage
        goodWillStore.loading = false
        guestStorage.refreshExpiry()
      } catch (error) {
        console.error('❌ Error initializing Good Will store from cache:', error)
      }
    }, 3, 500)

    initialiseInBackground.push(goodWillPromise)
  }

  if(cachedData?.guestData?.guestGift) {
    const giftPromise = withRetry(async () => {
      try {
        console.log('✅ Found valid cached Gift data, initializing store from cache')
        const giftStore = await lazyStoreAccess.getGiftStore()
        giftStore.gifts = cachedData.guestData.guestGift
        giftStore.loading = false
        guestStorage.refreshExpiry()
      } catch (error) {
        console.error('❌ Error initializing Gift store from cache:', error)
      }
    }, 3, 500)

    initialiseInBackground.push(giftPromise)
  }

  if(initialiseInBackground.length > 0) {
    await Promise.allSettled(initialiseInBackground)
      .then(() => console.log('🎯 Background store initializations completed'))
  }
}

const initialiseStoreWithToken = async (token: string) => {
  console.log('🚀 Initialising stores with token:', token)
  
  const [goodWillStore, giftStore] = await Promise.all([
    lazyStoreAccess.getGoodWillStore(),
    lazyStoreAccess.getGiftStore()
  ])
  
  try {
    const [guestResult, ...otherResults] = await Promise.allSettled([
      guestStore.fetchGuestByToken(token, true),
      rsvpStore.fetchRSVPData(token, true),
      goodWillStore.fetchGoodWillMessage(token, true),
      giftStore.fetchGuestGifts(token)
    ])

    if (guestResult.status === 'rejected') {
      throw guestResult.reason
    }

    const storeNames = ['guest', 'rsvp', 'goodWill', 'gift']
    ;[guestResult, ...otherResults].forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`❌ Error initializing ${storeNames[index]} store:`, result.reason)
      } else {
        console.log(`✅ ${storeNames[index]} store initialized successfully`)
      }
    })

  } catch (error) {
    console.error('❌ Critical error during store initialization:', error)
    throw error
  }
}


/* ------------------ Watchers ------------------ */
watch(showWelcomeModal, (newValue, oldValue) => {
  if (oldValue && !newValue && privacyStore.shouldShowBanner) {
    showCookieWithDelay.value = true
  }
}, { immediate: false })

watch(route, (newRoute) => {
  if(newRoute) {
    showHeader.value = newRoute.name !== 'media-viewer'
  }
})


/* ------------------- Lifecycle Hooks --------------------- */
onBeforeMount(async () => {
  console.log('⌛ Checking URL for token')
  const urlParam = window.location.pathname.split('/').pop() || ''
  tempToken.value = typeof urlParam === 'string' && /^[a-f0-9]{64}$/.test(urlParam) && urlParam ? urlParam : null

  if(!tempToken.value) {
    console.log('ℹ️ No token found in URL')
  } else {
    console.log('✅ Found valid token in URL:', tempToken.value)
  }
})

onMounted(async () => {
  // Initialize UI immediately - don't wait for data
  checkMobileSize()
  window.addEventListener('resize', checkMobileSize)

  const isMediaViewer = window.location.pathname.includes('media')
  showHeader.value = !isMediaViewer

  // Get tokens upfront
  const urlToken = tempToken.value
  const storedToken = guestStorage.getStoredToken()
  
  // Quick decision tree - no redundant checks
  let shouldUseCachedData = false
  let tokenToFetch = null

  // Decision logic (synchronous - no waiting)
  if (urlToken) {
    if (storedToken === urlToken) {
      // Token match - try cache first
      const cached = guestStorage.checkCache()
      if (cached.hasCache) {
        shouldUseCachedData = true
        console.log('⚡ Fast path: Using cached data for matching token')
      } else {
        tokenToFetch = urlToken
        console.log('📡 Cache miss: Will fetch data for URL token')
      }
    } else {
      // Token mismatch or no stored token - clear and fetch
      if (storedToken) {
        console.warn('⚠️ Token mismatch - clearing old data')
        guestStorage.clearGuestData()
      }
      tokenToFetch = urlToken
      console.log('📡 New token detected: Will fetch fresh data')
    }
  } else {
    // No URL token - check what we have locally
    const cached = guestStorage.checkCache()
    if (cached.hasCache) {
      shouldUseCachedData = true
      console.log('⚡ Fast path: Using cached data (no URL token)')
    } else if (storedToken) {
      tokenToFetch = storedToken
      console.log('📡 Data expired: Will re-fetch using stored token')
    } else {
      console.error('❌ No token or cached data available')
      guestStore.hasCachedData = false
      guestStore.guestData = null
      return
    }
  }

  // Execute the action (cache load is instant, fetch is async)
  if (shouldUseCachedData) {
    // INSTANT: Load from cache synchronously
    const cachedData = guestStorage.checkCache()
    initialiseCriticalDataFromCache(cachedData.data)
    privacyStore.initializeForCachedUser()
    guestStore.hasCachedData = true
    
    // Load non-critical data in background (doesn't block UI)
    setTimeout(() => {
      initialiseNonCriticalDataFromCache(cachedData.data)
      console.log('✅ Background: Non-critical data loaded')
    }, 0)
    
    console.log('✅ Page ready with cached data')
  } else if (tokenToFetch) {
    // ASYNC: Show loading state and fetch
    guestStore.loading = true
    
    try {
      // Fetch critical data first
      await initialiseStoreWithToken(tokenToFetch)
      privacyStore.initializeNotice(tokenToFetch)
      guestStore.hasCachedData = false
      
      console.log('✅ Page ready with fresh data')
    } catch (error) {
      console.error('❌ Failed to fetch guest data:', error)
      guestStore.guestData = null
    } finally {
      guestStore.loading = false
    }
  }
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

/* ✅ SMOOTH TRANSITIONS: Focus on natural animations */
.fade-enter-active, .fade-leave-active {
  transition: all 0.6s cubic-bezier(.39,.39,.01,.99);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(75%);
}

.slide-in-enter-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s;
}

.slide-in-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
</style>