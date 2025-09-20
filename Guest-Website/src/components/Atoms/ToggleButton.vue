<template>
  <button
    :class="buttonClasses"
    :aria-pressed="isSelected"
    :disabled="disabled"
    @click="handleToggle"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  isSelected: boolean
  label?: string
  disabled?: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const baseClasses = 'px-16 py-12 text-button transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-pri border-2'
  
  if (props.disabled) {
    return `${baseClasses} opacity-50 cursor-not-allowed border-neutrals-neu-76 text-neutrals-neu-46 bg-transparent`
  }
  
  if (props.isSelected) {
    // Active state: solid filled with brand accent background
    return `${baseClasses} bg-brand-accent border-brand-accent text-neutrals-neu-100 hover:bg-brand-accent-light-100 hover:border-brand-accent-light-100`
  } else {
    // Inactive state: outline with brand primary border and text
    return `${baseClasses} bg-transparent border-brand-pri text-brand-pri hover:bg-brand-sec-light-200 hover:border-brand-pri-light-100`
  }
})

const handleToggle = () => {
  if (!props.disabled) {
    emit('toggle')
  }
}
</script>

<style scoped>
</style>