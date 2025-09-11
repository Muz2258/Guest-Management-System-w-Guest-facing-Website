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
        <GoodWillForm 
          v-if="showGoodWillForm" 
          ref="goodWillFormRef"
          @form-valid="handleGoodWillValidityChange"
          @submit="handleGoodWillSubmit"
        />
        <RemovePlusOneDialog 
          v-if="showRemovePlusOneDialog"
        />
        <UpdateRSVPDialog
          v-if="showUpdateRSVPDialog"
        />
        <DeleteGoodWillDialog
          v-if="showDeleteGoodWillDialog"
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
        <GoodWillFooter
          v-if="showGoodWillForm"
          :is-form-valid="isGoodWillFormValid"
          :is-submitting="isGoodWillSubmitting"
          @submit="handleGoodWillFooterSubmit"
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
        <DeleteGoodWillFooter
          v-if="showDeleteGoodWillDialog"
          :is-deleting="isDeletingGoodWill"
          @cancel="handleDeleteGoodWillCancel"
          @confirm="handleDeleteGoodWillConfirm"
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
const rsvpStore = useRSVPStore()
const goodWillStore = useGoodWillStore()

// Refs for form handling
const plusOneFormRef = ref<{ handleSubmit: () => void } | null>(null)
const goodWillFormRef = ref<{ handleSubmit: () => void } | null>(null)
const isPlusOneFormValid = ref(false)
const isPlusOneSubmitting = ref(false)
const isRemovingPlusOne = ref(false)
const isGoodWillFormValid = ref(false)
const isGoodWillSubmitting = ref(false)
const isUpdatingRSVP = ref(false)
const selectedRSVPResponse = ref('')
const isDeletingGoodWill = ref(false)

// Computed properties
const showModal = computed(() => uiStore.showModal)
const showWelcome = computed(() => uiStore.showWelcome)
const showPlusOneForm = computed(() => uiStore.showPlusOneForm)
const showRemovePlusOneDialog = computed(() => uiStore.showRemovePlusOneDialog)
const showGoodWillForm = computed(() => uiStore.showGoodWillForm)
const showUpdateRSVPDialog = computed(() => uiStore.showUpdateRSVPDialog)
const showDeleteGoodWillDialog = computed(() => uiStore.showDeleteGoodWillDialog)
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
  if(!guestStore.guestData?.auth_token) {
    throw new Error('No guest token available')
  }

  const token = guestStore.guestData.auth_token
  isPlusOneSubmitting.value = true

  try {
    console.log('💾 Saving plus one data:', data)
    
    await rsvpStore.updateGuestRsvp(token, {
      plus_one_name: `${data.firstName} ${data.lastName ? data.lastName : ''}`.trim(),
      plus_one_attending: true
    })
    
    console.log('✅ Plus one saved successfully')
    uiStore.hideAllModals()
  } catch (error) {
    console.error('❌ Error saving plus one:', error)
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
  if(!guestStore.guestData?.auth_token) {
    throw new Error('No guest token available')
  }

  const token = guestStore.guestData.auth_token
  isRemovingPlusOne.value = true

  try {
    console.log('💾 Removing plus one data... ')
    
    await rsvpStore.updateGuestRsvp(token, {
      plus_one_name: null,
      plus_one_attending: null
    })

    console.log('✅ Plus one removed successfully')
    uiStore.hideAllModals()
  } catch (error) {
    console.error('❌ Error removing plus one:', error)
  }finally {
    isRemovingPlusOne.value = false
  }
}

// Good Will form handling
const handleGoodWillValidityChange = (isValid: boolean) => {
  isGoodWillFormValid.value = isValid
}

const handleGoodWillSubmit = async (data: { message: string }) => {
  if (!guestStore.guestData?.auth_token) {
    throw new Error('No guest token available')
  }

  const token = guestStore.guestData.auth_token
  isGoodWillSubmitting.value = true

  try {
    console.log('💾 Saving good will data:', data)

    // Save to good will store
    await goodWillStore.saveGoodWillMessage(token, data.message)

    console.log('✅ Good will message saved successfully')
    uiStore.hideAllModals()
    
  } catch (error) {
    console.error('❌ Error saving good will message:', error)
  }finally {
    isGoodWillSubmitting.value = false
  }
}

const handleGoodWillFooterSubmit = () => {
  if (goodWillFormRef.value && isGoodWillFormValid.value) {
    isGoodWillSubmitting.value = true

    goodWillFormRef.value?.handleSubmit()
  }
}

// RSVP Update handling
const handleUpdateRSVP = async (response: 'attending' | 'not_attending') => {
  console.log('handleUpdateRSVP called with response:', response);
  isUpdatingRSVP.value = true
  selectedRSVPResponse.value = response

  if(!guestStore.guestData?.auth_token) {
      console.error('❌ No guest token available to update RSVP');
      return;
  }

  const token = guestStore.guestData.auth_token;

  try {
    await rsvpStore.updateGuestRsvp(token, {attendance_status: response});
    
    console.log('✅ RSVP updated successfully')
    uiStore.hideAllModals()
  } catch (error) {
    console.error('Error updating RSVP:', error);
  } finally {
    isUpdatingRSVP.value = false
    selectedRSVPResponse.value = ''
  }
}

// Delete Good Will message handling
const handleDeleteGoodWillCancel = () => {
  uiStore.hideAllModals()
}

const handleDeleteGoodWillConfirm = async () => {
  isDeletingGoodWill.value = true

  if(!guestStore.guestData?.auth_token) {
      console.error('❌ No guest token available to delete good will message');
      return;
  }

  const token = guestStore.guestData.auth_token;

  try {
    await goodWillStore.deleteGoodWillMessage(token);
    
    console.log('✅ Good will message deleted successfully')
    uiStore.hideAllModals()
  } catch (error) {
    console.error('Error deleting good will message:', error);
  } finally {
    isDeletingGoodWill.value = false
  }
}

</script>

<style>
</style>
