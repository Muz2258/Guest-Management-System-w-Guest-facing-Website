<template>
  <transition appear name="modal-fade">
    <div v-if="isVisible" class="modal-backdrop w-full h-full fixed top-0 left-0 bg-neutrals-neu-0/50 backdrop-blur-sm flex items-center justify-center z-[1000]" @click="handleBackdropClick">
        <div class="modal-content flex flex-col gap-16 bg-neutrals-neu-100 shadow-modal max-w-lg w-[87vw] min-h-[30vh] max-h-[80vh] overflow-y-auto" @click.stop>
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
import { getColor } from '../../utils/colors';
import Icon from '../Icon';

/* ---------------- Props and Emits ------------------ */
interface Props {
    isVisible: boolean
}

const emit = defineEmits<{
  close: []
}>()

const props = withDefaults(defineProps<Props>(), {
  isVisible: false
})


/* ------------------ Computed Properties ------------------ */
const isVisible = computed(() => props.isVisible)


/* ------------------ Functions ------------------ */
const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  emit('close')
}


/* ------------------ Lifecycle Hooks ------------------ */
onMounted(() => {
  document.body.style.overflow = 'hidden';
})

onBeforeUnmount(() => {
  document.body.style.overflow = '';
})
</script>

<style scoped>
.modal-fade-enter-active .modal-backdrop,
.modal-fade-leave-active .modal-backdrop {
  transition: opacity 200ms linear;
}

.modal-fade-enter-from .modal-backdrop,
.modal-fade-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: all 400ms cubic-bezier(.08,.88,.34,.99);
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  opacity: 0;
  transform: translateY(45%);
}
</style>