<template>
    <section class="pb-44 pt-16">
        <div class="mx-auto mb-32 flex justify-center gap-x-8">
            <img
                src="../../assets/vectors/leaf-branch__left.svg"
                alt="Leaf Branch Left"
            />
            <img
                class="size-[1.75rem]"
                src="../../assets/vectors/wedding_letter-mark--black.svg"
                alt="Chidera and Emamuzo Wedding Letter Mark"
            />
            <img
                src="../../assets/vectors/leaf-branch__right.svg"
                alt="Leaf Branch Right"
            />
        </div>
        <div class="mx-auto mb-40 flex flex-col justify-center items-center">
            <h1 class="text-title text-neutrals-neu-0">Chidera</h1>
            <h1 class="text-title text-neutrals-neu-0">Emamuzo</h1>
            <h1 class="absolute size-[3rem] flex items-center justify-center top-auto right-auto bg-brand-pri text-neutrals-neu-100 text-[1.75rem] rounded-full mt-12">&</h1>
        </div>
        <div  class="mx-auto mb-24 w-[228px] relative" id="main-hero-image">
            <img src="../../assets/png/temp-image-1.png"/>
        </div>
        <h2 class="mx-auto text-heading-lg text-center text-neutrals-neu-0">15 - 11 - 2025</h2>
    </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
@reference '../../styles/main.css';

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