<script setup lang="ts">
import { onMounted, computed, onBeforeMount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { ElContainer, ElAside, ElMain, ElHeader, ElButton } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import MainNav from './components/MainNav.vue'
import '@/assets/style.css'

const authStore = useAuthStore()
const route = useRoute()

// Check if current route requires layout
const showLayout = computed(() => {
  return route.meta.requiresAuth !== false
})

onBeforeMount(async () => {
  await authStore.init()
})
</script>

<template>
  <div v-if="showLayout" class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <span>Wedding Management System</span>
        <el-button type="text" @click="authStore.logout">
          Logout
        </el-button>
      </div>
    </el-header>
    <el-aside class="app-sidenav" width="200px">
      <MainNav />
    </el-aside>
    <el-main class="app-main">
      <RouterView />
    </el-main>
  </div>

  <RouterView v-else />
</template>

<style>
.app-container {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-areas:
    "header header"
    "sidenav mainview";
  grid-template-rows: 60px 1fr;
  grid-template-columns: 200px 1fr;
}

.app-header {
  grid-area: header;
  background-color: var(--el-color-primary);
  color: white;
  padding: 0 20px;
  z-index: 2;
}

.app-sidenav {
  grid-area: sidenav;
  border-right: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.app-main {
  grid-area: mainview;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
  padding: 0;
  display: flex;
  /* width: 100%; */
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
