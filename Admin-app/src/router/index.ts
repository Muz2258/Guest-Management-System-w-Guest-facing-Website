import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import LoginView from '../views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import GuestsView from '../views/GuestsView.vue'
import Dashboard from '@/views/Dashboard.vue'
import GoodWillMessages from '@/views/GoodWillMessages.vue'
import CheckInView from '@/views/CheckInView.vue'
import SeatingView from '@/views/SeatingView.vue'

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
    component: Dashboard,
    meta: { requiresAuth: true, role: 'super-admin' }
  },
  {
    path: '/goodwill-messages',
    name: 'Goodwill Messages',
    component: GoodWillMessages,
    meta: { requiresAuth: true, role: 'super-admin' }
  },
  {
    path: '/guests',
    name: 'Guests',
    component: GuestsView,
    meta: { requiresAuth: true, role: 'super-admin' }
  },
  {
    path: '/seating',
    name: 'Seating',
    component: SeatingView,
    meta: { requiresAuth: true, role: 'super-admin' }
  },
  {
    path: '/check-in',
    name: 'Check In',
    component: CheckInView,
    meta: {requiresAuth: true, role: 'check-in-staff'}
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Flag to track if auth has been initialized
let authInitialized = false

// Navigation guard
router.beforeEach(async (to) => {
  console.log('🚦 Router Guard - Navigation to:', to.fullPath)
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth ?? true
  const requiredRole = to.meta.role
  
  console.log('🔐 Auth State:', {
    initialized: authInitialized,
    storeInitialized: authStore.initialized,
    isAuthenticated: authStore.isAuthenticated,
    hasSession: !!authStore.session,
    hasUser: !!authStore.user,
    userRole: authStore.activeRole,
    requiresAuth
  })

  // Initialize auth store if not already done
  if (!authInitialized) {
    console.log('🚀 Starting auth initialization')
    await authStore.init()
    authInitialized = true
    console.log('✅ Auth initialization complete', {
      isAuthenticated: authStore.isAuthenticated,
      hasSession: !!authStore.session,
      hasUser: !!authStore.user
    })
  }

  // First step: Check basic authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('❌ Authentication required but not authenticated, redirecting to login')
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Second step: For authenticated routes, check session and staff access
  if (requiresAuth && authStore.isAuthenticated) {
    // Check session expiration
    if (authStore.isSessionExpired) {
      console.log('⚠️ Session expired, attempting refresh')
      try {
        await authStore.refreshSession()
        console.log('✅ Session refresh successful')
      } catch {
        console.log('❌ Session refresh failed, redirecting to login')
        return { name: 'Login', query: { redirect: to.fullPath } }
      }
    }

    if(requiredRole !== authStore.activeRole) {
      ElMessage.error('You are not authorized to access this page')
      return { name: 'Login', query: { redirect: to.fullPath }}
    }
  }

  console.log('✅ Navigation guard checks passed')
})

export default router
