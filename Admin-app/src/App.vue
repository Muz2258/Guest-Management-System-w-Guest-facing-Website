<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { ElContainer, ElAside, ElMain, ElHeader, ElButton } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import MainNav from './components/MainNav.vue'

const authStore = useAuthStore()
const route = useRoute()

// Check if current route requires layout
const showLayout = computed(() => {
  return route.meta.requiresAuth !== false
})

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <el-container v-if="showLayout" class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <span>Wedding Management System</span>
        <el-button type="text" @click="authStore.logout">
          Logout
        </el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <MainNav />
      </el-aside>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>

  <RouterView v-else />
</template>

<style>
.app-container {
  min-height: 100vh;
}

.app-header {
  background-color: var(--el-color-primary);
  color: white;
  padding: 0 20px;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content span {
  font-size: 1.25rem;
  font-weight: bold;
}

.el-button--text {
  color: white;
}

.el-button--text:hover {
  color: var(--el-color-primary-light-3);
}
</style>
