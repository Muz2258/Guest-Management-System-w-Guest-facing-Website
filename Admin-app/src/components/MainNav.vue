<script setup lang="ts">
import { ElMenu, ElMenuItem } from 'element-plus'
</script>

<template>
  <el-menu
    class="main-nav"
    :router="true"
  >
    <el-menu-item index="/dashboard">
      <template #title>
        Dashboard
      </template>
    </el-menu-item>
    <el-menu-item index="/guests">
      <template #title>
        Guests
      </template>
    </el-menu-item>
  </el-menu>
</template>

<style>
.main-nav {
  height: 100%;
  border-right: none;
}
</style>
