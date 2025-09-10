<template>
    <div class="w-full h-full fixed top-0 left-0 bg-neutrals-neu-0/50 backdrop-blur-sm flex items-center justify-center z-[1000]" @click="handleBackdropClick">
        <div class="flex flex-col gap-16 bg-neutrals-neu-100 shadow-modal max-w-lg w-[87vw] min-h-[30vh] max-h-[80vh] overflow-y-auto" @click.stop>
            <div class="flex justify-end px-24 pt-24">
                <Icon name="close" :size="20" :color="getColor('neutral.neu_0')" @click="handleClose" class="cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
            <slot name="body"></slot>
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getColor } from '../../utils/colors';
import Icon from '../Icon';

// Define emits for parent component
const emit = defineEmits<{
  close: []
}>()

// Event handler for closing modal
const handleClose = () => {
  emit('close')
}

// Event handler for closing modal when clicking on backdrop
const handleBackdropClick = () => {
  emit('close')
}
</script>

<style scoped></style>