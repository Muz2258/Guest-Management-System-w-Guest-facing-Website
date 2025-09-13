import CryptoJS from 'crypto-js'

interface StoredGuestData {
  token: string
  guestData: any
  timestamp: number
  expiresAt: number
}

// Import privacy store to check consent
let privacyStore: any = null

// Lazy load privacy store to avoid circular dependencies
const getPrivacyStore = async () => {
  if (!privacyStore) {
    const { usePrivacyStore } = await import('../stores/privacy')
    privacyStore = usePrivacyStore()
  }
  return privacyStore
}

class SecureGuestStorage {
  private readonly STORAGE_KEY = 'wedding_guest_data'
  private readonly SECRET_KEY = 'wedding_guest_secure_key_2024' // In production, this should be from env
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Encrypt data using AES encryption
   */
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString()
  }

  /**
   * Decrypt data using AES decryption
   */
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  /**
   * Check if functional cookies are allowed before saving
   */
  private async canUseStorage(): Promise<boolean> {
    try {
      const store = await getPrivacyStore()
      return store.preferences.functional
    } catch (error) {
      console.warn('⚠️ Privacy store not available, allowing storage for now')
      return true // Fallback to allow storage if privacy store isn't available
    }
  }

  /**
   * Save guest data to local storage with encryption
   */
  async saveGuestData(token: string, partialData: Partial<{
    guestInfo?: any;
    guestRsvp?: any;
    guestMessage?: any;
    guestGift?: any;
  }>): Promise<void> {
    try{
      const canStore = await this.canUseStorage()
      if (!canStore) {
        console.warn('🚫 Functional cookies not allowed, skipping guest data storage')
        return
      }

      // Get existing data to merge
      const existing = this.getGuestData(token)
      const currentData = existing?.guestData || {guestInfo: {}, guestRsvp: {}, guestMessage: {}}

      // Merge new partial data with existing data
      const mergedData = {
        guestInfo: partialData.guestInfo || currentData.guestInfo,
        guestRsvp: partialData.guestRsvp || currentData.guestRsvp,
        guestMessage: partialData.guestMessage || currentData.guestMessage,
        guestGift: partialData.guestGift || currentData.guestGift
      }

      const now = Date.now()
      const storedData: StoredGuestData = {
        token,
        guestData: mergedData,
        timestamp: now,
        expiresAt: now + this.TTL
      }

      const jsonString = JSON.stringify(storedData)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.STORAGE_KEY, encryptedData)
      console.log('✅ Guest data securely saved to storage:', mergedData)
    }catch(err){
      console.error('❌ Failed to save guest data:', err)
    }
  }

  /**
   * Retrieve and decrypt guest data from local storage
   */
  getGuestData(token?: string): { guestData: any; isValid: boolean } | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY)
      
      if (!encryptedData) {
        console.log('📭 No stored guest data found')
        return null
      }

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      // Check if data has expired
      if (Date.now() > storedData.expiresAt) {
        console.log('⏰ Stored guest data has expired, cleaning up')
        this.clearGuestData()
        return null
      }

      // If token is provided, verify it matches
      if (token && storedData.token !== token) {
        console.log('🔑 Token mismatch, stored data is for different guest')
        return null
      }

      console.log('✅ Retrieved valid guest data from storage')
      return {
        guestData: storedData.guestData,
        isValid: true
      }
    } catch (error) {
      console.error('❌ Failed to retrieve guest data:', error)
      // If decryption fails, clear potentially corrupted data
      this.clearGuestData()
      return null
    }
  }

  /**
   * Check if guest data exists for a specific token
   */
  checkCache(token?: string): boolean {
    console.log('📦 Attempting to load guest data from cache...')
    let cachedData = null

    if(!token) cachedData = this.getGuestData()
    else cachedData = this.getGuestData(token)
    
    if (cachedData && cachedData.isValid) {
      console.log('✅ Loaded guest data from cache:', cachedData.guestData)
      return true
    }
    
    console.log('📭 No valid cached data found')
    return false
  }

  /**
   * Check if valid guest data exists for a specific token
   */
  hasValidData(token: string): boolean {
    const result = this.getGuestData(token)
    return result !== null && result.isValid
  }

  /**
   * Clear stored guest data
   */
  clearGuestData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🧹 Cleared stored guest data')
    } catch (error) {
      console.error('❌ Failed to clear guest data:', error)
    }
  }

  /**
   * Get time until stored data expires (in milliseconds)
   */
  getTimeUntilExpiry(): number | null {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY)
      if (!encryptedData) return null

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      return Math.max(0, storedData.expiresAt - Date.now())
    } catch (error) {
      console.error('❌ Failed to get expiry time:', error)
      return null
    }
  }

  /**
   * Refresh the expiry time of stored data
   */
  refreshExpiry(): void {
    try {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY)
      if (!encryptedData) return

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      // Update expiry time
      storedData.expiresAt = Date.now() + this.TTL

      const jsonString = JSON.stringify(storedData)
      const newEncryptedData = this.encrypt(jsonString)
      
      localStorage.setItem(this.STORAGE_KEY, newEncryptedData)
      
      console.log('🔄 Refreshed guest data expiry')
    } catch (error) {
      console.error('❌ Failed to refresh expiry:', error)
    }
  }
}

export const guestStorage = new SecureGuestStorage()
