<template>
    <bottom-sheet :is-visible="isVisible" @close="handleClose">
        <template v-if="showGiftingForm" #body>
            <div class="px-24 pb-24 overflow-y-auto grow">
                <h3 class="text-heading-md text-neutrals-neu-0 mb-16">
                    Send a gift
                </h3>
                <p class="text-neutrals-neu-35 text-s mb-24">
                    While your presence is valued, your gifts are also very much appreciated.
                </p>

                <Tabs :tabs="TABS" v-model="activeTab" class="sticky top-0" />

                <div v-if="activeTab === 'money_gift'">
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
                        class="mb-12"
                    />

                    <!-- Selected Amount Display -->
                    <div class="p-16 rounded-md bg-denotive-blue-light mb-16">
                      <h4 class="text-denotive-blue text-s font-body font-semibold italic underline mb-6">Payment Summary</h4>
                      <p class="text-denotive-blue text-xs flex justify-between mb-6">
                        <span>Your contribution:</span>
                        <span>{{ currency(giftBreakdown?.netAmount) }}</span>
                      </p>
                      <p class="text-denotive-blue text-xs flex justify-between mb-6">
                        <span>Processing fees ({{ giftStore.percentageFee }}% + ₦{{ giftStore.baseFee }}):</span>
                        <span>{{ currency(giftBreakdown?.processingFee) }}</span>
                      </p>
                      <p v-if="giftBreakdown?.deliveryFee" class="text-denotive-blue text-xs flex justify-between mb-6">
                        <span>Delivery fee:</span>
                        <span>{{ currency(giftBreakdown?.deliveryFee) }}</span>
                      </p>
                      <p class="text-denotive-blue text-s font-semibold flex justify-between mt-6 pt-6 border-t border-t-denotive-blue">
                        <span>Total:</span>
                        <span>{{ currency(giftBreakdown?.totalCharge) }}</span>
                      </p>
                    </div>
                    <CheckBox
                      v-model="payFees"
                      label="I'd like to cover the associated fees"
                    />
                </div>

                <div v-if="activeTab === 'gift_items'">
                    <GiftItemsList @buy="handleBuy" @contribute="handleContribute" />
                </div>
            </div>
        </template>

        <template v-if="showContributingSheet" #body>
            <div class="px-24 pb-24 grow overflow-y-auto">
                <h3 class="text-heading-md text-neutrals-neu-0 mb-24">
                    Contributing to:
                </h3>

                <GiftItemCard
                  v-if="selectedGiftItem"
                  :item="selectedGiftItem"
                  :has-actions="false"
                  class="mb-32"
                />

                <Input 
                    v-model="contributionAmount"
                    label="Contribution Amount"
                    placeholder="0"
                    prefix="₦"
                    :max="remainingAmount"
                    :error="contributionError"
                    @input="handleContributionInput"
                    required
                    class="mb-12"
                >
                  <template #actions>
                    <button class="text-brand-pri text-xs px-6 py-4 rounded-md bg-brand-sec-light-100" @click="useMaxContributionAmount">Use Max</button>
                  </template>
                </Input>

                <div class="p-16 rounded-md bg-denotive-blue-light mb-16">
                  <p class="text-denotive-blue text-s mb-16">This contribution will go towards funding the selected gift item.</p>
                  <h4 class="text-denotive-blue text-s font-body font-semibold italic underline mb-6">Payment Summary</h4>
                  <p class="text-denotive-blue text-xs flex justify-between mb-6">
                    <span>Your contribution:</span>
                    <span>{{ currency(giftBreakdown?.netAmount) }}</span>
                  </p>
                  <p class="text-denotive-blue text-xs flex justify-between mb-6">
                    <span>Processing fees ({{ giftStore.percentageFee }}% + ₦{{ giftStore.baseFee }}):</span>
                    <span>{{ currency(giftBreakdown?.processingFee) }}</span>
                  </p>
                  <p v-if="giftBreakdown?.deliveryFee" class="text-denotive-blue text-xs flex justify-between mb-6">
                    <span>Delivery fee:</span>
                    <span>{{ currency(giftBreakdown?.deliveryFee) }}</span>
                  </p>
                  <p class="text-denotive-blue text-s font-semibold flex justify-between mt-6 pt-6 border-t border-t-denotive-blue">
                    <span>Total:</span>
                    <span>{{ currency(giftBreakdown?.totalCharge) }}</span>
                  </p>
                </div>
                <CheckBox
                  v-model="payFees"
                  label="I'd like to cover the associated fees"
                />
            </div>
        </template>

        <template v-if="showGiftSummary" #body>
            <div class="px-24 pb-24 grow overflow-y-auto">
                <h3 class="text-heading-md text-neutrals-neu-0 mb-16">
                    Gift summary
                </h3>
                <p class="text-neutrals-neu-35 text-s mb-24">
                    A summary of your gift selection. Use the 'Pay' button below to process your contribution.
                </p>

                <GiftItemCard
                  v-if="selectedGiftItem"
                  :item="selectedGiftItem"
                  :has-actions="false"
                  class="mb-16"
                />

                <table class="w-full text-left mb-24">
                    <tbody>
                        <tr >
                            <td class="py-6 text-neutrals-neu-35">{{ summaryTableRowOne }}</td>
                            <td class="py-6 text-right font-medium text-neutrals-neu-0">{{ currency(giftBreakdown?.netAmount) }}</td>
                        </tr>
                        <tr v-if="selectedGiftItem && giftingMode === 'full_purchase'" >
                            <td class="py-6 text-neutrals-neu-35">Delivery fee</td>
                            <td class="py-6 text-right font-medium text-neutrals-neu-0">₦{{ formatAmount(giftBreakdown?.deliveryFee) }}</td>
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

        <template v-if="showGiftingForm && activeTab === 'money_gift'" #footer>
            <div class="flex flex-col gap-8 p-24">
                <Button
                    type="primary"
                    label="Proceed"
                    :disabled="!isFormValid"
                    @click="handleProceed('gifting-form')"
                />
                <Button
                    type="secondary"
                    label="Cancel"
                    @click="handleClose"
                />
            </div>
        </template>

        <template v-if="showContributingSheet" #footer>
            <div class="flex flex-col gap-8 p-24">
                <Button
                    type="primary"
                    label="Proceed"
                    :disabled="!isContributionValid"
                    @click="handleProceed('contribute-form')"
                />
                <Button
                    type="secondary"
                    label="Back"
                    @click="handleBack"
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
import type { GiftItem } from '@/types/guests'


