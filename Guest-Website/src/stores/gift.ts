import type { Gift } from '../types/guests';

export const useGiftStore = defineStore('gift', () => {
    /* ---------------------- Internal Types ---------------------- */
    interface moneyGiftSummary {
        feeStructure: {
            baseFee: number
            percentageFee: number
        }
        netAmount: number
        processingFee: number
        totalCharge: number
    }

    /* ---------------------- Stores ---------------------- */
    const uiStore = useUIStore()

    /* ---------------------- States ---------------------- */
    const gift = ref<Gift | null>(null)
    const has_gifted = ref<boolean>(gift.value !== null)
    const loading = ref(false);
    const error = ref<string | null>(null);

    const selectedAmount = ref<number | null>(null);
    const giftSummary = ref<moneyGiftSummary | null>(null)

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

    const processGift = (newGift: Gift) => {
        loading.value = true
        setTimeout(() => {
            gift.value = newGift
            has_gifted.value = true
            loading.value = false
            uiStore.hideAllBottomSheets()
            console.log('Gift processed:', gift.value)
        }, 1000)
    }
    
    const saveCurrentGiftData = async (token: string) => {
        guestStorage.saveGuestData(token, { guestGift: gift.value })
    }

    return {
        // States
        gift,
        has_gifted,
        loading,
        error,
        selectedAmount,
        giftSummary,

        // Methods
        updateSelectedAmount,
        calculateGiftSummary,
        processGift,
        saveCurrentGiftData
    }
})