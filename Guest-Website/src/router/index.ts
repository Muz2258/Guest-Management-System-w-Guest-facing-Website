import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGuestStore } from '../stores/guest'
import MainWebsiteView from '../views/MainWebsiteView.vue'
import GuestIdentifierView from '../views/GuestIdentifierView.vue'

const routes = [
  {
    path: '/',
    name: 'main-website',
    component: MainWebsiteView
  },
  {
    path: '/guest-identifier',
    name: 'guest-identifier',
    component: GuestIdentifierView
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
      const { fetchGuestByToken } = guestStore
      const { error } = storeToRefs(guestStore)
      
      try {
        console.log('🔑 Attempting to validate token...')
        await fetchGuestByToken(to.params.token as string)
        console.log('✅ Token validation successful, redirecting to main website')
        return {name: 'main-website'}
      } catch (e) {
        console.error('❌ Token validation failed:', e)
        error.value = e instanceof Error ? e.message : 'Invalid invitation link'
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
