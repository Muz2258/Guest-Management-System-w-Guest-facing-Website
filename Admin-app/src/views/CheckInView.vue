<template>
  <div>
    Check-in Staff View
    <el-button type="text" @click="authStore.logout">
      Logout
    </el-button>
    <div>{{ guestList }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useGuestStore } from '@/stores/guest';
import { ElButton } from 'element-plus';

const authStore = useAuthStore()
const guestStore = useGuestStore()

const guestList = computed(() => {
  return guestStore.guests
})

onMounted(() => {
  guestStore.fetchGuests()
})
</script>

<style scoped>

</style>