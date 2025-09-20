<template>
    <section id="love-story" class="flex flex-col items-center overflow-x-hidden" :class="{'pt-40 bg-brand-sec-light-100': !hasToken, 'pt-80 bg-transparent': hasToken}">
        <div class="flex gap-4 items-center mb-20">
            <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
            <h4 class="text-heading-s text-brand-pri">#BuiltToLast</h4>
            <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
        </div>
        <h3 class="text-neutrals-neu-0 text-heading-md mb-16">Our love story</h3>
        <div class="text-neutrals-neu-35 text w-[86%] mb-56 space-y-8">
            <p>Our love story began where neither of us expected, at a neighborhood gym!!😅 A quiet corper noticed a young gym lover enjoying a game of pool with his friends. One glance turned into a smile, a smile into a hello, and that simple beginning blossomed into a connection that grew deeper with every passing day 💘</p>
            <p>It didn’t take long for us to realize we were meant to be. Every glance, every laugh, every moment drew us closer, until it became undeniable that we weren’t just in love, we are #BuiltToLast!!!💕✨</p>
            <p>Our journey hasn’t always been perfect, but it has always been ours, filled with laughter, sweet memories, and moments that only made our love stronger than we ever imagined🥰. Through every season, we’ve found in each other a safe haven, a best friend, and the kind of love that feels like home. What we share isn’t just love…. It’s Forever!!! 😊</p>
        </div>
        <div class="w-full overflow-hidden">
          <div class="scroller-inner flex gap-8">
            <div class="flex gap-8 shrink-0">
              <img src="../../assets/png/english_01.png" />
              <img src="../../assets/png/english_02.png" />
              <img src="../../assets/png/english_03.png" />
              <img src="../../assets/png/english_04.png" />
              <img src="../../assets/png/english_05.png" />
              <img src="../../assets/png/english_06.png" />
            </div>
            <div class="flex gap-8 shrink-0" aria-hidden="true">
              <img src="../../assets/png/english_01.png" />
              <img src="../../assets/png/english_02.png" />
              <img src="../../assets/png/english_03.png" />
              <img src="../../assets/png/english_04.png" />
              <img src="../../assets/png/english_05.png" />
              <img src="../../assets/png/english_06.png" />
            </div>
          </div>
        </div>
    </section>
</template>

<script setup lang="ts">
/* ----------------------- Stores ----------------------- */
const guestStore = useGuestStore()


/* ----------------------- Computed Properties ----------------------- */
const hasToken = computed(() => {
  return !!guestStore.guestData?.auth_token
})
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