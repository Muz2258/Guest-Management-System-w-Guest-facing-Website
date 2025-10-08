<template>
  <Modal @close="handleClose">
    <template #body>
      <div class="flex flex-col items-center justify-center px-24 pb-24 text-center">
        <!-- Emoji -->
        <div class="text-[3rem] mb-16">😞</div>
        
        <!-- Heading -->
        <h2 class="text-h3 font-medium text-neutrals-neu-0 mb-16">
          Nooo!
        </h2>
        
        <!-- Message -->
        <p class="text-body-l text-neutrals-neu-20 leading-relaxed">
          We're so sorry you couldn't successfully process your gift contribution. Feel free to try again at a later time. We love you so so much. Cheers to more celebrations!
        </p>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '../Atoms/Modal.vue'

// Define emits
const emit = defineEmits<{
  close: []
}>()

// Event handlers
const handleClose = () => {
  emit('close')
}
</script>

<style scoped></style>