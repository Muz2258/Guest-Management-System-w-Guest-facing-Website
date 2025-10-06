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
    path: '/media/:imageID',
    name: 'media-viewer',
    component: () => import('../views/MediaViewerView.vue'),
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

      if(to.query && to.query.action === 'cancel' && to.query.reference) {
        console.log('Payment was cancelled for reference:', to.query.reference)
        const reference = to.query.reference as string

        console.log('Updating guest gift associated with cancelled payment')
        await giftStore.updateCanceledGuestGift(guestToken, reference)

        console.log('Redirecting back to main website after cancellation')
        return { name: 'main-website', replace: true }
      }
      
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
  scrollBehavior(to) {
    if (to.meta?.scrollBehavior) {
      return {
        top: 0,
        behavior: to.meta.scrollBehavior as ScrollBehavior // 'auto' | 'smooth'
      }
    }
    return { top: 0 }
  }
})

export default router
