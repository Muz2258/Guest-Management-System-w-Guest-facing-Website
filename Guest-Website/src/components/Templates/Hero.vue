<template>
    <transition appear name="hero-animation">
        <section class="pb-48 pt-16 h-svh flex flex-col justify-center items-center">
            <div class="logo mx-auto mb-32 flex justify-center items-center gap-x-8">
                <img
                    class="h-8 w-auto"
                    src="../../assets/vectors/leaf-branch__left.svg"
                    alt="Leaf Branch Left"
                />
                <img
                    class="size-[1.75rem]"
                    src="../../assets/vectors/wedding_letter-mark--black.svg"
                    alt="Chidera and Emamuzo Wedding Letter Mark"
                />
                <img
                    class="h-8 w-auto"
                    src="../../assets/vectors/leaf-branch__right.svg"
                    alt="Leaf Branch Right"
                />
            </div>
            <div class="mx-auto mb-48 flex flex-col justify-center items-center">
                <h1 class="bride text-title text-neutrals-neu-0">Chidera</h1>
                <h1 class="groom text-title text-neutrals-neu-0">Emamuzo</h1>
                <h1 class="and absolute size-[3rem] flex items-center justify-center top-auto right-auto bg-brand-pri text-neutrals-neu-100 text-[1.75rem] rounded-full mt-12">&</h1>
            </div>
            <div  class="img-container mx-auto mb-24 max-w-[75%] grow relative before:content-[var(--name)] before:absolute before:bottom-0 before:left-[-20px] before:[writing-mode:sideways-lr] before:text-xs before:text-neutrals-neu-35 before:[text-orientation:mixed] before:block after:content-[var(--hashtag)] after:absolute after:top-0 after:right-[-20px] after:text-xs after:text-neutrals-neu-35 after:[text-orientation:mixed] after:[writing-mode:sideways-rl] after:block" id="main-hero-image">
                <img class="image w-full h-full object-cover" src="../../assets/png/temp-image-1.png"/>
            </div>
            <h2 class="date mx-auto text-heading-lg text-center text-neutrals-neu-0">15 - 11 - 2025</h2>
        </section>
    </transition>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero-animation-enter-active .bride, .hero-animation-enter-active .groom {
  transition: all 2s cubic-bezier(.12,.6,.24,.99) 1s;
}

.hero-animation-enter-active .and {
  transition: all 0.45s cubic-bezier(.88,-0.66,.15,1.51) 1.8s;
}

.hero-animation-enter-active .img-container::after, .hero-animation-enter-active .img-container::before {
    transition: all 1.2s cubic-bezier(.45,.33,.36,.98) 0.5s;
}

.hero-animation-enter-active .image {
  transition: opacity 1.5s cubic-bezier(.81,.15,.52,.84);
}

.hero-animation-enter-active .logo, .hero-animation-enter-active .date {
  transition: all 1.5s cubic-bezier(.33,.22,.3,.98) 1.5s;
}

.hero-animation-enter-from .bride {
  transform: translateX(-45%);
  opacity: 0;
}

.hero-animation-enter-from .groom {
  transform: translateX(55%);
  opacity: 0;
}

.hero-animation-enter-from .and {
  transform: scale(0.6);
  opacity: 0;
}

.hero-animation-enter-from .img-container::after {
  transform: translateY(80%);
  opacity: 0;
}

.hero-animation-enter-from .img-container::before {
  transform: translateY(-80%);
  opacity: 0;
}

.hero-animation-enter-from .image {
  opacity: 0;
}

.hero-animation-enter-from .logo {
    transform: translateY(-50%);
    opacity: 0;
}

.hero-animation-enter-from .date {
    transform: translateY(50%);
    opacity: 0;
}
</style>