<template>
    <section class="py-40 flex flex-col items-center">
      <div class="flex gap-4 items-center mb-32">
          <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
          <h4 class="text-heading-s text-brand-pri">Details</h4>
          <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
      </div> 
      <div class="flex flex-col items-center w-[87%]">
          <DetailsInfo 
              v-for="(session, index) in sessionDetails" 
              :key="index" 
              v-bind="session" 
              :isLast="index === sessionDetails.length - 1" 
          />
      </div>
    </section>
</template>

<script setup lang="ts">
// Store
const sessionDetails = useEventStore().eventDetails?.sessionDetails || [];
</script>

<style scoped>
</style>