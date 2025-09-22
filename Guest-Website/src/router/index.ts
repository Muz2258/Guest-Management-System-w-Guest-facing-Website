import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { guestStorage } from '../utils/guestStorage'

// ✅ OPTIMIZATION: Helper to lazy load stores only when needed
const lazyStoreAccess = {
  async getGuestStore() {
    const { useGuestStore } = await import('../stores/guest')
    return useGuestStore()
  },
  async getPrivacyStore() {
    const { usePrivacyStore } = await import('../stores/privacy')
    return usePrivacyStore()
  },
  async getRSVPStore() {
    const { useRSVPStore } = await import('../stores/rsvp')
    return useRSVPStore()
  },
  async getUIStore() {
    const { useUIStore } = await import('../stores/ui')
    return useUIStore()
  },
  async getGoodWillStore() {
    const { useGoodWillStore } = await import('../stores/goodWill')
    return useGoodWillStore()
  },
  async getGiftStore() {
    const { useGiftStore } = await import('../stores/gift')
    return useGiftStore()
  }
}

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: () => import('../views/MainWebsiteView.vue'),
    beforeEnter: async () => {
      const [guestStore, privacyStore] = await Promise.all([
        lazyStoreAccess.getGuestStore(),
        lazyStoreAccess.getPrivacyStore()
      ])

      if(guestStore.accessedViaToken){
        console.log('ℹ️ Navigated here from token-handler, skipping cached data check')
        return
      }
      
      // Try to load any valid cached guest data
      console.log('🏠 Accessing main website without token, checking for cached data...')
      const hasCachedData = guestStorage.checkCache()
      
      if (hasCachedData) {
        console.log('✅ Found cached data, initialising store from cache')
        // ✅ CRITICAL FIX: Wait for cache initialization to complete before proceeding
        try {
          await initialiseStoreFromCache()
          console.log('🎯 Cache initialization completed, proceeding with navigation')
        } catch (error) {
          console.error('❌ Error initializing from cache:', error)
          // Continue anyway but log the error
        }
        privacyStore.initializeForCachedUser()
      } else {
        console.log('📭 No cached data found, proceeding with basic website experience')
      }
    }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('../views/GalleryView.vue'),
    meta: { preload: false }
  },
  {
    path: '/payment-validation/:token',
    name: 'payment-validation',
    component: () => import('../views/PaymentValidation.vue'),
    beforeEnter: async (to: RouteLocationNormalized) => {
      console.log('🚦 Route guard triggered for payment validation', to.path )
      const giftStore = await lazyStoreAccess.getGiftStore()
      const guestToken = to.params.token as string

      Promise.allSettled([
        giftStore.fetchGuestGifts(guestToken),
        initialiseStoreFromCache()
      ]).catch((e) => console.error(e))

      return true
    }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../views/PrivacyPolicy.vue')
  },
  {
    path: '/:token',
    name: 'token-handler',
    component: () => import('../views/MainWebsiteView.vue'),
    props: true,
    beforeEnter: async (to: RouteLocationNormalized) => {
      console.log('🚦 Route guard triggered for token handling', {
        path: to.path,
        token: to.params.token
      })

      const [privacyStore, guestStore, uiStore] = await Promise.all([
        lazyStoreAccess.getPrivacyStore(),
        lazyStoreAccess.getGuestStore(),
        lazyStoreAccess.getUIStore()
      ])

      try {
        console.log('🔑 Attempting to validate token...')
        
        const tokenValidation = initialiseStoreWithToken(to.params.token as string)
        
        console.log('🧭 Navigating to main-website view')
        guestStore.accessedViaToken = true
        
        const navigationPromise = router.push({ name: 'main-website' })
        
        const [, tokenResult] = await Promise.allSettled([navigationPromise, tokenValidation])
        
        if (tokenResult.status === 'rejected') {
          throw tokenResult.reason
        }

        console.log('✅ Token validation successful')
        if(guestStore.hasCachedData){
          uiStore.hideAllModals()
          uiStore.hideAllBottomSheets()
        } else {
          console.log('🎉 Showing personalized welcome modal for:', guestStore.guestData?.guest.first_name)
          setTimeout(() => {
            uiStore.showHideWelcomeModal(true)
            privacyStore.initializeNotice(to.params.token as string)
          }, 3500)
        }
      } catch (e) {
        console.error('❌ Token validation failed:', e)
        guestStore.setError(e instanceof Error ? e.message : 'Invalid invitation link')
        console.log('🔄 Redirecting to main website')
        return { name: 'main-website' }
      }
    }
  }
]

