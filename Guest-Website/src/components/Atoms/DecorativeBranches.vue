<template>
  <div class="flex gap-4 items-center">
    <img 
      v-if="leftBranch" 
      :src="leftBranch" 
      class="h-6" 
      alt="Decorative Left Branch"
      loading="lazy"
    />
    <slot></slot>
    <img 
      v-if="rightBranch" 
      :src="rightBranch" 
      class="h-6" 
      alt="Decorative Right Branch"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'purple',
  size: 'md'
})

// ✅ OPTIMIZATION: Lazy load branch SVGs only when component is used
const leftBranch = ref<string>('')
const rightBranch = ref<string>('')

const loadBranches = async () => {
  try {
    if (props.variant === 'purple') {
      // Dynamic import for purple branches
      const [leftModule, rightModule] = await Promise.all([
        import('../../assets/vectors/leaf-branch__left--purple.svg?url'),
        import('../../assets/vectors/leaf-branch__right--purple.svg?url')
      ])
      leftBranch.value = leftModule.default
      rightBranch.value = rightModule.default
    } else {
      // Dynamic import for default branches
      const [leftModule, rightModule] = await Promise.all([
        import('../../assets/vectors/leaf-branch__left.svg?url'),
        import('../../assets/vectors/leaf-branch__right.svg?url')
      ])
      leftBranch.value = leftModule.default
      rightBranch.value = rightModule.default
    }
  } catch (error) {
    console.error('Failed to load decorative branches:', error)
  }
}

onMounted(() => {
  loadBranches()
})
</script>

<style scoped>
</style>