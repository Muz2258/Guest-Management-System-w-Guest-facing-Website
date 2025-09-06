<template>
  <div v-if="showCacheStatus" class="fixed bottom-4 right-4 bg-neutrals-neu-96 p-12 rounded-md shadow-md text-xs z-50">
    <div class="flex items-center space-x-8">
      <div class="flex items-center space-x-4">
        <div :class="cacheStatusColor" class="w-8 h-8 rounded-full"></div>
        <span class="text-neutrals-neu-35">{{ cacheStatusText }}</span>
      </div>
      <button 
        v-if="hasCachedData" 
        @click="refreshData" 
        class="text-brand-pri hover:text-brand-pri-light-100 underline"
        :disabled="isRefreshing"
      >
        {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
      </button>
      <button 
        @click="clearCache" 
        class="text-denotive-red hover:opacity-70 underline"
      >
        Clear
      </button>
    </div>
    <div v-if="cacheInfo.hasData" class="mt-4 text-neutrals-neu-46">
      Expires in: {{ cacheInfo.expiresInHours }}h {{ cacheInfo.expiresInMinutes % 60 }}m
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
  token: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  }
})

// Composables
const guestCache = useGuestCache()

// State
const isRefreshing = ref(false)

// Computed
const showCacheStatus = computed(() => {
  return props.show && import.meta.env.DEV // Only show in development
})

const cacheInfo = computed(() => guestCache.getCacheInfo())

const hasCachedData = computed(() => {
  return props.token ? guestCache.hasCachedData(props.token) : false
})

const cacheStatusColor = computed(() => {
  if (!cacheInfo.value.hasData) return 'bg-neutrals-neu-46'
  if (cacheInfo.value.expiresInHours > 12) return 'bg-denotive-green_light'
  if (cacheInfo.value.expiresInHours > 2) return 'bg-denotive-yellow_light'
  return 'bg-denotive-red'
})

const cacheStatusText = computed(() => {
  if (!cacheInfo.value.hasData) return 'No cached data'
  if (cacheInfo.value.expiresInHours > 12) return 'Cache fresh'
  if (cacheInfo.value.expiresInHours > 2) return 'Cache aging'
  return 'Cache expiring soon'
})

// Methods
const refreshData = async () => {
  if (!props.token || isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await guestCache.refreshData(props.token)
  } finally {
    isRefreshing.value = false
  }
}

const clearCache = () => {
  guestCache.clearCache()
}
</script>

<style scoped></style>
