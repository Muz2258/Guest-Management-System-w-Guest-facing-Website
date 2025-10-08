<template>
    <div class="flex flex-col gap-8 p-24">
        <Button
            type="primary"
            label="Proceed"
            :is-loading="isSubmitting"
            :disabled="!isFormValid"
            @click="handleProceed"
        />
        <Button
            type="secondary"
            label="Cancel"
            @click="handleCancel"
        />
    </div>
</template>

<script setup lang="ts">
interface Props {
    isFormValid: boolean
    isSubmitting?: boolean
    selectedAmount?: number | null
}

interface Emits {
    (e: 'proceed', amount: number): void
    (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false,
    selectedAmount: null
})

const emit = defineEmits<Emits>()

const handleProceed = () => {
    if (props.isFormValid && props.selectedAmount && !props.isSubmitting) {
        emit('proceed', props.selectedAmount)
    }
}

const handleCancel = () => {
    if (!props.isSubmitting) {
        emit('cancel')
    }
}
</script>

<style scoped>
</style>