/* ------------------- Stores ------------------- */
const giftStore = useGiftStore()
const uiStore = useUIStore()
const guestStore = useGuestStore()
const { currency } = useCurrency()


/* ------------------- Props and Emits --------------------- */
interface Props {
    isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ------------------- Reactive State and Variables ------------------- */
const presetAmounts = [50000, 100000, 150000, 200000, 300000, 350000, 400000, 450000, 500000]
const TABS = [
  { id: 'money_gift', label: 'Money Gift' },
  { id: 'gift_items', label: 'Gift Items' }
]

const activeTab = ref('money_gift')
const previousView = ref<'gifting-form' | 'contribute-form' | 'summary'>('gifting-form')
const currentView = ref<'gifting-form' | 'contribute-form' | 'summary'>('gifting-form')
const selectedPresetAmount = ref<number | null>(null)
const customAmountInput = ref<string>('')
const customAmountError = ref<string>('')
const isFormValid = ref<boolean>(false)
const email = ref<string>('')
const emailError = ref<string>('')
const isEmailValid = ref<boolean>(false)
const contributionAmount = ref<string>('')
const contributionError = ref<string>('')
const isContributionValid = ref<boolean>(false)


/* ------------------- Computed Properties ------------------- */
const finalSelectedAmount = computed(() => {
    if (customAmountInput.value) {
        const customAmount = parseFloat(customAmountInput.value)
        return !isNaN(customAmount) && customAmount > 0 ? customAmount : null
    }else if (contributionAmount.value) {
        const contributionAmt = parseFloat(contributionAmount.value)
        return !isNaN(contributionAmt) && contributionAmt > 0 ? contributionAmt : null
    } 
    return selectedPresetAmount.value
})

const payFees = computed({
  get: () => giftStore.isPayingFees,
  set: (value: boolean) => {
    giftStore.setIsPayingFees(value)
    giftStore.calculateGiftSummary()
  }
})

const showGiftingForm = computed(() => uiStore.showGiftingForm)
const showContributingSheet = computed(() => uiStore.showContributingSheet)
const showGiftSummary = computed(() => uiStore.showGiftSummary)
const selectedAmount = computed(() => giftStore.selectedAmount)
const isLoading = computed(() => giftStore.loading)
const giftBreakdown = computed(() => giftStore.giftSummary)
const isVisible = computed(() => props.isVisible)
const selectedGiftItem = computed(() => giftStore.selectedGiftItem)
const giftingMode = computed(() => giftStore.giftingMode)
const remainingAmount = computed(() => {
    if (showContributingSheet.value && selectedGiftItem.value) {
        return Math.max(0, selectedGiftItem.value.price - selectedGiftItem.value.amount_contributed)
    }
    return 0
})
const summaryTableRowOne = computed(() => {
  const mode = giftStore.giftingMode

  if(selectedGiftItem.value && mode === 'contribution') {
    return 'Your contribution'
  }

  if(selectedGiftItem.value && mode === 'full_purchase') {
    return 'Item Amount'
  }

  return 'What we get'
})

/* ------------------- Utility Functions ------------------- */
const formatAmount = (amount: number | null | undefined): string => {
    if(!amount && amount !== 0) {
        return '0.00'
    }
    return amount.toLocaleString('en-NG')
}

const handleBuy = (item: GiftItem) => {
  console.log('Received event from child. Proceeding to next action:', item )
  giftStore.clearGiftSelection()
  giftStore.setIsPayingFees(true)

  giftStore.setSelectedGiftItem(item, 'buy')
  
  currentView.value = 'summary'
  previousView.value = 'gifting-form'
}

const handleContribute = (item: GiftItem) => {
  console.log('Received event from child. Proceeding to next action:', item )
  giftStore.clearGiftSelection()
  giftStore.setIsPayingFees(false)
  giftStore.setSelectedGiftItem(item, 'contribute')
  currentView.value = 'summary'
  previousView.value = 'gifting-form'
}

const handlePresetAmountSelect = (amount: number) => {
    customAmountInput.value = ''
    customAmountError.value = ''
    
    if (selectedPresetAmount.value === amount) {
        selectedPresetAmount.value = null
        giftStore.updateSelectedAmount(0)
        giftStore.calculateGiftSummary()
    } else {
        selectedPresetAmount.value = amount
        giftStore.updateSelectedAmount(amount)
        giftStore.calculateGiftSummary()
    }
}

const handleCustomAmountInput = () => {
    selectedPresetAmount.value = null
    customAmountError.value = ''
    
    const value = customAmountInput.value
    const minimumGiftAmount = (finalSelectedAmount.value || 0) * (giftStore.percentageFee / 100) + giftStore.baseFee
    
    if (value === '') {
        giftStore.updateSelectedAmount(0)
        giftStore.calculateGiftSummary()
        return // Allow empty input
    }
    
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
        customAmountError.value = 'Please enter a valid number'
        return
    } else {
        const numericValue = parseFloat(value)

        if (numericValue < minimumGiftAmount) {
            customAmountError.value = `Minimum allowed amount is ${currency(minimumGiftAmount)}`
            return
        }else {
          giftStore.updateSelectedAmount(numericValue)
          giftStore.calculateGiftSummary()
        }
    }
}

