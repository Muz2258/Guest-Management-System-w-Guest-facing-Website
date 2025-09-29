<template>
  <div class="logo flex justify-center items-center gap-x-8">
    <img
      v-if="leftBranch"
      class="h-8 w-auto"
      :src="leftBranch"
      alt="Leaf Branch Left"
      loading="lazy"
    />
    <img
      class="size-[1.75rem]"
      :src="letterMark"
      alt="Chidera and Emamuzo Wedding Letter Mark"
      loading="lazy"
    />
    <img
      v-if="rightBranch"
      class="h-8 w-auto"
      :src="rightBranch"
      alt="Leaf Branch Right"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
// ✅ OPTIMIZATION: Lazy load logo assets
const leftBranch = ref<string>('')
const rightBranch = ref<string>('')
const letterMark = ref<string>('')

const loadLogo = async () => {
  try {
    const [leftModule, letterModule, rightModule] = await Promise.all([
      import('../../assets/vectors/leaf-branch__left.svg?url'),
      import('../../assets/vectors/wedding_letter-mark--black.svg?url'),
      import('../../assets/vectors/leaf-branch__right.svg?url')
    ])
    
    leftBranch.value = leftModule.default
    letterMark.value = letterModule.default
    rightBranch.value = rightModule.default
  } catch (error) {
    console.error('Failed to load logo assets:', error)
  }
}

onMounted(() => {
  loadLogo()
})
</script>