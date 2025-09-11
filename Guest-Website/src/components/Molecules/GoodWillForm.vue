<template>
    <div class="px-24 py-24">
        <h3 class="text-heading-md text-center text-neutrals-neu-0 mb-16">
            {{ isEditing ? 'Edit your message' : 'Write on our wall' }}
        </h3>
        <p class="text-neutrals-neu-46 text-s text-center mb-32">
            Leave a message for us to see. We appreciate your love and support!
        </p>
        
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-16">
            <div class="flex flex-col gap-4">
                <label for="message"></label>
                <textarea
                    id="message"
                    v-model="formData.message"
                    placeholder="Write your message here..."
                    rows="6"
                    maxlength="250"
                    class="resize-none"
                    :class="{ 'border-denotive-red': errors.message }"
                    @blur="validateMessage"
                    @input="validateMessage"
                />
                <div class="flex justify-between items-center">
                    <span v-if="errors.message" class="text-denotive-red text-xs">{{ errors.message }}</span>
                    <span class="text-xs text-neutrals-neu-46 ml-auto">
                        {{ formData.message.length }}/200 characters
                    </span>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
// Stores
const goodWillStore = useGoodWillStore()

// Define emits for parent component
const emit = defineEmits<{
  formValid: [isValid: boolean]
  submit: [data: { message: string }]
}>()

// Form data - initialize with existing message if available
const initializeFormData = () => {
    const existingMessage = goodWillStore.goodWillMessage?.message_text || ''
    return {
        message: existingMessage
    }
}

const formData = ref(initializeFormData())

// Form errors
const errors = ref({
    message: ''
})

// Validation functions
const validateMessage = () => {
    const message = formData.value.message.trim()
    
    if (!message) {
        errors.value.message = 'Message is required'
        return false
    } else if (message.length > 200) {
        errors.value.message = 'Message must be 200 characters or less'
        return false
    } else if (message.length < 5) {
        errors.value.message = 'Message must be at least 5 characters'
        return false
    } else {
        errors.value.message = ''
        return true
    }
}

// Check if form is valid
const isFormValid = computed(() => {
    return formData.value.message.trim() !== '' && 
           formData.value.message.trim().length >= 5 &&
           formData.value.message.length <= 200 &&
           errors.value.message === ''
})

// Check if we're editing an existing message
const isEditing = computed(() => {
    return !!goodWillStore.goodWillMessage?.message_text
})

// Watch for form validity changes and emit to parent
watch(isFormValid, (newValue) => {
    emit('formValid', newValue)
}, { immediate: true })

// Reinitialize form when component is mounted/reopened
onMounted(() => {
    const initialData = initializeFormData()
    formData.value = initialData
    
    // Validate message if it has initial data
    if (initialData.message) {
        validateMessage()
    }
})

// Handle form submission
const handleSubmit = () => {
    validateMessage()
    
    if (isFormValid.value) {
        emit('submit', {
            message: formData.value.message.trim()
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
