<template>
  <transition appear name="bottom-sheet-fade">
    <div v-if="isVisible" class="sheet-backdrop w-full h-full fixed top-0 left-0 bg-neutrals-neu-0/50 backdrop-blur-sm flex items-end justify-center z-[1000]">
        <div class="sheet-content flex flex-col gap-16 bg-neutrals-neu-100 shadow-modal max-w-lg w-full min-h-[60vh] max-h-[95vh]" >
            <div class="flex justify-end px-24 pt-24">
                <Icon name="close" :size="20" :color="getColor('neutral.neu_0')" @click="handleClose" class="cursor-pointer hover:opacity-70 transition-opacity" />
            </div>
            <slot name="body"></slot>
            <slot name="footer"></slot>
        </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
/* ------------------- Imports ------------------- */
import Icon from '../Icon';
import { getColor } from '../../utils/colors';


/* ----------------- Props and Emits -------------------- */
interface Props {
    isVisible: boolean
}

interface Emits {
    close: []
}

const emit = defineEmits<Emits>()

const props = withDefaults(defineProps<Props>(), {
    isVisible: false
})


/* ------------------- Computed ------------------- */
const isVisible = computed(() => props.isVisible)


/* ------------------- Methods ------------------- */
const handleClose = () => {
  emit('close')
}


/* ------------------- Lifecycle Hooks ------------------- */
onMounted(() => {
  document.body.style.overflow = 'hidden';
})

onBeforeUnmount(() => {
  document.body.style.overflow = '';
})
</script>

<style scoped>
.bottom-sheet-fade-enter-active .sheet-backdrop,
.bottom-sheet-fade-leave-active .sheet-backdrop {
  transition: opacity 200ms linear;
}

.bottom-sheet-fade-enter-from .sheet-backdrop,
.bottom-sheet-fade-leave-to .sheet-backdrop {
  opacity: 0;
}

.bottom-sheet-fade-enter-active .sheet-content,
.bottom-sheet-fade-leave-active .sheet-content {
  transition: all 400ms cubic-bezier(.08,.88,.34,.99);
}

.bottom-sheet-fade-enter-from .sheet-content,
.bottom-sheet-fade-leave-to .sheet-content {
  opacity: 0;
  transform: translateY(45%);
}
</style>