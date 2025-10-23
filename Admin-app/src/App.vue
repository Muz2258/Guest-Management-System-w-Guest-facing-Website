<template>
  <component :is="activeLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
import AdminLayout from './layouts/AdminLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';
import CheckinLayout from './layouts/CheckinLayout.vue';

const authStore = useAuthStore()
const route = useRoute()

const activeLayout = computed(() => {
  const activeRole = authStore.activeRole
  const requiredRole = route.meta.role
  const requiresAuth = route.meta.requiresAuth

  if(requiresAuth && requiredRole) {
    if(activeRole === 'super-admin') return AdminLayout
    else if(activeRole === 'check-in-staff') return CheckinLayout
  }

  return AuthLayout
})

onBeforeMount(async () => {
  await authStore.init()
})
</script>

<style>
</style>
