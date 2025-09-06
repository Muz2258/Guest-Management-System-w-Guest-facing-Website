import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { nextTick } from 'vue'
import { useGuestStore } from '../stores/guest'
import { useUIStore } from '../stores/ui'
import MainWebsiteView from '../views/MainWebsiteView.vue'
import GuestIdentifierView from '../views/GuestIdentifierView.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: MainWebsiteView,
    beforeEnter: async () => {
      console.log('🏠 Accessing main website without token, checking for cached data...')
      
      const guestStore = useGuestStore()
      const uiStore = useUIStore()
      
      // Try to load any valid cached guest data
      const hasCachedData = guestStore.loadAnyValidCachedData()
      
      if (hasCachedData) {
        console.log('✅ Found cached guest data, enabling enhanced experience')
        // Show welcome modal for returning guests
        nextTick(() => {
          console.log('🎉 Showing welcome modal for cached guest:', guestStore.guest?.first_name)
          uiStore.showCookie = false // Don't show cookie banner if they already have cached data
          uiStore.showWelcome = false
        })
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
        await guestStore.fetchGuestByToken(to.params.token as string)
        console.log('✅ Token validation successful')
        
        // Step 1: Verify if guest data has been successfully fetched and stored
        if (!guestStore.guest) {
          console.error('❌ Guest data not found after successful token validation')
          guestStore.setError('Failed to load guest information')
          return { name: 'guest-identifier' }
        }
        
        console.log('✅ Guest data verified in store:', guestStore.guest)
        
        // Step 2: Navigate to the 'main-website' view
        console.log('🧭 Navigating to main-website view')
        
        // Step 3: Show the modal with the personalised welcome message
        // Use nextTick to ensure navigation is complete before showing modal
        nextTick(() => {
          console.log('🎉 Showing personalized welcome modal for:', guestStore.guest?.first_name)
          uiStore.showCookie = true
          uiStore.showWelcome = true
        })
        
        return { name: 'main-website' }
      } catch (e) {
        console.error('❌ Token validation failed:', e)
        guestStore.setError(e instanceof Error ? e.message : 'Invalid invitation link')
        console.log('🔄 Redirecting to guest identifier')
        return { name: 'guest-identifier' }
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
