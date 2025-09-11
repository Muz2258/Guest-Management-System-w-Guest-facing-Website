<template>
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

<script setup lang="ts">
// Stores
const goodWillStore = useGoodWillStore()

// Define props
interface Props {
    isFormValid: boolean
    isSubmitting?: boolean
    isDeleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false,
    isDeleting: false
})

// Check if we're editing an existing message
const isEditing = computed(() => {
    return !!goodWillStore.currentGoodWillMessage?.message_text
})

// Define emits
const emit = defineEmits<{
    submit: []
}>()

// Handle submit
const handleSubmit = () => {
    if (props.isFormValid) {
        emit('submit')
    }
}
</script>

<style scoped>
</style>
