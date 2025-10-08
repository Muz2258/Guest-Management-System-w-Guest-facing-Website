<template>
    <div class="flex flex-col gap-8 p-24">
        <Button
            type="primary"
            :label="payLabel"
            :is-loading="isProcessing"
            :disabled="!isFormValid"
            @click="handlePayment"
        />
        <Button
            type="secondary"
            label="Back"
            @click="handleBack"
        />
    </div>
</template>

<script setup lang="ts">
interface Props {
    totalAmount: number | null
    guestEmail: string
    isFormValid: boolean
    isProcessing?: boolean
}

interface Emits {
    (e: 'pay', data: { totalAmount: number; email: string }): void
    (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
    isProcessing: false
})

const emit = defineEmits<Emits>()

// Computed properties
const payLabel = computed(() => {
    if (props.isProcessing) {
        return 'Processing...'
    }
    return `Pay ₦${formatAmount(props.totalAmount || 0)}`
})

// Format amount with proper decimal places
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// Event handlers
const handlePayment = () => {
    if (props.isFormValid && !props.isProcessing && props.totalAmount) {
        emit('pay', {
            totalAmount: props.totalAmount,
            email: props.guestEmail
        })
    }
}

const handleBack = () => {
    if (!props.isProcessing) {
        emit('back')
    }
}
</script>

<style scoped>
</style>