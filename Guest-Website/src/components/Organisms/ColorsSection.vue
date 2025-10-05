<template>
  <page-section section-title="Colors Of The Day">
    <template #content>
      <div class="flex justify-center gap-12 w-full mt-24 mb-32">
        <div v-for="color in colors" :key="color.id" class="flex flex-col items-center gap-12">
          <div class="rounded-full size-64" :style="{ backgroundColor: color.hex }"></div>
          <p>{{ color.name }}</p>
        </div>
      </div>
    </template>
  </page-section>
</template>

<script setup lang="ts">
const colors = [
  { id: 1, name: 'Purple', hex: '#4F1E8B' },
  { id: 2, name: 'Lilac', hex: '#DDC8F8' },
  { id: 3, name: 'Peach', hex: '#EFB19A' },
  { id: 4, name: 'Green', hex: '#177B61' },
]
</script>