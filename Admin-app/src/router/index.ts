import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import GuestsView from '../views/GuestsView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    redirect: '/guests',
    meta: { requiresAuth: true }
  },
  {
    path: '/guests',
    name: 'Guests',
    component: GuestsView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Flag to track if auth has been initialized
let authInitialized = false

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true

  // Initialize auth store if not already done
  if (!authInitialized) {
    await authStore.init()
    authInitialized = true
  }

  // Check session expiration if authenticated
  if (authStore.isAuthenticated && authStore.isSessionExpired) {
    try {
      await authStore.refreshSession()
    } catch {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (!requiresAuth && authStore.isAuthenticated) {
    return { name: 'Dashboard' }
  }
})

export default router
