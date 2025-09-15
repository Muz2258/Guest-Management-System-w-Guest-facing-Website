import type { GuestGifts } from '../types/guests';

export const useGiftStore = defineStore('gift', () => {
    /* ---------------------- Internal Types ---------------------- */
    interface paymentData {
        amount: number
        email: string
        guest_token: string
        is_anonymous?: boolean
        gift_item_id?: string
    }

    interface moneyGiftSummary {
        feeStructure: {
            baseFee: number
            percentageFee: number
        }
        netAmount: number
        processingFee: number
        totalCharge: number
    }

    interface paymentInitResponse {
        success: boolean;
        access_code?: string;
        authorization_url?: string;
        error?: string;
    }

    /* ---------------------- Stores ---------------------- */
    const guestStore = useGuestStore()

    /* ---------------------- States ---------------------- */
    const gifts = ref<GuestGifts | null>(null)
    const loading = ref(false);
    const error = ref<string | null>(null);

    const selectedAmount = ref<number | null>(null);
    const giftSummary = ref<moneyGiftSummary | null>(null)

    /* ---------------------- Computed ---------------------- */
    const has_gifted = computed(() => gifts.value !== null && gifts.value.gifts.length > 0)

    /* ---------------------- Methods ---------------------- */
    const updateSelectedAmount = (amount: number | string | null) => {
        if (amount === null || typeof amount === 'number') {
            selectedAmount.value = amount
            return
        }
        
        selectedAmount.value = parseFloat(amount)
    }

    const calculateGiftSummary = () => {
        if (selectedAmount.value === null) {
            giftSummary.value = null
            return
        }

        const baseFee = 100
        const percentageFee = 1.5
        const processingFee = selectedAmount.value * (percentageFee / 100) + baseFee
        const netAmount = selectedAmount.value - processingFee
        const totalCharge = selectedAmount.value

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

    const processGift = async (newGift: {
        gift_amount: number
        guest_email: string
        is_anonymous?: boolean
        guest_token: string
    }) => {
        console.log('Processing gift:', newGift)
        loading.value = true

        const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

        if(!paystackPublicKey) {
            error.value = 'Payment gateway is not configured properly.'
            console.error(error.value)
            loading.value = false
            return
        }

        const paymentInitRes: paymentInitResponse = await initializePayment({
            amount: newGift.gift_amount || 0,
            email: newGift.guest_email || '',
            guest_token: guestStore.guestData?.auth_token || '',
        })

        if(!paymentInitRes.success || !paymentInitRes.access_code) {
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
        loading.value = true
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
        }
    }

    const initialiseGiftStoreFromCache = async () => {
        console.log('🚀 Initialising gift store...')
        const cachedData = await guestStorage.getGuestData()

        if(!cachedData.data?.guestData?.guestGift) {
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
        error,
        selectedAmount,
        giftSummary,

        // Methods
        updateSelectedAmount,
        calculateGiftSummary,
        processGift,
        saveCurrentGiftData,
        initializePayment,
        fetchGuestGifts,
        initialiseGiftStoreFromCache
    }
})