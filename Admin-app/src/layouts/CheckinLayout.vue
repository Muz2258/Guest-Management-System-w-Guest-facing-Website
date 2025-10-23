<template>
  <el-container class="check-in-layout">
    <slot />
  </el-container>
</template>

<script setup lang="ts">
import { ElContainer } from 'element-plus';
</script>

<style scoped>
.check-in-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
</style>