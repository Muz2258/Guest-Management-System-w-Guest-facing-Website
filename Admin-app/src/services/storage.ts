import type { Session } from '@supabase/supabase-js'
import type { UserStaffProfile, FeaturePermission } from '@/types/auth'

interface StoredSession {
  session: Session
  profile: UserStaffProfile | null
  lastUpdated: number
  featureHash: string
}

const STORAGE_KEYS = {
  SESSION: 'app_session_v1',
} as const

// Create a hash of features array for quick comparison
function createFeatureHash(features: FeaturePermission[]): string {
  return features.sort().join(',')
}

// Validate session expiry
function isSessionValid(session: Session): boolean {
  if (!session.expires_at) return false
  const expiresAt = new Date(session.expires_at * 1000)
  // Add 5 second buffer for time sync issues
  return expiresAt > new Date(Date.now() + 5000)
}

export const storage = {
  // Store session data
  saveSession(session: Session, profile: UserStaffProfile | null): void {
    try {
      const storedData: StoredSession = {
        session,
        profile,
        lastUpdated: Date.now(),
        featureHash: profile ? createFeatureHash(profile.features) : ''
      }
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(storedData))
      this.broadcastStorageUpdate()
    } catch (e) {
      console.error('Error saving session:', e)
      this.clearSession()
    }
  },

  // Get stored session data
  getSession(): StoredSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION)
      if (!stored) return null

      const data: StoredSession = JSON.parse(stored)
      
      // Validate stored data structure
      if (!data.session || typeof data.lastUpdated !== 'number') {
        this.clearSession()
        return null
      }

      // Check session validity
      if (!isSessionValid(data.session)) {
        this.clearSession()
        return null
      }

      return data
    } catch (e) {
      console.error('Error reading session:', e)
      this.clearSession()
      return null
    }
  },

  // Clear session data
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
    this.broadcastStorageUpdate()
  },

  // Check if stored profile features match current features
  hasProfileChanged(currentProfile: UserStaffProfile | null, storedProfile: UserStaffProfile | null): boolean {
    if (!currentProfile || !storedProfile) {
      return currentProfile !== storedProfile
    }

    const currentHash = createFeatureHash(currentProfile.features)
    const storedHash = createFeatureHash(storedProfile.features)
    
    return currentHash !== storedHash
  },

  // Handle cross-tab communication
  // Internal method to broadcast storage updates
  broadcastStorageUpdate(): void {
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.SESSION,
      newValue: localStorage.getItem(STORAGE_KEYS.SESSION),
      storageArea: localStorage
    }))
  },

  // Subscribe to storage changes
  subscribeToChanges(callback: (data: StoredSession | null) => void): () => void {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.SESSION) {
        const data = event.newValue ? JSON.parse(event.newValue) as StoredSession : null
        callback(data)
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }
}
