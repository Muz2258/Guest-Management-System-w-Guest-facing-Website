<template>
  <!-- Sticky Header -->
  <transition appear name="slide-down">
    <header class="fixed top-0 w-screen z-50" :class="{'h-svh': showNavigation}">
      <div class="flex justify-center items-center py-16 px-24 bg-neutrals-neu-100/90 backdrop-blur-sm border-b border-neutrals-neu-90 relative">
        <WeddingLogo />
        <div class="absolute -bottom-[13px] flex justify-center items-center p-8 rounded-full bg-neutrals-neu-100 z-10 border border-neutrals-neu-90" aria-label="Toggle navigation menu" @click="toggleNavigation">
          <Icon :name="showNavigation ? 'arrow-head-up' : 'arrow-head-down'" :color="getColor('neutral.neu_0')" :size="10" />
        </div>
      </div>

      <Transition name="navigation">
        <div 
          v-if="showNavigation"
          class="bg-neutrals-neu-100/90 backdrop-blur-sm p-56 flex flex-col items-center h-full origin-top"
          @click.self="closeNavigation"
        >
          <nav class="flex flex-col items-center gap-32">
            <router-link
              to="/"
              @click="navigateAndClose"
              class="nav-link text-heading-lg text-neutrals-neu-0 hover:text-brand-pri transition-colors"
              :class="{ 'text-brand-pri': $route.name === 'main-website' }"
            >
              Home
            </router-link>
            
            <router-link
              to="/gallery"
              @click="navigateAndClose"
              class="nav-link text-heading-lg text-neutrals-neu-0 hover:text-brand-pri transition-colors"
              :class="{ 'text-brand-pri': $route.name === 'gallery' }"
            >
              Gallery
            </router-link>
          </nav>

          <!-- Bottom Decorative Element -->
          <div class="absolute bottom-32 flex justify-center items-center gap-x-4 opacity-50">
            <div class="w-8 h-px bg-brand-pri"></div>
            <div class="w-2 h-2 rounded-full bg-brand-pri"></div>
            <div class="w-8 h-px bg-brand-pri"></div>
          </div>
        </div>
      </Transition>
    </header>
  </transition>
  

  <!-- Full-Screen Navigation Overlay -->
  
</template>

<script setup lang="ts">
/* ------------------ Components ------------------- */
import Icon from '../Icon';
import { getColor } from '@/utils/colors';

const emit = defineEmits<{
  'mounted': []
}>()

/* ------------------ Reactive Variables ------------------- */
const showNavigation = ref(false)
const route = useRoute()

/* ------------------ Methods ------------------- */
const toggleNavigation = () => {
  showNavigation.value = !showNavigation.value
  document.body.style.overflow = showNavigation.value ? 'hidden' : ''
}

const closeNavigation = () => {
  showNavigation.value = false
  document.body.style.overflow = ''
}

const navigateAndClose = () => {
  setTimeout(() => {
    closeNavigation()
  }, 100)
}

/* ------------------ Lifecycle ------------------- */
watch(() => route.path, () => {
  closeNavigation()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

onMounted(() => {
  emit('mounted')
  
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showNavigation.value) {
      closeNavigation()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 1.5s cubic-bezier(.19,.73,.42,.93) 1.8s;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-75%);
}

/* Navigation Transition */
.navigation-enter-active,
.navigation-leave-active {
  transition: all 0.3s ease;
}

.navigation-enter-from,
.navigation-leave-to {
  opacity: 0;
  transform: scaleY(0.5);
}

.navigation-enter-to,
.navigation-leave-from {
  opacity: 1;
  transform: scaleY(1);
}

/* Navigation Link Styles */
.nav-link {
  position: relative;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--color-brand-pri);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after,
.nav-link.router-link-exact-active::after {
  width: 100%;
}

/* Header spacing for content below */
.header-spacer {
  height: 80px; /* Adjust based on header height */
}
</style>