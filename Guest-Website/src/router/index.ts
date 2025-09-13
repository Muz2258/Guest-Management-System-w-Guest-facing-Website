import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useGuestStore } from '../stores/guest'
import { useRSVPStore } from '../stores/rsvp'
import { useUIStore } from '../stores/ui'
import { useGoodWillStore } from '../stores/goodWill'
import { guestStorage } from '../utils/guestStorage'
import MainWebsiteView from '../views/MainWebsiteView.vue'
import GuestIdentifierView from '../views/GuestIdentifierView.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: MainWebsiteView,
    beforeEnter: async () => {
      const guestStore = useGuestStore()

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
      } else {
        console.log('📭 No cached data found, proceeding with basic website experience')
      }
    }
  },
  {
    path: '/guest-identifier',
    name: 'guest-identifier',
    component: GuestIdentifierView
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
          uiStore.showCookie = false
          uiStore.hideAllModals()
          uiStore.hideAllBottomSheets()
        }else {
          console.log('🎉 Showing personalized welcome modal for:', guestStore.guestData?.guest.first_name)
          uiStore.showCookie = true
          uiStore.showHideWelcomeModal(true)
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
  
  const results = await Promise.allSettled([
    guestStore.fetchGuestByToken(token),
    rsvpStore.fetchRSVPData(token),
    goodWillStore.fetchGoodWillMessage(token)
  ])

  results.forEach((result, index) => {
    const stores = [guestStore, rsvpStore, goodWillStore]
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

  const results = await Promise.allSettled([
    guestStore.initialiseGuestStoreFromCache(),
    rsvpStore.initialiseRsvpStoreFromCache(),
    goodWillStore.initialiseGoodWillStoreFromCache()
  ])

  results.forEach((result, index) => {
    const stores = [guestStore, rsvpStore, goodWillStore]
    if (result.status === 'rejected') {
      console.warn(`❌ Error initializing store ${stores[index]}:`, result.reason)
    } else {
      console.log(`✅ ${stores[index]} initialized successfully`)
    }
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
