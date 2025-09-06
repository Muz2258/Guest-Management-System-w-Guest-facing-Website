<template>
    <button 
        :class="buttonClasses"
        :disabled="disabled"
        @click="handleClick"
        class="px-16 py-16 text-button transition-colors duration-200"
    >
        {{ label }}
    </button>
</template>

<script setup lang="ts">
// Props and Emits
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'primary',
        validator: (value: string) => ['primary', 'secondary', 'tertiary', 'alt-solid', 'alt-text'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click'])

// Computed properties
const buttonClasses = computed(() => {
    const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-brand-sec-dark-100 disabled:text-neutrals-neu-100/50'
    
    switch (props.type) {
        case 'primary':
            return `${baseClasses} bg-brand-pri text-neutrals-neu-100 hover:bg-brand-pri-light-100 focus:ring-brand-pri`
        case 'secondary':
            return `${baseClasses} bg-brand-sec-light-100 text-brand-pri hover:bg-brand-sec-light-200 focus:ring-brand-sec`
        case 'tertiary':
            return `${baseClasses} bg-transparent text-brand-pri hover:bg-brand-sec-light-100 focus:ring-brand-pri`
        case 'alt-solid':
            return `${baseClasses} bg-neutrals-neu-100 text-brand-accent hover:bg-neutrals-neu-100 focus:ring-neutrals-neu-100`
        case 'alt-text':
            return `${baseClasses} bg-transparent text-neutrals-neu-100 hover:bg-neutrals-neu-100 focus:ring-neutrals-neu-100`
    }
})

// Methods
const handleClick = (event: Event) => {
    if (!props.disabled) {
        emit('click', event)
    }
}
</script>

<style scoped></style>