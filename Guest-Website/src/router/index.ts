import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useGuestStore } from '../stores/guest'
import { useRSVPStore } from '../stores/rsvp'
import { useUIStore } from '../stores/ui'
import { useGoodWillStore } from '../stores/goodWill'
import { usePrivacyStore } from '../stores/privacy'
import { useGiftStore } from '../stores/gift'
import { guestStorage } from '../utils/guestStorage'

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: () => import('../views/MainWebsiteView.vue'),
    beforeEnter: async () => {
      const guestStore = useGuestStore()
      const privacyStore = usePrivacyStore()

      if(guestStore.accessedViaToken){
        console.log('ℹ️ Navigated here from token-handler, skipping cached data check')
        return
      }
      
      // Try to load any valid cached guest data
      console.log('🏠 Accessing main website without token, checking for cached data...')
      const hasCachedData = guestStorage.checkCache()
      
      if (hasCachedData) {
        console.log('✅ Found cached data, initialising store from cache')
        initialiseStoreFromCache().catch((e) => console.error(e))
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
      const giftStore = useGiftStore()
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

      const privacyStore = usePrivacyStore()
      const guestStore = useGuestStore()
      const uiStore = useUIStore()

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
  const guestStore = useGuestStore()
  const rsvpStore = useRSVPStore()
  const goodWillStore = useGoodWillStore()
  const giftStore = useGiftStore()
  
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
  const guestStore = useGuestStore()
  const rsvpStore = useRSVPStore()
  const goodWillStore = useGoodWillStore()
  const giftStore = useGiftStore()

  try {
    // Load guest data first (most important)
    await guestStore.initialiseGuestStoreFromCache()
    
    // Load others in parallel (less critical)
    const results = await Promise.allSettled([
      rsvpStore.initialiseRsvpStoreFromCache(),
      goodWillStore.initialiseGoodWillStoreFromCache(),
      giftStore.initialiseGiftStoreFromCache()
    ])

    const storeNames = ['rsvp', 'goodWill', 'gift']
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`❌ Error initializing ${storeNames[index]} store from cache:`, result.reason)
      } else {
        console.log(`✅ ${storeNames[index]} store initialized from cache`)
      }
    })
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
  
  // Add loading state for longer operations
  const uiStore = useUIStore()
  if (to.meta?.showLoading !== false) {
    uiStore.setGlobalLoading(true)
  }
})

router.afterEach(() => {
  // Clear loading state
  const uiStore = useUIStore()
  uiStore.setGlobalLoading(false)
})

export default router
