<template>
  <section 
      class="flex flex-col items-center bg-neutrals-neu-100 pt-8 pb-40 px-24 overflow-hidden"
  >
    <div class="mb-20">
        <DecorativeBranches variant="purple">
            <h4 class="text-heading-s text-brand-pri">{{ sectionTitle }}</h4>
        </DecorativeBranches>
    </div>
    <slot name="content"></slot>
  </section>
</template>

<script setup lang="ts">
interface Props {
  sectionTitle: string
}

const props = defineProps<Props>()

const sectionTitle = computed(() => props.sectionTitle)
</script>