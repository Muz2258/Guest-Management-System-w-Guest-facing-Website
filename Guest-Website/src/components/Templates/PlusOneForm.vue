<template>
    <div class="px-24 py-24">
        <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
            {{ isEditing ? 'Update your +1\'s details' : 'Add your +1\'s details' }}
        </h3>
        <p class="text-neutrals-neu-46 text-s text-center mb-32">
            Please provide the details of your guest so we can prepare accordingly.
        </p>
        
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-16">
            <div class="flex flex-col gap-4">
                <label for="firstName" class="text-xs text-neutrals-neu-46">
                    First Name <span class="text-denotive-red">*</span>
                </label>
                <input
                    id="firstName"
                    v-model="formData.firstName"
                    type="text"
                    placeholder="Enter first name"
                    :class="{ 'border-denotive-red': errors.firstName }"
                    @blur="validateFirstName"
                />
                <span v-if="errors.firstName" class="text-denotive-red text-xs">{{ errors.firstName }}</span>
            </div>
            
            <div class="flex flex-col gap-4">
                <label for="lastName" class="text-xs font-medium text-neutrals-neu-46">
                    Last Name
                </label>
                <input
                    id="lastName"
                    v-model="formData.lastName"
                    type="text"
                    placeholder="Enter last name"
                    :class="{ 'border-denotive-red': errors.lastName }"
                    @blur="validateLastName"
                />
                <span v-if="errors.lastName" class="text-denotive-red text-xs">{{ errors.lastName }}</span>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
// Stores
const guestStore = useGuestStore()

// Define emits for parent component
const emit = defineEmits<{
  formValid: [isValid: boolean]
  submit: [data: { firstName: string; lastName: string }]
}>()

// Form data - initialize with existing plus one data if available
const initializeFormData = () => {
    const existingPlusOne = guestStore.guest?.rsvp?.plus_one_name || ''
    if (existingPlusOne) {
        const names = existingPlusOne.trim().split(' ')
        return {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || ''
        }
    }
    return {
        firstName: '',
        lastName: ''
    }
}

const formData = ref(initializeFormData())

// Form errors
const errors = ref({
    firstName: '',
    lastName: ''
})

// Name validation regex - allows letters, hyphens, and apostrophes
const nameRegex = /^[a-zA-Z'-]+$/

// Validation functions
const validateFirstName = () => {
    if (!formData.value.firstName.trim()) {
        errors.value.firstName = 'First name is required'
        return false
    } else if (!nameRegex.test(formData.value.firstName.trim())) {
        errors.value.firstName = 'Please enter a valid name (letters, hyphens, and apostrophes only)'
        return false
    } else {
        errors.value.firstName = ''
        return true
    }
}

const validateLastName = () => {
    if (formData.value.lastName.trim() && !nameRegex.test(formData.value.lastName.trim())) {
        errors.value.lastName = 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
        return false
    } else {
        errors.value.lastName = ''
        return true
    }
}

// Check if form is valid
const isFormValid = computed(() => {
    return formData.value.firstName.trim() !== '' && 
           errors.value.firstName === '' && 
           errors.value.lastName === ''
})

// Check if we're editing an existing plus one
const isEditing = computed(() => {
    return !!guestStore.guest?.rsvp?.plus_one_name
})

// Watch for form validity changes and emit to parent
watch(isFormValid, (newValue) => {
    emit('formValid', newValue)
}, { immediate: true })

// Reinitialize form when component is mounted/reopened
onMounted(() => {
    const initialData = initializeFormData()
    formData.value = initialData
    
    // Validate fields if they have initial data
    if (initialData.firstName) {
        validateFirstName()
    }
    if (initialData.lastName) {
        validateLastName()
    }
})

// Handle form submission
const handleSubmit = () => {
    validateFirstName()
    validateLastName()
    
    if (isFormValid.value) {
        emit('submit', {
            firstName: formData.value.firstName.trim(),
            lastName: formData.value.lastName.trim()
        })
    }
}

// Expose handleSubmit for parent to call
defineExpose({
    handleSubmit
})
</script>

<style scoped>
</style>
