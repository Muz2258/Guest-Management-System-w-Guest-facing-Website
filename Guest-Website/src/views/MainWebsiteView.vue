<template>
  <main class="page-wrapper">
    <div class="content-wrapper">
      <Hero />
      <EventDetails />
    </div>
  </main>
</template>

<script setup lang="ts">
</script>

<style lang="postcss" scoped>
@reference '../styles/main.css';

#main-hero-image::before {
  content: "Cheema '25";
  display: inline-block;
  position: absolute;
  bottom: 0;
  left: -9%;
  writing-mode: sideways-lr;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}

#main-hero-image::after {
  content: "#BuiltToLast";
  display: inline-block;
  position: absolute;
  top: 0;
  right: -9%;
  writing-mode: sideways-rl;
  text-orientation: mixed;
  @apply text-xs text-neutrals-neu-35;
}
</style>
