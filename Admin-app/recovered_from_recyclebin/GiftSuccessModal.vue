<template>
  <Modal @close="handleClose">
    <template #body>
      <div class="flex flex-col items-center justify-center px-24 pb-24 text-center">
        <!-- Emoji -->
        <div class="text-[3rem] mb-16">😘</div>
        
        <!-- Heading -->
        <h2 class="text-h3 font-medium text-neutrals-neu-0 mb-16">
          We love you!
        </h2>
        
        <!-- Message -->
        <p class="text-body-l text-neutrals-neu-20 leading-relaxed">
          Thank you so much {{ firstName || '' }} for your gift. We are grateful to have you in our lives. Cheers to more celebrations!
        </p>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '../Atoms/Modal.vue'

// Define props
interface Props {
  firstName?: string
}

withDefaults(defineProps<Props>(), {
  firstName: ''
})

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