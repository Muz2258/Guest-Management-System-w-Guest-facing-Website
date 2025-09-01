import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '@/utils/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const isAuthenticated = computed(() => !!session.value)
  const initialized = ref(false)

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      user.value = data.user
      await router.push('/')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred during login'
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      error.value = null
      
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError

      user.value = null
      await router.push('/login')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred during logout'
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
      // Get initial session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null

      // Set up session listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
      })

      // Clean up subscription on store disposal
      onUnmounted(() => {
        subscription.unsubscribe()
      })

      initialized.value = true
    } catch (e) {
      console.error('Error initializing auth:', e)
      throw e
    }
  }

  // Check if the session is expired
  const isSessionExpired = computed(() => {
    if (!session.value?.expires_at) return true
    const expiresAt = new Date(session.value.expires_at * 1000)
    return expiresAt <= new Date()
  })

  // Refresh session
  async function refreshSession() {
    try {
      loading.value = true
      error.value = null

      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) throw refreshError
      
      session.value = newSession
      user.value = newSession?.user ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error refreshing session'
      // If refresh fails, redirect to login
      await router.push('/login')
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
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
