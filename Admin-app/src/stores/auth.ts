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
  const staffProfile = ref<UserStaffProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()
  const initialized = ref(false)
  const isValidating = ref(false)

  // Enhanced authentication check
  const isAuthenticated = computed(() => {
    const authenticated = !!session.value && !isSessionExpired.value
    console.log('🔑 Authentication check:', {
      hasSession: !!session.value,
      sessionExpiry: session.value?.expires_at,
      authenticated,
      isValidating: isValidating.value
    })
    return authenticated
  })

  const featureAccess = computed<FeatureAccess>(() => ({
    canCreateGuests: hasFeatureAccess('create_guests'),
    canEditGuests: hasFeatureAccess('edit_guest_details'),
    canDeleteGuests: hasFeatureAccess('delete_guests'),
    canViewGuests: hasFeatureAccess('view_all_guests'),
    canManageRSVPs: hasFeatureAccess('edit_rsvp_responses') || hasFeatureAccess('manual_rsvp_entry'),
    canViewRSVPs: hasFeatureAccess('view_rsvp_responses')
  }))

  const isStaffMember = computed(() => !!staffProfile.value?.is_active)

  function hasFeatureAccess(feature: FeaturePermission): boolean {
    return !!(staffProfile.value?.is_active && staffProfile.value?.features?.includes(feature))
  }

  async function login(email: string, password: string) {
    try {
      console.log('🔑 Starting login process')
      loading.value = true
      error.value = null
      staffProfile.value = null
      
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
      
      // Fetch staff profile
      await fetchStaffProfile(data.user.id)

      console.log('👤 Staff profile check:', isStaffMember.value ? 'is staff' : 'not staff')
      // Only allow staff members to proceed
      if (!isStaffMember.value) {
        console.log('❌ Not a staff member, logging out')
        await logout()
        throw new Error('Staff access required')
      }

      console.log('✨ Login complete, redirecting to home')
      await router.push('/')
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
      staffProfile.value = null

      // Force route change before anything else
      console.log('✅ Logout complete, forcing navigation to login')
      // Use replace instead of push to prevent going back
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
        await fetchStaffProfile(currentSession.user.id)
      }

      // Set up session listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        console.log('🔄 Auth state change:', _event)
        
        if (_event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          session.value = null
          user.value = null
          staffProfile.value = null
          return
        }

        if (newSession?.user) {
          console.log('🔐 Session updated')
          session.value = newSession
          user.value = newSession.user
          await fetchStaffProfile(newSession.user.id)
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

  async function fetchStaffProfile(userId: string) {
    try {
      console.log('👤 Fetching staff profile for user:', userId)
      // First, get the staff profile with their role
      const { data: profile, error: profileError } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) throw profileError
      if (!profile) throw new Error('Staff profile not found')
      
      console.log('📋 Found staff profile:', profile)

      // Then, get the features for their role from role_features and features tables
      const { data: roleFeatures, error: featuresError } = await supabase
        .from('role_features')
        .select('feature_id')
        .eq('role', profile.role)

      if (featuresError) throw featuresError

      console.log('🔑 Role features:', roleFeatures)
      
      // Get the actual features from the features table
      const featureIds = roleFeatures?.map(rf => rf.feature_id) || []
      console.log('🏷️ Feature IDs:', featureIds)
      
      if (featureIds.length === 0) {
        console.log('⚠️ No feature IDs found for role, setting empty features array')
        staffProfile.value = {
          ...profile,
          features: []
        }
        return
      }
      
      const { data: features, error: featureNamesError } = await supabase
        .from('features')
        .select('feature_name')
        .in('feature_id', featureIds)

      if (featureNamesError) throw featureNamesError

      console.log('✨ Features:', features)

      // Extract feature names and cast them to FeaturePermission
      const featureNames = features?.map(f => f.feature_name as FeaturePermission) || []

      const newProfile = {
        ...profile,
        features: featureNames
      }

      console.log('🔄 Updating staff profile with new data')
      staffProfile.value = newProfile
    } catch (e) {
      console.error('❌ Error fetching staff profile:', e)
      staffProfile.value = null
      throw e
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

  // Helper to check permissions outside auth store
  function checkPermission(permission: FeaturePermission): boolean {
    return hasFeatureAccess(permission)
  }

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
        
        // Re-fetch profile to ensure we have latest permissions
        await fetchStaffProfile(newSession.user.id)
      } else {
        console.log('❌ No session after refresh')
        session.value = null
        user.value = null
        staffProfile.value = null
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
    staffProfile,
    loading,
    error,
    initialized,
    isAuthenticated,
    isStaffMember,
    isSessionExpired,
    featureAccess,
    hasFeatureAccess,
    login,
    logout,
    resetPassword,
    updatePassword,
    refreshSession,
    init
  }
})
