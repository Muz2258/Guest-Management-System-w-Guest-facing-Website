import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

const lazyStoreAccess = {
  async getGiftStore() {
    const { useGiftStore } = await import('../stores/gift')
    return useGiftStore()
  }
}

const routes = [
  {
    path: '/:token?',
    name: 'main-website',
    component: () => import('../views/MainWebsiteView.vue'),
    beforeEnter: (to: RouteLocationNormalized) => {
      if(to.params.token) {
        return {
          name: 'main-website',
          replace: true
        }
      }else {
        return true
      }
    }
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('../views/GalleryView.vue'),
    meta: { scrollBehavior: 'instant'}
  },
  {
    path: '/payment-validation/:token',
    name: 'payment-validation',
    component: () => import('../views/PaymentValidation.vue'),
    beforeEnter: async (to: RouteLocationNormalized) => {
      console.log('🚦 Route guard triggered for payment validation', to.path )
      const giftStore = await lazyStoreAccess.getGiftStore()
      const guestToken = to.params.token as string
      
      await giftStore.fetchGuestGifts(guestToken)

      return true
    }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../views/PrivacyPolicy.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.meta?.scrollBehavior) {
      return {
        top: 0,
        behavior: to.meta.scrollBehavior as ScrollBehavior // 'auto' | 'smooth'
      }
    }
    
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
