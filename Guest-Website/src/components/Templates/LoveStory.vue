<template>
  <section id="love-story" class="flex flex-col items-center overflow-x-hidden py-40 bg-brand-sec-light-200">
    <div class="mb-20">
        <DecorativeBranches variant="purple">
            <h4 class="text-heading-s text-brand-pri">#BuiltToLast</h4>
        </DecorativeBranches>
    </div>
    <h3 class="text-neutrals-neu-0 text-heading-md mb-40">Our love story</h3>
    <div class="text-neutrals-neu-35 text w-full px-24 flex gap-16 items-center overflow-x-auto scrollbar-hide">
      <CardStory v-for="(block, index) in storyBlocks" :key="`block-${index}`" :copy="block.copy" :source="block.source" :alt="block.alt" class="mb-24"/>
        <!-- <p>Our love story began where neither of us expected, at a neighborhood gym!!😅 A quiet corper noticed a young gym lover enjoying a game of pool with his friends. One glance turned into a smile, a smile into a hello, and that simple beginning blossomed into a connection that grew deeper with every passing day 💘</p>
        <p>It didn’t take long for us to realize we were meant to be. Every glance, every laugh, every moment drew us closer, until it became undeniable that we weren’t just in love, we are #BuiltToLast!!!💕✨</p>
        <p>Our journey hasn’t always been perfect, but it has always been ours, filled with laughter, sweet memories, and moments that only made our love stronger than we ever imagined🥰. Through every season, we’ve found in each other a safe haven, a best friend, and the kind of love that feels like home. What we share isn’t just love…. It’s Forever!!! 😊</p> -->
    </div>
  </section>
</template>

<script setup lang="ts">
const storyBlocks = [
  {
    copy: 'It all began at our neighborhood gym',
    source: {
      webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fe/512.webp',
      gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fe/512.gif'
    },
    alt: '💪🏾',
  },
  {
    copy: 'From a glance, to a smile, and then a hello… such was a connection that deepened with each passing day',
    source: {
      webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae3/512.webp',
      gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae3/512.gif'
    },
    alt: '🫣',
  },
  {
    copy: 'With every moment, it became clear that we aren’t just in love, we’re #BuiltToLast!',
    source: {
      webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f495/512.webp',
      gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f495/512.gif'
    },
    alt: '💕',
  },
  {
    copy: 'Our journey isn’t perfect, but it’s ours filled with a love stronger than we ever imagined',
    source: {
      webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f972/512.webp',
      gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f972/512.gif'
    },
    alt: '🥲',
  },
  {
    copy: 'Through every season, What we share isn’t just love… it’s Home, it’s Forever!!!',
    source: {
      webp: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f979/512.webp',
      gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f979/512.gif'
    },
    alt: '🥹',
  }
]
</script>

<style scoped>
</style>