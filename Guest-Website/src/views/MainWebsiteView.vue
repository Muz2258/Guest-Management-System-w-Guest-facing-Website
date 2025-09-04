<template>
  <main class="main-website">
    <h1 class="text-heading-mobile">Main Website</h1>
    <div v-if="guestData" class="guest-welcome">
    <p class="text-body-mobile">
      Welcome,
      <span v-if="typeof guestData.name === 'object'">
        {{ guestData.name.first_name }} {{ guestData.name.last_name }}
      </span>
      <span v-else>
        {{ guestData.name }}
      </span>
    </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuestStore } from '../stores/guest'
import { storeToRefs } from 'pinia'

const guestStore = useGuestStore()
const { guest } = storeToRefs(guestStore)

const guestData = computed(() => {
    console.log('🔄 Computing guest data from:', guest.value)
    const currentGuest = guest?.value ?? null

    if (!currentGuest) {
      console.log('ℹ️ No guest data available')
      return null
    }

    if (guest?.value && typeof guest.value.name === 'string' && guest.value.name.includes(' ')) {
        currentGuest.name = { 
            first_name: guest.value.name.split(' ')[0], 
            last_name: guest.value.name.split(' ')[1] ?? null 
        }
    }

    console.log('✅ Guest data computed:', currentGuest)

    return currentGuest
})
</script>

<style scoped>
.main-website {
  padding: 2rem;
}

.guest-welcome {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