const handleContributionInput = () => {
  console.log('handleContributionInput called with:', contributionAmount.value)  
  contributionError.value = ''
  
  const value = contributionAmount.value
  const minimumContribution = (finalSelectedAmount.value || 0) * (giftStore.percentageFee / 100) + giftStore.baseFee + (selectedGiftItem.value?.delivery_fee || 0)
  
  if (value === '') {
      giftStore.updateSelectedAmount(0)
      giftStore.calculateGiftSummary()
      return // Allow empty input
  }

  if (!/^\d*\.?\d{0,2}$/.test(value)) {
    contributionError.value = 'Please enter a valid number'
    return
  } else {
    const numericValue = parseFloat(value)

    if (numericValue > remainingAmount.value) {
        contributionError.value = `Maximum allowed amount is ₦${formatAmount(remainingAmount.value)}`
        return
    }else if( numericValue < minimumContribution ) {
      contributionError.value = `Minimum allowed amount is ₦${formatAmount(minimumContribution)}`
      return
    }else {
      giftStore.updateSelectedAmount(numericValue)
      giftStore.calculateGiftSummary()
    }
  }
}

const useMaxContributionAmount = () => {
  contributionAmount.value = remainingAmount.value.toString()
  handleContributionInput()
}

const handlePayment = () => {
    console.log('handlePayment called with:', {
        isEmailValid: isEmailValid.value,
        isLoading: isLoading.value,
        totalAmount: giftBreakdown.value?.totalCharge || 0
    })
    if (isEmailValid.value && !isLoading.value && giftBreakdown.value?.totalCharge) {
        const guestToken = guestStore.guestData?.auth_token

        if(!guestToken) {
            console.log('No guest token found. Cannot proceed with payment.')
            return
        }

        if(!giftBreakdown.value) {
          console.log('No gift breakdown available. Cannot proceed with payment.')
          return
        }

        const mode = giftStore.giftingMode

        if(mode === 'contribution' && selectedGiftItem.value) {
          giftStore.processGift({
              guest_email: email.value.trim(),
              guest_token: guestToken,
              gift_item_id: selectedGiftItem.value.gift_item_id,
              payment_type: 'contribution',
              amount_gifted: giftBreakdown.value.netAmount,
              processing_fee: giftBreakdown.value.processingFee
          })
        } else if (mode === 'full_purchase' && selectedGiftItem.value) {
          giftStore.processGift({
              guest_email: email.value.trim(),
              guest_token: guestToken,
              gift_item_id: selectedGiftItem.value.gift_item_id,
              payment_type: 'full_purchase',
              amount_gifted: giftBreakdown.value.netAmount,
              processing_fee: giftBreakdown.value.processingFee,
              delivery_fee: giftBreakdown.value.deliveryFee
          })
        }else {
          giftStore.processGift({
              guest_email: email.value.trim(),
              guest_token: guestToken,
              payment_type: 'monetary',
              amount_gifted: giftBreakdown.value.netAmount,
              processing_fee: giftBreakdown.value.processingFee,
          })
        }
    }
}

