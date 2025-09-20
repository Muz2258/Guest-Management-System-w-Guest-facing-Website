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
        <div class="w-full overflow-hidden">
          <div class="scroller-inner flex gap-8">
            <div class="flex gap-8 shrink-0">
              <img src="../../assets/png/native_01.png" />
              <img src="../../assets/png/native_02.png" />
              <img src="../../assets/png/native_03.png" />
              <img src="../../assets/png/native_04.png" />
              <img src="../../assets/png/native_05.png" />
              <img src="../../assets/png/native_06.png" />
            </div>
            <div class="flex gap-8 shrink-0" aria-hidden="true">
              <img src="../../assets/png/native_01.png" />
              <img src="../../assets/png/native_02.png" />
              <img src="../../assets/png/native_03.png" />
              <img src="../../assets/png/native_04.png" />
              <img src="../../assets/png/native_05.png" />
              <img src="../../assets/png/native_06.png" />
            </div>
          </div>
        </div>
    </section>
</template>

<script setup lang="ts">
// Store
const sessionDetails = useEventStore().eventDetails?.sessionDetails || [];
</script>

<style scoped>
.scroller-inner {
  width: max-content;
  animation: scroll-left 100s linear infinite;
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-50% - 4px));
  }
}
</style>