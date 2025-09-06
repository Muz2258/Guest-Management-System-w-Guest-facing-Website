<template>
    <div>
        <label class="relative inline-flex items-center cursor-pointer" :for="label">
            <input 
                type="checkbox" 
                v-model="modelValue" 
                class="sr-only peer"
                :id="label"
            >
            <div class="w-44 h-24 bg-neutrals-neu-76 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-pri/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-20 after:w-20 after:transition-all peer-checked:bg-brand-pri"></div>
        </label>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    label: {
        type: String,
        required: true
    }
})

const label = computed(() => props.label.replace(/\s+/g, '-').toLowerCase())

const modelValue = defineModel<boolean>({
    type: Boolean,
    required: true
})
</script>

<style scoped>

</style>