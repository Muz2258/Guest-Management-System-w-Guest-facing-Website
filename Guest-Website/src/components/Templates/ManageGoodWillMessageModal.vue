<template>
    <Modal @close="handleClose">
        <template #body>
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
                            name="message"
                            id="message"
                            v-model="formData"
                            placeholder="Write your message here..."                            rows="6"
                            maxlength="250"
                            class="resize-none"
                            :class="{ 'border-denotive-red': errors.message }" 
                            @blur="validateMessage(formData)"
                            @input="validateMessage(formData)"
                        />
                        <div class="flex justify-between items-center">
                            <span v-if="errors.message" class="text-denotive-red text-xs">{{ errors.message }}</span>
                            <span class="text-xs text-neutrals-neu-46 ml-auto">
                                {{ formData.length }}/200 characters
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </template>

        <template #footer>
            <div class="px-24 pb-24">
                <div class="flex flex-col gap-12">
                    <Button 
                        :label="isEditing ? 'Update message' : 'Send message'"
                        type="primary" 
                        class="w-full" 
                        :disabled="!isFormValid"
                        :is-loading="isSubmitting"
                        @click="handleSubmit"
                    />
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
/* ------------------- Stores ------------------- */
const uiStore = useUIStore()
const goodWillStore = useGoodWillStore()
const guestStore = useGuestStore()


/* ------------------- Local Variables ----------------- */
const formData = ref(goodWillStore.initializeGoodWillFormData())

const errors = ref({
    message: ''
})


/* ------------------- Computed Properties ----------------- */
const isFormValid = computed(() => {
    return formData.value.trim() !== '' && 
           formData.value.trim().length >= 5 &&
           formData.value.length <= 200 &&
           errors.value.message === ''
})

const isEditing = computed(() => !!goodWillStore.goodWillMessage?.message_text)
const isSubmitting = computed(() => goodWillStore.loading)


/* ------------------- Functions ----------------- */
const handleClose =() => {
    uiStore.showHideGoodWillModal(false)
}

const validateMessage = (message: string) => {    
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

const handleSubmit = async () => {
    const guestToken = guestStore.guestData?.auth_token

    if (!guestToken) {
        throw new Error('Guest is not authenticated')
    }

    const message = formData.value.trim()
    const isMessageValid = validateMessage(message)
    
    if (isMessageValid) {
        await goodWillStore.saveGoodWillMessage(guestToken, message)

        uiStore.showHideGoodWillModal(false)
    }
}


/* ------------------- Lifecycle Hooks ----------------- */
onMounted(() => {
    const initialData = goodWillStore.initializeGoodWillFormData()
    formData.value = initialData
    
    if (initialData) {
        validateMessage(formData.value)
    }
})
</script>