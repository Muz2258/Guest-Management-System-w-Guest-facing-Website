<template>
  <div>
    <CookieBanner v-if="showCookie" />
    <RouterView />
    <Modal v-if="showModal" @close="handleClose">
      <template #body>
        <WelcomeMsg v-if="showWelcome" />
        <PlusOneForm 
          v-if="showPlusOneForm" 
          ref="plusOneFormRef"
          @form-valid="handleFormValidityChange"
          @submit="handlePlusOneSubmit"
        />
        <WellWishesForm 
          v-if="showWellWishesForm" 
          ref="wellWishesFormRef"
          @form-valid="handleWellWishesFormValidityChange"
          @submit="handleWellWishesSubmit"
        />
        <RemovePlusOneDialog 
          v-if="showRemovePlusOneDialog"
        />
        <UpdateRSVPDialog 
          v-if="showUpdateRSVPDialog"
        />
      </template>
      <template #footer>
        <WelcomeFoot
          v-if="showWelcome"
          @details-click="goToDetails"
          @rsvp-click="goToRSVP"
        />
        <PlusOneFooter
          v-if="showPlusOneForm"
          :is-form-valid="isPlusOneFormValid"
          :is-submitting="isPlusOneSubmitting"
          @submit="handlePlusOneFooterSubmit"
        />
        <WellWishesFooter
          v-if="showWellWishesForm"
          :is-form-valid="isWellWishesFormValid"
          :is-submitting="isWellWishesSubmitting"
          @submit="handleWellWishesFooterSubmit"
        />
        <RemovePlusOneFooter 
          v-if="showRemovePlusOneDialog"
          :is-removing="isRemovingPlusOne"
          @keep-plus-one="handleClose"
          @delete-plus-one="handleDeletePlusOne"
        />
        <UpdateRSVPFooter 
          v-if="showUpdateRSVPDialog"
          :is-updating="isUpdatingRSVP"
          :selected-response="selectedRSVPResponse"
          @update-rsvp="handleUpdateRSVP"
          @cancel="handleClose"
        />
      </template>
    </Modal>
    <!-- <CacheStatus :token="guestData?.auth_token" :show="true"/> -->
  </div>
</template>

<script setup lang="ts">
// Stores
const privacyStore = usePrivacyStore()
const uiStore = useUIStore()
const guestStore = useGuestStore()
const wellWishesStore = useWellWishesStore()

// Refs for form handling
const plusOneFormRef = ref<{ handleSubmit: () => void } | null>(null)
const wellWishesFormRef = ref<{ handleSubmit: () => void } | null>(null)
const isPlusOneFormValid = ref(false)
const isPlusOneSubmitting = ref(false)
const isRemovingPlusOne = ref(false)
const isWellWishesFormValid = ref(false)
const isWellWishesSubmitting = ref(false)
const isUpdatingRSVP = ref(false)
const selectedRSVPResponse = ref('')

// Computed properties
const showModal = computed(() => uiStore.showModal)
const showWelcome = computed(() => uiStore.showWelcome)
const showPlusOneForm = computed(() => uiStore.showPlusOneForm)
const showRemovePlusOneDialog = computed(() => uiStore.showRemovePlusOneDialog)
const showWellWishesForm = computed(() => uiStore.showWellWishesForm)
const showUpdateRSVPDialog = computed(() => uiStore.showUpdateRSVPDialog)
const showCookie = computed(() => uiStore.showCookie && !privacyStore.hasSeenBanner)

// Functions
const handleClose = () => {
  uiStore.hideAllModals();
}

const goToDetails = () => {
  uiStore.hideAllModals();
  uiStore.scrollToSection('details');
}

const goToRSVP = () => {
  uiStore.hideAllModals();
  uiStore.scrollToSection('rsvp');
}

// Plus One form handling
const handleFormValidityChange = (isValid: boolean) => {
  isPlusOneFormValid.value = isValid
}

const handlePlusOneSubmit = async (data: { firstName: string; lastName: string }) => {
  try {
    console.log('💾 Saving plus one data:', data)
    
    // Save to guest store and database
    await guestStore.savePlusOne(data.firstName, data.lastName)
    
    console.log('✅ Plus one saved successfully')
    uiStore.hideAllModals()
    
    // You could add a success toast/notification here if needed
    
  } catch (error) {
    console.error('❌ Error saving plus one:', error)
    // You could add error handling/notification here
  }finally {
    isPlusOneSubmitting.value = false
  }
}

const handlePlusOneFooterSubmit =  () => {
  if (plusOneFormRef.value && isPlusOneFormValid.value) {
    isPlusOneSubmitting.value = true
    
    plusOneFormRef.value?.handleSubmit()
  }
}

const handleDeletePlusOne = async () => {
  try {
    console.log('🗑️ Deleting plus one')
    isRemovingPlusOne.value = true
    
    // Remove plus one from guest store and database
    await guestStore.removePlusOne()
    
    console.log('✅ Plus one removed successfully')
    uiStore.hideAllModals()
    
  } catch (error) {
    console.error('❌ Error removing plus one:', error)
    // You could add error handling/notification here
  } finally {
    isRemovingPlusOne.value = false
  }
}

// Well Wishes form handling
const handleWellWishesFormValidityChange = (isValid: boolean) => {
  isWellWishesFormValid.value = isValid
}

const handleWellWishesSubmit = async (data: { message: string }) => {
  try {
    console.log('💾 Saving well wishes data:', data)
    
    if (!guestStore.guest?.guest_id) {
      throw new Error('No guest ID available')
    }
    
    // Save to well wishes store
    await wellWishesStore.saveWellWish(guestStore.guest.guest_id, data.message)
    
    console.log('✅ Well wishes saved successfully')
    uiStore.hideAllModals()
    
  } catch (error) {
    console.error('❌ Error saving well wishes:', error)
    // You could add error handling/notification here
  }finally {
    isWellWishesSubmitting.value = false
  }
}

const handleWellWishesFooterSubmit = () => {
  if (wellWishesFormRef.value && isWellWishesFormValid.value) {
    isWellWishesSubmitting.value = true
    
    wellWishesFormRef.value?.handleSubmit()
  }
}

// RSVP Update handling
const handleUpdateRSVP = async (response: 'attending' | 'not_attending') => {
  console.log('handleUpdateRSVP called with response:', response);
  try {
    console.log('📝 Updating RSVP to:', response)
    isUpdatingRSVP.value = true
    selectedRSVPResponse.value = response
    
    if (!guestStore.guest?.guest_id) {
      throw new Error('No guest ID available')
    }
    
    // Update guest RSVP in store and database
    await guestStore.updateGuestRSVP(response)
    
    // If guest is a couple, also update spouse RSVP
    if (guestStore.guest.guest_type === 'couple') {
      const spouseAttending = response === 'attending'
      await guestStore.updateSpouseRSVP(spouseAttending)
    }
    
    console.log('✅ RSVP updated successfully')
    uiStore.hideAllModals()
    
  } catch (error) {
    console.error('❌ Error updating RSVP:', error)
    // You could add error handling/notification here
  } finally {
    isUpdatingRSVP.value = false
    selectedRSVPResponse.value = ''
  }
}

</script>

<style>
</style>
