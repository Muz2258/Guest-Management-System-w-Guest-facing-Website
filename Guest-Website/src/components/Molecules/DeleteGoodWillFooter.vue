<template>
    <div class="flex flex-col gap-8 w-full px-24 pb-24 pt-8">
        <Button 
            label="Cancel" 
            type="secondary" 
            class="w-full" 
            @click="$emit('cancel')"
            :disabled="isDeleting"
        />
        <Button 
            label="Delete Message" 
            type="primary" 
            class="w-full" 
            :is-loading="isDeleting"
            @click="$emit('confirm')"
        />
    </div>
</template>

<script setup lang="ts">
// Define props
interface Props {
    isDeleting?: boolean
}

withDefaults(defineProps<Props>(), {
    isDeleting: false
})

// Define emits
defineEmits<{
    cancel: []
    confirm: []
}>()
</script>

<style scoped>
</style>
