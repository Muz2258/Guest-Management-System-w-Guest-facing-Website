<template>
    <div class="px-24 pb-24">
        <div class="flex flex-col gap-12">
            <Button 
                label="Yes, I'll be there"
                type="primary" 
                class="w-full" 
                :is-loading="isUpdating && selectedResponse === 'attending'"
                @click="handleRSVPUpdate('attending')"
            />
            <Button 
                label="Sorry, I can't make it"
                type="secondary" 
                class="w-full" 
                :is-loading="isUpdating && selectedResponse === 'not_attending'"
                @click="handleRSVPUpdate('not_attending')"
            />
            <Button 
                label="Cancel"
                type="tertiary" 
                class="w-full" 
                :disabled="isUpdating"
                @click="handleCancel"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
// Define props
interface Props {
    isUpdating?: boolean
    selectedResponse?: string
}

withDefaults(defineProps<Props>(), {
    isUpdating: false,
    selectedResponse: ''
})

// Define emits
const emit = defineEmits<{
    updateRsvp: [response: 'attending' | 'not_attending']
    cancel: []
}>()

// Handle RSVP update
const handleRSVPUpdate = (response: 'attending' | 'not_attending') => {
    console.log(`RSVP update requested: ${response}`);
    emit('updateRsvp', response)
}

// Handle cancel
const handleCancel = () => {
    emit('cancel')
}
</script>

<style scoped>
</style>