const handleProceed = (from: 'gifting-form' | 'contribute-form' | 'summary') => {
    if (finalSelectedAmount.value && !isLoading.value) {
      console.log('Proceed to summary for amount:', finalSelectedAmount.value)
      giftStore.updateSelectedAmount(finalSelectedAmount.value)
      giftStore.calculateGiftSummary()
      uiStore.showHideGiftingSheets('summary')
      
      previousView.value = from
      currentView.value = 'summary'
    }
}

const handleBack = () => {
  console.log('handleBack called:', previousView.value)
  if (!isLoading.value) {
    if(currentView.value === 'summary') {
      console.log('Going back to previous view from summary:', previousView.value)
      uiStore.showHideGiftingSheets(previousView.value)
      giftStore.setIsPayingFees(false)
      currentView.value = previousView.value
      previousView.value = 'summary'
    }else {
      console.log('Going back to gifting form')
      uiStore.showHideGiftingSheets('gifting-form')
    }
  }
}

const handleClose = () => {
  console.log('handleClose', isLoading.value)
  if (!isLoading.value) {
    uiStore.hideAllBottomSheets()
    giftStore.clearGiftSelection()
    giftStore.setIsPayingFees(false)
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
watch(email, (newEmail) => {
  validateEmail()
  email.value = newEmail
  isEmailValid.value = !emailError.value && newEmail.trim() !== ''
}, { immediate: true })

watch(selectedPresetAmount, (newAmount) => {
  if(newAmount && newAmount > 0) {
    isFormValid.value = true
  }
})

watch(customAmountInput, (newAmount) => {
  customAmountInput.value = newAmount
  isFormValid.value = !customAmountError.value && newAmount.trim() !== ''
})

watch(contributionAmount, (newAmount) => {
  contributionAmount.value = newAmount
  isContributionValid.value = !contributionError.value && newAmount.trim() !== ''
})

watch(payFees, (newValue) => {
  console.log('payFees changed:', newValue)
  giftStore.setIsPayingFees(newValue)
  giftStore.calculateGiftSummary()
}, { immediate: true })

watch(activeTab, (newTab) => {
  if(newTab) giftStore.clearGiftSelection()
})
</script>

<style scoped>

</style>