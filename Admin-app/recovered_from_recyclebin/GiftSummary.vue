<template>
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
                    <td class="py-6 text-right font-medium text-neutrals-neu-0">₦{{ formatAmount(giftBreakdown.netAmount) }}</td>
                </tr>
                <tr >
                    <td class="pt-6 pb-12 text-neutrals-neu-35">Processing fees</td>
                    <td class="pt-6 pb-12 text-right text-neutrals-neu-35">₦{{ formatAmount(giftBreakdown.processingFee) }}</td>
                </tr>
                <tr class="border-t border-brand-sec">
                    <td class="py-6 font-semibold text-neutrals-neu-0">Total</td>
                    <td class="py-6 text-right font-semibold text-neutrals-neu-0">₦{{ formatAmount(giftBreakdown.totalAmount) }}</td>
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
            <p class="text-denotive-blue text-s  ">Your email address is required to process your contribution. We do not share your email with anyone.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getColor } from '../../utils/colors'
import Icon from '../Icon'
interface Props {
    selectedAmount: number
}

interface GiftBreakdown {
    originalAmount: number
    processingFee: number
    netAmount: number
    totalAmount: number
}

interface Emits {
    (e: 'email-updated', email: string): void
    (e: 'email-valid', isValid: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive data
const email = ref<string>('')
const emailError = ref<string>('')

// Computed properties
const giftBreakdown = computed((): GiftBreakdown => {
    return calculateGiftBreakdown(props.selectedAmount)
})

// Gift breakdown calculation function
const calculateGiftBreakdown = (amount: number): GiftBreakdown => {
    // Basic calculation - you can update this with actual business logic
    const processingFeeRate = 0.025 // 2.5% processing fee
    const baseProcessingFee = 100
    const minimumFee = 50 // Minimum ₦50 fee
    
    let processingFee = Math.max(amount * processingFeeRate, minimumFee) + baseProcessingFee
    
    const netAmount = amount - processingFee // What the couple receives
    const totalAmount = amount
    
    return {
        originalAmount: amount,
        processingFee: Math.round(processingFee * 100) / 100, // Round to 2 decimal places
        netAmount,
        totalAmount: Math.round(totalAmount * 100) / 100
    }
}

// Format amount with proper decimal places
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// Email validation
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

// Watch email changes
watch(email, (newEmail) => {
    validateEmail()
    emit('email-updated', newEmail)
    emit('email-valid', !emailError.value && newEmail.trim() !== '')
}, { immediate: true })
</script>

<style scoped>
</style>