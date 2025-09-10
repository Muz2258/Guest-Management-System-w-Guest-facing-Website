<template>
    <div class="p-24 h-[16.5rem] w-[16.5rem] shrink-0 bg-neutrals-neu-100 flex flex-col justify-between shadow-card">
        <div>
            <h2 class="text-neutrals-neu-0 text-heading-sm lining-nums mb-12">{{ title }}</h2>
            <p v-if="typeof description === 'string' && hasCopy" class="text-s text-neutrals-neu-46">{{ description }}</p>
            <p v-else class="text-s text-neutrals-neu-46">
                {{ descriptionObject?.before }} <span class="text-neutrals-neu-0">{{ descriptionObject?.guestName }}</span> {{ descriptionObject?.after }}</p>
        </div>
        <slot name="footer"></slot>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: [String, Object],
        required: false,
    }
})

const hasCopy = computed(() => props.description !== null && props.description !== undefined);

const descriptionObject = computed(() => {
    if (typeof props.description === 'object' && props.description !== null) {
        return props.description as { before: string; guestName: string; after: string };
    }
    return null;
});
</script>