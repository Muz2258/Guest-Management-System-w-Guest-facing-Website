<template>
    <div class="px-24 pb-24 pt-56">
        <Button 
            :label="isEditing ? 'Update +1 details' : 'Submit +1 details'"
            type="primary" 
            class="w-full" 
            :disabled="!isFormValid"
            :is-loading="isSubmitting"
            @click="handleSubmit"
        />
    </div>
</template>

<script setup lang="ts">
// Stores
const guestStore = useGuestStore()

// Store variables
const { guestData } = guestStore

// Define props
interface Props {
    isFormValid: boolean
    isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false
})

// Computed properties
const guestRsvp = computed(() => guestData?.rsvp)

// Check if we're editing an existing plus one
const isEditing = computed(() => {
    return !!guestRsvp.value?.plus_one_name
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
