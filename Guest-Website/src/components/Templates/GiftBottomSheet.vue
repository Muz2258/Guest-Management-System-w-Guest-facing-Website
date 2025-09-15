<template>
    <bottom-sheet @close="handleClose">
        <template v-if="showGiftingForm" #body>
            <div class="px-24 pb-24">
                <h3 class="text-heading-md text-neutrals-neu-0 mb-16">
                    Send a gift
                </h3>
                <p class="text-neutrals-neu-35 text-s mb-32">
                    While your presence is valued, your gifts are also very much appreciated.
                </p>
                
                <!-- Preset Amount Selection -->
                <div class="mb-24">
                    <p class="text-s text-neutrals-neu-46 mb-12">
                        Select an amount:
                    </p>
                    <div class="grid grid-cols-3 gap-8">
                        <ToggleButton
                            v-for="amount in presetAmounts"
                            :key="amount"
                            :is-selected="selectedPresetAmount === amount"
                            @toggle="handlePresetAmountSelect(amount)"
                        >
                            ₦{{ formatAmount(amount) }}
                        </ToggleButton>
                    </div>
                </div>

                <!-- Custom Amount Input -->
                <Input 
                    v-model='customAmountInput'
                    label="Or enter a custom amount"
                    type="number"
                    placeholder="Enter amount"
                    prefix="₦"
                    :min="1"
                    :error="customAmountError"
                    @input="handleCustomAmountInput"
                    class="mb-24"
                />

                <!-- Selected Amount Display -->
                <div class="mb-24 p-12 bg-brand-sec-light-100 border-brand-sec">
                    <p class="text text-brand-pri">
                        Gift amount: ₦{{ finalSelectedAmount ? formatAmount(finalSelectedAmount) : 0.00 }}
                    </p>
                </div>
            </div>
        </template>

        <template v-if="showGiftSummary" #body>
            <div class="px-24 pb-24">
                <h3 class="text-heading-md text-neutrals-neu-0 mb-16">
                    Gift summary
                </h3>
                <p class="text-neutrals-neu-35 text-s mb-32">
                    A summary of your gift selection. Use the 'Pay' button below to process your contribution.
                </p>

                <table class="w-full text-left mb-24">
                    <tbody>
                        <tr >
                            <td class="py-6 text-neutrals-neu-35">What we get</td>
                            <td class="py-6 text-right font-medium text-neutrals-neu-0">₦{{ formatAmount(giftBreakdown?.netAmount) }}</td>
                        </tr>
                        <tr >
                            <td class="pt-6 pb-12 text-neutrals-neu-35">
                                <div class="flex items-center gap-6">
                                    <span>Processing fees</span>
                                    <span class="text-brand-accent md:hidden">({{ giftBreakdown?.feeStructure.percentageFee }}% + ₦{{ giftBreakdown?.feeStructure.baseFee }})</span>
                                    <div class="hidden relative md:flex items-center">
                                        <Icon name="question" :color="getColor('brand.pri')" :size="18" :stroke-width="1.5" class="peer" />
                                        <div class="absolute peer-hover:block hidden left-0 top-full min-w-[180px] bg-neutrals-neu-100 p-12 border border-brand-sec-light-100 rounded-md shadow-xl text-neutrals-neu-0">
                                            <span>Processing fee:</span>
                                            <span class="text-brand-accent font-semibold ml-6">{{ giftBreakdown?.feeStructure.percentageFee }}% + ₦{{ giftBreakdown?.feeStructure.baseFee }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="pt-6 pb-12 text-right text-neutrals-neu-35">₦{{ formatAmount(giftBreakdown?.processingFee) }}</td>
                        </tr>
                        <tr class="border-t border-brand-sec">
                            <td class="py-6 font-semibold text-neutrals-neu-0">Total</td>
                            <td class="py-6 text-right font-semibold text-neutrals-neu-0">₦{{ formatAmount(giftBreakdown?.totalCharge) }}</td>
                        </tr>
                    </tbody>
                </table>

                <Input 
                    v-model="email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    :error="emailError"
                    required
                    class="mb-24"
                />

                <div class="flex items-start gap-8 pl-16 pr-20 py-16 bg-denotive-blue-light">
                    <Icon name="info" :color="getColor('denotive.denote_blue')" :size="20" :stroke-width="1.5" />
                    <p class="text-denotive-blue text-s  ">This transaction's receipt will be sent to the provided email. Please ensure that the email is valid before proceeding.</p>
                </div>
            </div>
        </template>

        <template v-if="showGiftingForm" #footer>
            <div class="flex flex-col gap-8 p-24">
                <Button
                    type="primary"
                    label="Proceed"
                    :disabled="!isFormValid"
                    @click="handleProceed"
                />
                <Button
                    type="secondary"
                    label="Cancel"
                    @click="handleClose"
                />
            </div>
        </template>

        <template v-if="showGiftSummary" #footer>
            <div class="flex flex-col gap-8 p-24">
                <Button
                    type="primary"
                    :label="`Pay ₦${formatAmount(selectedAmount || 0)}`"
                    :is-loading="isLoading"
                    :disabled="!isEmailValid"
                    @click="handlePayment"
                />
                <Button
                    type="secondary"
                    label="Back"
                    @click="handleBack"
                />
            </div>
        </template>
    </bottom-sheet>
</template>

<script setup lang="ts">
/* ------------------- Imports ------------------- */
import Icon from '../Icon'
import { getColor } from '../../utils/colors'

/* ------------------- Stores ------------------- */
const giftStore = useGiftStore()
const uiStore = useUIStore()
const guestStore = useGuestStore()


/* ------------------- Reactive State and Variables ------------------- */
const presetAmounts = [50000, 100000, 150000, 200000, 300000, 350000, 400000, 450000, 500000]

const selectedPresetAmount = ref<number | null>(null)
const customAmountInput = ref<string>('')
const customAmountError = ref<string>('')
const isFormValid = ref<boolean>(false)
const email = ref<string>('')
const emailError = ref<string>('')
const isEmailValid = ref<boolean>(false)


/* ------------------- Computed Properties ------------------- */
const finalSelectedAmount = computed(() => {
    if (customAmountInput.value) {
        const customAmount = parseFloat(customAmountInput.value)
        return !isNaN(customAmount) && customAmount > 0 ? customAmount : null
    }
    return selectedPresetAmount.value
})

const showGiftingForm = computed(() => uiStore.showGiftingForm)
const showGiftSummary = computed(() => uiStore.showGiftSummary)
const selectedAmount = computed(() => giftStore.selectedAmount)
const isLoading = computed(() => giftStore.loading)
const giftBreakdown = computed(() => giftStore.giftSummary)

/* ------------------- Utility Functions ------------------- */
const formatAmount = (amount: number | null | undefined): string => {
    if(!amount && amount !== 0) {
        return '0.00'
    }
    return amount.toLocaleString('en-NG')
}

const handlePresetAmountSelect = (amount: number) => {
    customAmountInput.value = ''
    customAmountError.value = ''
    
    if (selectedPresetAmount.value === amount) {
        selectedPresetAmount.value = null
    } else {
        selectedPresetAmount.value = amount
    }
}

const handleCustomAmountInput = () => {
    selectedPresetAmount.value = null
    customAmountError.value = ''
    
    const value = customAmountInput.value
    
    if (value === '') {
        return // Allow empty input
    }
    
    const numericValue = parseFloat(value)
    
    if (isNaN(numericValue)) {
        customAmountError.value = 'Please enter a valid number'
    } else if (numericValue > 500000) {
        customAmountError.value = 'Maximum allowed amount is ₦500,000'
    }
}

const handleProceed = () => {
    if (finalSelectedAmount.value && !isLoading.value) {
        giftStore.updateSelectedAmount(finalSelectedAmount.value)
        giftStore.calculateGiftSummary()
        uiStore.showGiftSummarySheet()
    }
}

const handleClose = () => {
    console.log('handleClose', isLoading.value)
    if (!isLoading.value) {
        uiStore.hideAllBottomSheets()
    }
}

const handlePayment = () => {
    console.log('handlePayment called. Waiting for response')
    if (isFormValid.value && !isLoading.value && selectedAmount.value) {
        const guestToken = guestStore.guestData?.auth_token

        if(!guestToken) {
            console.log('No guest token found. Cannot proceed with payment.')
            return
        }
        giftStore.processGift({
            gift_amount: selectedAmount.value,
            guest_email: email.value.trim(),
            guest_token: guestToken
        })
    }
}

const handleBack = () => {
    console.log('handleBack called')
    if (!isLoading.value) {
        uiStore.showGiftFormSheet()
    }
}

const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email.value.trim()) {
        emailError.value = 'Email address is required'
        return false
    } else if (!emailRegex.test(email.value.trim())) {
        emailError.value = 'Please enter a valid email address'
        return false
    } else {
        emailError.value = ''
        return true
    }
}

/* ------------------- Watchers ------------------- */
watch(finalSelectedAmount, (newAmount) => {
    isFormValid.value = newAmount !== null && newAmount > 0 && newAmount <= 500000
})

watch(email, (newEmail) => {
    validateEmail()
    email.value = newEmail
    isEmailValid.value = !emailError.value && newEmail.trim() !== ''
}, { immediate: true })

</script>

<style scoped>

</style>