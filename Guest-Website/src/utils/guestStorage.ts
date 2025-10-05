import CryptoJS from 'crypto-js'
import { 
  logger, 
  ErrorType, 
  handleSync
} from './errorHandler'

interface StoredGuestData {
  cookiesSeen?: boolean
  guestData?: any
  timestamp: number
  expiresAt: number
}

interface StoredToken {
  token: string
  timestamp: number
  expiresAt: number
}

class SecureGuestStorage {
  private readonly storageKey = import.meta.env.VITE_APP_PRIVACY_STORAGE_KEY
  private readonly tokenKey = `${import.meta.env.VITE_APP_PRIVACY_STORAGE_KEY}_token`
  private readonly secreteKey = import.meta.env.VITE_APP_PRIVACY_SECRETE_KEY
  private readonly DATA_TTL = 24 * 60 * 60 * 1000
  private readonly TOKEN_TTL = import.meta.env.VITE_APP_PRIVACY_TTL * 24 * 60 * 60 * 1000

  /**
   * Encrypt data using AES encryption
   */
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secreteKey).toString()
  }

  /**
   * Decrypt data using AES decryption
   */
  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secreteKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  private saveToken(token: string): void {
    const result = handleSync(() => {
      const now = Date.now()
      const storedToken: StoredToken = {
        token,
        timestamp: now,
        expiresAt: now + this.TOKEN_TTL
      }

      const jsonString = JSON.stringify(storedToken)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.tokenKey, encryptedData)
      console.log('✅ Token securely saved to storage')
    }, 'save-token', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }

  getStoredToken(): string | null {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.tokenKey)
      
      if (!encryptedData) {
        console.log('📭 No stored token found')
        return null
      }

      const decryptedData = this.decrypt(encryptedData)
      const storedToken: StoredToken = JSON.parse(decryptedData)

      // Check if token has expired
      if (Date.now() > storedToken.expiresAt) {
        console.log('⏰ Stored token has expired, cleaning up')
        this.clearToken()
        return null
      }

      console.log('✅ Retrieved valid token from storage')
      return storedToken.token
    }, 'get-stored-token', ErrorType.STORAGE)

    if (!result.success) {
      // If decryption fails, clear potentially corrupted data
      this.clearToken()
      return null
    }

    return result.data
  }

  private clearToken(): void {
    const result = handleSync(() => {
      localStorage.removeItem(this.tokenKey)
      console.log('🧹 Cleared stored token')
    }, 'clear-token', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
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
    const result = handleSync(() => {
      this.saveToken(token)

      console.log('fetching existing guest data for merge...')
      const existing = this.getGuestData()
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
        cookiesSeen: currentCookiesSeen,
        guestData: mergedData,
        timestamp: now,
        expiresAt: now + this.DATA_TTL
      }

      const jsonString = JSON.stringify(storedData)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.storageKey, encryptedData)
      console.log('✅ Guest data securely saved to storage:', mergedData)
    }, 'save-guest-data', ErrorType.STORAGE)

    if (!result.success) {
      throw result.error
    }
  }

  /**
   * Retrieve and decrypt guest data from local storage
   */
  getGuestData(): { data: any; isValid: boolean } | null {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.storageKey)
      
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

  markCookiesAsSeen(): boolean {
    const result = handleSync(() => {
      // Get existing data to merge
      const existing = this.getGuestData()
      const currentData = existing?.data?.guestData || {guestInfo: {}, guestRsvp: {}, guestMessage: {}, guestGift: {}}

      const now = Date.now()
      const update: StoredGuestData = {
        cookiesSeen: true,
        guestData: currentData,
        timestamp: now,
        expiresAt: now + this.DATA_TTL
      }

      const jsonString = JSON.stringify(update)
      const encryptedData = this.encrypt(jsonString)

      localStorage.setItem(this.storageKey, encryptedData)
      console.log('✅ cookiesSeen flag updated in storage')
      return true
    }, 'mark-cookies-seen', ErrorType.STORAGE)

    return result.success ? result.data : false
  }

  /**
   * Check if guest data exists for a specific token
   */
  checkCache(): any {
    console.log('📦 Attempting to load guest data from cache...')
    const cachedData = this.getGuestData()
    
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
  hasValidData(): boolean {
    const result = this.getGuestData()
    return result !== null && result.isValid
  }

  hasValidToken(): boolean {
    return this.getStoredToken() !== null
  }

  /**
   * Clear stored guest data
   */
  clearGuestData(): void {
    const result = handleSync(() => {
      localStorage.removeItem(this.storageKey)
      console.log('🧹 Cleared stored guest data')
    }, 'clear-guest-data', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }

  clearAll(): void {
    this.clearGuestData()
    this.clearToken()
    console.log('🧹 Cleared all stored data and token')
  }

  /**
   * Get time until stored data expires (in milliseconds)
   */
  getTimeUntilExpiry(): number | null {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.storageKey)
      if (!encryptedData) return null

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      return Math.max(0, storedData.expiresAt - Date.now())
    }, 'get-expiry-time', ErrorType.STORAGE)

    return result.success ? result.data : null
  }

  getTokenTimeUntilExpiry(): number | null {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.tokenKey)
      if (!encryptedData) return null

      const decryptedData = this.decrypt(encryptedData)
      const storedToken: StoredToken = JSON.parse(decryptedData)

      return Math.max(0, storedToken.expiresAt - Date.now())
    }, 'get-token-expiry-time', ErrorType.STORAGE)

    return result.success ? result.data : null
  }

  /**
   * Refresh the expiry time of stored data
   */
  refreshExpiry(): void {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.storageKey)
      if (!encryptedData) return

      const decryptedData = this.decrypt(encryptedData)
      const storedData: StoredGuestData = JSON.parse(decryptedData)

      // Update expiry time
      storedData.expiresAt = Date.now() + this.DATA_TTL

      const jsonString = JSON.stringify(storedData)
      const newEncryptedData = this.encrypt(jsonString)
      
      localStorage.setItem(this.storageKey, newEncryptedData)
      
      console.log('🔄 Refreshed guest data expiry')
    }, 'refresh-expiry', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }

  refreshTokenExpiry(): void {
    const result = handleSync(() => {
      const encryptedData = localStorage.getItem(this.tokenKey)
      if (!encryptedData) return

      const decryptedData = this.decrypt(encryptedData)
      const storedToken: StoredToken = JSON.parse(decryptedData)

      // Update expiry time
      storedToken.expiresAt = Date.now() + this.TOKEN_TTL

      const jsonString = JSON.stringify(storedToken)
      const newEncryptedData = this.encrypt(jsonString)
      
      localStorage.setItem(this.tokenKey, newEncryptedData)
      
      console.log('🔄 Refreshed token expiry')
    }, 'refresh-token-expiry', ErrorType.STORAGE)

    if (!result.success) {
      logger.log(result.error)
    }
  }
}

export const guestStorage = new SecureGuestStorage()
