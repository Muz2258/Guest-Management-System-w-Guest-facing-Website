<template>
    <Modal :is-visible="isVisible" @close="handleClose">
        <template #body>
            <div class="px-24 py-24">
                <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
                    {{ isEditing ? 'Update your +1\'s details' : 'Add your +1\'s details' }}
                </h3>
                <p class="text-neutrals-neu-46 text-s text-center mb-32">
                    Please provide the details of your guest so we can prepare accordingly.
                </p>
                
                <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
                    <Input 
                        v-model="formData.firstName" 
                        label="First Name" 
                        placeholder="Enter first name" 
                        :error="errors.firstName" 
                        required 
                        @blur="validateFirstName"
                    />

                    <Input
                        v-model="formData.lastName" 
                        label="Last Name" 
                        placeholder="Enter last name" 
                        :error="errors.lastName" 
                        @blur="validateLastName"
                    />
                </form>
            </div>
        </template>

        <template #footer>
            <div class="px-24 pb-24 pt-56">
                <Button 
                    :label="isEditing ? 'Update +1 details' : 'Submit +1 details'"
                    type="primary" 
                    class="w-full" 
                    :disabled="!isFormValid"
                    :is-loading="isLoading"
                    @click="handleSubmit"
                />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
/* ------------------- Stores ------------------- */
const rsvpStore = useRSVPStore()
const guestStore = useGuestStore()
const uiStore = useUIStore()


/* ------------------- Props and Emits ------------------- */
interface Props {
    isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ------------------- Computed Properties ------------------- */
const guestRsvp = computed(() => rsvpStore.rsvpData)
const isLoading = computed(() => rsvpStore.loading)
const isVisible = computed(() => props.isVisible)

const plusOneName = computed(() => {
  const plusOne = guestRsvp.value?.plus_one_data?.plus_ones?.[0]
  return plusOne ? `${plusOne.name.titles ? plusOne.name.titles.join(' ') : ''} ${plusOne.name.first_name} ${plusOne.name.last_name}` : 'your +1'
})

const isFormValid = computed(() => {
    return formData.value.firstName.trim() !== '' && 
           errors.value.firstName === '' && 
           errors.value.lastName === ''
})

const isEditing = computed(() => {
    return !!plusOneName.value && plusOneName.value !== 'your +1'
})

/* ------------------- Variables ------------------- */
const errors = ref({
    firstName: '',
    lastName: ''
})
const formData = ref(rsvpStore.initializePlusOneFormData())
const nameRegex = /^[a-zA-Z'-]+$/


/* ------------------- Methods ------------------- */
const validateFirstName = () => {
    if (!formData.value.firstName.trim()) {
        errors.value.firstName = 'First name is required'
        return false
    } else if (!nameRegex.test(formData.value.firstName.trim())) {
        errors.value.firstName = 'Please enter a valid name (aA-zZ, -, \' only)'
        return false
    } else {
        errors.value.firstName = ''
        return true
    }
}

const validateLastName = () => {
    if (formData.value.lastName.trim() && !nameRegex.test(formData.value.lastName.trim())) {
        errors.value.lastName = 'Please enter a valid name (aA-zZ, -, \')'
        return false
    } else {
        errors.value.lastName = ''
        return true
    }
}

const handleSubmit = async () => {
    validateFirstName()
    validateLastName()
    
    if (isFormValid.value) {
      const guestToken = guestStore.guestData?.auth_token
      const plusOneID = guestRsvp.value?.plus_one_data?.plus_ones?.[0]?.plus_one_id || null
      const formAction = isEditing.value ? 'update' : 'add'
      const plusOneName = {
        first_name: formData.value.firstName.trim(),
        last_name: formData.value.lastName.trim(),
      }
        
      if(!guestToken) {
          throw new Error('No guest token available')
      }

      if(!plusOneID && isEditing.value) {
          throw new Error('No plus one found to remove.')
      }

      if (isEditing.value) {
        await rsvpStore.managePlusOneData(guestToken, formAction, {
          p_plus_one_id: plusOneID,
          plus_one_type: 'others',
          plus_one_name: plusOneName
        })
      } else {
        await rsvpStore.managePlusOneData(guestToken, formAction, {
          plus_one_type: 'others',
          plus_one_name: plusOneName
        })
      }
        
      uiStore.showHidePlusOneModal(false)
      clearFormData()
    }
}

const handleClose = () => {
    uiStore.showHidePlusOneModal(false)
    clearFormData()
}

const clearFormData = () => {
    formData.value = {
        firstName: '',
        lastName: ''
    }
}


/* ------------------- Lifecycle Hooks ------------------- */
onMounted(() => {
    const initialData = rsvpStore.initializePlusOneFormData()
    formData.value = initialData
    
    if (initialData.firstName) {
        validateFirstName()
    }
    if (initialData.lastName) {
        validateLastName()
    }
})
</script>

<style scoped>

</style>