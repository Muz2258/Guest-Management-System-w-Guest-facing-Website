import CryptoJS from 'crypto-js'
import { 
  logger, 
  ErrorType, 
  handleSync
} from './errorHandler'

interface StoredGuestData {
  token: string
  cookiesSeen?: boolean
  guestData?: any
  timestamp: number
  expiresAt: number
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
   * Save guest data to local storage with encryption
   */
  async saveGuestData(token: string, partialData: Partial<{
    guestInfo?: any;
    guestRsvp?: any;
    guestMessage?: any;
    guestGift?: any;
  }>): Promise<void> {
    const result = handleSync(() => {
      // Get existing data to merge
      console.log('fetching existing guest data for merge...')
      const existing = this.getGuestData(token)
      const currentData = existing?.data?.guestData || {guestInfo: {}, guestRsvp: {}, guestMessage: {}, guestGift: {}}
      const currentCookiesSeen = existing?.data?.cookiesSeen || false

      // Merge new partial data with existing data
      console.log('constructing merged guest data for storage...')
      const mergedData = {
        guestInfo: partialData.guestInfo || currentData.guestInfo,
        guestRsvp: partialData.guestRsvp || currentData.guestRsvp,
        guestMessage: partialData.guestMessage || currentData.guestMessage,
        guestGift: partialData.guestGift || currentData.guestGift
      }

      const now = Date.now()
      const storedData: StoredGuestData = {
        token,
        cookiesSeen: currentCookiesSeen,
        guestData: mergedData,
        timestamp: now,
        expiresAt: now + this.TTL
      }

      const jsonString = JSON.stringify(storedData)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.STORAGE_KEY, encryptedData)
      console.log('✅ Guest data securely saved to storage:', mergedData)
    }, 'save-guest-data', ErrorType.STORAGE)

    if (!result.success) {
      throw result.error
    }
  }

  /**
   * Retrieve and decrypt guest data from local storage
   */
  getGuestData(token?: string): { data: any; isValid: boolean } | null {
    const result = handleSync(() => {
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
        data: storedData,
        isValid: true
      }
    }, 'get-guest-data', ErrorType.STORAGE)

    if (!result.success) {
      // If decryption fails, clear potentially corrupted data
      this.clearGuestData()
      return null
    }

    return result.data
  }

  markCookiesAsSeen(token: string): boolean {
    const result = handleSync(() => {
      // Get existing data to merge
      const existing = this.getGuestData(token)
      const currentData = existing?.data?.guestData || {guestInfo: {}, guestRsvp: {}, guestMessage: {}, guestGift: {}}

      const now = Date.now()
      const update: StoredGuestData = {
        token,
        cookiesSeen: true,
        guestData: currentData,
        timestamp: now,
        expiresAt: now + this.TTL
      }

      const jsonString = JSON.stringify(update)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.STORAGE_KEY, encryptedData)
      console.log('✅ cookiesSeen flag updated in storage')
      return true
    }, 'mark-cookies-seen', ErrorType.STORAGE)

    return result.success ? result.data : false
  }

  /**
   * Check if guest data exists for a specific token
   */
  checkCache(token?: string): any {
    console.log('📦 Attempting to load guest data from cache...')
    let cachedData = null

    if(!token) cachedData = this.getGuestData()
    else cachedData = this.getGuestData(token)
    
    if (cachedData && cachedData.isValid) {
      console.log('✅ Loaded guest data from cache:', cachedData.data)
      return {hasCache: true, data: cachedData.data}
    }
    
    console.log('📭 No valid cached data found')
    return {hasCache: false, data: null}
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
    const result = handleSync(() => {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🧹 Cleared stored guest data')
    }, 'clear-guest-data', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }

  /**
   * Get time until stored data expires (in milliseconds)
   */
  getTimeUntilExpiry(): number | null {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.STORAGE_KEY)
      if (!encryptedData) return null

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      return Math.max(0, storedData.expiresAt - Date.now())
    }, 'get-expiry-time', ErrorType.STORAGE)

    return result.success ? result.data : null
  }

  /**
   * Refresh the expiry time of stored data
   */
  refreshExpiry(): void {
    const result = handleSync(() => {
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
    }, 'refresh-expiry', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }
}

export const guestStorage = new SecureGuestStorage()
