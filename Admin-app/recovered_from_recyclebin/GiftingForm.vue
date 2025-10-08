<template>
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

<script setup lang="ts">
/* ------------------- Stores ------------------- */
const giftStore = useGiftStore()

// Preset gift amounts in Nigerian Naira
const presetAmounts = [50000, 100000, 150000, 200000, 300000, 350000, 400000, 450000, 500000]

// Reactive state
const selectedPresetAmount = ref<number | null>(null)
const customAmountInput = ref<string>('')
const customAmountError = ref<string>('')

// Computed properties
const finalSelectedAmount = computed(() => {
    if (customAmountInput.value) {
        const customAmount = parseFloat(customAmountInput.value)
        return !isNaN(customAmount) && customAmount > 0 ? customAmount : null
    }
    return selectedPresetAmount.value
})

// Format amount with thousand separators
const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-NG')
}

// Handle preset amount selection
const handlePresetAmountSelect = (amount: number) => {
    // Clear custom input when preset is selected
    customAmountInput.value = ''
    customAmountError.value = ''
    
    // Toggle selection (deselect if already selected)
    if (selectedPresetAmount.value === amount) {
        selectedPresetAmount.value = null
    } else {
        selectedPresetAmount.value = amount
    }
}

// Handle custom amount input
const handleCustomAmountInput = () => {
    // Clear preset selection when custom amount is entered
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

// Watch for changes and emit to parent
watch(finalSelectedAmount, (newAmount) => {
    giftStore.updateSelectedAmount(newAmount)
})
</script>

<style scoped>
</style>