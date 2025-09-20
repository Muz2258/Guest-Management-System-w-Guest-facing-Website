<template>
  <div class="flex items-center gap-8">
    <div class="relative flex items-center">
      <input
        :id="inputId"
        type="checkbox"
        :name="name"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        :class="inputClasses"
        class="sr-only"
      />
      <div :class="checkboxClasses" @click="handleClick">
        <Icon v-if="modelValue" name="check" :size="14" :color="getColor('neutral.neu_100')" :stroke-width="2" />
      </div>
    </div>
    
    <div v-if="label || $slots.default" class="flex-1">
      <label 
        :for="inputId" 
        :class="labelClasses"
        @click="handleClick"
      >
        <slot>{{ label }}</slot>
        <span v-if="required" class="text-denotive-red ml-2">*</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '../Icon'
import { getColor } from '@/utils/colors'


interface Props {
  modelValue: boolean
  label?: string
  name?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  required: false
})

const emit = defineEmits<Emits>()

// Generate unique ID if not provided
const inputId = computed(() => {
  if (props.id) return props.id
  return `checkbox-${Math.random().toString(36).substr(2, 9)}`
})

// Compute checkbox styling classes
const checkboxClasses = computed(() => {
  const baseClasses = 'w-20 h-20 flex rounded items-center justify-center border-2 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-pri'
  
  if (props.disabled) {
    return `${baseClasses} opacity-50 cursor-not-allowed border-neutrals-neu-76 bg-neutrals-neu-90`
  }
  
  if (props.modelValue) {
    return `${baseClasses} bg-brand-pri border-brand-pri hover:bg-brand-pri-light-100 hover:border-brand-pri-light-100`
  }
  
  return `${baseClasses} bg-transparent border-brand-pri hover:bg-brand-sec-light-200 hover:border-brand-pri-light-100`
})

// Compute label styling classes
const labelClasses = computed(() => {
  const baseClasses = 'text-s cursor-pointer select-none'
  
  if (props.disabled) {
    return `${baseClasses} text-neutrals-neu-46 cursor-not-allowed`
  }
  
  return `${baseClasses} text-neutrals-neu-20`
})

// Compute input classes for accessibility
const inputClasses = computed(() => {
  return 'focus:ring-2 focus:ring-brand-pri focus:ring-offset-2'
})

// Event handlers
const handleChange = (event: Event) => {
  if (props.disabled) return
  
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', event)
}

const handleClick = () => {
  if (props.disabled) return
  
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
/* Hide default checkbox but keep it accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>