const initialiseStoreWithToken = async (token: string) => {
  console.log('🚀 Initialising stores with token:', token)
  
  // ✅ OPTIMIZATION: Load stores only when needed
  const [guestStore, rsvpStore, goodWillStore, giftStore] = await Promise.all([
    lazyStoreAccess.getGuestStore(),
    lazyStoreAccess.getRSVPStore(),
    lazyStoreAccess.getGoodWillStore(),
    lazyStoreAccess.getGiftStore()
  ])
  
  try {
    const [guestResult, ...otherResults] = await Promise.allSettled([
      guestStore.fetchGuestByToken(token), // Critical - must succeed
      rsvpStore.fetchRSVPData(token),
      goodWillStore.fetchGoodWillMessage(token),
      giftStore.fetchGuestGifts(token)
    ])

    // Guest data is critical - fail if this fails
    if (guestResult.status === 'rejected') {
      throw guestResult.reason
    }

    // Log other failures but don't block the app
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

const initialiseStoreFromCache = async() => {
  console.log('🚀 Initialising stores from cache')
  
  // ✅ OPTIMIZATION: Load guest store first (critical), then load others only if needed
  const guestStore = await lazyStoreAccess.getGuestStore()
  
  try {
    // Load guest data first (most important)
    await guestStore.initialiseGuestStoreFromCache()
    
    // ✅ OPTIMIZATION: Only load other stores if guest has the relevant permissions
    const loadPromises: Promise<any>[] = []
    const storeNames: string[] = []
    
    if (guestStore.guestData?.permissions?.can_rsvp) {
      loadPromises.push(
        lazyStoreAccess.getRSVPStore().then(store => store.initialiseRsvpStoreFromCache())
      )
      storeNames.push('rsvp')
    }
    
    // Always load goodWill and gift stores as they're commonly used
    loadPromises.push(
      lazyStoreAccess.getGoodWillStore().then(store => store.initialiseGoodWillStoreFromCache()),
      lazyStoreAccess.getGiftStore().then(store => store.initialiseGiftStoreFromCache())
    )
    storeNames.push('goodWill', 'gift')
    
    // Load relevant stores in parallel
    if (loadPromises.length > 0) {
      const results = await Promise.allSettled(loadPromises)
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`❌ Error initializing ${storeNames[index]} store from cache:`, result.reason)
        } else {
          console.log(`✅ ${storeNames[index]} store initialized from cache`)
        }
      })
    }
  } catch (error) {
    console.error('❌ Error initializing guest store from cache:', error)
    // Don't throw - let the app continue with fresh data
  }
}

const preloadRoute = (routeName: string) => {
  const route = routes.find(r => r.name === routeName)
  if (route && typeof route.component === 'function') {
    route.component().catch(console.error)
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // ✅ OPTIMIZATION 14: Optimize scroll behavior
    if (savedPosition) {
      // Restore scroll position when using browser back/forward
      return savedPosition
    }
    
    if (to.hash) {
      // Delay scroll to hash to allow content to load
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            behavior: 'smooth',
          })
        }, 100)
      })
    }
    
    // Only smooth scroll on different routes, instant for same route
    const shouldSmoothScroll = to.name !== from.name
    return { 
      top: 0, 
      behavior: shouldSmoothScroll ? 'smooth' : 'instant'
    }
  },
})

router.beforeEach(async (to) => {
  // Preload likely next routes based on current route
  if (to.name === 'main-website') {
    // User likely to visit gallery next
    setTimeout(() => preloadRoute('gallery'), 2000)
  }
  
  // ✅ OPTIMIZATION: Only load UI store when actually needed
  if (to.meta?.showLoading !== false) {
    const uiStore = await lazyStoreAccess.getUIStore()
    uiStore.setGlobalLoading(true)
  }
})

router.afterEach(async () => {
  // ✅ OPTIMIZATION: Only clear loading if UI store was loaded
  try {
    const uiStore = await lazyStoreAccess.getUIStore()
    uiStore.setGlobalLoading(false)
  } catch {
    // UI store not loaded yet, no need to clear loading
  }
})

export default router
