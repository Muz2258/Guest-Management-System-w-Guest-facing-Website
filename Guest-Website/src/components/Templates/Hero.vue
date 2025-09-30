<template>
    <transition appear name="hero-animation" @enter="handleEnter" @after-enter="handleAnimationEnd" :duration="{ enter: 4500, leave: 3000 }">
        <section 
          v-show="imageLoaded"
          class="pb-48 pt-[108px] h-svh flex flex-col justify-center items-center overflow-hidden"
        >
            <div class="mx-auto mb-48 flex flex-col justify-center items-center">
                <h1 class="bride text-title text-neutrals-neu-0">Chidera</h1>
                <h1 class="groom text-title text-neutrals-neu-0">Emamuzo</h1>
                <h1 class="and absolute size-[3rem] flex items-center justify-center top-auto right-auto bg-brand-pri text-neutrals-neu-100 text-[1.75rem] rounded-full mt-12">&</h1>
            </div>
            <div  class="img-container mx-auto mb-24 max-w-[75%] grow relative" id="main-hero-image">
              <picture>
                  <source 
                    :srcset="`${s3Url}/images/base/hero-image.webp 1x, ${s3Url}/images/@2x/hero-image@2x.webp 2x, ${s3Url}/images/@3x/hero-image@3x.webp 3x`" 
                    type="image/webp" 
                  />
                  <img 
                    class="image w-full h-full object-cover" 
                    :src="`${s3Url}/images/base/hero-image.webp`"
                    :srcset="`${s3Url}/images/base/hero-image.webp 1x, ${s3Url}/images/@2x/hero-image@2x.webp 2x, ${s3Url}/images/@3x/hero-image@3x.webp 3x`"
                    alt="Wedding hero image"
                    @load="handleImageLoaded"
                  />
              </picture>
            </div>
            <h2 class="date mx-auto text-heading-lg text-center text-neutrals-neu-0">15 - 11 - 2025</h2>
        </section>
    </transition>
</template>

<script setup lang="ts">
const imageLoaded = ref(false);
const s3Url = import.meta.env.VITE_APP_S3_STATIC_URI || '';

const emit = defineEmits<{
  'hero-ready': [],
  'hero-animation-ended': []
}>()

const handleImageLoaded = () => {
  console.log('Hero image loaded successfully')
  imageLoaded.value = true;
}

const handleEnter = () => {
  console.log('Hero animation started');
  if(imageLoaded.value) {
    emit('hero-ready')
  }
}

const handleAnimationEnd = () => {
  emit('hero-animation-ended');
}
</script>

<style scoped>
.img-container::before, .img-container::after {
  display: block;
  position: absolute;
  font-size: 0.75rem;
  color: #595959;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.img-container::before {
  content: 'Cheema \'25';
  bottom: 24px;
  left: -44px;
  transform: rotate(-90deg) translateX(0);
}

.img-container::after {
  content: '#BuiltToLast';
  top: 26px;
  right: -46px;
  transform: rotate(90deg) translateX(0);
}

.hero-animation-enter-active .image {
  transition: opacity 1.5s cubic-bezier(.81,.15,.52,.84);
}

.hero-animation-enter-active .img-container::after, .hero-animation-enter-active .img-container::before {
    transition: all 1.2s cubic-bezier(.45,.33,.36,.98) 0.5s;
}

.hero-animation-enter-active .bride, .hero-animation-enter-active .groom {
  transition: all 2s cubic-bezier(.12,.6,.24,.99) 1s;
}

.hero-animation-enter-active .logo, .hero-animation-enter-active .date {
  transition: all 1.5s cubic-bezier(.33,.22,.3,.98) 1.5s;
}

.hero-animation-enter-active .and {
  transition: all 0.45s cubic-bezier(.88,-0.66,.15,1.51) 1.8s;
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
  transform: rotate(90deg) translateX(80%);
  opacity: 0;
}

.hero-animation-enter-from .img-container::before {
  transform: rotate(-90deg) translateX(80%);
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