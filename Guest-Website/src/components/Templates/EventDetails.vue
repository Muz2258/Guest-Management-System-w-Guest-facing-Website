<template>
    <section class="pt-80 flex flex-col items-center">
        <div class="flex gap-4 items-center mb-32">
            <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
            <h4 class="text-heading-s text-brand-pri">Details</h4>
            <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
        </div> 
        <div class="flex flex-col items-center w-[87%] mb-56">
            <DetailsInfo 
                v-for="(session, index) in sessionDetails" 
                :key="index" 
                v-bind="session" 
                :isLast="index === sessionDetails.length - 1" 
            />
        </div>
        <div class="flex gap-8 justify-center w-full overflow-hidden">
            <img src="../../assets/png/temp-image-details-1.png" />
            <img src="../../assets/png/temp-image-details-2.png" />
            <img src="../../assets/png/temp-image-details-3.png" />
        </div>
    </section>
</template>

<script setup lang="ts">
// Store
const sessionDetails = useEventStore().eventDetails?.sessionDetails || [];
</script>