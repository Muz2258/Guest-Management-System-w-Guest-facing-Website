import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useGuestStore } from '../stores/guest'
import { useRSVPStore } from '../stores/rsvp'
import { useUIStore } from '../stores/ui'
import { useGoodWillStore } from '../stores/goodWill'
import { usePrivacyStore } from '../stores/privacy'
import { useGiftStore } from '../stores/gift'
import { guestStorage } from '../utils/guestStorage'
import MainWebsiteView from '../views/MainWebsiteView.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import PaymentValidation from '../views/PaymentValidation.vue'

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: MainWebsiteView,
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
        await initialiseStoreFromCache()
        // For cached users, don't show the banner (they've been here before)
        privacyStore.initializeForCachedUser()
      } else {
        console.log('📭 No cached data found, proceeding with basic website experience')
        // For completely new users without tokens, don't show banner either
        privacyStore.initializeForCachedUser()
      }
    }
  },
  {
    path: '/payment-validation/:token',
    name: 'payment-validation',
    component: PaymentValidation,
    beforeEnter: async (to: RouteLocationNormalized) => {
      console.log('🚦 Route guard triggered for payment validation', to.path )
      const giftStore = useGiftStore()
      const guestToken = to.params.token as string

      await giftStore.fetchGuestGifts(guestToken)
      await initialiseStoreFromCache()

      return true
    }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicy
  },
  {
    path: '/:token',
    name: 'token-handler',
    component: MainWebsiteView,
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
        // await guestStore.fetchGuestByToken(to.params.token as string)
        await initialiseStoreWithToken(to.params.token as string)
        console.log('✅ Token validation successful')

        //Navigate to the 'main-website' view
        console.log('🧭 Navigating to main-website view')
        guestStore.accessedViaToken = true
        await router.push({ name: 'main-website' })
        
        // Use nextTick to ensure navigation is complete before showing modal
        if(guestStore.hasCachedData){
          // uiStore.showCookie = false
          uiStore.hideAllModals()
          uiStore.hideAllBottomSheets()
        }else {
          console.log('🎉 Showing personalized welcome modal for:', guestStore.guestData?.guest.first_name)
          // uiStore.showCookie = true
          setTimeout(() => {
            uiStore.showHideWelcomeModal(true)
            privacyStore.initializeNotice(to.params.token as string)
            // Note: Data notice will be shown via banner component if not yet acknowledged
          }, 4500)
        }
      } catch (e) {
        console.error('❌ Token validation failed:', e)
        guestStore.setError(e instanceof Error ? e.message : 'Invalid invitation link')
        console.log('🔄 Redirecting to guest identifier')
        return { name: 'guest-identifier' }
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
  
  const results = await Promise.allSettled([
    guestStore.fetchGuestByToken(token),
    rsvpStore.fetchRSVPData(token),
    goodWillStore.fetchGoodWillMessage(token),
    giftStore.fetchGuestGifts(token)
  ])

  results.forEach((result, index) => {
    const stores = [guestStore, rsvpStore, goodWillStore, giftStore]
    if (result.status === 'rejected') {
      console.warn(`❌ Error initializing store ${stores[index]}:`, result.reason)
    } else {
      console.log(`✅ Store ${index} initialized successfully`)
    }
  })
}

const initialiseStoreFromCache = async() => {
  console.log('🚀 Initialising stores from cache')
  const guestStore = useGuestStore()
  const rsvpStore = useRSVPStore()
  const goodWillStore = useGoodWillStore()
  const giftStore = useGiftStore()

  const results = await Promise.allSettled([
    guestStore.initialiseGuestStoreFromCache(),
    rsvpStore.initialiseRsvpStoreFromCache(),
    goodWillStore.initialiseGoodWillStoreFromCache(),
    giftStore.initialiseGiftStoreFromCache()
  ])

  results.forEach((result, index) => {
    const stores = [guestStore, rsvpStore, goodWillStore, giftStore]
    if (result.status === 'rejected') {
      console.warn(`❌ Error initializing store ${stores[index]}:`, result.reason)
    } else {
      console.log(`✅ ${stores[index]} initialized successfully`)
    }
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    } else {
      // Always scroll to the top of the page on a new route
      return { top: 0, behavior: 'smooth' };
    }
  },
})

export default router
