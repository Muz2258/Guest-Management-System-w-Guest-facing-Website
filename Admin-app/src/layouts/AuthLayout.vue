<template>
  <el-container class="auth-layout" >
    <slot />
  </el-container>
</template>

<script setup lang="ts">
import { ElContainer } from 'element-plus';
</script>

<style scoped>
.auth-layout {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color-light);
}
</style>