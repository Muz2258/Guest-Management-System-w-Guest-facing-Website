<template>
    <section class="py-40 flex flex-col items-center overflow-hidden">
      <div class="mb-32">
          <DecorativeBranches variant="purple">
            <h4 class="text-heading-s text-brand-pri">Details</h4>
          </DecorativeBranches>
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
// Components
import DecorativeBranches from '../Atoms/DecorativeBranches.vue'

// Store
const sessionDetails = useEventStore().eventDetails?.sessionDetails || [];
</script>

<style scoped>
</style>