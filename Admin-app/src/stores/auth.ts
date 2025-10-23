import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserStaffProfile, FeatureAccess, FeaturePermission } from '@/types/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()
  const initialized = ref(false)
  const isValidating = ref(false)
  const activeRole = ref<string | null>(null)
  // const staffProfile = ref<UserStaffProfile | null>(null)

  // Enhanced authentication check
  const isAuthenticated = computed(() => {
    const authenticated = !!session.value && !isSessionExpired.value
    console.log('🔑 Authentication check:', {
      hasSession: !!session.value,
      sessionExpiry: session.value?.expires_at,
      userRole: activeRole.value,
      authenticated,
      isValidating: isValidating.value
    })
    return authenticated
  })

  async function login(email: string, password: string) {
    try {
      console.log('🔑 Starting login process')
      loading.value = true
      error.value = null
      activeRole.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw authError
      }

      console.log('✅ Login successful, fetching staff profile')
      user.value = data.user
      session.value = data.session

      console.log('✨ Login complete, redirecting to home')
      
      if(user.value.user_metadata.role === 'super-admin') {
        activeRole.value = 'super-admin'
        await router.push('/')
      }else if(user.value.user_metadata.role === 'check-in-staff') {
        activeRole.value = 'check-in-staff'
        await router.replace('/check-in')
      }
    } catch (e) {
      console.error('❌ Login error:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred during login'
      if (error.value === 'Staff access required') {
        ElMessage.error('Only staff members can access this application')
      } else {
        ElMessage.error(error.value)
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      console.log('👋 Starting logout process')
      loading.value = true
      error.value = null
      
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError

      // Clear all auth state immediately
      session.value = null
      user.value = null
      activeRole.value = null

      // Force route change before anything else
      console.log('✅ Logout complete, forcing navigation to login')
      await router.replace('/login')
      
      // Show success message
      ElMessage.success('Successfully logged out')
      
    } catch (e) {
      console.error('❌ Logout error:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred during logout'
      ElMessage.error(error.value)
      
      // Even if there's an error, try to redirect to login
      await router.replace('/login')
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(email: string) {
    try {
      loading.value = true
      error.value = null
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError
      
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred during password reset'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      loading.value = true
      error.value = null
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError
      
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred while updating password'
      return false
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state and set up session listener
  async function init() {
    if (initialized.value) return

    try {
      console.log('🚀 Initializing auth store')

      // Check Supabase session
      console.log('📡 Checking Supabase session')
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession?.user) {
        console.log('✅ Found active session')
        session.value = currentSession
        user.value = currentSession.user
        activeRole.value = user.value.user_metadata.role
      }

      // Set up session listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        console.log('🔄 Auth state change:', _event)
        
        if (_event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          session.value = null
          user.value = null
          activeRole.value = null
          return
        }

        if (newSession?.user) {
          console.log('🔐 Session updated')
          session.value = newSession
          user.value = newSession.user
          activeRole.value = user.value.user_metadata.role
        }
      })

      // Clean up
      onUnmounted(() => {
        console.log('🧹 Cleaning up auth subscription')
        subscription.unsubscribe()
      })

      initialized.value = true
    } catch (e) {
      console.error('❌ Error initializing auth:', e)
      throw e
    } finally {
      isValidating.value = false
    }
  }

  // Check if the session is expired
  const isSessionExpired = computed(() => {
    if (!session.value?.expires_at) {
      console.log('⚠️ No session expiry found')
      return true
    }
    const expiresAt = new Date(session.value.expires_at * 1000)
    const now = new Date()
    const isExpired = expiresAt <= now
    console.log('⏰ Session expiry check:', {
      expiresAt: expiresAt.toISOString(),
      now: now.toISOString(),
      isExpired,
      timeLeft: Math.floor((expiresAt.getTime() - now.getTime()) / 1000) + ' seconds'
    })
    return isExpired
  })

  // Refresh session
  async function refreshSession() {
    try {
      console.log('🔄 Refreshing session')
      loading.value = true
      error.value = null
      isValidating.value = true

      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) throw refreshError
      
      if (newSession) {
        console.log('✅ Session refresh successful')
        session.value = newSession
        user.value = newSession.user
        activeRole.value = user.value.user_metadata.role
      } else {
        console.log('❌ No session after refresh')
        session.value = null
        user.value = null
        activeRole.value = null
        await router.push('/login')
      }
    } catch (e) {
      console.error('❌ Session refresh error:', e)
      error.value = e instanceof Error ? e.message : 'Error refreshing session'
      await router.push('/login')
    } finally {
      loading.value = false
      isValidating.value = false
    }
  }

  return {
    user,
    session,
    activeRole,
    loading,
    error,
    initialized,
    isAuthenticated,
    isSessionExpired,
    login,
    logout,
    resetPassword,
    updatePassword,
    refreshSession,
    init
  }
})
