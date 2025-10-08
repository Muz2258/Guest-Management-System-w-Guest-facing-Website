<template>
    <div class="flex flex-col gap-8 px-24 pb-24 pt-16">
        <Button 
            :label="'Keep my +1'"
            type="secondary" 
            class="w-full" 
            @click="keepPlusOne"
        />
        <Button 
            :label="'Remove my +1'"
            type="primary" 
            class="w-full" 
            :is-loading="deleting"
            @click="handleDelete"
        />
    </div>
</template>

<script setup lang="ts">
// Define props
interface Props {
    isRemoving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isRemoving: false
})

const deleting = computed(() => props.isRemoving)

// Define emits
const emit = defineEmits<{
    deletePlusOne: []
    keepPlusOne: []
}>()

// Functions
const handleDelete = () => {
    emit('deletePlusOne')
}

const keepPlusOne = () => {
    emit('keepPlusOne')
}
</script>

<style scoped>
</style>
