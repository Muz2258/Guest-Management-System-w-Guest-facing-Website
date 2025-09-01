<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElContainer, ElAside, ElMain, ElHeader } from 'element-plus'
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      Wedding Management System
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
</template>

<style>
.app-container {
  min-height: 100vh;
}

.app-header {
  background-color: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
