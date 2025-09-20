<template>
  <div>
    <nav class="-mb-px flex space-x-8 pb-24 bg-neutrals-neu-100" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="selectTab(tab.id)"
        :class="[baseClasses, tab.id === modelValue ? active : inactive]"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
/* ---------------------- Type Interfaces ------------------- */
interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}


/* --------------------- Props and Emits ------------------- */
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])


/* ---------------------- Non-reactive Variables ------------------- */
const baseClasses = 'whitespace-nowrap p-12 w-full text-sm transition-colors duration-200 focus:outline-none'
const active = 'bg-brand-accent text-neutrals-neu-100'
const inactive = 'bg-neutrals-neu-96 text-neutrals-neu-0'


/* -------------------- Functions --------------------- */
const selectTab = (tabId: string) => {
  emit('update:modelValue', tabId)
}
</script>
