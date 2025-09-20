<template>
  <div class="flex flex-col gap-6">
    <!-- Label -->
    <label 
      v-if="label || $slots.label" 
      :for="inputId" 
      class="text-s text-neutrals-neu-46"
    >
      <slot name="label">
        {{ label }}
        <span v-if="required" class="text-denotive-red">*</span>
      </slot>
    </label>
    
    <!-- Input Container -->
    <div :class="inputClasses">
      <!-- Prefix -->
      <span 
        v-if="prefix" 
        class="text-neutrals-neu-0 text pointer-events-none ml-4"
      >
        {{ prefix }}
      </span>
      
      <!-- Input Field -->
      <input
        type="text"
        :id="inputId"
        :name="label"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
        class="flex-1 focus:outline-none bg-transparent"
      />
      
      <!-- Suffix -->
      <span 
        v-if="suffix" 
        class="text-neutrals-neu-0 text pointer-events-none mr-4"
      >
        {{ suffix }}
      </span>
    </div>
    
    <div class="flex justify-between items-center">
      <!-- Error Message -->
      <span class="text-denotive-red text-xs min-h-16" :class="{'opacity-100': error, 'opacity-0': !error}">{{ error }}</span>
      
      <!-- Help Text -->
      <span v-if="helpText && !error" class="text-neutrals-neu-46 text-xs">{{ helpText }}</span>

      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  error?: string
  helpText?: string
  prefix?: string
  suffix?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
  id?: string
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'input', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<Emits>()

// Generate unique ID if not provided
const inputId = computed(() => {
  if (props.id) return props.id
  return `input-${Math.random().toString(36).substr(2, 9)}`
})

// Compute input classes
const inputClasses = computed(() => {
  const baseClasses = 'flex items-center gap-8 px-12 py-12 border border-brand-sec text-neutrals-neu-0 bg-neutrals-neu-96 focus-within:outline-2 focus-within:outline-brand-pri focus-within:border-transparent'
  
  // Error state
  const errorClasses = props.error ? 'border-denotive-red' : ''
  
  // Disabled state
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return [
    baseClasses,
    errorClasses,
    disabledClasses
  ].filter(Boolean).join(' ')
})

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  emit('update:modelValue', value)
  emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}
</script>

<style scoped>
</style>