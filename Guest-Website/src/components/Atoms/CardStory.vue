<template>
  <div class="p-24 h-[16.5rem] w-[16.5rem] shrink-0 bg-neutrals-neu-100 flex flex-col justify-between shadow-card rounded-lg">
    <div class="flex flex-col items-center gap-24 mt-12 h-full">
      <picture>
        <source :srcset="sourceComputed.webp" type="image/webp">
        <img :src="sourceComputed.gif" :alt="altComputed" width="88" height="88">
      </picture>
      <p class="text-s text-neutrals-neu-0 text-center">{{ copyComputed }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  copy: string
  source: {
    webp: string
    gif: string
  }
  alt: string
}

const props = withDefaults(defineProps<Props>(), {
  source: () => ({
    webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp',
    gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif'
  }),
  alt: '🥰',
})

const copyComputed = computed(() => props.copy)
const sourceComputed = computed(() => props.source)
const altComputed = computed(() => props.alt)
</script>