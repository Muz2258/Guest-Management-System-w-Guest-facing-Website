<template>
    <div class="backdrop w-full h-full fixed top-0 left-0 bg-neutrals-neu-0/50 backdrop-blur-sm flex items-end justify-center z-[1000]">
        <div class="bottom-sheet flex flex-col gap-16 bg-neutrals-neu-100 shadow-modal max-w-lg w-full min-h-[60vh] max-h-[95vh]" >
            <div class="flex justify-end px-24 pt-24">
                <Icon name="close" :size="20" :color="getColor('neutral.neu_0')" @click="handleClose" class="cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
            <slot name="body"></slot>
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import Icon from '../Icon';
import { getColor } from '../../utils/colors';

// Define emits for parent component
const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden';
})

onBeforeUnmount(() => {
  document.body.style.overflow = '';
})
</script>

<style scoped>
</style>