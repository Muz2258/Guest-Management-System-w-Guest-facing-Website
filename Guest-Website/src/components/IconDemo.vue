<template>
  <div class="p-6 space-y-8">
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Basic Usage</h2>
      <div class="flex gap-4 items-center">
        <Icon name="close" />
        <Icon name="location-pin" />
        <Icon name="alarm-clock" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Custom Sizes</h2>
      <div class="flex gap-4 items-center">
        <Icon name="alarm-clock" size="16px" />
        <Icon name="alarm-clock" size="24px" />
        <Icon name="alarm-clock" size="32px" />
        <Icon name="alarm-clock" size="48px" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Custom Colors</h2>
      <div class="flex gap-4 items-center">
        <Icon name="location-pin" size="32px" color="currentColor" />
        <Icon name="location-pin" size="32px" color="#FF5733" />
        <Icon name="location-pin" size="32px" color="#33FF57" />
        <Icon name="location-pin" size="32px" color="#3357FF" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Rotation</h2>
      <div class="flex gap-4 items-center">
        <Icon name="alarm-clock" size="32px" :rotate="0" />
        <Icon name="alarm-clock" size="32px" :rotate="45" />
        <Icon name="alarm-clock" size="32px" :rotate="90" />
        <Icon name="alarm-clock" size="32px" :rotate="180" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Flipping</h2>
      <div class="flex gap-4 items-center">
        <Icon name="location-pin" size="32px" />
        <Icon name="location-pin" size="32px" :flipX="true" />
        <Icon name="location-pin" size="32px" :flipY="true" />
        <Icon name="location-pin" size="32px" :flipX="true" :flipY="true" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Custom Classes</h2>
      <div class="flex gap-4 items-center">
        <Icon 
          name="close" 
          size="32px" 
          class="hover:text-red-500 transition-colors duration-200" 
        />
        <Icon 
          name="close" 
          size="32px" 
          class="hover:scale-125 transition-transform duration-200" 
        />
        <Icon 
          name="close" 
          size="32px" 
          class="hover:rotate-90 transition-transform duration-200" 
        />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-xl font-semibold">Combined Features</h2>
      <div class="flex gap-4 items-center">
        <Icon 
          name="alarm-clock" 
          size="48px" 
          color="#FF5733" 
          :rotate="45" 
          class="hover:scale-110 transition-transform duration-200" 
        />
        <Icon 
          name="location-pin" 
          size="48px" 
          color="#33FF57" 
          :flipX="true" 
          class="hover:rotate-180 transition-transform duration-500" 
        />
        <Icon 
          name="close" 
          size="48px" 
          color="#3357FF" 
          class="animate-spin hover:animate-none" 
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Icon from './Icon'
</script>

<style scoped>
.animate-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hover\:animate-none:hover {
  animation: none;
}
</style>
