import type { GuestGifts, GiftItem } from '../types/guests'
import { supabase } from '../utils/supabase'

export const useGiftStore = defineStore('gift', () => {
  /* ---------------------- Internal Types ---------------------- */
  interface paymentData {
    guest_email: string
    guest_token: string
    is_anonymous?: boolean
    gift_item_id?: string
    payment_type: 'monetary' | 'contribution' | 'full_purchase'
    amount_gifted: number
    processing_fee: number
    delivery_fee?: number
  }

  interface moneyGiftSummary {
    feeStructure: {
      baseFee: number
      percentageFee: number
    }
    netAmount: number
    processingFee: number
    totalCharge: number
    deliveryFee?: number
    itemName?: string
  }

  interface paymentInitResponse {
    success: boolean;
    access_code?: string;
    authorization_url?: string;
    error?: string;
  }

  /* ---------------------- Stores ---------------------- */
  const guestStore = useGuestStore()
  const uiStore = useUIStore()

  /* ---------------------- States ---------------------- */
  const gifts = ref<GuestGifts | null>(null)
  const loading = ref(false)
  const fetching = ref(false)
  const isPayingFees = ref(false)
  const error = ref<string | null>(null)
  const giftingMode = ref<'sending' | 'contribution' | 'full_purchase'>('sending')

  const selectedAmount = ref<number | null>(null)
  const giftSummary = ref<moneyGiftSummary | null>(null)

  const giftItems = ref<GiftItem[]>([])
  const selectedGiftItem = ref<GiftItem | null>(null)

  const baseFee = 100
  const percentageFee = 1.5
  const maxProcessingFee = 2000

  /* ---------------------- Computed ---------------------- */
  const has_gifted = computed(() => gifts.value !== null && gifts.value.gifts.length > 0)

  const sortedGiftItems = computed(() => {
    return [...giftItems.value].sort((a, b) => {
      const a_funded = a.price <= a.amount_contributed
      const b_funded = b.price <= b.amount_contributed
      if (a_funded && !b_funded) return 1
      if (!a_funded && b_funded) return -1
      return 0
    })
  })

  /* ---------------------- Methods ---------------------- */
  const updateSelectedAmount = (amount: number | string | null) => {
    if (amount === null || typeof amount === 'number') {
      selectedAmount.value = amount
      return
    }
    
    selectedAmount.value = parseFloat(amount)
  }

  const calculateGiftSummary = () => {
    console.log('Calculating gift summary')
    if (selectedAmount.value === null) {
      giftSummary.value = null
      return
    }

    // Handle cases where selectedAmount is 0, empty string, or undefined
    const amount = selectedAmount.value || 0
    
    if (amount === 0) {
      if (giftingMode.value === 'full_purchase') {
        giftSummary.value = {
          feeStructure: {
            baseFee,
            percentageFee
          },
          netAmount: 0,
          processingFee: 0,
          totalCharge: 0,
          deliveryFee: 0
        }
      } else {
        giftSummary.value = {
          feeStructure: {
            baseFee,
            percentageFee
          },
          netAmount: 0,
          processingFee: 0,
          totalCharge: 0
        }
      }
      return
    }

    const deliveryFee = giftingMode.value === 'full_purchase' ? selectedGiftItem.value?.delivery_fee || 0 : 0
    const processingFee = Math.min((amount + deliveryFee) * (percentageFee / 100) + baseFee, maxProcessingFee)
    const netAmount = isPayingFees.value ? amount : amount - (processingFee + deliveryFee)
    const totalCharge = isPayingFees.value ? amount + processingFee + deliveryFee : amount

    if (giftingMode.value === 'full_purchase') {
      giftSummary.value = {
        feeStructure: {
          baseFee,
          percentageFee
        },
        netAmount,
        processingFee,
        totalCharge,
        deliveryFee
      }
    }else {
      giftSummary.value = {
        feeStructure: {
          baseFee,
          percentageFee
        },
        netAmount,
        processingFee,
        totalCharge
      }
    }
  }

  const setSelectedGiftItem = (item: GiftItem, action: 'buy' | 'contribute') => {
    console.log('Setting selected gift item:', item, 'Action:', action)
    selectedGiftItem.value = item

    if(action === 'buy') {
      updateSelectedAmount(item.price)
      setGiftingMode('full_purchase')
      calculateGiftSummary()
      uiStore.showHideGiftingSheets('summary')
    }else {
      uiStore.showHideGiftingSheets('contribute-form')
      setGiftingMode('contribution')
    }
  }

  const clearGiftSelection = () => {
    selectedAmount.value = null
    selectedGiftItem.value = null
    giftSummary.value = null
  }

  const setIsPayingFees = (value: boolean) => {
    console.log('Setting isPayingFees to:', value)
    isPayingFees.value = value
  }

  const setGiftingMode = (mode: 'sending' | 'contribution' | 'full_purchase') => {
    giftingMode.value = mode
  }

  const initializePayment = async (details: paymentData): Promise<paymentInitResponse> => {
    console.log('Initializing payment with details:', details)
    loading.value = true
    error.value = null

    try {
      const initResponse = await fetch('https://mxgdroyymeepbrgecgwu.supabase.co/functions/v1/initialize-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${details.guest_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(details)
      })

      if(!initResponse.ok) {
        console.error('Failed to initialize payment. Status:', initResponse.status)
        error.value = 'Failed to initialize payment. Please try again.'
        return {
          success: false,
          error: `HTTP error! status: ${initResponse.status}`
        }
      }

      const res = await initResponse.json()

      if(!res || (!res.data.access_code && !res.data.authorization_url)) {
        console.error('Failed to initialize payment. Response:', res)
        error.value = 'Failed to initialize payment. Please try again.'
        return {
          success: false,
          error: 'No access code or authorization URL returned from payment initialization.'
        }
      }
      
      console.log('Payment initialized successfully. Returning access code.')
      return {
        success: true,
        access_code: res.data.access_code,
        authorization_url: res.data.authorization_url
      }
    } catch (err: any) {
      console.error('Error during payment initialization:', err)
      error.value = err.message || 'An unexpected error occurred.'
      return {
        success: false,
        error: err.message
      }
    } finally {
      error.value = null
    }
  }

  const processGift = async (newGift: paymentData) => {
    console.log('Processing gift:', newGift)
    loading.value = true

    const paystackPublicKey = process.env.VITE_APP_PAYSTACK_PUBLIC_KEY

    if(!paystackPublicKey) {
      error.value = 'Payment gateway is not configured properly.'
      console.error(error.value)
      loading.value = false
      return
    }

    const paymentInitRes = await initializePayment(newGift)

    if (!paymentInitRes.success || !paymentInitRes.access_code) {
      error.value = paymentInitRes.error || 'Failed to initialize payment.'
      console.error(error.value)
      loading.value = false
      return
    }

    if(paymentInitRes.authorization_url) {
      window.location.href = paymentInitRes.authorization_url
    }
  }

  const fetchGuestGifts = async (token: string) => {
    console.log('Initializing gift fetching process for:', token)
    fetching.value = true
    error.value = null

    try {
      console.log('Fetching guest gifts from database for token:', token)
      const {data: res, error: err} = await supabase
        .rpc('guest_get_gifts', {
          auth_token: token
        })

      if(err) {
        console.error('Supabase RPC error:', err)
        throw err
      }

      console.log('Gifts retrieved from database:', res)

      console.log('Formating gift data for store...')
      const giftData = {
        guest_email: res.guest_email,
        gifts: res.gifts || []
      }

      gifts.value = giftData

      console.log('Gifts saved to store successfully:', gifts.value)

      // Save to secure storage for future use
      await guestStorage.saveGuestData(token, {guestGift: gifts.value})
      console.log('Gifts successfully saved to cache:', gifts.value)
    } catch (err: any) {
      console.error('Error fetching gifts:', err)
      error.value = err.message || 'An unexpected error occurred while fetching gifts.'
    } finally {
      fetching.value = false
      error.value = null
    }
  }

  const fetchGiftItems = async () => {
    console.log('Initializing gift items fetching process')
    fetching.value = true
    error.value = null

    try {
      const guestToken = guestStore.guestData?.auth_token
      
      if (!guestToken) {
        console.error('No guest token found for fetching gift items')
        error.value = 'Authentication required to fetch gift items.'
        fetching.value = false
        return
      }

      console.log('Fetching gift items from database for token:', guestToken)
      const {data: res, error: err} = await supabase
        .rpc('guest_get_gift_items', {
          auth_token: guestToken
        })

      if(err) {
        console.error('Supabase RPC error:', err)
        throw err
      }

      console.log('Gift items retrieved from database:', res)

      giftItems.value = res.data
      console.log('Gift items saved to store successfully:', giftItems.value)
    } catch (err: any) {
      console.error('Error fetching gift items:', err)
      error.value = err.message || 'An unexpected error occurred while fetching gift items.'
    } finally {
      fetching.value = false
      error.value = null
    }
  }

  const initialiseGiftStoreFromCache = async () => {
    console.log('🚀 Initialising gift store...')
    const cachedData = await guestStorage.getGuestData()

    if(!cachedData?.data?.guestData?.guestGift) {
      console.log('❌ No cached guest gift data found')
      throw new Error('No cached guest gift data found')
    }

    gifts.value = cachedData.data.guestData.guestGift
    loading.value = false
    guestStorage.refreshExpiry()

    console.log('✅ Guest gift data loaded from cache:', gifts.value)
    return
  }
  
  const saveCurrentGiftData = async (token: string) => {
    guestStorage.saveGuestData(token, { guestGift: gifts.value })
  }

  return {
    // States
    gifts,
    has_gifted,
    loading,
    fetching,
    error,
    selectedAmount,
    giftSummary,
    giftItems,
    sortedGiftItems,
    selectedGiftItem,
    baseFee,
    percentageFee,
    isPayingFees,
    giftingMode,

    // Methods
    updateSelectedAmount,
    calculateGiftSummary,
    processGift,
    saveCurrentGiftData,
    initializePayment,
    fetchGuestGifts,
    initialiseGiftStoreFromCache,
    fetchGiftItems,
    setSelectedGiftItem,
    clearGiftSelection,
    setIsPayingFees,
    setGiftingMode
  }
})